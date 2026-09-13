// SPDX-License-Identifier: MIT
/**
 * The expansion pass: statements to the stream of pending words. Native
 * instructions bind directly to their table row; macros expand into the
 * sequences ASPSX 2.81 emits (docs/ASPSX-2.81.md, "Macro expansion").
 */
import { COP_SLOTS, hi16, lo16, signExtend16, type Slot } from '../isa/fields.js';
import { ISA_ROWS, rowFor, type IsaRow, type TableMnemonic } from '../isa/table.js';
import type { DiagnosticCode, SmallDataEntry } from '../public-types.js';
import { zip } from '../util.js';
import type { Diagnostics } from './diagnostics.js';
import type { Expr, SourceOperand, SymbolExpr } from './operands.js';
import type { Statement } from './parser.js';
import { sectionKind } from './sections.js';
import type { Item, Pending, PendingArg, PendingWord } from './stream.js';
import { isTransparentLabel } from './symbols.js';

export interface ExpandContext {
  readonly gpSize: number;
  readonly smallData: ReadonlyMap<string, SmallDataEntry>;
  readonly partialDivExpansion: boolean;
  readonly diagnostics: Diagnostics;
}

type InstructionStatement = Extract<Statement, { kind: 'instruction' }>;
type Operands = readonly SourceOperand[];

/** What one statement became. */
interface Expansion {
  readonly words: readonly PendingWord[];
  readonly macro?: string;
  readonly divMove?: number;
}

interface Failure {
  readonly code: DiagnosticCode;
  readonly message: string;
}

type Outcome = Expansion | Failure;

const AT = 1;
const GP = 28;
const RA = 31;

const TABLE = Object.fromEntries(ISA_ROWS.map((r) => [r.mnemonic, r])) as Record<
  TableMnemonic,
  IsaRow
>;

const LOADS: ReadonlySet<string> = new Set(['lb', 'lbu', 'lh', 'lhu', 'lw', 'lwl', 'lwr', 'lwc2']);
const STORES: ReadonlySet<string> = new Set(['sb', 'sh', 'sw', 'swl', 'swr', 'swc2']);

/** GNU macros cc1psx never emits; rejected by name rather than as unknown. */
const UNSUPPORTED: ReadonlySet<string> = new Set([
  'abs',
  'bal',
  'beql',
  'bge',
  'bgeu',
  'bgezl',
  'bgt',
  'bgtu',
  'bgtzl',
  'ble',
  'bleu',
  'blezl',
  'blt',
  'bltu',
  'bltzl',
  'bnel',
  'mul',
  'mulo',
  'mulou',
  'neg',
  'not',
  'rol',
  'ror',
  'seq',
  'sge',
  'sgeu',
  'sgt',
  'sgtu',
  'sle',
  'sleu',
  'sne',
  'ulh',
  'ulw',
  'ush',
  'usw',
]);

/** Three-register instructions written with an immediate third operand. */
const IMMEDIATE_FORMS: Readonly<
  Partial<
    Record<
      string,
      {
        readonly immediate: TableMnemonic;
        readonly register: TableMnemonic;
        readonly unsigned: boolean;
        readonly negate: boolean;
      }
    >
  >
> = {
  addu: { immediate: 'addiu', register: 'addu', unsigned: false, negate: false },
  add: { immediate: 'addi', register: 'add', unsigned: false, negate: false },
  subu: { immediate: 'addiu', register: 'subu', unsigned: false, negate: true },
  sub: { immediate: 'addi', register: 'sub', unsigned: false, negate: true },
  and: { immediate: 'andi', register: 'and', unsigned: true, negate: false },
  or: { immediate: 'ori', register: 'or', unsigned: true, negate: false },
  xor: { immediate: 'xori', register: 'xor', unsigned: true, negate: false },
  slt: { immediate: 'slti', register: 'slt', unsigned: false, negate: false },
  sltu: { immediate: 'sltiu', register: 'sltu', unsigned: false, negate: false },
};

