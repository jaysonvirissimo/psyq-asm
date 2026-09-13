// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { InvalidInstructionError, InvalidOptionsError } from '../../../src/errors.js';
import { decodeWords } from '../../../src/program/decode-words.js';
import type { DecodeOptions } from '../../../src/public-types.js';

const LOOP = [0x2442ffff, 0x1440fffe, 0x00000000, 0x10000001, 0x03e00008];

describe('decodeWords', () => {
  it('resolves branch targets inside the program, including its end', () => {
    const program = decodeWords(LOOP);
    expect(program.instructions.map((i) => i.mnemonic)).toEqual([
      'addiu',
      'bne',
      'sll',
      'beq',
      'jr',
    ]);
    expect([...program.labels]).toEqual([
      [0, 'L_0'],
      [5, 'L_5'],
    ]);
    expect([...program.branchTargets]).toEqual([
      [1, 0],
      [3, 5],
    ]);
    expect('baseAddress' in program).toBe(false);
  });

  it('leaves branches that leave the program unlabelled', () => {
    const program = decodeWords(Uint32Array.from([0x1000fff0, 0x10000010]));
    expect(program.labels.size).toBe(0);
    expect(program.branchTargets.size).toBe(0);
  });

  it('names labels by address and resolves jumps when given a base address', () => {
    const program = decodeWords([0x0c0315b2, 0x00000000, 0x03e00008, 0x08000000], {
      baseAddress: 0x800c56c0,
      labelPrefix: 'func',
    });
    expect([...program.labels]).toEqual([[2, 'func_800C56C8']]);
    expect([...program.branchTargets]).toEqual([[0, 2]]);
    expect(program.baseAddress).toBe(0x800c56c0);
  });

  it('keeps unknown words', () => {
    expect(decodeWords([0xffffffff]).instructions).toEqual([
      { mnemonic: '.word', word: 0xffffffff, reason: 'unknown opcode 0x3F' },
    ]);
  });

  it.each([
    [null, 'options must be an object.'],
    [{ base: 0 }, 'options.base is not a known option.'],
    [{ baseAddress: 1 }, 'baseAddress must be a word-aligned 32-bit address.'],
    [{ baseAddress: -4 }, 'baseAddress must be a word-aligned 32-bit address.'],
    [{ baseAddress: 0x100000000 }, 'baseAddress must be a word-aligned 32-bit address.'],
    [{ baseAddress: '0x80000000' }, 'baseAddress must be a word-aligned 32-bit address.'],
    [{ labelPrefix: '1abc' }, 'labelPrefix "1abc" must be a symbol name.'],
    [{ labelPrefix: 5 }, 'labelPrefix 5 must be a symbol name.'],
  ])('rejects the options %j', (options, message) => {
    expect(() => decodeWords([], options as DecodeOptions)).toThrow(
      new InvalidOptionsError(message),
    );
  });

  it('rejects words that are not an array of 32-bit integers', () => {
    expect(() => decodeWords(5 as unknown as number[])).toThrow(
      new InvalidOptionsError('words must be an array-like of 32-bit integers.'),
    );
    expect(() => decodeWords(null as unknown as number[])).toThrow(InvalidOptionsError);
    expect(() => decodeWords([1.5])).toThrow(InvalidInstructionError);
  });
});
