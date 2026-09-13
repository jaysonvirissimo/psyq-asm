// SPDX-License-Identifier: MIT
/**
 * Ported from mkst/maspsx (MIT), tests/test_sltu.py. test_sltu_at models
 * ASPSX 2.56 and earlier ($at for a negative sltu immediate) and is not ported.
 */
import { describe, expect, it } from 'vitest';
import { src } from '../../helpers/assembly.js';
import { listing } from '../../helpers/listing.js';

describe('maspsx test_sltu', () => {
  it('test_no_sltu_at', () => {
    expect(listing(src('\tsltu\t$3,$3,-23'))).toEqual(['sltiu $3,$3,-0x17']);
  });
});
