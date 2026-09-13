// SPDX-License-Identifier: MIT
/**
 * Ported from mkst/maspsx (MIT), tests/test_break.py. maspsx rewrites a source
 * `break N` as GNU `break N>>10,N&0x3FF`; these tests pin the resulting words.
 * (Real ASPSX 2.81 agrees: test/fixtures/probes/VERIFY-13.words.json.)
 */
import { describe, expect, it } from 'vitest';
import { assembleOk, src, wordsOf } from '../../helpers/assembly.js';

describe('maspsx test_break', () => {
  it('test_break_7', () => {
    expect(wordsOf(assembleOk(src('\tbreak\t7')))).toEqual(['0x000001CD']);
  });

  it('test_break_0x407', () => {
    expect(wordsOf(assembleOk(src('\tbreak 0x407')))).toEqual(['0x000101CD']);
  });
});