// ---- word construction -----------------------------------------------------

const gpr = (number: number): Pending => ({ kind: 'gpr', number });
const constant = (value: number): Expr => ({ kind: 'number', value });
const imm = (value: number): Pending => ({ kind: 'value', expr: constant(value) });
const value = (expr: Expr): Pending => ({ kind: 'value', expr });
const reloc = (fn: 'hi' | 'lo' | 'gp_rel', inner: SymbolExpr): Expr => ({
  kind: 'reloc',
  fn,
  inner,
});
/** A branch to `words` instructions past the delay slot. */
const skip = (words: number): Pending => ({
  kind: 'branch',
  target: { kind: 'dot', offset: 4 + 4 * words },
});

function word(mnemonic: TableMnemonic, ...values: Pending[]): PendingWord {
  const row = TABLE[mnemonic];
  const args = zip(row.syntax, values).map(([slot, v]) => ({ slot, value: v }));
  return { row, args, origin: 'macro' };
}

const nop = (): PendingWord => word('sll', gpr(0), gpr(0), imm(0));

const fits16s = (n: number): boolean => n >= -0x8000 && n <= 0x7fff;
const fits16u = (n: number): boolean => n >= 0 && n <= 0xffff;

function macro(name: string, words: readonly PendingWord[]): Expansion {
  return { words, macro: name };
}

function expects(mnemonic: string, what: string): Failure {
  return { code: 'invalid-operand', message: `${mnemonic} expects ${what}.` };
}

function unsupported(message: string): Failure {
  return { code: 'unsupported-syntax', message };
}

type RegOperand = Extract<SourceOperand, { kind: 'reg' }>;
type ExprOperand = Extract<SourceOperand, { kind: 'expr' }>;

function isReg(operand: SourceOperand | undefined): operand is RegOperand {
  return operand?.kind === 'reg';
}

function isExpr(operand: SourceOperand | undefined): operand is ExprOperand {
  return operand?.kind === 'expr';
}

function integerOf(operand: SourceOperand | undefined): number | undefined {
  return operand?.kind === 'expr' && operand.expr.kind === 'number'
    ? operand.expr.value
    : undefined;
}

// ---- loads of constants and addresses --------------------------------------

/** `lui rd,upper` then `ori rd,rd,lower` when the lower half is not zero. */
function upperLower(rd: number, bits: number): PendingWord[] {
  const lui = word('lui', gpr(rd), imm((bits >>> 16) & 0xffff));
  return (bits & 0xffff) === 0 ? [lui] : [lui, word('ori', gpr(rd), gpr(rd), imm(bits & 0xffff))];
}

/** `li rd,value` as ASPSX 2.56 and later expand it. */
export function loadImmediate(rd: number, n: number): PendingWord[] {
  if (fits16s(n)) return [word('addiu', gpr(rd), gpr(0), imm(n))];
  // VERIFY-9: 0x8000 to 0xFFFF load with a single ori.
  if (fits16u(n)) return [word('ori', gpr(rd), gpr(0), imm(n))];
  return upperLower(rd, n >>> 0);
}

function loadSingle(rd: number, n: number): PendingWord[] {
  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, n);
  return upperLower(rd, view.getUint32(0));
}

function loadDouble(rd: number, n: number): PendingWord[] {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, n);
  const high = view.getUint32(0);
  const low = view.getUint32(4);
  // VERIFY-10: the low word goes in rd and the high word in rd+1.
  const first = low === 0 ? [word('addiu', gpr(rd), gpr(0), imm(0))] : upperLower(rd, low);
  return [...first, ...upperLower(rd + 1, high)];
}

function loadAddress(rd: number, symbol: SymbolExpr, ctx: ExpandContext): PendingWord[] {
  if (ctx.smallData.has(symbol.name)) {
    return [word('addiu', gpr(rd), gpr(GP), value(reloc('gp_rel', symbol)))];
  }
  return [
    word('lui', gpr(rd), value(reloc('hi', symbol))),
    word('addiu', gpr(rd), gpr(rd), value(reloc('lo', symbol))),
  ];
}

