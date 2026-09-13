// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { zip } from '../../src/util.js';

describe('zip', () => {
  it('pairs elements and stops at the shorter list', () => {
    expect(zip([1, 2, 3], ['a', 'b'])).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
    expect(zip([], ['a'])).toEqual([]);
  });
});
