// SPDX-License-Identifier: MIT
import { InvalidInstructionError } from '../errors.js';
import type { Instruction, Operand, UnknownInstruction } from '../public-types.js';
import { COP_SLOTS, signExtend16, type Slot } from './fields.js';
import { buildInstruction, reservedBits } from './instruction.js';
import { ISA_ROWS, type IsaRow } from './table.js';

interface Candidate {
  readonly row: IsaRow;
  /** Bits that must be zero for a word to be this row. */
  readonly reserved: number;
}

/** Rows grouped by primary opcode, each with its reserved bits precomputed. */
const BY_OPCODE: ReadonlyMap<number, readonly Candidate[]> = (() => {
  const map = new Map<number, Candidate[]>();
  for (const row of ISA_ROWS) {
    const op = row.value >>> 26;
    const bucket = map.get(op) ?? [];
    bucket.push({ row, reserved: reservedBits(row) });
    map.set(op, bucket);
  }
  return map;
})();

function hex(value: number, digits: number): string {
  return `0x${value.toString(16).toUpperCase().padStart(digits, '0')}`;
}

function operandFor(slot: Slot, word: number): Operand {
  switch (slot) {
    case 'rd':
      return { kind: 'gpr', number: (word >>> 11) & 31 };
    case 'rs':
      return { kind: 'gpr', number: (word >>> 21) & 31 };
    case 'rt':
      return { kind: 'gpr', number: (word >>> 16) & 31 };
    case 'sa':
      return { kind: 'shamt', value: (word >>> 6) & 31 };
    case 'imm16s':
      return { kind: 'imm', value: signExtend16(word), bits: 16, signed: true };
    case 'imm16u':
      return { kind: 'imm', value: word & 0xffff, bits: 16, signed: false };
    case 'mem':
      return { kind: 'mem', base: (word >>> 21) & 31, offset: signExtend16(word) };
    case 'branch':
      return { kind: 'branch', displacement: signExtend16(word) };
    case 'target':
      return { kind: 'target', index: word & 0x03ffffff };
    case 'code20':
      return { kind: 'imm', value: (word >>> 6) & 0xfffff, bits: 20, signed: false };
    case 'break20':
      // VERIFY-13: low 10 bits of the code in [25:16], high 10 bits in [15:6].
      return {
        kind: 'imm',
        value: ((word >>> 16) & 0x3ff) | (((word >>> 6) & 0x3ff) << 10),
        bits: 20,
        signed: false,
      };
    case 'code10':
      return { kind: 'imm', value: (word >>> 6) & 0x3ff, bits: 10, signed: false };
    case 'imm25':
      return { kind: 'imm', value: word & 0x01ffffff, bits: 25, signed: false };
    case 'cop0':
    case 'cop2d':
    case 'cop2c':
    case 'cop2dRt': {
      const { unit, space, shift } = COP_SLOTS[slot];
      return { kind: 'cop', number: (word >>> shift) & 31, unit, space };
    }
  }
}

function unknownReason(word: number): string {
  const op = word >>> 26;
  switch (op) {
    case 0x00:
      return `unknown SPECIAL function ${hex(word & 0x3f, 2)}`;
    case 0x01:
      return `unknown REGIMM condition ${hex((word >>> 16) & 31, 2)}`;
    case 0x10:
      return 'unknown coprocessor 0 operation';
    case 0x12:
      return 'unknown coprocessor 2 operation';
    default:
      return `unknown opcode ${hex(op, 2)}`;
  }
}

/**
 * Decode one R3000 word. Reserved and unknown encodings return an
 * `UnknownInstruction` rather than throwing. Throws `InvalidInstructionError`
 * only when `word` is not a 32-bit integer (signed or unsigned).
 */
export function decode(word: number): Instruction | UnknownInstruction {
  if (!Number.isInteger(word) || word < -0x80000000 || word > 0xffffffff) {
    throw new InvalidInstructionError(`word must be a 32-bit integer, not ${String(word)}.`);
  }
  const w = word >>> 0;
  for (const { row: r, reserved } of BY_OPCODE.get(w >>> 26) ?? []) {
    if ((w & r.mask) >>> 0 !== r.value) continue;
    if ((w & reserved) >>> 0 !== 0) {
      return { mnemonic: '.word', word: w, reason: `${r.mnemonic} with reserved bits set` };
    }
    return buildInstruction(
      r,
      r.syntax.map((slot) => operandFor(slot, w)),
      w,
    );
  }
  return { mnemonic: '.word', word: w, reason: unknownReason(w) };
}
