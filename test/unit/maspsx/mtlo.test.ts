// SPDX-License-Identifier: MIT
/** Ported from mkst/maspsx (MIT), tests/test_mtlo.py. */
import { describe, expect, it } from 'vitest';
import { src } from '../../helpers/assembly.js';
import { listing } from '../../helpers/listing.js';

const NOP = 'sll $0,$0,0';

describe('maspsx test_mtlo', () => {
  it.each([
    [
      'test_lbu_mtlo_same_reg',
      ['\tlbu\t$2,23($2)', '\t#nop', '\tmtlo\t$2'],
      ['lbu $2,0x17($2)', NOP, 'mtlo $2'],
    ],
    [
      'test_lw_mtlo_same_reg',
      ['\tlw\t$3,0($5)', '\t#nop', '\tmtlo\t$3'],
      ['lw $3,0x0($5)', NOP, 'mtlo $3'],
    ],
    [
      'test_lbu_mthi_same_reg',
      ['\tlbu\t$4,0($5)', '\t#nop', '\tmthi\t$4'],
      ['lbu $4,0x0($5)', NOP, 'mthi $4'],
    ],
    [
      'test_lbu_mtlo_different_reg',
      ['\tlbu\t$2,23($3)', '\t#nop', '\tmtlo\t$4'],
      ['lbu $2,0x17($3)', 'mtlo $4'],
    ],
    [
      'test_lw_mthi_same_reg',
      ['\tlw\t$2,0($5)', '\t#nop', '\tmthi\t$2'],
      ['lw $2,0x0($5)', NOP, 'mthi $2'],
    ],
  ])('%s', (_, lines, expected) => {
    expect(listing(src(...lines))).toEqual(expected);
  });
});
