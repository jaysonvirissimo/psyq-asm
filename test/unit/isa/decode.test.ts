// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { InvalidInstructionError } from '../../../src/errors.js';
import { decode } from '../../../src/isa/decode.js';
import { encode } from '../../../src/isa/encode.js';
import { format } from '../../../src/isa/format.js';
import type { Instruction } from '../../../src/public-types.js';
import { loadAspsxFixtures, parseWord } from '../../helpers/fixtures.js';

/** Words ASPSX is known to emit, with the text this package renders for them. */
const KNOWN: readonly (readonly [number, string])[] = [
  [0x27bdffa8, 'addiu $sp,$sp,-0x58'],
  [0xafbf0054, 'sw $ra,0x54($sp)'],
  [0x0086001a, 'div $a0,$a2'],
  [0x14c00002, 'bne $a2,$zero,.+12'],
  [0x0007000d, 'break 7,0'],
  [0x2401ffff, 'addiu $at,$zero,-0x1'],
  [0x14c10004, 'bne $a2,$at,.+20'],
  [0x3c018000, 'lui $at,0x8000'],
  [0x14810002, 'bne $a0,$at,.+12'],
  [0x0006000d, 'break 6,0'],
  [0x00001012, 'mflo $v0'],
  [0x24020000, 'addiu $v0,$zero,0x0'],
  [0x3c020001, 'lui $v0,0x1'],
  [0x34420001, 'ori $v0,$v0,0x1'],
  [0x2402ffff, 'addiu $v0,$zero,-0x1'],
  [0x24028000, 'addiu $v0,$zero,-0x8000'],
  [0x3c02ffff, 'lui $v0,0xFFFF'],
  [0x34427fff, 'ori $v0,$v0,0x7FFF'],
  [0x2c63ffe9, 'sltiu $v1,$v1,-0x17'],
  [0x24030064, 'addiu $v1,$zero,0x64'],
  [0x84427fff, 'lh $v0,0x7FFF($v0)'],
  [0x3c010001, 'lui $at,0x1'],
  [0x00410821, 'addu $at,$v0,$at'],
  [0x84228000, 'lh $v0,-0x8000($at)'],
  [0x00220821, 'addu $at,$at,$v0'],
  [0x8c220000, 'lw $v0,0x0($at)'],
  [0xac240000, 'sw $a0,0x0($at)'],
  [0x8f820000, 'lw $v0,0x0($gp)'],
  [0x27840000, 'addiu $a0,$gp,0x0'],
  [0xa0022710, 'sb $v0,0x2710($zero)'],
  [0x97a20010, 'lhu $v0,0x10($sp)'],
  [0x96480172, 'lhu $t0,0x172($s2)'],
  [0x48444000, 'cfc2 $a0,$8'],
  [0x48044000, 'mfc2 $a0,$8'],
  [0x48c44000, 'ctc2 $a0,$8'],
  [0x48c82000, 'ctc2 $t0,$4'],
  [0xc8850004, 'lwc2 $5,0x4($a0)'],
  [0x24a40008, 'addiu $a0,$a1,0x8'],
  [0x00640018, 'mult $v1,$a0'],
  [0x4a180001, 'cop2 0x180001'],
  [0x00000000, 'sll $zero,$zero,0'],
  [0x0040f809, 'jalr $v0'],
  [0x0c000010, 'jal 0x40'],
  [0x42000010, 'rfe'],
  [0x0000000c, 'syscall'],
  [0x00001770, 'tge $zero,$zero,93'],
];

function known(word: number): Instruction {
  const decoded = decode(word);
  if (decoded.mnemonic === '.word') throw new Error(`0x${word.toString(16)} did not decode`);
  return decoded;
}

