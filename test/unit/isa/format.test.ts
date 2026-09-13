// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { InvalidOptionsError } from '../../../src/errors.js';
import { decode } from '../../../src/isa/decode.js';
import { format, formatNumber } from '../../../src/isa/format.js';
import type { FormatStyle, Instruction } from '../../../src/public-types.js';

const f = (word: number, style?: FormatStyle): string => format(decode(word), style);

describe('format', () => {
  it('renders registers by ABI name or number, and numbers in either radix', () => {
    expect(f(0x8e020020)).toBe('lw $v0,0x20($s0)');
    expect(f(0x8e020020, { registers: 'numeric' })).toBe('lw $2,0x20($16)');
    expect(f(0x8e020020, { registers: 'numeric', hex: false })).toBe('lw $2,32($16)');
    expect(f(0x27bdffa8, { hex: false })).toBe('addiu $sp,$sp,-88');
    expect(f(0x0c000010, { hex: false })).toBe('jal 64');
    expect(f(0x48444000, { registers: 'numeric' })).toBe('cfc2 $4,$8');
    const outOfRange: Instruction = {
      mnemonic: 'jr',
      format: 'R',
      operands: [{ kind: 'gpr', number: 40 }],
      reads: [],
      writes: [],
      hazardClass: 'jump',
    };
    expect(format(outOfRange)).toBe('jr $40');
  });

  it('writes branch targets relative to the branch', () => {
    expect(f(0x1000ffff)).toBe('beq $zero,$zero,.+0');
    expect(f(0x1000fffe)).toBe('beq $zero,$zero,.-4');
    expect(f(0x04010003)).toBe('bgez $zero,.+16');
  });

  it('keeps codes decimal and omits them at zero', () => {
    expect(f(0x0000000d)).toBe('break');
    expect(f(0x0007000d, { hex: true })).toBe('break 7,0');
    expect(f(0x000001cd)).toBe('break 0,7');
    expect(f(0x0000014c)).toBe('syscall 5');
    expect(f(0x00220030)).toBe('tge $at,$v0');
  });

  it('omits the link register of jalr only when it is $ra', () => {
    expect(f(0x0040f809)).toBe('jalr $v0');
    expect(f(0x00401809)).toBe('jalr $v1,$v0');
  });

  it('renders pseudo-instructions only when asked', () => {
    expect(f(0x00000000, { pseudo: true })).toBe('nop');
    expect(f(0x00000040, { pseudo: true })).toBe('sll $zero,$zero,1');
    expect(f(0x00021000, { pseudo: true })).toBe('sll $v0,$v0,0');
    expect(f(0x00a01021, { pseudo: true })).toBe('move $v0,$a1');
    expect(f(0x00a01021)).toBe('addu $v0,$a1,$zero');
    expect(f(0x10400003, { pseudo: true })).toBe('beqz $v0,.+16');
    expect(f(0x14400003, { pseudo: true })).toBe('bnez $v0,.+16');
    expect(f(0x10020003, { pseudo: true })).toBe('beq $zero,$v0,.+16');
    expect(f(0x00a01025, { pseudo: true })).toBe('or $v0,$a1,$zero');
  });

  it('renders unknown words as .word', () => {
    expect(f(0xffffffff)).toBe('.word 0xFFFFFFFF');
    expect(f(0x0000003f)).toBe('.word 0x0000003F');
  });

  it('tolerates hand-built instructions with omitted optional operands', () => {
    const partial: Instruction = {
      mnemonic: 'addu',
      format: 'R',
      operands: [{ kind: 'gpr', number: 2 }],
      reads: [],
      writes: [],
      hazardClass: 'none',
    };
    expect(format(partial, { pseudo: true })).toBe('addu $v0');
    expect(format({ ...partial, mnemonic: 'syscall', operands: [] })).toBe('syscall');
    expect(
      format({
        ...partial,
        mnemonic: 'tge',
        operands: [
          { kind: 'gpr', number: 1 },
          { kind: 'imm', value: 0, bits: 10, signed: false },
        ],
      }),
    ).toBe('tge $at,0');
    expect(
      format(
        {
          ...partial,
          mnemonic: 'sll',
          operands: [
            { kind: 'gpr', number: 0 },
            { kind: 'gpr', number: 0 },
            { kind: 'gpr', number: 0 },
          ],
        },
        { pseudo: true },
      ),
    ).toBe('sll $zero,$zero,$zero');
  });

  it.each([
    [null, 'style must be an object.'],
    [['abi'], 'style must be an object.'],
    [{ registers: 'hex' }, `style.registers must be 'numeric' or 'abi', not "hex".`],
    [{ pseudo: 'yes' }, 'style.pseudo must be a boolean, not "yes".'],
    [{ hex: 1 }, 'style.hex must be a boolean, not 1.'],
  ])('rejects the style %j', (style, message) => {
    expect(() => format(decode(0), style as FormatStyle)).toThrow(new InvalidOptionsError(message));
  });

  it('formats numbers with upper-case hexadecimal digits', () => {
    expect(formatNumber(-0x58, true)).toBe('-0x58');
    expect(formatNumber(0xabc, true)).toBe('0xABC');
    expect(formatNumber(-7, false)).toBe('-7');
  });
});
