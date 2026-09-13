// SPDX-License-Identifier: MIT
/**
 * Operand resolution at layout time: labels become displacements, symbols
 * become relocation records, and every value is range-checked before it
 * reaches the encoder.
 *
 * A relocated field holds the addend's field bits (for a local label, the
 * label's section offset plus the addend); consumers compare words under
 * `fieldMask`.
 */
import { hi16, lo16, signExtend16, type Slot } from '../isa/fields.js';
import type { DiagnosticCode, Operand, Relocation, RelocationTarget } from '../public-types.js';
import type { Expr, SymbolExpr } from './operands.js';
import type { Pending } from './stream.js';
import { isLocalLabel } from './symbols.js';

export interface LabelLocation {
  readonly section: string;
  readonly offset: number;
}

export interface ResolveContext {
  readonly labels: ReadonlyMap<string, LabelLocation>;
  readonly section: string;
  /** Byte offset of the word being resolved. */
  readonly offset: number;
}

export type RelocationDraft = Omit<Relocation, 'offset'>;

export interface ResolveError {
  readonly code: DiagnosticCode;
  readonly message: string;
}

export interface Resolved<T> {
  readonly value: T;
  readonly relocation?: RelocationDraft;
}

type Resolution<T> = Resolved<T> | ResolveError;

function failure(code: DiagnosticCode, message: string): ResolveError {
  return { code, message };
}

export function isError<T>(resolution: Resolution<T>): resolution is ResolveError {
  return 'code' in resolution;
}

function withRelocation<T>(value: T, relocation: RelocationDraft | undefined): Resolved<T> {
  return relocation === undefined ? { value } : { value, relocation };
}

/** A symbol's relocation target, and the value its field starts from. */
function targetOf(
  symbol: SymbolExpr,
  ctx: ResolveContext,
): { readonly target: RelocationTarget; readonly base: number } | ResolveError {
  if (!isLocalLabel(symbol.name)) {
    return {
      target: { kind: 'symbol', name: symbol.name, addend: symbol.addend },
      base: symbol.addend,
    };
  }
  const label = ctx.labels.get(symbol.name);
  if (label === undefined) return failure('undefined-label', `${symbol.name} is not defined.`);
  const offset = label.offset + symbol.addend;
  return {
    target: { kind: 'section', section: label.section, offset, label: symbol.name },
    base: offset,
  };
}

/** A 16-bit immediate or offset field. */
export function resolveField(expr: Expr, signed: boolean, ctx: ResolveContext): Resolution<number> {
  switch (expr.kind) {
    case 'number': {
      const [min, max] = signed ? [-0x8000, 0x7fff] : [0, 0xffff];
      if (expr.value < min || expr.value > max) {
        return failure(
          'immediate-out-of-range',
          `${String(expr.value)} does not fit in ${signed ? 'a signed' : 'an unsigned'} 16-bit field.`,
        );
      }
      return { value: expr.value };
    }
    case 'symbol':
      return failure(
        'unsupported-syntax',
        `${expr.name} needs %hi, %lo, or %gp_rel in a 16-bit field.`,
      );
    case 'dot':
      return failure('unsupported-syntax', '"." is valid only as a branch target.');
    case 'reloc': {
      const { fn, inner } = expr;
      const toValue = (field: number): number => (signed ? signExtend16(field) : field);
      if (inner.kind === 'number') {
        if (fn === 'gp_rel') return failure('unsupported-syntax', '%gp_rel needs a symbol.');
        return { value: toValue(fn === 'hi' ? hi16(inner.value) : lo16(inner.value)) };
      }
      const resolved = targetOf(inner, ctx);
      if ('code' in resolved) return resolved;
      // VERIFY-7: a $gp-relative field holds 0; the addend lives in the target.
      const field = fn === 'hi' ? hi16(resolved.base) : fn === 'lo' ? lo16(resolved.base) : 0;
      const kind = fn === 'hi' ? 'HI16' : fn === 'lo' ? 'LO16' : 'GPREL16';
      return {
        value: toValue(field),
        relocation: { kind, fieldMask: 0xffff, target: resolved.target, fieldValue: field },
      };
    }
  }
}

function resolveBranch(expr: Expr, ctx: ResolveContext): Resolution<Operand> {
  let bytes: number;
  if (expr.kind === 'dot') {
    bytes = expr.offset;
  } else if (expr.kind === 'symbol') {
    const label = ctx.labels.get(expr.name);
    if (label === undefined) return failure('undefined-label', `${expr.name} is not defined.`);
    if (label.section !== ctx.section) {
      return failure(
        'unsupported-syntax',
        `${expr.name} is in ${label.section}, not ${ctx.section}.`,
      );
    }
    bytes = label.offset + expr.addend - ctx.offset;
  } else {
    return failure('unsupported-syntax', 'a branch target must be a label.');
  }
  if (bytes % 4 !== 0)
    return failure('unsupported-syntax', 'a branch target must be word-aligned.');
  const displacement = (bytes - 4) / 4;
  if (displacement < -0x8000 || displacement > 0x7fff) {
    return failure(
      'branch-out-of-range',
      `the target is ${String(displacement)} instructions away.`,
    );
  }
  return { value: { kind: 'branch', displacement } };
}

