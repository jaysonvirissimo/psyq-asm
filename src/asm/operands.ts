// SPDX-License-Identifier: MIT
/**
 * The operand grammar:
 *
 *   operand  := register | memory | float | expr
 *   register := '$' (digits | abi-name)
 *   memory   := [expr] '(' register ')'
 *   expr     := '%hi(' simple ')' | '%lo(' simple ')' | '%gp_rel(' simple ')'
 *             | '.' [('+'|'-') integer] | simple
 *   simple   := integer | symbol [('+'|'-') integer]
 *   integer  := ['-'|'+'] ('0x' hex+ | digits)      32-bit, two's complement
 */
import { parseRegister } from '../isa/registers.js';

export type RelocFunction = 'hi' | 'lo' | 'gp_rel';

export interface NumberExpr {
  readonly kind: 'number';
  readonly value: number;
}

export interface SymbolExpr {
  readonly kind: 'symbol';
  readonly name: string;
  readonly addend: number;
}

export type Expr =
  | NumberExpr
  | SymbolExpr
  | { readonly kind: 'reloc'; readonly fn: RelocFunction; readonly inner: NumberExpr | SymbolExpr }
  /** `.` plus a byte offset: a position relative to the current instruction. */
  | { readonly kind: 'dot'; readonly offset: number };

export type SourceOperand =
  | { readonly kind: 'reg'; readonly number: number }
  | { readonly kind: 'mem'; readonly base: number; readonly offset: Expr }
  | { readonly kind: 'expr'; readonly expr: Expr }
  | { readonly kind: 'float'; readonly value: number };

export type ParseFailureCode = 'invalid-operand' | 'immediate-out-of-range';

export type Parsed<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly code: ParseFailureCode; readonly message: string };

const INTEGER = /^([-+]?)\s*(0x[0-9a-f]+|\d+)$/i;
const SYMBOL_EXPR = /^([A-Za-z_.$][A-Za-z0-9_.$]*)\s*(?:([-+])\s*(0x[0-9a-f]+|\d+))?$/i;
const FLOAT = /^[-+]?(?:(?:\d+\.\d*|\.\d+)(?:e[-+]?\d+)?|\d+e[-+]?\d+)$/i;
const RELOC = /^%(hi|lo|gp_rel)\s*\((.*)\)$/;
const DOT = /^\.\s*(?:([-+])\s*(0x[0-9a-f]+|\d+))?$/i;
const REGISTER_LIKE = /^\$[a-z0-9]+$/;

function ok<T>(value: T): Parsed<T> {
  return { ok: true, value };
}

function fail<T>(message: string, code: ParseFailureCode = 'invalid-operand'): Parsed<T> {
  return { ok: false, code, message };
}

/** Parse an integer that must fit in 32 bits; the result is a signed 32-bit value. */
export function parseInteger(text: string): Parsed<number> {
  const match = INTEGER.exec(text.trim());
  if (match === null) return fail(`${JSON.stringify(text.trim())} is not an integer.`);
  const digits = String(match[2]);
  const magnitude = Number.parseInt(digits, /^0x/i.test(digits) ? 16 : 10);
  const value = match[1] === '-' ? -magnitude : magnitude;
  if (value < -0x80000000 || value > 0xffffffff) {
    return fail(`${text.trim()} does not fit in 32 bits.`, 'immediate-out-of-range');
  }
  return ok(value | 0);
}

function parseSimple(text: string): Parsed<NumberExpr | SymbolExpr> {
  if (INTEGER.test(text)) {
    const n = parseInteger(text);
    return n.ok ? ok({ kind: 'number', value: n.value }) : n;
  }
  const match = SYMBOL_EXPR.exec(text);
  if (match === null) return fail(`cannot parse ${JSON.stringify(text)}.`);
  const name = String(match[1]);
  if (parseRegister(name) !== undefined) return fail(`register ${name} cannot be used here.`);
  if (match[2] === undefined) return ok({ kind: 'symbol', name, addend: 0 });
  const addend = parseInteger(String(match[3]));
  if (!addend.ok) return addend;
  return ok({ kind: 'symbol', name, addend: match[2] === '-' ? -addend.value | 0 : addend.value });
}

/** Parse an expression: a number, `symbol[+-n]`, `%hi/%lo/%gp_rel(...)`, or `.[+-n]`. */
export function parseExpr(text: string): Parsed<Expr> {
  const t = text.trim();
  const reloc = RELOC.exec(t);
  if (reloc !== null) {
    const inner = parseSimple(String(reloc[2]).trim());
    return inner.ok
      ? ok({ kind: 'reloc', fn: reloc[1] as RelocFunction, inner: inner.value })
      : inner;
  }
  const dot = DOT.exec(t);
  if (dot !== null) {
    if (dot[1] === undefined) return ok({ kind: 'dot', offset: 0 });
    const n = parseInteger(String(dot[2]));
    if (!n.ok) return n;
    return ok({ kind: 'dot', offset: dot[1] === '-' ? -n.value : n.value });
  }
  return parseSimple(t);
}

/** Index of the `(` matching the final `)`, or -1. */
function matchingOpen(text: string): number {
  let depth = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] === ')') depth++;
    else if (text[i] === '(' && --depth === 0) return i;
  }
  return -1;
}

export function parseOperand(text: string): Parsed<SourceOperand> {
  const t = text.trim();
  if (t === '') return fail('missing operand.');
  const register = parseRegister(t);
  if (register !== undefined) return ok({ kind: 'reg', number: register });
  if (REGISTER_LIKE.test(t)) return fail(`unknown register ${t}.`);
  if (t.endsWith(')')) {
    const open = matchingOpen(t);
    const base = open < 0 ? undefined : parseRegister(t.slice(open + 1, -1).trim());
    if (base !== undefined) {
      const offsetText = t.slice(0, open).trim();
      if (offsetText === '') return ok({ kind: 'mem', base, offset: { kind: 'number', value: 0 } });
      const offset = parseExpr(offsetText);
      return offset.ok ? ok({ kind: 'mem', base, offset: offset.value }) : offset;
    }
  }
  if (FLOAT.test(t)) return ok({ kind: 'float', value: Number(t) });
  const expr = parseExpr(t);
  return expr.ok ? ok({ kind: 'expr', expr: expr.value }) : expr;
}
