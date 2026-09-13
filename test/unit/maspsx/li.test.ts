// SPDX-License-Identifier: MIT
/**
 * Ported from mkst/maspsx (MIT), tests/test_li.py. For ASPSX 2.81 maspsx leaves
 * `li` to the assembler (test_no_expand_li); the other upstream cases model the
 * `ori` expansion of ASPSX 2.34 and earlier and are not ported. The 2.56+
 * expansion is pinned by the expand_li ground-truth fixture instead.
 */
import { describe, expect, it } from 'vitest';
import { src } from '../../helpers/assembly.js';
import { listing } from '../../helpers/listing.js';

describe('maspsx test_li', () => {
  it('test_no_expand_li', () => {
    expect(listing(src('\tli\t$4,0x0000007f\t\t# 127'))).toEqual(['addiu $4,$0,0x7F']);
  });
});