// ---- macro families -----------------------------------------------------------

function expandLoadStore(m: TableMnemonic, ops: Operands, ctx: ExpandContext): Outcome | undefined {
  const [first, address] = ops;
  if (ops.length !== 2 || !isReg(first)) return undefined;
  if (
    address?.kind === 'mem' &&
    (address.offset.kind === 'reloc' ||
      (address.offset.kind === 'number' && fits16s(address.offset.value)))
  ) {
    return undefined;
  }
  const cop = m === 'lwc2' || m === 'swc2';
  const target: Pending = cop
    ? { kind: 'cop', number: first.number, unit: 2, space: 'data' }
    : gpr(first.number);
  const access = (base: number, offset: Expr): PendingWord =>
    word(m, target, { kind: 'mem', base, offset });

  if (address?.kind === 'mem') {
    const { base, offset } = address;
    if (offset.kind === 'number') {
      return macro(m, [
        word('lui', gpr(AT), imm(hi16(offset.value))),
        word('addu', gpr(AT), gpr(base), gpr(AT)),
        access(AT, constant(signExtend16(lo16(offset.value)))),
      ]);
    }
    if (offset.kind === 'symbol') {
      // VERIFY-15: a symbol with a base register never uses $gp.
      return macro(m, [
        word('lui', gpr(AT), value(reloc('hi', offset))),
        word('addu', gpr(AT), gpr(AT), gpr(base)),
        access(AT, reloc('lo', offset)),
      ]);
    }
    return unsupported(`${m}: "." cannot be used as an address.`);
  }
  if (!isExpr(address))
    return { code: 'invalid-operand', message: `${m} operand 2 must be offset(base).` };

  const { expr } = address;
  // Loads use their own destination as the temporary; stores need $at.
  const temp = LOADS.has(m) && !cop ? first.number : AT;
  if (expr.kind === 'number') {
    if (fits16s(expr.value)) return macro(m, [access(0, expr)]);
    // VERIFY-14 (loads) and VERIFY-16 (stores): an absolute address out of range.
    return macro(m, [
      word('lui', gpr(temp), imm(hi16(expr.value))),
      access(temp, constant(signExtend16(lo16(expr.value)))),
    ]);
  }
  if (expr.kind === 'symbol') {
    if (cop) return unsupported(`${m} with a symbol address is not supported.`);
    if (ctx.smallData.has(expr.name)) return macro(m, [access(GP, reloc('gp_rel', expr))]);
    return macro(m, [
      word('lui', gpr(temp), value(reloc('hi', expr))),
      access(temp, reloc('lo', expr)),
    ]);
  }
  return unsupported(`${m}: the address must be offset(base), a symbol, or a number.`);
}

function expandImmediate(m: string, ops: Operands): Outcome | undefined {
  const form = IMMEDIATE_FORMS[m];
  const [rd, rs, operand] = ops;
  if (form === undefined || ops.length !== 3 || !isReg(rd) || !isReg(rs) || !isExpr(operand)) {
    return undefined;
  }
  if (operand.expr.kind !== 'number')
    return unsupported(`${m}: the immediate operand must be a number.`);
  const n = operand.expr.value;
  const direct = form.negate ? -n | 0 : n;
  if (form.unsigned ? fits16u(direct) : fits16s(direct)) {
    return macro(m, [word(form.immediate, gpr(rd.number), gpr(rs.number), imm(direct))]);
  }
  // VERIFY-11: out of range, the constant is loaded into $at first.
  return macro(m, [
    ...loadImmediate(AT, n),
    word(form.register, gpr(rd.number), gpr(rs.number), gpr(AT)),
  ]);
}

