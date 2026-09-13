// SPDX-License-Identifier: MIT
/** Derivations shared by the encoder and decoder: reserved bits and register use. */
import type { Instruction, Mnemonic, Operand } from '../public-types.js';
import { SLOT_BITS } from './fields.js';
import type { IsaRow, RegisterRef } from './table.js';

/** Bits that must be zero in a word of this row: neither selector nor operand. */
export function reservedBits(row: IsaRow): number {
  const owned = row.syntax.reduce((bits, slot) => bits | SLOT_BITS[slot], row.mask);
  return ~owned >>> 0;
}

function registerOf(ref: RegisterRef, word: number): number {
  switch (ref) {
    case 'rs':
      return (word >>> 21) & 31;
    case 'rt':
      return (word >>> 16) & 31;
    case 'rd':
      return (word >>> 11) & 31;
    case 31:
      return 31;
  }
}

/**
 * Resolve register references against an encoded word. `$0` is hard-wired to
 * zero, so it is never reported as read or written.
 */
export function registersOf(refs: readonly RegisterRef[], word: number): number[] {
  const out: number[] = [];
  for (const ref of refs) {
    const n = registerOf(ref, word);
    if (n !== 0 && !out.includes(n)) out.push(n);
  }
  return out;
}

/** Registers that count as read for the load-delay rule. */
export function hazardReadsOf(row: IsaRow, word: number): number[] {
  return registersOf(row.hazardReads ?? row.reads, word);
}

/** Assemble the public `Instruction` for a row, its canonical operands, and its word. */
export function buildInstruction(
  row: IsaRow,
  operands: readonly Operand[],
  word: number,
): Instruction {
  return {
    mnemonic: row.mnemonic as Mnemonic,
    format: row.format,
    operands,
    reads: registersOf(row.reads, word),
    writes: registersOf(row.writes, word),
    hazardClass: row.hazard,
  };
}
