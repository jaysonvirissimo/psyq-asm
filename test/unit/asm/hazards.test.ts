// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { endsOf } from '../../../src/asm/hazards.js';
import type { AssembleOptions } from '../../../src/public-types.js';
import { assembleOk, bytesOf, sectionOf, src, wordsOf } from '../../helpers/assembly.js';
import { listing } from '../../helpers/listing.js';

const NOP = 'sll $0,$0,0';

function kinds(text: string, options: Partial<AssembleOptions> = {}): string[] {
  return (sectionOf(assembleOk(text, options), '.text').provenance ?? []).map((o) => o.kind);
}

describe('H1: branch and jump delay slots', () => {
  it('fills the delay slot under .set reorder', () => {
    const object = assembleOk(src('\tjr\t$31'));
    expect(wordsOf(object)).toEqual(['0x03E00008', '0x00000000']);
    expect(sectionOf(object, '.text').provenance).toEqual([
      { line: 1, kind: 'instruction' },
      { line: 1, kind: 'branch-delay-nop', note: 'the delay slot of jr under .set reorder' },
    ]);
  });

  it('leaves the delay slot to the compiler under .set noreorder, until .end', () => {
    expect(
      listing(
        src(
          '\t.ent\tf',
          '\t.set\tnoreorder',
          '\tjr\t$31',
          '\taddu\t$2,$3,$4',
          '\t.end\tf',
          '\tjr\t$31',
        ),
      ),
    ).toEqual(['jr $31', 'addu $2,$3,$4', 'jr $31', NOP]);
  });

  it('applies to branch macros, and labels after the branch follow the nop', () => {
    expect(listing(src('\tb\t$L1', '$L1:', '\tj\t$31'))).toEqual([
      'beq $0,$0,.+8',
      NOP,
      'jr $31',
      NOP,
    ]);
  });
});

describe('H2: load delay', () => {
  it('inserts a nop when the next instruction reads the loaded register', () => {
    const object = assembleOk(src('\tlbu\t$3,4($4)', '\taddu\t$2,$3,$4'));
    expect(sectionOf(object, '.text').provenance?.[1]).toEqual({
      line: 1,
      kind: 'load-delay-nop',
      note: '$3 is written by lbu and read by addu',
    });
    expect(kinds(src('\tlbu\t$3,4($4)', '\taddu\t$2,$3,$4'))).toEqual([
      'instruction',
      'load-delay-nop',
      'instruction',
    ]);
  });

  it.each([
    ['another register', ['\tlbu\t$3,4($4)', '\taddu\t$2,$5,$4']],
    ['a load into $0', ['\tlw\t$0,0($4)', '\taddu\t$2,$0,$0']],
    ['lwl then lwr', ['\tlwl\t$3,3($8)', '\tlwr\t$3,0($8)']],
    ['a section switch', ['\tlw\t$2,0($4)', '\t.data', '\t.text', '\taddu\t$3,$2,$2']],
    ['a symbol label', ['\tlw\t$2,0($4)', 'foo:', '\taddu\t$3,$2,$2']],
    ['a macro starting with lui $at', ['\tlw\t$2,0($4)', '\tlw\t$3,sym($2)']],
    ['the end of the input', ['\tlw\t$2,0($4)']],
  ])('inserts nothing across %s', (_, lines) => {
    expect(kinds(src(...lines))).not.toContain('load-delay-nop');
  });

  it('looks past .loc and .set noreorder, putting the nop before the consumer', () => {
    expect(listing(src('\tlw\t$2,0($4)', '\t.loc\t1 2', '\taddu\t$3,$2,$2'))).toEqual([
      'lw $2,0x0($4)',
      NOP,
      'addu $3,$2,$2',
    ]);
    expect(
      listing(src('\tlh\t$2,4($16)', '\t.set\tnoreorder', '\tbgez\t$2,.+8', '\taddu\t$2,$2,1')),
    ).toEqual(['lh $2,0x4($16)', NOP, 'bgez $2,.+8', 'addiu $2,$2,0x1']);
  });

  it('binds labels between the load and its consumer to the nop', () => {
    const text = src(
      '\tlw\t$9,188($sp)',
      '$L1:',
      '$L2:',
      '\tlw\t$2,40($9)',
      '\t.rdata',
      '\t.word\t$L1',
      '\t.word\t$L2',
    );
    expect(listing(text)).toEqual(['lw $9,0xBC($29)', NOP, 'lw $2,0x28($9)']);
    expect(bytesOf(assembleOk(text), '.rdata')).toBe('04 00 00 00 04 00 00 00');
  });

  it('checks the first word of the consumer and the last word of the producer', () => {
    expect(listing(src('\t.comm\tg,4', '\tlw\t$2,0($4)', '\tsw\t$2,g'), { gpSize: 8 })).toEqual([
      'lw $2,0x0($4)',
      NOP,
      'sw $2,0x0($28)',
    ]);
    expect(listing(src('\tlw\t$2,sym', '\taddu\t$3,$2,$2'))).toEqual([
      'lui $2,0x0',
      'lw $2,0x0($2)',
      NOP,
      'addu $3,$2,$2',
    ]);
  });

  it('checks each statement of inline assembly', () => {
    expect(
      listing(src('\tlw\t$2,20($2)', '#APP', '\tlw $12, 0( $2 );lw $13, 4( $2 )', '#NO_APP')),
    ).toEqual(['lw $2,0x14($2)', NOP, 'lw $12,0x0($2)', 'lw $13,0x4($2)']);
  });
});

