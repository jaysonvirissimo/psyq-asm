// SPDX-License-Identifier: MIT
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { decode } from '../../src/isa/decode.js';
import { encode } from '../../src/isa/encode.js';
import { COP_SLOTS, SLOT_BITS, type Slot } from '../../src/isa/fields.js';
import { ISA_ROWS } from '../../src/isa/table.js';
import type { Operand } from '../../src/public-types.js';

const register = fc.integer({ min: 0, max: 31 });

function operandArbitrary(slot: Slot): fc.Arbitrary<Operand> {
  switch (slot) {
    case 'rd':
    case 'rs':
    case 'rt':
      return register.map((number) => ({ kind: 'gpr', number }));
    case 'sa':
      return register.map((value) => ({ kind: 'shamt', value }));
    case 'imm16s':
      return fc
        .integer({ min: -0x8000, max: 0x7fff })
        .map((value) => ({ kind: 'imm', value, bits: 16, signed: true }));
    case 'imm16u':
      return fc
        .integer({ min: 0, max: 0xffff })
        .map((value) => ({ kind: 'imm', value, bits: 16, signed: false }));
    case 'mem':
      return fc
        .tuple(register, fc.integer({ min: -0x8000, max: 0x7fff }))
        .map(([base, offset]) => ({ kind: 'mem', base, offset }));
    case 'branch':
      return fc
        .integer({ min: -0x8000, max: 0x7fff })
        .map((displacement) => ({ kind: 'branch', displacement }));
    case 'target':
      return fc.integer({ min: 0, max: 0x03ffffff }).map((index) => ({ kind: 'target', index }));
    case 'code20':
    case 'break20':
      return fc
        .integer({ min: 0, max: 0xfffff })
        .map((value) => ({ kind: 'imm', value, bits: 20, signed: false }));
    case 'code10':
      return fc
        .integer({ min: 0, max: 0x3ff })
        .map((value) => ({ kind: 'imm', value, bits: 10, signed: false }));
    case 'imm25':
      return fc
        .integer({ min: 0, max: 0x01ffffff })
        .map((value) => ({ kind: 'imm', value, bits: 25, signed: false }));
    case 'cop0':
    case 'cop2d':
    case 'cop2c':
    case 'cop2dRt': {
      const { unit, space } = COP_SLOTS[slot];
      return register.map((number) => ({ kind: 'cop', number, unit, space }));
    }
  }
}

describe('encode and decode (property)', () => {
  it.each(ISA_ROWS.map((r) => [r.mnemonic, r] as const))(
    'decode(encode(%s ...)) returns the same operands',
    (_, row) => {
      const operands = fc.tuple(...row.syntax.map((slot) => operandArbitrary(slot)));
      fc.assert(
        fc.property(operands, (ops) => {
          const word = encode({ mnemonic: row.mnemonic, operands: ops });
          const decoded = decode(word);
          expect(decoded.mnemonic).toBe(row.mnemonic);
          expect('operands' in decoded ? decoded.operands : undefined).toEqual(ops);
        }),
        { numRuns: 200 },
      );
    },
  );

  it('encode(decode(w)) === w for every word that decodes', () => {
    const anyWord = fc.integer({ min: 0, max: 0xffffffff });
    // Words built from a row's selector plus random operand bits, so that valid
    // encodings are well represented, not only the sparse random hits.
    const rowWord = fc
      .tuple(fc.constantFrom(...ISA_ROWS), fc.integer({ min: 0, max: 0xffffffff }))
      .map(([r, noise]) => {
        const operandBits = r.syntax.reduce((bits, slot) => bits | SLOT_BITS[slot], 0);
        return (r.value | (noise & operandBits)) >>> 0;
      });
    fc.assert(
      fc.property(fc.oneof(anyWord, rowWord), (word) => {
        const decoded = decode(word);
        if (decoded.mnemonic === '.word') {
          expect(decoded.word).toBe(word);
        } else {
          expect(encode(decoded)).toBe(word);
        }
      }),
      { numRuns: 20_000 },
    );
  });
});
