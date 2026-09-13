// SPDX-License-Identifier: MIT
/**
 * Ported from mkst/maspsx (MIT), tests/test_mflo.py, plus the two mflo cases of
 * tests/test_move.py.
 *
 * maspsx defaults to partial divide expansion (ASPSX -0), so the divide cases
 * set partialDivExpansion. test_mflo_disabled models ASPSX 2.21 and earlier and
 * is not ported. Branch targets the upstream snippets leave undefined are given
 * labels.
 */
import { describe, expect, it } from 'vitest';
import { src } from '../../helpers/assembly.js';
import { listing } from '../../helpers/listing.js';

const NOP = 'sll $0,$0,0';
const partial = { partialDivExpansion: true };

describe('maspsx test_mflo', () => {
  it('test_mflo_li', () => {
    expect(
      listing(src('\tmflo\t$3', '\tli\t$5,-2004318071\t\t\t# 0x88888889', '\tmult\t$3,$5        ')),
    ).toEqual(['mflo $3', 'lui $5,0x8888', 'ori $5,$5,0x8889', 'mult $3,$5']);
  });

  it('test_mflo_li_hex', () => {
    expect(
      listing(src('\tmflo\t$3', '\tli\t$5,0x2aaaaaab\t\t# 715827883', '\tmult\t$3,$5        ')),
    ).toEqual(['mflo $3', 'lui $5,0x2AAA', 'ori $5,$5,0xAAAB', 'mult $3,$5']);
  });

  it('test_mflo_bgez_no_set_noreorder', () => {
    expect(
      listing(src('\tmflo\t$2', '\t#nop', '\t#nop', '\tbgez\t$2,$L14', '\tmult\t$17,$3', '$L14:')),
    ).toEqual(['mflo $2', 'bgez $2,.+12', NOP, 'mult $17,$3']);
  });

  it('test_mflo_bgez_set_reorder', () => {
    const text = src(
      '\tmflo\t$2',
      '\t#nop',
      '\t#nop',
      '\t.set\tnoreorder',
      '\t.set\tnomacro',
      '\tbgez\t$2,$L14',
      '\tmult\t$17,$3',
      '$L14:',
    );
    expect(listing(text)).toEqual(['mflo $2', NOP, 'bgez $2,.+8', 'mult $17,$3']);
  });

  it('test_expand_div_mflo_load_from_register', () => {
    expect(listing(src('div\t$2,$2,$7', 'subu\t$2,$10,$2', 'mult\t$2,$8'), partial)).toEqual([
      'div $2,$7',
      'mflo $2',
      NOP,
      'subu $2,$10,$2',
      'mult $2,$8',
    ]);
  });

  it('test_expand_divu_mflo_load_from_register', () => {
    expect(listing(src('divu\t$2,$2,$7', 'subu\t$2,$10,$2', 'mult\t$2,$8'), partial)).toEqual([
      'divu $2,$7',
      'mflo $2',
      NOP,
      'subu $2,$10,$2',
      'mult $2,$8',
    ]);
  });

  it('test_expand_div_mflo_no_load_from_register', () => {
    expect(listing(src('div\t$2,$2,$7', 'subu\t$2,$10,$3', 'mult\t$2,$8'), partial)).toEqual([
      'div $2,$7',
      'mflo $2',
      'subu $2,$10,$3',
      NOP,
      'mult $2,$8',
    ]);
  });

  it('test_mflo_rem', () => {
    expect(listing(src('mflo\t$7', '#nop', 'sll\t$2,$3,12', 'rem\t$7,$7,$2'), partial)).toEqual([
      'mflo $7',
      'sll $2,$3,12',
      NOP,
      'div $7,$2',
      'mfhi $7',
    ]);
  });

  it('test_multu', () => {
    expect(listing(src('mfhi\t$5', 'mflo\t$4', '#nop', '#nop', 'mult\t$6,$9'))).toEqual([
      'mfhi $5',
      'mflo $4',
      NOP,
      NOP,
      'mult $6,$9',
    ]);
  });

  it('test_div_div_label', () => {
    expect(
      listing(src('\tdiv\t$16,$2,$4', '\tsll\t$2,$17,12', '$L15:', '\tdiv\t$17,$2,$4'), partial),
    ).toEqual(['div $2,$4', 'mflo $16', 'sll $2,$17,12', NOP, 'div $2,$4', 'mflo $17']);
  });

  it('test_mflo_mult_branch_label', () => {
    expect(
      listing(
        src('\tmflo\t$20', '\t#nop', '\tbne\t$2,$0,$L78', '$L83:', '\tmult\t$16,$16', '$L78:'),
      ),
    ).toEqual(['mflo $20', 'bne $2,$0,.+12', NOP, 'mult $16,$16']);
  });
});

describe('maspsx test_move (mflo cases)', () => {
  it('test_mflo_move', () => {
    expect(listing(src('\tmflo\t$3', '\tmove\t$2,$6', '\tmult\t$3,$5'))).toEqual([
      'mflo $3',
      'addu $2,$6,$0',
      NOP,
      'mult $3,$5',
    ]);
  });

  it('test_mflo_move_noreorder', () => {
    expect(listing(src('\tmflo\t$3', '.set\tnoreorder', '\tmove\t$2,$6', '\tmult\t$3,$5'))).toEqual(
      ['mflo $3', NOP, 'addu $2,$6,$0', 'mult $3,$5'],
    );
  });
});
