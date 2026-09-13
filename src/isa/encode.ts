// SPDX-License-Identifier: MIT
import { InvalidInstructionError } from '../errors.js';
import { isRecord } from '../options.js';
import type { EncodableInstruction, Operand } from '../public-types.js';
import { COP_SLOTS, type Slot } from './fields.js';
import { rowFor, type IsaRow } from './table.js';

const EXPECTED_KIND: Readonly<Record<Slot, Operand['kind']>> = {
  rd: 'gpr',
  rs: 'gpr',
  rt: 'gpr',
  sa: 'shamt',
  imm16s: 'imm',
  imm16u: 'imm',
  mem: 'mem',
  branch: 'branch',
  target: 'target',
  code20: 'imm',
  code10hi: 'imm',
  code10: 'imm',
  imm25: 'imm',
  cop0: 'cop',
  cop2d: 'cop',
  cop2c: 'cop',
  cop2dRt: 'cop',
};

/** Reads one integer field of an operand, or throws naming the operand. */
type FieldReader = (key: string, min: number, max: number, what: string) => number;

function fieldReader(operand: Record<string, unknown>, position: string): FieldReader {
  return (key, min, max, what) => {
    const value = operand[key];
    if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
      throw new InvalidInstructionError(
        `${position}: ${what} must be an integer from ${String(min)} to ${String(max)}, not ${String(value)}.`,
      );
    }
    return value;
  };
}

/** The bits one operand contributes to the word. */
function fieldBits(
  slot: Slot,
  field: FieldReader,
  operand: Record<string, unknown>,
  position: string,
): number {
  switch (slot) {
    case 'rd':
      return field('number', 0, 31, 'register') << 11;
    case 'rs':
      return field('number', 0, 31, 'register') << 21;
    case 'rt':
      return field('number', 0, 31, 'register') << 16;
    case 'sa':
      return field('value', 0, 31, 'shift amount') << 6;
    case 'imm16s':
      return field('value', -0x8000, 0x7fff, 'signed 16-bit immediate') & 0xffff;
    case 'imm16u':
      return field('value', 0, 0xffff, 'unsigned 16-bit immediate');
    case 'mem':
      return (
        (field('base', 0, 31, 'base register') << 21) |
        (field('offset', -0x8000, 0x7fff, 'offset') & 0xffff)
      );
    case 'branch':
      return field('displacement', -0x8000, 0x7fff, 'branch displacement') & 0xffff;
    case 'target':
      return field('index', 0, 0x03ffffff, 'jump index');
    case 'code20':
      return field('value', 0, 0xfffff, 'code') << 6;
    case 'code10hi':
      return field('value', 0, 0x3ff, 'code') << 16;
    case 'code10':
      return field('value', 0, 0x3ff, 'code') << 6;
    case 'imm25':
      return field('value', 0, 0x01ffffff, 'coprocessor command');
    case 'cop0':
    case 'cop2d':
    case 'cop2c':
    case 'cop2dRt': {
      const n = field('number', 0, 31, 'coprocessor register');
      const { unit, space, shift } = COP_SLOTS[slot];
      if (operand['unit'] !== unit || operand['space'] !== space) {
        throw new InvalidInstructionError(
          `${position} must be a coprocessor ${String(unit)} ${space} register.`,
        );
      }
      return n << shift;
    }
  }
}

/** Fill omitted optional operands so the list matches the row's syntax. */
function canonicalOperands(row: IsaRow, operands: readonly unknown[]): readonly unknown[] {
  if (row.optional === 'trailing-zero' && operands.length < row.syntax.length) {
    const missing = row.syntax.length - operands.length;
    return [...operands, ...Array<unknown>(missing).fill({ kind: 'imm', value: 0 })];
  }
  if (row.optional === 'leading-ra' && operands.length === row.syntax.length - 1) {
    return [{ kind: 'gpr', number: 31 }, ...operands];
  }
  return operands;
}

/**
 * Encode one instruction. The operands are in assembly order, as `decode`
 * produces them; `jalr rs` may omit the link register and `syscall`, `break`,
 * and `tge` may omit their code. Throws `InvalidInstructionError` for an
 * unknown mnemonic or an operand that does not fit.
 */
export function encode(instruction: EncodableInstruction): number {
  const candidate: unknown = instruction;
  if (
    !isRecord(candidate) ||
    typeof candidate['mnemonic'] !== 'string' ||
    !Array.isArray(candidate['operands'])
  ) {
    throw new InvalidInstructionError(
      'instruction must be an object with a mnemonic and an operands array.',
    );
  }
  const mnemonic = candidate['mnemonic'];
  const given: readonly unknown[] = candidate['operands'];
  const row = rowFor(mnemonic);
  if (row === undefined) {
    throw new InvalidInstructionError(`unknown mnemonic ${JSON.stringify(mnemonic)}.`);
  }
  const operands = canonicalOperands(row, given);
  if (operands.length !== row.syntax.length) {
    throw new InvalidInstructionError(
      `${mnemonic} takes ${String(row.syntax.length)} operands, not ${String(given.length)}.`,
    );
  }
  let word = row.value;
  row.syntax.forEach((slot, index) => {
    const operand = operands[index];
    const position = `${mnemonic} operand ${String(index + 1)}`;
    const expected = EXPECTED_KIND[slot];
    if (!isRecord(operand) || operand['kind'] !== expected) {
      const kind = isRecord(operand) ? String(operand['kind']) : typeof operand;
      throw new InvalidInstructionError(`${position} must be of kind ${expected}, not ${kind}.`);
    }
    word |= fieldBits(slot, fieldReader(operand, position), operand, position);
  });
  return word >>> 0;
}