function expandDivide(
  m: 'div' | 'divu' | 'rem' | 'remu',
  ops: Operands,
  ctx: ExpandContext,
): Outcome | undefined {
  const unsigned = m.endsWith('u');
  const divide: TableMnemonic = unsigned ? 'divu' : 'div';
  const move: TableMnemonic = m.startsWith('rem') ? 'mfhi' : 'mflo';
  if (ops.length === 2) {
    if (m === divide) return undefined;
    const [rs, rt] = ops;
    return isReg(rs) && isReg(rt)
      ? macro(m, [word(divide, gpr(rs.number), gpr(rt.number))])
      : expects(m, 'two or three registers');
  }
  const [rd, rs, rt] = ops;
  if (ops.length !== 3 || !isReg(rd) || !isReg(rs) || !isReg(rt)) {
    return expects(m, 'two or three registers');
  }
  const operation = word(divide, gpr(rs.number), gpr(rt.number));
  if (rd.number === 0) return macro(m, [operation]);
  const traps = ctx.partialDivExpansion
    ? []
    : [
        word('bne', gpr(rt.number), gpr(0), skip(2)),
        nop(),
        word('break', imm(7), imm(0)),
        ...(unsigned
          ? []
          : [
              word('addiu', gpr(AT), gpr(0), imm(-1)),
              word('bne', gpr(rt.number), gpr(AT), skip(4)),
              word('lui', gpr(AT), imm(0x8000)),
              word('bne', gpr(rs.number), gpr(AT), skip(2)),
              nop(),
              word('break', imm(6), imm(0)),
            ]),
      ];
  return { words: [operation, ...traps, word(move, gpr(rd.number))], macro: m, divMove: rd.number };
}

function expandRegisterJump(m: 'j' | 'jal', ops: Operands): Outcome | undefined {
  if (!ops.some(isReg)) return undefined;
  const [first, second] = ops;
  if (ops.length === 1 && isReg(first)) {
    return macro(m, [
      m === 'j' ? word('jr', gpr(first.number)) : word('jalr', gpr(RA), gpr(first.number)),
    ]);
  }
  if (m === 'jal' && ops.length === 2 && isReg(first) && isReg(second)) {
    return macro(m, [word('jalr', gpr(first.number), gpr(second.number))]);
  }
  return expects(
    m,
    m === 'j' ? 'a target or a register' : 'a target, a register, or two registers',
  );
}

