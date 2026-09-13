// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { decode } from '../../../src/isa/decode.js';
import { SLOT_BITS, hi16, lo16, signExtend16 } from '../../../src/isa/fields.js';
import { hazardReadsOf, reservedBits } from '../../../src/isa/instruction.js';
import { ISA_ROWS, rowFor } from '../../../src/isa/table.js';

describe('instruction table', () => {
  it('covers every mnemonic of the R3000 integer set, GTE moves, and commands', () => {
    const names = ISA_ROWS.map((r) => r.mnemonic);
    expect(new Set(names).size).toBe(names.length);
    for (const name of [
      'sll srl sra sllv srlv srav jr jalr syscall break mfhi mthi mflo mtlo',
      'mult multu div divu add addu sub subu and or xor nor slt sltu',
      'bltz bgez bltzal bgezal j jal beq bne blez bgtz addi addiu slti sltiu andi ori xori lui',
      'lb lh lwl lw lbu lhu lwr sb sh swl sw swr lwc2 swc2',
      'mfc0 mtc0 rfe mfc2 cfc2 mtc2 ctc2 cop2',
    ].flatMap((line) => line.split(' '))) {
      expect(rowFor(name), name).toBeDefined();
    }
    expect(rowFor('mul')).toBeUndefined();
    expect(rowFor('nop')).toBeUndefined();
  });

  it('selects every row by bits that no other row shares', () => {
    for (const a of ISA_ROWS) {
      expect((a.value & ~a.mask) >>> 0, a.mnemonic).toBe(0);
      for (const b of ISA_ROWS) {
        if (a === b) continue;
        const common = (a.mask & b.mask) >>> 0;
        expect((a.value & common) >>> 0, `${a.mnemonic} vs ${b.mnemonic}`).not.toBe(
          (b.value & common) >>> 0,
        );
      }
    }
  });

  it('gives each operand its own bits, outside the selector', () => {
    for (const r of ISA_ROWS) {
      let owned = r.mask;
      for (const slot of r.syntax) {
        expect((owned & SLOT_BITS[slot]) >>> 0, `${r.mnemonic} ${slot}`).toBe(0);
        owned |= SLOT_BITS[slot];
      }
      expect(reservedBits(r)).toBe(~owned >>> 0);
    }
  });

  it('decodes each row from its selector bits alone', () => {
    for (const r of ISA_ROWS) expect(decode(r.value).mnemonic).toBe(r.mnemonic);
  });

  it('counts only the base of lwl and lwr as read for the load-delay rule', () => {
    const hazardReads = (mnemonic: string, word: number): number[] => {
      const r = rowFor(mnemonic);
      if (r === undefined) throw new Error(`no row ${mnemonic}`);
      return hazardReadsOf(r, word);
    };
    expect(hazardReads('lwl', 0x88430000)).toEqual([2]);
    expect(hazardReads('lwr', 0x98430000)).toEqual([2]);
    expect(hazardReads('lw', 0x8c430000)).toEqual([2]);
    expect(hazardReads('sw', 0xac430000)).toEqual([2, 3]);
  });
});

describe('field helpers', () => {
  it('sign-extends 16-bit fields', () => {
    expect(signExtend16(0x7fff)).toBe(32767);
    expect(signExtend16(0x8000)).toBe(-32768);
    expect(signExtend16(0x1ffff)).toBe(-1);
  });

  it('splits values into %hi and %lo halves that recombine', () => {
    for (const value of [
      0, 1, -1, 0x7fff, 0x8000, -0x8000, -0x8001, 0x12345678, -0x7fffffff, 0x7fffffff,
    ]) {
      const recombined = ((hi16(value) << 16) + signExtend16(lo16(value))) | 0;
      expect(recombined, String(value)).toBe(value | 0);
    }
    expect(hi16(0x8000)).toBe(1);
    expect(hi16(-1)).toBe(0);
    expect(lo16(-0x8000)).toBe(0x8000);
  });
});
