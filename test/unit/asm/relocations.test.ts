// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { assembleOk, bytesOf, sectionOf, src, wordsOf } from '../../helpers/assembly.js';

describe('relocations', () => {
  it('records symbol and label relocations with their field values', () => {
    const object = assembleOk(
      src(
        '\t.set\tnoreorder',
        '\t.data',
        'tbl:',
        '\t.word\t1,2',
        '\t.text',
        '\tlui\t$2,%hi(tbl)',
        '\taddiu\t$2,$2,%lo(tbl+4)',
        '\tlw\t$3,%lo(ext)($2)',
        '\tjal\text',
        '\tj\t$L9',
        '$L9:',
        '\tlw\t$4,%gp_rel(small)($gp)',
        '\t.rdata',
        '\t.align\t2',
        '$L23:',
        '\t.word\t$L9',
        '\t.word\text+8',
      ),
    );
    expect(object.sections.map((s) => s.name)).toEqual(['.data', '.text', '.rdata']);
    expect(wordsOf(object)).toEqual([
      '0x3C020000',
      '0x24420000',
      '0x8C430000',
      '0x0C000000',
      '0x08000000',
      '0x8F840000',
    ]);
    expect(sectionOf(object, '.text').relocations).toEqual([
      {
        offset: 0,
        kind: 'HI16',
        fieldMask: 0xffff,
        target: { kind: 'section', section: '.data', offset: 0, label: 'tbl' },
        fieldValue: 0,
      },
      {
        offset: 4,
        kind: 'LO16',
        fieldMask: 0xffff,
        target: { kind: 'section', section: '.data', offset: 4, label: 'tbl' },
        fieldValue: 0,
      },
      {
        offset: 8,
        kind: 'LO16',
        fieldMask: 0xffff,
        target: { kind: 'symbol', name: 'ext', addend: 0 },
        fieldValue: 0,
      },
      {
        offset: 12,
        kind: 'MIPS26',
        fieldMask: 0x03ffffff,
        target: { kind: 'symbol', name: 'ext', addend: 0 },
        fieldValue: 0,
      },
      {
        offset: 16,
        kind: 'MIPS26',
        fieldMask: 0x03ffffff,
        target: { kind: 'section', section: '.text', offset: 20, label: '$L9' },
        fieldValue: 0,
      },
      {
        offset: 20,
        kind: 'GPREL16',
        fieldMask: 0xffff,
        target: { kind: 'symbol', name: 'small', addend: 0 },
        fieldValue: 0,
      },
    ]);
    expect(bytesOf(object, '.rdata')).toBe('00 00 00 00 00 00 00 00');
    expect(sectionOf(object, '.rdata').relocations).toEqual([
      {
        offset: 0,
        kind: 'WORD32',
        fieldMask: 0xffffffff,
        target: { kind: 'section', section: '.text', offset: 20, label: '$L9' },
        fieldValue: 0,
      },
      {
        offset: 4,
        kind: 'WORD32',
        fieldMask: 0xffffffff,
        target: { kind: 'symbol', name: 'ext', addend: 8 },
        fieldValue: 0,
      },
    ]);
    expect(object.symbols).toEqual([
      { name: 'tbl', binding: 'local', section: '.data', offset: 0 },
      { name: 'ext', binding: 'extern' },
      { name: 'small', binding: 'extern' },
    ]);
  });

  it('leaves symbol addends to the relocation (VERIFY-7), and folds numeric %hi/%lo', () => {
    const object = assembleOk(
      src(
        '\tlui\t$2,%hi(tbl+0x8000)',
        '\taddiu\t$2,$2,%lo(tbl+0x8000)',
        '\tori\t$2,$2,%lo(tbl+0x8000)',
        '\taddiu\t$2,$0,%hi(0x18000)',
        '\taddiu\t$2,$0,%lo(0x18000)',
        '\tj\t0x100',
        '\t.extern\ttbl,4',
      ),
    );
    expect(wordsOf(object)).toEqual([
      '0x3C020000',
      '0x24420000',
      '0x34420000',
      '0x24020002',
      '0x24028000',
      '0x08000040',
      '0x00000000',
    ]);
    expect(sectionOf(object, '.text').relocations.map((r) => [r.kind, r.fieldValue])).toEqual([
      ['HI16', 0],
      ['LO16', 0],
      ['LO16', 0],
    ]);
    expect(object.symbols).toEqual([{ name: 'tbl', binding: 'extern', size: 4 }]);
  });

  it('resolves a jump table the way cc1psx lays it out', () => {
    const object = assembleOk(
      src(
        '\t.text',
        '\t.ent\tclassify',
        'classify:',
        '\tsltiu\t$2,$4,7',
        '\t.set\tnoreorder',
        '\tbeq\t$2,$0,$L22',
        '\tlui\t$2,%hi($L23) # high',
        '\t.set\treorder',
        '\taddiu\t$2,$2,%lo($L23) # low',
        '\tsll\t$3,$4,2',
        '\taddu\t$3,$3,$2',
        '\tlw\t$2,0($3)',
        '\tjr\t$2',
        '\t.rdata',
        '\t.align\t3',
        '$L23:',
        '\t.word\t$L15',
        '\t.word\t$L16',
        '\t.text',
        '$L15:',
        '\tjr\t$31',
        '$L16:',
        '\tjr\t$31',
        '$L22:',
        '\tjr\t$31',
        '\t.end\tclassify',
      ),
    );
    // The compiler's `#nop` after `lw $2,0($3)` is a real load delay, and every
    // jump under reorder gets its delay-slot nop.
    expect(wordsOf(object)).toEqual([
      '0x2C820007',
      '0x1040000C',
      '0x3C020000',
      '0x24420000',
      '0x00041880',
      '0x00621821',
      '0x8C620000',
      '0x00000000',
      '0x00400008',
      '0x00000000',
      '0x03E00008',
      '0x00000000',
      '0x03E00008',
      '0x00000000',
      '0x03E00008',
      '0x00000000',
    ]);
    expect(sectionOf(object, '.text').relocations.map((r) => [r.offset, r.kind, r.target])).toEqual(
      [
        [8, 'HI16', { kind: 'section', section: '.rdata', offset: 0, label: '$L23' }],
        [12, 'LO16', { kind: 'section', section: '.rdata', offset: 0, label: '$L23' }],
      ],
    );
    expect(
      sectionOf(object, '.rdata').relocations.map((r) => [r.kind, r.target, r.fieldValue]),
    ).toEqual([
      ['WORD32', { kind: 'section', section: '.text', offset: 40, label: '$L15' }, 0],
      ['WORD32', { kind: 'section', section: '.text', offset: 48, label: '$L16' }, 0],
    ]);
    expect(object.functions).toEqual([{ name: 'classify', section: '.text', start: 0, end: 16 }]);
    expect(object.symbols).toEqual([
      { name: 'classify', binding: 'local', section: '.text', offset: 0 },
    ]);
  });

  it('relocates jumps to symbols defined in the same file against their section', () => {
    const object = assembleOk(src('\t.globl\thelper', 'helper:', '\tjr\t$31', '\tjal\thelper'));
    expect(sectionOf(object, '.text').relocations).toEqual([
      {
        offset: 8,
        kind: 'MIPS26',
        fieldMask: 0x03ffffff,
        target: { kind: 'section', section: '.text', offset: 0, label: 'helper' },
        fieldValue: 0,
      },
    ]);
    expect(object.symbols).toEqual([
      { name: 'helper', binding: 'global', section: '.text', offset: 0 },
    ]);
  });
});