describe('decode', () => {
  it.each(KNOWN.map(([w, text]) => [`0x${w.toString(16).padStart(8, '0')}`, w, text] as const))(
    '%s is %s and re-encodes',
    (_, word, text) => {
      const instruction = known(word);
      expect(format(instruction)).toBe(text);
      expect(encode(instruction)).toBe(word);
    },
  );

  it('addiu $sp,$sp,-0x58 in full', () => {
    expect(decode(0x27bdffa8)).toEqual({
      mnemonic: 'addiu',
      format: 'I',
      operands: [
        { kind: 'gpr', number: 29 },
        { kind: 'gpr', number: 29 },
        { kind: 'imm', value: -88, bits: 16, signed: true },
      ],
      reads: [29],
      writes: [29],
      hazardClass: 'none',
    });
  });

  it('derives register use and hazard classes from the table, ignoring $0', () => {
    const summary = (w: number) => {
      const i = known(w);
      return [i.mnemonic, i.format, i.reads, i.writes, i.hazardClass];
    };
    expect(summary(0x0086001a)).toEqual(['div', 'R', [4, 6], [], 'div']);
    expect(summary(0x0c000010)).toEqual(['jal', 'J', [], [31], 'jump']);
    expect(summary(0x96480172)).toEqual(['lhu', 'I', [18], [8], 'load']);
    expect(summary(0x88430000)).toEqual(['lwl', 'I', [2, 3], [3], 'load']);
    expect(summary(0x48044000)).toEqual(['mfc2', 'COP', [], [4], 'cop-from']);
    expect(summary(0x48c82000)).toEqual(['ctc2', 'COP', [8], [], 'cop-to']);
    expect(summary(0xc8850004)).toEqual(['lwc2', 'I', [4], [], 'none']);
    expect(summary(0x4a180001)).toEqual(['cop2', 'COP2CMD', [], [], 'none']);
    expect(summary(0x00000000)).toEqual(['sll', 'R', [], [], 'none']);
    expect(summary(0x00221021)).toEqual(['addu', 'R', [1, 2], [2], 'none']);
    expect(summary(0x04110003)).toEqual(['bgezal', 'I', [], [31], 'branch']);
  });

  it('reports coprocessor register spaces', () => {
    expect(known(0x48444000).operands[1]).toEqual({
      kind: 'cop',
      number: 8,
      unit: 2,
      space: 'control',
    });
    expect(known(0x48044000).operands[1]).toEqual({
      kind: 'cop',
      number: 8,
      unit: 2,
      space: 'data',
    });
    expect(known(0x40026000).operands[1]).toEqual({
      kind: 'cop',
      number: 12,
      unit: 0,
      space: 'data',
    });
  });

  it('decodes the two break codes from [25:16] and [15:6]', () => {
    expect(known(0x0007004d).operands).toEqual([
      { kind: 'imm', value: 7, bits: 10, signed: false },
      { kind: 'imm', value: 1, bits: 10, signed: false },
    ]);
  });

  it.each([
    [0xffffffff, 'unknown opcode 0x3F'],
    [0xc4000000, 'unknown opcode 0x31'],
    [0x0000003f, 'unknown SPECIAL function 0x3F'],
    [0x041f0000, 'unknown REGIMM condition 0x1F'],
    [0x42000001, 'unknown coprocessor 0 operation'],
    [0x49000000, 'unknown coprocessor 2 operation'],
    [0x00200000, 'sll with reserved bits set'],
    [0x00000021 | (1 << 6), 'addu with reserved bits set'],
    [0x42000030, 'unknown coprocessor 0 operation'],
  ])('0x%s is an unknown word: %s', (word, reason) => {
    expect(decode(word)).toEqual({ mnemonic: '.word', word: word >>> 0, reason });
  });

  it('accepts signed 32-bit words', () => {
    expect(decode(-1)).toEqual(decode(0xffffffff));
    expect(decode(0xafbf0054 | 0)).toEqual(decode(0xafbf0054));
  });

  it.each([1.5, 2 ** 32, -(2 ** 31) - 1, Number.NaN])('throws for %s', (word) => {
    expect(() => decode(word)).toThrow(InvalidInstructionError);
  });

  it('decodes every word of the ASPSX ground truth, matching its disassembly', () => {
    for (const fixture of loadAspsxFixtures()) {
      fixture.expectedWords.forEach((text, index) => {
        const decoded = decode(parseWord(text));
        expect(decoded.mnemonic, `${fixture.name}[${String(index)}]`).not.toBe('.word');
        const ours = format(decoded, { pseudo: true }).split(' ')[0];
        const theirs = fixture.disassembly[index]?.split(' ')[0];
        expect(ours, `${fixture.name}[${String(index)}] ${text}`).toBe(theirs);
      });
    }
  });
});
