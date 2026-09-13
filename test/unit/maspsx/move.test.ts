// SPDX-License-Identifier: MIT
/** Ported from mkst/maspsx (MIT), tests/test_move.py. */
import { describe, expect, it } from 'vitest';
import { src } from '../../helpers/assembly.js';
import { listing } from '../../helpers/listing.js';

describe('maspsx test_move', () => {
  it('test_move: addu, not the or modern GNU as emits', () => {
    expect(listing(src('move $2,$6'))).toEqual(['addu $2,$6,$0']);
  });

  it('test_move_with_comment', () => {
    expect(listing(src('move $2,$6 # sp not trusted here'))).toEqual(['addu $2,$6,$0']);
  });
});