/** Expand a macro, or return `undefined` to bind the statement natively. */
function expandMacro(m: string, ops: Operands, ctx: ExpandContext): Outcome | undefined {
  switch (m) {
    case 'nop':
      return ops.length === 0 ? macro(m, [nop()]) : expects(m, 'no operands');
    case 'move': {
      const [rd, rs] = ops;
      return ops.length === 2 && isReg(rd) && isReg(rs)
        ? macro(m, [word('addu', gpr(rd.number), gpr(rs.number), gpr(0))])
        : expects(m, 'two registers');
    }
    case 'negu': {
      const [rd, rs = rd] = ops;
      return ops.length <= 2 && isReg(rd) && isReg(rs)
        ? macro(m, [word('subu', gpr(rd.number), gpr(0), gpr(rs.number))])
        : expects(m, 'one or two registers');
    }
    case 'li': {
      const [rd, operand] = ops;
      const n = integerOf(operand);
      return ops.length === 2 && isReg(rd) && n !== undefined
        ? macro(m, loadImmediate(rd.number, n))
        : expects(m, 'a register and an integer');
    }
    case 'la': {
      const [rd, target] = ops;
      if (ops.length === 2 && isReg(rd) && isExpr(target)) {
        if (target.expr.kind === 'number')
          return macro(m, loadImmediate(rd.number, target.expr.value));
        if (target.expr.kind === 'symbol')
          return macro(m, loadAddress(rd.number, target.expr, ctx));
      }
      return expects(m, 'a register and a symbol or an address');
    }
    case 'li.s':
    case 'li.d': {
      const [rd, operand] = ops;
      const n = operand?.kind === 'float' ? operand.value : integerOf(operand);
      if (ops.length !== 2 || !isReg(rd) || n === undefined) {
        return expects(m, 'a register and a floating-point constant');
      }
      if (m === 'li.s') return macro(m, loadSingle(rd.number, n));
      return rd.number === 31
        ? expects(m, 'a register other than $31, which has no pair')
        : macro(m, loadDouble(rd.number, n));
    }
    case 'b': {
      const [target] = ops;
      return ops.length === 1 && isExpr(target)
        ? macro(m, [word('beq', gpr(0), gpr(0), { kind: 'branch', target: target.expr })])
        : expects(m, 'a branch target');
    }
    case 'beqz':
    case 'bnez': {
      const [rs, target] = ops;
      return ops.length === 2 && isReg(rs) && isExpr(target)
        ? macro(m, [
            word(m === 'beqz' ? 'beq' : 'bne', gpr(rs.number), gpr(0), {
              kind: 'branch',
              target: target.expr,
            }),
          ])
        : expects(m, 'a register and a branch target');
    }
    case 'break': {
      const n = integerOf(ops[0]);
      if (ops.length !== 1 || n === undefined) return undefined;
      if (n < 0 || n > 0xfffff) {
        return {
          code: 'immediate-out-of-range',
          message: `break: the code ${String(n)} is outside 0 to 1048575.`,
        };
      }
      // VERIFY-13: a single code is split as maspsx does (test_break): its high
      // bits in [25:16], its low 10 bits in [15:6].
      return {
        words: [{ ...word('break', imm(n >>> 10), imm(n & 0x3ff)), origin: 'instruction' }],
      };
    }
    case 'sll':
    case 'srl':
    case 'sra': {
      // cc1psx writes variable shifts as `sll $2,$4,$5`: the sllv family.
      const [rd, rt, rs] = ops;
      if (ops.length !== 3 || !isReg(rd) || !isReg(rt) || !isReg(rs)) return undefined;
      return macro(m, [word(`${m}v`, gpr(rd.number), gpr(rt.number), gpr(rs.number))]);
    }
    case 'div':
    case 'divu':
    case 'rem':
    case 'remu':
      return expandDivide(m, ops, ctx);
    case 'j':
    case 'jal':
      return expandRegisterJump(m, ops);
    case 'beq':
    case 'bne':
      return ops[1]?.kind === 'expr'
        ? unsupported(`${m} against an immediate is not supported.`)
        : undefined;
    default:
      break;
  }
  if (UNSUPPORTED.has(m)) return unsupported(`${m} is not emitted by cc1psx and is not supported.`);
  if (LOADS.has(m) || STORES.has(m)) return expandLoadStore(m as TableMnemonic, ops, ctx);
  return expandImmediate(m, ops);
}

// ---- native binding ---------------------------------------------------------------

function bindArg(slot: Slot, operand: SourceOperand, position: number): Pending | string {
  const which = `operand ${String(position)}`;
  if (operand.kind === 'float') {
    return `${which}: a floating-point constant is valid only for li.s and li.d.`;
  }
  switch (slot) {
    case 'rd':
    case 'rs':
    case 'rt':
      return operand.kind === 'reg'
        ? { kind: 'gpr', number: operand.number }
        : `${which} must be a register.`;
    case 'cop0':
    case 'cop2d':
    case 'cop2c':
    case 'cop2dRt': {
      if (operand.kind !== 'reg') return `${which} must be a coprocessor register such as $8.`;
      const { unit, space } = COP_SLOTS[slot];
      return { kind: 'cop', number: operand.number, unit, space };
    }
    case 'mem':
      return operand.kind === 'mem'
        ? { kind: 'mem', base: operand.base, offset: operand.offset }
        : `${which} must be offset(base).`;
    case 'branch':
      return operand.kind === 'expr'
        ? { kind: 'branch', target: operand.expr }
        : `${which} must be a branch target.`;
    default:
      return operand.kind === 'expr'
        ? { kind: 'value', expr: operand.expr }
        : `${which} must be ${slot === 'target' ? 'a jump target' : 'an immediate value'}.`;
  }
}

