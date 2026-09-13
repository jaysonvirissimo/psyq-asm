// SPDX-License-Identifier: MIT
/** Ported from mkst/maspsx (MIT), tests/test_float.py. */
import { describe, expect, it } from 'vitest';
import { src } from '../../helpers/assembly.js';
import { listing } from '../../helpers/listing.js';

describe('maspsx test_float', () => {
  it('test_load_float', () => {
    expect(
      listing(
        src(
          'li.s\t$4,1.00000000000000000000e+00',
          'li.s\t$5,2.00000000000000000000e+00',
          'li.s\t$6,4.00000000000000000000e+00',
          'li.s\t$7,8.00000000000000000000e+00',
          'li.s\t$8,1.60000000000000000000e+01',
          'li.s\t$9,3.20000000000000000000e+01',
        ),
      ),
    ).toEqual([
      'lui $4,0x3F80',
      'lui $5,0x4000',
      'lui $6,0x4080',
      'lui $7,0x4100',
      'lui $8,0x4180',
      'lui $9,0x4200',
    ]);
  });

  it('test_load_float_2', () => {
    expect(listing(src('li.s\t$4,-1.23450000000000000000e+00'))).toEqual([
      'lui $4,0xBF9E',
      'ori $4,$4,0x419',
    ]);
  });

  it('test_load_double (li $n,0x0 is addiu on 2.81)', () => {
    expect(
      listing(
        src(
          'li.d\t$2,1.00000000000000000000e+00',
          'li.d\t$4,2.00000000000000000000e+00',
          'li.d\t$6,4.00000000000000000000e+00',
          'li.d\t$8,8.00000000000000000000e+00',
        ),
      ),
    ).toEqual([
      'addiu $2,$0,0x0',
      'lui $3,0x3FF0',
      'addiu $4,$0,0x0',
      'lui $5,0x4000',
      'addiu $6,$0,0x0',
      'lui $7,0x4010',
      'addiu $8,$0,0x0',
      'lui $9,0x4020',
    ]);
  });
});
