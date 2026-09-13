// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { REGISTER_NAMES, parseRegister } from '../../../src/isa/registers.js';

describe('registers', () => {
  it('names all 32 general-purpose registers in ABI spelling', () => {
    expect(REGISTER_NAMES).toHaveLength(32);
    expect([REGISTER_NAMES[0], REGISTER_NAMES[4], REGISTER_NAMES[28], REGISTER_NAMES[31]]).toEqual([
      'zero',
      'a0',
      'gp',
      'ra',
    ]);
    expect(Object.isFrozen(REGISTER_NAMES)).toBe(true);
  });

  it.each([
    ['$0', 0],
    ['$2', 2],
    ['$31', 31],
    ['$zero', 0],
    ['$at', 1],
    ['$v0', 2],
    ['$t9', 25],
    ['$k1', 27],
    ['$gp', 28],
    ['$sp', 29],
    ['$fp', 30],
    ['$s8', 30],
    ['$ra', 31],
  ])('parses %s', (text, n) => {
    expect(parseRegister(text)).toBe(n);
  });

  it.each(['2', '$32', '$02', '$-1', '$V0', '$', '$pc', 'sp', '$1a'])('rejects %s', (text) => {
    expect(parseRegister(text)).toBeUndefined();
  });
});
