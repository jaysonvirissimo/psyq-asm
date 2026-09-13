// SPDX-License-Identifier: MIT
/** The expansion pass: statements to the stream of pending words (docs/ASPSX-2.81.md). */
import { COP_SLOTS, type Slot } from '../isa/fields.js';
import { rowFor, type IsaRow } from '../isa/table.js';
import type { SmallDataEntry } from '../public-types.js';
import { zip } from '../util.js';
import type { Diagnostics } from './diagnostics.js';
import type { SourceOperand } from './operands.js';
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
export function bindNative(row: IsaRow, given: readonly SourceOperand[]): PendingArg[] | string {
  let operands = given;
  if (given.length === row.syntax.length - 1) {
    if (row.optional === 'leading-ra') operands = [{ kind: 'reg', number: 31 }, ...given];
    else if (row.optional === 'trailing-zero') {
      operands = [...given, { kind: 'expr', expr: { kind: 'number', value: 0 } }];
    }
  }
  if (operands.length !== row.syntax.length) {
    const n = row.syntax.length;
    return `takes ${String(n)} operand${n === 1 ? '' : 's'}, not ${String(given.length)}.`;
  }
  const args: PendingArg[] = [];
  for (const [index, [slot, operand]] of zip(row.syntax, operands).entries()) {
    const value = bindArg(slot, operand, index + 1);
    if (typeof value === 'string') return value;
    args.push({ slot, value });
  }
  return args;
}

function expandInstruction(
  statement: InstructionStatement,
  ctx: ExpandContext,
): PendingWord[] | undefined {
  const row = rowFor(statement.mnemonic);
  if (row === undefined) {
    ctx.diagnostics.error(statement, 'unknown-mnemonic', `unknown mnemonic ${statement.mnemonic}.`);
    return undefined;
  }
  const args = bindNative(row, statement.operands);
  if (typeof args === 'string') {
    ctx.diagnostics.error(statement, 'invalid-operand', `${statement.mnemonic} ${args}`);
    return undefined;
  }
  return [{ row, args, origin: 'instruction' }];
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
        const words = expandInstruction(statement, ctx);
        if (words !== undefined) {
          items.push({
            kind: 'group',
            line: statement.line,
            column: statement.column,
            section,
            reorder,
            words,
          });
        }
        break;
      }
    }
  }
  return items;
}
