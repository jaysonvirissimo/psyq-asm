// SPDX-License-Identifier: MIT
/**
 * Ported from mkst/maspsx (MIT), tests/test_nop.py.
 *
 * maspsx defaults to partial divide expansion (ASPSX -0), so the divide cases
 * set partialDivExpansion. test_v0_at_nop (nop_at_expansion) and
 * test_lw_lw_nop (nop_lw_lw) model ASPSX 2.21 and earlier and are not ported.
 * Branch targets the upstream snippets leave undefined are given labels.
 */
import { describe, expect, it } from 'vitest';
import { assembleOk, bytesOf, src } from '../../helpers/assembly.js';
import { listing } from '../../helpers/listing.js';

const NOP = 'sll $0,$0,0';
const partial = { partialDivExpansion: true };

const GTE_MACRO = (base: string): string =>
  `\tlw\t$12, 0( ${base} );lw\t$13, 4( ${base} );ctc2\t$12, $0;ctc2\t$13, $1;lw\t$12, 8( ${base} );lw\t$13, 12( ${base} );lw\t$14, 16( ${base} );ctc2\t$12, $2;ctc2\t$13, $3;ctc2\t$14, $4`;

describe('maspsx test_nop', () => {
  it('test_nop_lw_div', () => {
    expect(listing(src('\tlw\t$3,0($5)', '\t#nop', '\tdiv\t$3,$3,$7'), partial)).toEqual([
      'lw $3,0x0($5)',
      NOP,
      'div $3,$7',
      'mflo $3',
    ]);
  });

  it('test_nop_lw_divu', () => {
    expect(listing(src('\tlw\t$3,0($5)', '\t#nop', '\tdivu\t$3,$3,$7'), partial)).toEqual([
      'lw $3,0x0($5)',
      NOP,
      'divu $3,$7',
      'mflo $3',
    ]);
  });

  it('test_rem_nop', () => {
    expect(
      listing(src('\tlw\t$4,_spu_mem_mode_unit', '\t#nop', '\trem\t$2,$5,$4'), partial),
    ).toEqual(['lui $4,0x0', 'lw $4,0x0($4)', NOP, 'div $5,$4', 'mfhi $2']);
  });

  it('test_remu_nop', () => {
    expect(
      listing(src('\tlw\t$4,_spu_mem_mode_unit', '\t#nop', '\tremu\t$2,$5,$4'), partial),
    ).toEqual(['lui $4,0x0', 'lw $4,0x0($4)', NOP, 'divu $5,$4', 'mfhi $2']);
  });

  it('test_nop_at_expansion_with_macro', () => {
    const text = src(
      '\tlw\t$19,Cameras($2)',
      '',
      '\t.loc\t2 41',
      ' #APP',
      GTE_MACRO('$19'),
      ' #NO_APP',
    );
    expect(listing(text).slice(0, 5)).toEqual([
      'lui $1,0x0',
      'addu $1,$1,$2',
      'lw $19,0x0($1)',
      NOP,
      'lw $12,0x0($19)',
    ]);
  });

  it('test_nop_with_macro', () => {
    expect(
      listing(src('\tlw\t$2,20($2)', '', '\t#APP', GTE_MACRO('$2'), '\t#NO_APP')).slice(0, 2),
    ).toEqual(['lw $2,0x14($2)', NOP]);
  });

  it('test_nop_with_macro_with_addend_no_r_source', () => {
    expect(
      listing(src('\tlw\t$15,MRViewtrans_ptr', '\t#APP', GTE_MACRO('$15'), '\t#NO_APP')).slice(
        0,
        3,
      ),
    ).toEqual(['lui $15,0x0', 'lw $15,0x0($15)', NOP]);
  });

  it('test_nop_with_macro_lwc2', () => {
    const macro =
      '\tlwc2\t$0, 0( $7 );lwc2\t$1, 4( $7 );lwc2\t$2, 0( $2 );lwc2\t$3, 4( $2 );lwc2\t$4, 0( $3 );lwc2\t$5, 4( $3 )';
    expect(listing(src('\tlw\t$7,48($fp)', '\t#APP', macro)).slice(0, 3)).toEqual([
      'lw $7,0x30($30)',
      NOP,
      'lwc2 $0,0x0($7)',
    ]);
  });

  it('test_nop_macro_uses_spaces', () => {
    const macro =
      '\tlw    $12, 0($10);lw    $13, 4($10);ctc2    $12, $0;ctc2    $13, $1;lw    $12, 8($10);lw    $13, 12($10);lw    $14, 16($10);ctc2    $12, $2;ctc2    $13, $3;ctc2    $14, $4';
    expect(listing(src('\tlw\t$10,104($sp)', '\t#APP', macro)).slice(0, 2)).toEqual([
      'lw $10,0x68($29)',
      NOP,
    ]);
  });

  it('test_nop_macro_uses_swc2', () => {
    const macro = '\tswc2    $25, 0($11);swc2    $26, 4($11);swc2    $27, 8($11)';
    expect(listing(src('\tlw\t$11,56($sp)', ' #APP', macro)).slice(0, 3)).toEqual([
      'lw $11,0x38($29)',
      NOP,
      'swc2 $25,0x0($11)',
    ]);
  });

  it('test_nop_lw_addu', () => {
    expect(
      listing(
        src(
          '\tli\t$19,0x1f800000\t\t# 528482304',
          '\tlw\t$2,528482500\t\t# 0x1f8000c4',
          '\t#nop',
          '\taddu\t$3,$9,$2',
        ),
      ),
    ).toEqual(['lui $19,0x1F80', 'lui $2,0x1F80', 'lw $2,0xC4($2)', NOP, 'addu $3,$9,$2']);
  });

  it('test_nop_lw_lhu_omitted', () => {
    expect(
      listing(
        src(
          '\tli\t$19,0x1f800000\t\t# 528482304',
          '\tlw\t$2,528482508',
          '',
          '\t.loc\t1 161',
          'LM102:',
          '\tlhu\t$11,16($sp)',
        ),
      ),
    ).toEqual(['lui $19,0x1F80', 'lui $2,0x1F80', 'lw $2,0xCC($2)', 'lhu $11,0x10($29)']);
  });

  it('test_nop_gp_lw', () => {
    const text = src(
      '\t.comm\tUnkVar00,4',
      '\t.comm\tUnkVar01,4',
      '\tli\t$2,-1\t\t\t# 0xffffffff',
      '\t.set\tvolatile',
      '\tsw\t$2,UnkVar00',
      '\t.set\tnovolatile',
      '\t.set\tvolatile',
      '\tlw\t$2,UnkVar00',
      '\t.set\tnovolatile',
      '\t#nop',
      '\t.set\tvolatile',
      '\tsw\t$2,UnkVar01',
    );
    expect(listing(text, { gpSize: 4 })).toEqual([
      'addiu $2,$0,-0x1',
      'sw $2,0x0($28)',
      'lw $2,0x0($28)',
      NOP,
      'sw $2,0x0($28)',
    ]);
  });

  it('test_nop_gp_lw_sw_pair', () => {
    const text = src(
      '\t.comm\tgameTrackerX,624',
      '\tlw\t$2,gameTrackerX+580',
      '$L15:',
      '\tsw\t$2,gameTrackerX+576',
    );
    expect(listing(text, { gpSize: 1024 })).toEqual(['lw $2,0x0($28)', NOP, 'sw $2,0x0($28)']);
  });

  it('test_nop_lh_sw_pair_uses_gp', () => {
    const text = src(
      '\t.comm\tMap_water_height,2',
      '\tlh\t$2,2($2)',
      '\t#nop',
      '\tsw\t$2,Map_water_height',
    );
    expect(listing(text, { gpSize: 4 })).toEqual(['lh $2,0x2($2)', NOP, 'sw $2,0x0($28)']);
  });

  it('test_nop_lh_sw_pair_no_gp', () => {
    expect(listing(src('\tlh\t$2,2($2)', '\t#nop', '\tsw\t$2,Map_water_height'))).toEqual([
      'lh $2,0x2($2)',
      'lui $1,0x0',
      'sw $2,0x0($1)',
    ]);
  });

  it('test_nop_nor', () => {
    expect(listing(src('\tlbu\t$2,20($16)', '\tnor\t$2,$0,$2'))).toEqual([
      'lbu $2,0x14($16)',
      NOP,
      'nor $2,$0,$2',
    ]);
  });

  it('test_div_move_nop', () => {
    expect(
      listing(src('\tdiv\t$2,$2,$3', '$L21:', '', 'LM30:', '\tmove\t$16,$2'), partial),
    ).toEqual(['div $2,$3', 'mflo $2', NOP, 'addu $16,$2,$0']);
  });

  it('test_remu_move_nop', () => {
    expect(
      listing(src('\tremu\t$2,$2,$3', '$L21:', '', 'LM30:', '\tmove\t$16,$2'), partial),
    ).toEqual(['divu $2,$3', 'mfhi $2', NOP, 'addu $16,$2,$0']);
  });

  it('test_lw_move_nop', () => {
    expect(
      listing(
        src(
          '\tlw\t$16,16($2)',
          '$L2:',
          '',
          '\t.loc\t2 17',
          '$Le1:',
          '\t.bend\t$Le1\t14',
          '\tmove\t$2,$16',
        ),
      ),
    ).toEqual(['lw $16,0x10($2)', NOP, 'addu $2,$16,$0']);
  });

  it('test_v0_at_no_nop', () => {
    expect(listing(src('$L2:', '\tlw\t$2,D_801C3544', '$L3:', '\tsw\t$2,D_801C34D4'))).toEqual([
      'lui $2,0x0',
      'lw $2,0x0($2)',
      'lui $1,0x0',
      'sw $2,0x0($1)',
    ]);
  });

  it('test_at_large_sb_no_nop', () => {
    expect(listing(src('lhu\t$2,16($sp)', '#nop', 'sb\t$2,-2147292186'))).toEqual([
      'lhu $2,0x10($29)',
      'lui $1,0x8003',
      'sb $2,-0x141A($1)',
    ]);
  });

  it('test_at_small_sb_nop', () => {
    expect(listing(src('lhu\t$2,16($sp)', '#nop', 'sb\t$2,10000'))).toEqual([
      'lhu $2,0x10($29)',
      NOP,
      'sb $2,0x2710($0)',
    ]);
  });

  it('test_ctc2_nop', () => {
    expect(listing(src('lhu\t$9,192($17)', 'ctc2\t$9,$26'))).toEqual([
      'lhu $9,0xC0($17)',
      NOP,
      'ctc2 $9,$26',
    ]);
  });

  it('test_ctc2_no_nop', () => {
    expect(listing(src('lhu\t$9,192($17)', 'ctc2\t$8,$26'))).toEqual([
      'lhu $9,0xC0($17)',
      'ctc2 $8,$26',
    ]);
  });

  it('test_lwl_lwr_no_nop (the same on 2.81)', () => {
    expect(listing(src('\tlwl\t$3,3($8)', '\tlwr\t$3,0($8)'))).toEqual([
      'lwl $3,0x3($8)',
      'lwr $3,0x0($8)',
    ]);
  });

  it('test_lw_lw_no_nop', () => {
    const text = src(
      '\t#.set\tvolatile',
      '\tlw\t$2,Savemap+2944',
      '\t#.set\tnovolatile',
      '',
      '\t.loc\t2 32',
      'LM18:',
      '\t#nop',
      '\t#.set\tvolatile',
      '\tlw\t$2,0($3)',
      '\t#.set\tnovolatile',
    );
    expect(listing(text)).toEqual(['lui $2,0x0', 'lw $2,0x0($2)', 'lw $2,0x0($3)']);
  });

  it('test_load_delay_keeps_consecutive_labels_together', () => {
    const text = src(
      '\tlw\t$9,188($sp)',
      '$L1:',
      '$L2:',
      '$L3:',
      '\tlw\t$2,40($9)',
      '\t.rdata',
      '\t.word\t$L1,$L2,$L3',
    );
    expect(listing(text)).toEqual(['lw $9,0xBC($29)', NOP, 'lw $2,0x28($9)']);
    expect(bytesOf(assembleOk(text), '.rdata')).toBe('04 00 00 00 04 00 00 00 04 00 00 00');
  });

  it('test_nop_macro_no_nop_afterwards', () => {
    expect(
      listing(
        src(
          ' #APP',
          '\tlwc2 $4, 0( $4 );lwc2 $5, 4( $4 )',
          ' #NO_APP',
          '\t.loc 1 1122',
          'LM439:',
          '\taddu $4,$4,8',
        ),
      ),
    ).toEqual(['lwc2 $4,0x0($4)', 'lwc2 $5,0x4($4)', 'addiu $4,$4,0x8']);
  });

  it('test_nop_macro_no_nop_afterwards_2', () => {
    expect(
      listing(
        src(
          ' #APP',
          '\tlwc2 $4, 0( $4 );lwc2 $5, 4( $4 )',
          ' #NO_APP',
          '\t.loc 1 1122',
          'LM439:',
          '\taddu $4,$5,8',
        ),
      ),
    ).toEqual(['lwc2 $4,0x0($4)', 'lwc2 $5,0x4($4)', 'addiu $4,$5,0x8']);
  });

  it('test_nop_mtc2', () => {
    expect(listing(src('\tlhu\t$8,370($18)', ' #APP', '\tmtc2    $8, $8', ' #NO_APP'))).toEqual([
      'lhu $8,0x172($18)',
      NOP,
      'mtc2 $8,$8',
    ]);
  });

  it('test_lw_lo_macro', () => {
    expect(
      listing(src('\tlw\t$5,%lo(objectAccess+204)($2)', '$L3:', '\tbeq\t$5,$0,$L4', '$L4:')).slice(
        0,
        3,
      ),
    ).toEqual(['lw $5,0x0($2)', NOP, 'beq $5,$0,.+8']);
  });

  it('test_lw_sw_lo_macro', () => {
    expect(listing(src('lw\t$2,0($5)', '#nop', 'sw\t$2,%lo(s_attr)($3)'))).toEqual([
      'lw $2,0x0($5)',
      NOP,
      'sw $2,0x0($3)',
    ]);
  });

  it('test_lw_sw_no_lo_macro', () => {
    expect(listing(src('lw\t$2,0($5)', '#nop', 'sw\t$2,s_attr($3)'))).toEqual([
      'lw $2,0x0($5)',
      'lui $1,0x0',
      'addu $1,$1,$3',
      'sw $2,0x0($1)',
    ]);
  });
});