/** Match operands to a table row's syntax, or explain why they do not fit. */
export function bindNative(row: IsaRow, given: Operands): PendingArg[] | string {
  let operands: Operands = given;
  if (row.optional === 'trailing-zero') {
    const zero: SourceOperand = { kind: 'expr', expr: constant(0) };
    operands = [
      ...given,
      ...Array<SourceOperand>(Math.max(0, row.syntax.length - given.length)).fill(zero),
    ];
  } else if (row.optional === 'leading-ra' && given.length === row.syntax.length - 1) {
    operands = [{ kind: 'reg', number: RA }, ...given];
  }
  if (operands.length !== row.syntax.length) {
    const n = row.syntax.length;
    return `takes ${String(n)} operand${n === 1 ? '' : 's'}, not ${String(given.length)}.`;
  }
  const args: PendingArg[] = [];
  for (const [index, [slot, operand]] of zip(row.syntax, operands).entries()) {
    const bound = bindArg(slot, operand, index + 1);
    if (typeof bound === 'string') return bound;
    args.push({ slot, value: bound });
  }
  return args;
}

function expandNative(m: string, ops: Operands): Outcome {
  const row = rowFor(m);
  if (row === undefined) return { code: 'unknown-mnemonic', message: `unknown mnemonic ${m}.` };
  const args = bindNative(row, ops);
  if (typeof args === 'string') return { code: 'invalid-operand', message: `${m} ${args}` };
  return { words: [{ row, args, origin: 'instruction' }] };
}

function expandInstruction(
  statement: InstructionStatement,
  ctx: ExpandContext,
): Expansion | undefined {
  const { mnemonic, operands } = statement;
  const outcome = expandMacro(mnemonic, operands, ctx) ?? expandNative(mnemonic, operands);
  if ('code' in outcome) {
    ctx.diagnostics.error(statement, outcome.code, outcome.message);
    return undefined;
  }
  return outcome;
}

/** Turn statements into the stream the nop and layout passes work on. */
export function expand(statements: readonly Statement[], ctx: ExpandContext): Item[] {
  const items: Item[] = [];
  let section = '.text';
  let reorder = true;
  for (const statement of statements) {
    switch (statement.kind) {
      case 'label':
        items.push({
          kind: 'label',
          name: statement.name,
          line: statement.line,
          column: statement.column,
          transparent: isTransparentLabel(statement.name),
        });
        break;
      case 'directive': {
        const d = statement.directive;
        if (d.kind === 'set') {
          if (d.option === 'reorder') reorder = true;
          else if (d.option === 'noreorder') reorder = false;
          items.push({ kind: 'set', option: d.option, line: statement.line });
          break;
        }
        if (d.kind === 'ignored' && d.transparent) break;
        if (d.kind === 'section') section = d.name;
        // Every function starts in reorder mode.
        if (d.kind === 'end') reorder = true;
        items.push({
          kind: 'directive',
          directive: d,
          line: statement.line,
          column: statement.column,
        });
        break;
      }
      case 'instruction': {
        if (sectionKind(section) !== 'code') {
          ctx.diagnostics.error(
            statement,
            'unsupported-syntax',
            `instructions belong in a code section, not ${section}.`,
          );
          break;
        }
        const expansion = expandInstruction(statement, ctx);
        if (expansion !== undefined) {
          items.push({
            kind: 'group',
            line: statement.line,
            column: statement.column,
            section,
            reorder,
            words: expansion.words,
            ...(expansion.macro === undefined ? {} : { macro: expansion.macro }),
            ...(expansion.divMove === undefined ? {} : { divMove: expansion.divMove }),
          });
        }
        break;
      }
    }
  }
  return items;
}