describe('H3: the mult/div gap after mflo/mfhi', () => {
  it.each([
    ['directly followed', ['\tmflo\t$2', '\tmult\t$3,$4'], ['mflo $2', NOP, NOP, 'mult $3,$4']],
    [
      'restarted by a second move',
      ['\tmfhi\t$5', '\tmflo\t$4', '\tmult\t$6,$9'],
      ['mfhi $5', 'mflo $4', NOP, NOP, 'mult $6,$9'],
    ],
    [
      'one instruction between',
      ['\tmflo\t$3', '\tmove\t$2,$6', '\tmult\t$3,$5'],
      ['mflo $3', 'addu $2,$6,$0', NOP, 'mult $3,$5'],
    ],
    [
      'a one-word li between',
      ['\tmflo\t$3', '\tli\t$5,100', '\tmult\t$3,$5'],
      ['mflo $3', 'addiu $5,$0,0x64', NOP, 'mult $3,$5'],
    ],
    [
      'a two-word li between',
      ['\tmflo\t$3', '\tli\t$5,0x2aaaaaab', '\tmult\t$3,$5'],
      ['mflo $3', 'lui $5,0x2AAA', 'ori $5,$5,0xAAAB', 'mult $3,$5'],
    ],
    [
      'a branch under reorder',
      ['\tmflo\t$2', '\tbgez\t$2,$L14', '\tmult\t$17,$3', '$L14:'],
      ['mflo $2', 'bgez $2,.+12', NOP, 'mult $17,$3'],
    ],
    [
      'a branch under noreorder',
      ['\t.set\tnoreorder', '\tmflo\t$2', '\tbgez\t$2,$L14', '\tmult\t$17,$3', '$L14:'],
      ['mflo $2', 'bgez $2,.+12', NOP, 'mult $17,$3'],
    ],
    [
      'a .set noreorder crossed',
      [
        '\tmflo\t$2',
        '\t.set\tnoreorder',
        '\t.set\tnomacro',
        '\t.set\tnoreorder',
        '\tbgez\t$2,$L14',
        '\tmult\t$17,$3',
        '$L14:',
      ],
      ['mflo $2', NOP, 'bgez $2,.+8', 'mult $17,$3'],
    ],
    [
      'a load between (VERIFY-19)',
      ['\tmflo\t$2', '\tlw\t$3,0($4)', '\tmult\t$5,$6'],
      ['mflo $2', 'lw $3,0x0($4)', 'mult $5,$6'],
    ],
    [
      'no mult or div within two',
      ['\tmflo\t$2', '\taddu\t$3,$2,$2', '\taddu\t$4,$2,$2'],
      ['mflo $2', 'addu $3,$2,$2', 'addu $4,$2,$2'],
    ],
    ['nothing following', ['\tmflo\t$2'], ['mflo $2']],
  ])('%s', (_, lines, expected) => {
    expect(listing(src(...lines))).toEqual(expected);
  });

  it('puts the nop after a one-word li but after a label for anything else', () => {
    const li = src(
      '\tmflo\t$3',
      '\tli\t$5,100',
      '$L1:',
      '\tmult\t$3,$5',
      '\t.rdata',
      '\t.word\t$L1',
    );
    expect(bytesOf(assembleOk(li), '.rdata')).toBe('0c 00 00 00');
    const sll = src(
      '\tmflo\t$3',
      '\tsll\t$2,$17,12',
      '$L1:',
      '\tmult\t$2,$4',
      '\t.rdata',
      '\t.word\t$L1',
    );
    expect(bytesOf(assembleOk(sll), '.rdata')).toBe('08 00 00 00');
  });

  it('gives a div expansion the gap, or else the load-delay rule', () => {
    const partial = { partialDivExpansion: true };
    expect(listing(src('\tdiv\t$2,$2,$7', '\tsubu\t$2,$10,$2', '\tmult\t$2,$8'), partial)).toEqual([
      'div $2,$7',
      'mflo $2',
      NOP,
      'subu $2,$10,$2',
      'mult $2,$8',
    ]);
    expect(listing(src('\tdiv\t$2,$2,$3', '\tsw\t$2,112($18)'), partial)).toEqual([
      'div $2,$3',
      'mflo $2',
      NOP,
      'sw $2,0x70($18)',
    ]);
    expect(listing(src('\tdivu\t$2,$2,$3', '\tsw\t$2,112($18)')).slice(-3)).toEqual([
      'mflo $2',
      NOP,
      'sw $2,0x70($18)',
    ]);
  });
});

