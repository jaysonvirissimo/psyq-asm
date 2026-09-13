// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { InvalidInstructionError } from '../../../src/errors.js';
import { encode } from '../../../src/isa/encode.js';
import type { EncodableInstruction, Operand } from '../../../src/public-types.js';

const gpr = (number: number): Operand => ({ kind: 'gpr', number });
const imm = (value: number, bits: 10 | 16 | 20 | 25 = 16, signed = true): Operand => ({
  kind: 'imm',
  value,
  bits,
  signed,
});

function insn(mnemonic: string, ...operands: unknown[]): EncodableInstruction {
  return { mnemonic, operands } as unknown as EncodableInstruction;
}

describe('encode', () => {
  it('encodes each operand kind into its field', () => {
    expect(encode(insn('addiu', gpr(29), gpr(29), imm(-88)))).toBe(0x27bdffa8);
    expect(encode(insn('sw', gpr(31), { kind: 'mem', base: 29, offset: 0x54 }))).toBe(0xafbf0054);
    expect(encode(insn('sll', gpr(2), gpr(2), { kind: 'shamt', value: 3 }))).toBe(0x000210c0);
    expect(encode(insn('bne', gpr(6), gpr(0), { kind: 'branch', displacement: 2 }))).toBe(
      0x14c00002,
    );
    expect(encode(insn('bne', gpr(6), gpr(0), { kind: 'branch', displacement: -1 }))).toBe(
      0x14c0ffff,
    );
    expect(encode(insn('jal', { kind: 'target', index: 0x10 }))).toBe(0x0c000010);
    expect(encode(insn('ori', gpr(2), gpr(2), imm(0xffff, 16, false)))).toBe(0x3442ffff);
    expect(encode(insn('cop2', imm(0x180001, 25, false)))).toBe(0x4a180001);
    expect(
      encode(insn('ctc2', gpr(8), { kind: 'cop', number: 4, unit: 2, space: 'control' })),
    ).toBe(0x48c82000);
    expect(
      encode(
        insn(
          'lwc2',
          { kind: 'cop', number: 5, unit: 2, space: 'data' },
          { kind: 'mem', base: 4, offset: 4 },
        ),
      ),
    ).toBe(0xc8850004);
    expect(encode(insn('mtc0', gpr(2), { kind: 'cop', number: 12, unit: 0, space: 'data' }))).toBe(
      0x40826000,
    );
    expect(encode(insn('syscall', imm(5, 20, false)))).toBe(0x0000014c);
    expect(encode(insn('tge', gpr(0), gpr(0), imm(93, 10, false)))).toBe(0x00001770);
    expect(encode(insn('rfe'))).toBe(0x42000010);
  });

  it('splits break codes: low 10 bits in [25:16], high bits in [15:6] (VERIFY-13)', () => {
    expect(encode(insn('break', imm(7, 20, false)))).toBe(0x0007000d);
    expect(encode(insn('break', imm(0x407, 20, false)))).toBe(0x0007004d);
  });

  it('fills omitted optional operands', () => {
    expect(encode(insn('jalr', gpr(2)))).toBe(0x0040f809);
    expect(encode(insn('jalr', gpr(3), gpr(2)))).toBe(0x00401809);
    expect(encode(insn('syscall'))).toBe(0x0000000c);
    expect(encode(insn('break'))).toBe(0x0000000d);
    expect(encode(insn('tge', gpr(1), gpr(2)))).toBe(0x00220030);
  });

  it.each([
    [null, 'instruction must be an object with a mnemonic and an operands array.'],
    [{ mnemonic: 'nop' }, 'instruction must be an object with a mnemonic and an operands array.'],
    [
      { mnemonic: 5, operands: [] },
      'instruction must be an object with a mnemonic and an operands array.',
    ],
    [insn('mul', gpr(2), gpr(3), gpr(4)), 'unknown mnemonic "mul".'],
    [insn('addu', gpr(2), gpr(3)), 'addu takes 3 operands, not 2.'],
    [insn('jr'), 'jr takes 1 operands, not 0.'],
    [insn('addiu', gpr(2), gpr(3), gpr(4)), 'addiu operand 3 must be of kind imm, not gpr.'],
    [insn('addiu', gpr(2), 3, imm(1)), 'addiu operand 2 must be of kind gpr, not number.'],
    [insn('addiu', gpr(2), null, imm(1)), 'addiu operand 2 must be of kind gpr, not object.'],
    [
      insn('addu', gpr(32), gpr(0), gpr(0)),
      'addu operand 1: register must be an integer from 0 to 31, not 32.',
    ],
    [
      insn('addu', gpr(0), gpr(-1), gpr(0)),
      'addu operand 2: register must be an integer from 0 to 31, not -1.',
    ],
    [
      insn('addu', gpr(0), gpr(0), gpr(1.5)),
      'addu operand 3: register must be an integer from 0 to 31, not 1.5.',
    ],
    [
      insn('addu', gpr(0), gpr(0), { kind: 'gpr' }),
      'addu operand 3: register must be an integer from 0 to 31, not undefined.',
    ],
    [
      insn('sll', gpr(0), gpr(0), { kind: 'shamt', value: 32 }),
      'sll operand 3: shift amount must be an integer from 0 to 31, not 32.',
    ],
    [
      insn('addiu', gpr(0), gpr(0), imm(0x8000)),
      'addiu operand 3: signed 16-bit immediate must be an integer from -32768 to 32767, not 32768.',
    ],
    [
      insn('ori', gpr(0), gpr(0), imm(-1)),
      'ori operand 3: unsigned 16-bit immediate must be an integer from 0 to 65535, not -1.',
    ],
    [
      insn('lw', gpr(2), { kind: 'mem', base: 32, offset: 0 }),
      'lw operand 2: base register must be an integer from 0 to 31, not 32.',
    ],
    [
      insn('lw', gpr(2), { kind: 'mem', base: 4, offset: -32769 }),
      'lw operand 2: offset must be an integer from -32768 to 32767, not -32769.',
    ],
    [
      insn('beq', gpr(0), gpr(0), { kind: 'branch', displacement: 32768 }),
      'beq operand 3: branch displacement must be an integer from -32768 to 32767, not 32768.',
    ],
    [
      insn('j', { kind: 'target', index: 0x4000000 }),
      'j operand 1: jump index must be an integer from 0 to 67108863, not 67108864.',
    ],
    [
      insn('syscall', imm(0x100000, 20, false)),
      'syscall operand 1: code must be an integer from 0 to 1048575, not 1048576.',
    ],
    [
      insn('break', imm(-1, 20, false)),
      'break operand 1: code must be an integer from 0 to 1048575, not -1.',
    ],
    [
      insn('tge', gpr(0), gpr(0), imm(1024, 10, false)),
      'tge operand 3: code must be an integer from 0 to 1023, not 1024.',
    ],
    [
      insn('cop2', imm(0x2000000, 25, false)),
      'cop2 operand 1: coprocessor command must be an integer from 0 to 33554431, not 33554432.',
    ],
    [
      insn('mfc2', gpr(2), { kind: 'cop', number: 32, unit: 2, space: 'data' }),
      'mfc2 operand 2: coprocessor register must be an integer from 0 to 31, not 32.',
    ],
    [
      insn('cfc2', gpr(2), { kind: 'cop', number: 8, unit: 2, space: 'data' }),
      'cfc2 operand 2 must be a coprocessor 2 control register.',
    ],
    [
      insn('mfc0', gpr(2), { kind: 'cop', number: 8, unit: 2, space: 'data' }),
      'mfc0 operand 2 must be a coprocessor 0 data register.',
    ],
  ])('rejects %j', (instruction, message) => {
    expect(() => encode(instruction as EncodableInstruction)).toThrow(
      new InvalidInstructionError(message),
    );
  });
});
