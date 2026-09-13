// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { InvalidOptionsError } from '../../../src/errors.js';
import { decodeWords } from '../../../src/program/decode-words.js';
import { formatProgram } from '../../../src/program/format-program.js';
import type { FormatStyle } from '../../../src/public-types.js';
import { assembleOk, hex8, wordsOf } from '../../helpers/assembly.js';

const LOOP = [0x2442ffff, 0x1440fffe, 0x00000000, 0x10000001, 0x03e00008];

describe('formatProgram', () => {
  it('writes labels and label targets, and re-assembles to the same words', () => {
    const text = formatProgram(decodeWords(LOOP));
    expect(text).toBe(
      [
        '\t.set\tnoreorder',
        'L_0:',
        '\taddiu $v0,$v0,-0x1',
        '\tbne $v0,$zero,L_0',
        '\tsll $zero,$zero,0',
        '\tbeq $zero,$zero,L_5',
        '\tjr $ra',
        'L_5:',
        '',
      ].join('\n'),
    );
    expect(wordsOf(assembleOk(text))).toEqual(LOOP.map(hex8));
  });

  it('applies the style, and labels jumps when a base address was given', () => {
    const program = decodeWords([0x0c0315b2, 0x00000000, 0x03e00008, 0xffffffff], {
      baseAddress: 0x800c56c0,
    });
    expect(formatProgram(program, { registers: 'numeric', pseudo: true })).toBe(
      [
        '\t.set\tnoreorder',
        '\tjal L_800C56C8',
        '\tnop',
        'L_800C56C8:',
        '\tjr $31',
        '\t.word 0xFFFFFFFF',
        '',
      ].join('\n'),
    );
  });

  it('writes branches that leave the program relative to themselves', () => {
    expect(formatProgram(decodeWords([0x1000fff0]))).toBe(
      '\t.set\tnoreorder\n\tbeq $zero,$zero,.-60\n',
    );
  });

  it('validates the style even for an empty program', () => {
    expect(formatProgram(decodeWords([]))).toBe('\t.set\tnoreorder\n');
    expect(() => formatProgram(decodeWords([]), { hex: 'no' } as unknown as FormatStyle)).toThrow(
      InvalidOptionsError,
    );
  });
});
