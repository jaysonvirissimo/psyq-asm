// SPDX-License-Identifier: MIT
/**
 * Ported from mkst/maspsx (MIT), tests/test_div.py.
 *
 * Upstream expand_div=True is this package's default (full trap sequences);
 * upstream's default is partialDivExpansion here. The tge cases (ASPSX
 * 2.05/2.08), the expand_li=True cases (2.34 and earlier), and
 * test_div_expand_at_nop (nop_at_expansion) are not ported.
 */
import { describe, expect, it } from 'vitest';
import { src } from '../../helpers/assembly.js';
import { listing } from '../../helpers/listing.js';

const NOP = 'sll $0,$0,0';
const partial = { partialDivExpansion: true };

const SIGNED_TRAPS = [
  'bne $2,$0,.+12',
  NOP,
  'break 7,0',
  'addiu $1,$0,-0x1',
  'bne $2,$1,.+20',
  'lui $1,0x8000',
  'bne $16,$1,.+12',
  NOP,
  'break 6,0',
];

describe('maspsx test_div', () => {
  it('test_div_expand', () => {
    expect(listing(src('\tdiv\t$16,$16,$2'))).toEqual(['div $16,$2', ...SIGNED_TRAPS, 'mflo $16']);
  });

  it('test_rem_expand', () => {
    expect(listing(src('\trem\t$16,$16,$2'))).toEqual(['div $16,$2', ...SIGNED_TRAPS, 'mfhi $16']);
  });

  it('test_div_nop', () => {
    const text = src(
      '\tdiv\t$16,$16,$2',
      '',
      '\t.loc\t2 173',
      'LM163:',
      '\tli\t$4,0x00001000\t\t# 4096',
      '\tdiv\t$4,$4,$2',
    );
    expect(listing(text, partial)).toEqual([
      'div $16,$2',
      'mflo $16',
      'addiu $4,$0,0x1000',
      NOP,
      'div $4,$2',
      'mflo $4',
    ]);
  });

  it('test_div_no_nop', () => {
    const text = src(
      '\tdiv\t$16,$16,$2',
      '',
      '\t.loc\t2 173',
      'LM163:',
      '\tli\t$4,0x0010001\t\t# 65537',
      '\tdiv\t$4,$4,$2',
    );
    expect(listing(text, partial)).toEqual([
      'div $16,$2',
      'mflo $16',
      'lui $4,0x1',
      'ori $4,$4,0x1',
      'div $4,$2',
      'mflo $4',
    ]);
  });

  it('test_div_expand_at_no_nop', () => {
    expect(listing(src('divu\t$2,$2,$3', 'sh\t$2,gUpdateRate'))).toEqual([
      'divu $2,$3',
      'bne $3,$0,.+12',
      NOP,
      'break 7,0',
      'mflo $2',
      'lui $1,0x0',
      'sh $2,0x0($1)',
    ]);
  });

  it('test_nop_div_mult', () => {
    expect(listing(src('\tdiv\t$3,$3,$6', '', '\t.loc\t2 67', '\tmult\t$3,$5'), partial)).toEqual([
      'div $3,$6',
      'mflo $3',
      NOP,
      NOP,
      'mult $3,$5',
    ]);
  });

  it('test_simple_div_expansion_nop', () => {
    expect(listing(src('\tdiv\t$2,$2,$3', '\tsw\t$2,112($18)'), partial)).toEqual([
      'div $2,$3',
      'mflo $2',
      NOP,
      'sw $2,0x70($18)',
    ]);
  });

  it('test_simple_div_expansion_no_nop', () => {
    expect(
      listing(src('\tdiv\t$2,$2,$3', '', '\t.loc\t2 204', '\tlh\t$3,242($18)'), partial),
    ).toEqual(['div $2,$3', 'mflo $2', 'lh $3,0xF2($18)']);
  });

  it('test_simple_divu_expansion_no_nop', () => {
    expect(
      listing(src('\tdivu\t$2,$2,$3', '', '\t.loc\t2 204', '\tlh\t$3,242($18)'), partial),
    ).toEqual(['divu $2,$3', 'mflo $2', 'lh $3,0xF2($18)']);
  });
});
