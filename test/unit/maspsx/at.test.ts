// SPDX-License-Identifier: MIT
/**
 * Ported from mkst/maspsx (MIT), tests/test_at.py. The cases that set
 * nop_at_expansion=True or addiu_at=True model ASPSX 2.21 and earlier and are
 * not ported. test_expand_sw_dont_use_addiu leaves the store to GNU as upstream;
 * here the expected words are that expansion's.
 */
import { describe, expect, it } from 'vitest';
import { src } from '../../helpers/assembly.js';
import { listing } from '../../helpers/listing.js';

const NOP = 'sll $0,$0,0';
const AT_32768 = ['lui $1,0x1', 'addu $1,$2,$1', 'lh $2,-0x8000($1)'];
const AT_MINUS_32769 = ['lui $1,0xFFFF', 'addu $1,$2,$1', 'lh $2,0x7FFF($1)'];

describe('maspsx test_at', () => {
  it.each([
    [
      'test_no_at_expansion_nop',
      ['lh\t$2,32767($2)', 'lh\t$2,32767($2)'],
      ['lh $2,0x7FFF($2)', NOP, 'lh $2,0x7FFF($2)'],
    ],
    [
      'test_no_at_expansion_nop_negative',
      ['lh\t$2,-32768($2)', 'lh\t$2,-32768($2)'],
      ['lh $2,-0x8000($2)', NOP, 'lh $2,-0x8000($2)'],
    ],
    [
      'test_at_expansion_no_nop',
      ['lh\t$2,32767($2)', 'lh\t$2,32768($2)'],
      ['lh $2,0x7FFF($2)', ...AT_32768],
    ],
    ['test_at_expansion_hex_offset', ['lh\t$2,0x8000($2)'], AT_32768],
    [
      'test_at_expansion_no_nop_negative',
      ['lh\t$2,-32768($2)', 'lh\t$2,-32769($2)'],
      ['lh $2,-0x8000($2)', ...AT_MINUS_32769],
    ],
    [
      'test_at_expansion_prefix_nop',
      ['lh\t$2,32768($2)', 'lh\t$2,32767($2)'],
      [...AT_32768, NOP, 'lh $2,0x7FFF($2)'],
    ],
    [
      'test_at_expansion_prefix_nop_negative',
      ['lh\t$2,-32769($2)', 'lh\t$2,-32768($2)'],
      [...AT_MINUS_32769, NOP, 'lh $2,-0x8000($2)'],
    ],
    [
      'test_double_at_expansion_no_nop',
      ['lh\t$2,32768($2)', 'lh\t$2,32768($2)'],
      [...AT_32768, ...AT_32768],
    ],
    [
      'test_double_at_expansion_no_nop_negative',
      ['lh\t$2,-32769($2)', 'lh\t$2,-32769($2)'],
      [...AT_MINUS_32769, ...AT_MINUS_32769],
    ],
    [
      'test_expand_lw_dont_use_addiu',
      ['lw\t$2,ctlbuf($2)'],
      ['lui $1,0x0', 'addu $1,$1,$2', 'lw $2,0x0($1)'],
    ],
    [
      'test_expand_sw_dont_use_addiu',
      ['sw\t$2,ctlbuf($2)'],
      ['lui $1,0x0', 'addu $1,$1,$2', 'sw $2,0x0($1)'],
    ],
    [
      'test_expand_sw_pointer_offset',
      ['sw\t$2,56200($4)'],
      ['lui $1,0x1', 'addu $1,$4,$1', 'sw $2,-0x2478($1)'],
    ],
    [
      'test_expand_lh_lbu_no_nop_at_expansion',
      ['lh\t$2,10($18)', 'lbu\t$2,buttonDoorIdx.29($2)'],
      ['lh $2,0xA($18)', 'lui $1,0x0', 'addu $1,$1,$2', 'lbu $2,0x0($1)'],
    ],
  ])('%s', (_, lines, expected) => {
    expect(listing(src(...lines))).toEqual(expected);
  });
});