function resolveTarget(expr: Expr, ctx: ResolveContext): Resolution<Operand> {
  if (expr.kind === 'number') {
    if (expr.value % 4 !== 0)
      return failure('unsupported-syntax', 'a jump target must be word-aligned.');
    return { value: { kind: 'target', index: (expr.value >>> 2) & 0x03ffffff } };
  }
  if (expr.kind !== 'symbol')
    return failure('unsupported-syntax', 'a jump target must be a symbol or an address.');
  const resolved = targetOf(expr, ctx);
  if ('code' in resolved) return resolved;
  // VERIFY-6: a jump to a local label carries the label's word index.
  const index = resolved.target.kind === 'section' ? (resolved.base >>> 2) & 0x03ffffff : 0;
  return {
    value: { kind: 'target', index },
    relocation: {
      kind: 'MIPS26',
      fieldMask: 0x03ffffff,
      target: resolved.target,
      fieldValue: index,
    },
  };
}

function plainNumber(
  expr: Expr,
  max: number,
  what: string,
  make: (value: number) => Operand,
): Resolution<Operand> {
  if (expr.kind !== 'number') return failure('unsupported-syntax', `the ${what} must be a number.`);
  if (expr.value < 0 || expr.value > max) {
    return failure(
      'immediate-out-of-range',
      `the ${what} ${String(expr.value)} is outside 0 to ${String(max)}.`,
    );
  }
  return { value: make(expr.value) };
}

/** Resolve one bound operand to its final value and any relocation. */
export function resolveArg(slot: Slot, pending: Pending, ctx: ResolveContext): Resolution<Operand> {
  switch (pending.kind) {
    case 'gpr':
      return { value: { kind: 'gpr', number: pending.number } };
    case 'cop':
      return {
        value: { kind: 'cop', number: pending.number, unit: pending.unit, space: pending.space },
      };
    case 'mem': {
      const offset = resolveField(pending.offset, true, ctx);
      if (isError(offset)) return offset;
      return withRelocation(
        { kind: 'mem', base: pending.base, offset: offset.value },
        offset.relocation,
      );
    }
    case 'branch':
      return resolveBranch(pending.target, ctx);
    case 'value':
      switch (slot) {
        case 'imm16s':
        case 'imm16u': {
          const signed = slot === 'imm16s';
          const field = resolveField(pending.expr, signed, ctx);
          if (isError(field)) return field;
          return withRelocation(
            { kind: 'imm', value: field.value, bits: 16, signed },
            field.relocation,
          );
        }
        case 'target':
          return resolveTarget(pending.expr, ctx);
        case 'sa':
          return plainNumber(pending.expr, 31, 'shift amount', (value) => ({
            kind: 'shamt',
            value,
          }));
        case 'code10':
          return plainNumber(pending.expr, 0x3ff, 'code', (value) => ({
            kind: 'imm',
            value,
            bits: 10,
            signed: false,
          }));
        case 'code20':
        case 'break20':
          return plainNumber(pending.expr, 0xfffff, 'code', (value) => ({
            kind: 'imm',
            value,
            bits: 20,
            signed: false,
          }));
        default:
          return plainNumber(pending.expr, 0x01ffffff, 'command', (value) => ({
            kind: 'imm',
            value,
            bits: 25,
            signed: false,
          }));
      }
  }
}

/** A `.word`, `.half`, or `.byte` value. */
export function resolveData(unit: 1 | 2 | 4, expr: Expr, ctx: ResolveContext): Resolution<number> {
  if (expr.kind === 'number') {
    const bits = unit * 8;
    const min = unit === 4 ? -0x80000000 : -(2 ** (bits - 1));
    const max = unit === 4 ? 0xffffffff : 2 ** bits - 1;
    if (expr.value < min || expr.value > max) {
      return failure(
        'immediate-out-of-range',
        `${String(expr.value)} does not fit in ${String(bits)} bits.`,
      );
    }
    return { value: expr.value };
  }
  if (expr.kind !== 'symbol')
    return failure('unsupported-syntax', 'data values must be numbers, symbols, or labels.');
  const resolved = targetOf(expr, ctx);
  if ('code' in resolved) return resolved;
  const field = resolved.base >>> 0;
  return {
    value: field,
    relocation: {
      kind: 'WORD32',
      fieldMask: 0xffffffff,
      target: resolved.target,
      fieldValue: field,
    },
  };
}
