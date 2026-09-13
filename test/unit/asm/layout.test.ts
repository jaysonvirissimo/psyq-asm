// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { commonAlignment } from '../../../src/asm/layout.js';
import { assembleOk, bytesOf, sectionOf, src, wordsOf } from '../../helpers/assembly.js';

describe('layout: sections and data', () => {
  it('lays out data directives in first-appearance order', () => {
    const object = assembleOk(
      src(
        '\t.rdata',
        '\t.ascii\t"hi\\n\\000\\"\\\\\\101"',
        '\t.asciiz\t"x"',
        '\t.half\t1,-1',
        '\t.byte\t255,-128',
        '\t.space\t3',
        '\t.sdata',
        '\t.align\t2',
        'g:',
        '\t.word\t7',
        '\t.bss',
        '\t.space\t16',
        '\t.section\t.custom',
        '\t.word\t0xf01b866e',
      ),
      { gpSize: 8 },
    );
    expect(object.sections.map((s) => [s.name, s.kind, s.size])).toEqual([
      ['.rdata', 'data', 18],
      ['.sdata', 'data', 4],
      ['.bss', 'bss', 16],
      ['.custom', 'data', 4],
    ]);
    expect(bytesOf(object, '.rdata')).toBe('68 69 0a 00 22 5c 41 78 00 01 00 ff ff ff 80 00 00 00');
    expect(bytesOf(object, '.sdata')).toBe('07 00 00 00');
    expect(bytesOf(object, '.bss')).toBe('');
    expect(bytesOf(object, '.custom')).toBe('6e 86 1b f0');
    expect(sectionOf(object, '.rdata').words).toBeUndefined();
    expect(object.smallData).toEqual([{ name: 'g', reason: 'sdata' }]);
  });

  it('pads code with nop words and keeps provenance per word', () => {
    const object = assembleOk(
      src(
        '\t.set\tnoreorder',
        '\tjr\t$31',
        '\t.align\t3',
        '\tjr\t$31',
        '\t.byte\t1',
        '\t.align\t2',
        '\t.space\t5',
      ),
    );
    expect(wordsOf(object)).toEqual([
      '0x03E00008',
      '0x00000000',
      '0x03E00008',
      '0x00000001',
      '0x00000000',
      '0x00000000',
    ]);
    expect(sectionOf(object, '.text').provenance).toEqual([
      { line: 2, kind: 'instruction' },
      { line: 3, kind: 'align' },
      { line: 4, kind: 'instruction' },
      { line: 5, kind: 'data' },
      { line: 7, kind: 'data' },
      { line: 7, kind: 'data' },
    ]);
  });

  it('pads a data section with zero bytes when aligning', () => {
    expect(
      bytesOf(assembleOk(src('\t.data', '\t.byte\t1', '\t.align\t2', '\t.byte\t2')), '.data'),
    ).toBe('01 00 00 00 02');
  });
});

describe('layout: commons', () => {
  const text = src(
    '\t.comm\ta,4',
    '\t.comm\tbig,100',
    '\t.lcomm\tc,2',
    '\t.comm\td,8,4',
    '\t.comm\te,1',
    '\t.text',
    '\tlw\t$2,%gp_rel(a)($gp)',
  );

  it('leaves .comm to the linker and allocates .lcomm in .sbss at -G 8', () => {
    const object = assembleOk(text, { gpSize: 8 });
    expect(object.sections.map((s) => [s.name, s.size])).toEqual([
      ['.text', 4],
      ['.sbss', 2],
    ]);
    expect(object.symbols).toEqual([
      { name: 'a', binding: 'common', section: '.sbss', size: 4 },
      { name: 'big', binding: 'common', section: '.bss', size: 100 },
      { name: 'c', binding: 'local', section: '.sbss', offset: 0, size: 2 },
      { name: 'd', binding: 'common', section: '.sbss', size: 8 },
      { name: 'e', binding: 'common', section: '.sbss', size: 1 },
    ]);
    expect(object.smallData.map((s) => s.name)).toEqual(['a', 'c', 'd', 'e']);
    expect(sectionOf(object, '.text').relocations.map((r) => r.target)).toEqual([
      { kind: 'symbol', name: 'a', addend: 0 },
    ]);
  });

  it('lays out .lcomm in order and aligned by size, as ASPSX 2.81 does', () => {
    const lcomm = src(
      '\t.comm\tg1,4',
      '\t.lcomm\tl1,1',
      '\t.lcomm\tl2,4',
      '\t.text',
      '\t.lcomm\tl3,2',
      '\t.lcomm\tl4,8',
      '\t.lcomm\tl5,3',
      '\t.lcomm\tbig,100',
      '\t.lcomm\tl6,1',
      '\tla\t$2,l6',
    );
    const bss = (object: ReturnType<typeof assembleOk>): (string | number)[][] =>
      object.sections.filter((s) => s.kind === 'bss').map((s) => [s.name, s.size]);
    const offsets = (object: ReturnType<typeof assembleOk>): (string | number | undefined)[][] =>
      object.symbols.map((s) => [s.name, s.section, s.offset]);
    const at8 = assembleOk(lcomm, { gpSize: 8 });
    expect(bss(at8)).toEqual([
      ['.sbss', 28],
      ['.bss', 100],
    ]);
    expect(offsets(at8)).toEqual([
      ['g1', '.sbss', undefined],
      ['l1', '.sbss', 0],
      ['l2', '.sbss', 4],
      ['l3', '.sbss', 8],
      ['l4', '.sbss', 16],
      ['l5', '.sbss', 24],
      ['big', '.bss', 0],
      ['l6', '.sbss', 27],
    ]);
    expect(sectionOf(at8, '.text').relocations.map((r) => r.target)).toEqual([
      { kind: 'section', section: '.sbss', offset: 27, label: 'l6' },
    ]);
    const at0 = assembleOk(lcomm, { gpSize: 0 });
    expect(bss(at0)).toEqual([['.bss', 133]]);
    expect(offsets(at0).slice(1)).toEqual([
      ['l1', '.bss', 0],
      ['l2', '.bss', 4],
      ['l3', '.bss', 8],
      ['l4', '.bss', 16],
      ['l5', '.bss', 24],
      ['big', '.bss', 32],
      ['l6', '.bss', 132],
    ]);
  });

  it('prefers a label over a common of the same name', () => {
    const object = assembleOk(src('\t.comm\tx,4', '\t.data', 'x:', '\t.word\t1'));
    expect(object.symbols).toEqual([{ name: 'x', binding: 'local', section: '.data', offset: 0 }]);
  });

  it('derives alignment from size unless one is given', () => {
    expect([1, 2, 3, 4, 7, 8, 100].map((size) => commonAlignment(size, undefined))).toEqual([
      1, 2, 2, 4, 4, 8, 8,
    ]);
    expect(commonAlignment(100, 16)).toBe(16);
  });
});