describe('H4: coprocessor moves (VERIFY-18)', () => {
  it('delays a reader of an mfc2/cfc2 destination unless disabled', () => {
    const text = src('\tmfc2\t$4,$8', '\taddu\t$2,$4,$4');
    expect(kinds(text)).toEqual(['instruction', 'cop-delay-nop', 'instruction']);
    expect(listing(text, { experimental: { copMoveDelayNop: false } })).toEqual([
      'mfc2 $4,$8',
      'addu $2,$4,$4',
    ]);
    expect(listing(src('\tcfc2\t$4,$8', '\tlhu\t$8,370($18)'))).toEqual([
      'cfc2 $4,$8',
      'lhu $8,0x172($18)',
    ]);
  });
});

describe('the worked example', () => {
  const text = src(
    '\t.extern\tg_counter, 4',
    '\t.text',
    '\t.ent\tinc',
    'inc:',
    '\t.frame\t$sp,0,$31',
    '\t.mask\t0x00000000,0',
    '\t.fmask\t0x00000000,0',
    '\tlbu\t$3,4($4)',
    '\tlbu\t$2,5($4)',
    '\taddu\t$3,$3,1',
    '\tsll\t$2,$2,3',
    '\t.set\tnoreorder',
    '\t.set\tnomacro',
    '\tj\t$31',
    '\tsb\t$3,4($4)',
    '\t.set\tmacro',
    '\t.set\treorder',
    '\t.end\tinc',
    '\t.ent\tglob',
    'glob:',
    '\tlw\t$3,g_counter',
    '\t#nop',
    '\tsll\t$2,$3,1',
    '\tj\t$31',
    '\t.end\tglob',
  );

  it('assembles to the expected words, provenance, functions, and small data at -G 8', () => {
    const object = assembleOk(text, { gpSize: 8 });
    expect(wordsOf(object)).toEqual([
      '0x90830004',
      '0x90820005',
      '0x24630001',
      '0x000210C0',
      '0x03E00008',
      '0xA0830004',
      '0x8F830000',
      '0x00000000',
      '0x00031040',
      '0x03E00008',
      '0x00000000',
    ]);
    expect(sectionOf(object, '.text').provenance?.map((o) => [o.line, o.kind, o.macro])).toEqual([
      [8, 'instruction', undefined],
      [9, 'instruction', undefined],
      [10, 'macro', 'addu'],
      [11, 'instruction', undefined],
      [14, 'macro', 'j'],
      [15, 'instruction', undefined],
      [21, 'macro', 'lw'],
      [21, 'load-delay-nop', undefined],
      [23, 'instruction', undefined],
      [24, 'macro', 'j'],
      [24, 'branch-delay-nop', undefined],
    ]);
    expect(sectionOf(object, '.text').relocations).toEqual([
      {
        offset: 24,
        kind: 'GPREL16',
        fieldMask: 0xffff,
        target: { kind: 'symbol', name: 'g_counter', addend: 0 },
        fieldValue: 0,
      },
    ]);
    expect(object.functions.map((f) => [f.name, f.start, f.end])).toEqual([
      ['inc', 0, 6],
      ['glob', 6, 11],
    ]);
    expect(object.smallData).toEqual([{ name: 'g_counter', reason: 'extern', size: 4 }]);
  });

  it('uses %hi/%lo for the external at -G 0', () => {
    expect(listing(text, { gpSize: 0 }).slice(6, 10)).toEqual([
      'lui $3,0x0',
      'lw $3,0x0($3)',
      NOP,
      'sll $2,$3,1',
    ]);
  });
});

describe('endsOf', () => {
  it('treats an empty group as a nop', () => {
    const [first, last] = endsOf({
      kind: 'group',
      line: 1,
      column: 1,
      section: '.text',
      reorder: true,
      words: [],
    });
    expect([first.row.mnemonic, last.row.mnemonic]).toEqual(['sll', 'sll']);
  });
});
