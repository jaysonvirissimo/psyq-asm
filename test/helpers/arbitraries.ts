// SPDX-License-Identifier: MIT
import fc from 'fast-check';
import { COP_SLOTS, type Slot } from '../../src/isa/fields.js';
import type { Operand } from '../../src/public-types.js';

const register = fc.integer({ min: 0, max: 31 });

/** Any value an operand slot can hold, in the shape `decode` produces. */
export function operandArbitrary(slot: Slot): fc.Arbitrary<Operand> {
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
      return fc
        .integer({ min: 0, max: 0xfffff })
        .map((value) => ({ kind: 'imm', value, bits: 20, signed: false }));
    case 'code10':
    case 'code10hi':
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
