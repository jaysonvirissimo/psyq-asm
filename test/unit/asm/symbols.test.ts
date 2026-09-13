// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../../../src/asm/diagnostics.js';
import { parse } from '../../../src/asm/parser.js';
import {
  classifySmallData,
  collectSymbols,
  isLocalLabel,
  isTransparentLabel,
} from '../../../src/asm/symbols.js';
import { src } from '../../helpers/assembly.js';

function table(text: string) {
  const diagnostics = new Diagnostics('t.s');
  const symbols = collectSymbols(parse(text, diagnostics), diagnostics);
  return { symbols, diagnostics: diagnostics.sorted() };
}

describe('collectSymbols', () => {
  it('records definitions, bindings, sizes, and first-appearance order', () => {
    const { symbols, diagnostics } = table(
      src(
        '\t.globl\tmain',
        '\t.extern\tg_counter, 4',
        '\t.comm\tg_arr,100',
        '\t.sdata',
        'g_int:',
        '\t.word\tg_str, 1',
        '\t.text',
        'main:',
        '\tlw\t$2,%gp_rel(g_int)($gp)',
        '\tlui\t$3,%hi(g_arr)',
        '\tjal\tcallee',
        '\tbeq\t$0,$0,$L2',
        '$L2:',
        '\tsw\t$2,g_counter',
        '\tlw\t$2,5($3)',
        '\taddiu\t$2,$2,%lo(5)',
      ),
    );
    expect(diagnostics).toEqual([]);
    expect(symbols.order).toEqual([
      'main',
      'g_counter',
      'g_arr',
      'g_int',
      'g_str',
      'callee',
      '$L2',
    ]);
    expect([...symbols.labels]).toEqual([
      ['g_int', { section: '.sdata', line: 5 }],
      ['main', { section: '.text', line: 8 }],
      ['$L2', { section: '.text', line: 13 }],
    ]);
    expect([...symbols.globals]).toEqual(['main']);
    expect([...symbols.externs]).toEqual([['g_counter', 4]]);
    expect([...symbols.commons.values()]).toEqual([
      { name: 'g_arr', size: 100, align: undefined, local: false },
    ]);
  });

  it('reports duplicate labels and commons', () => {
    const { diagnostics } = table(src('x:', 'x:', '\t.comm\tc,4', '\t.comm\tc,4'));
    expect(diagnostics.map((d) => [d.line, d.code, d.message])).toEqual([
      [2, 'duplicate-label', 'x is already defined on line 1.'],
      [4, 'duplicate-label', 'c is already a common symbol.'],
    ]);
  });
});

describe('label kinds', () => {
  it.each([
    ['$L12', true, true],
    ['$Lb3', true, true],
    ['$Le3', true, true],
    ['$LC0', true, false],
    ['LM439', true, true],
    ['L12', false, false],
    ['main', false, false],
  ])('%s: local %s, transparent %s', (name, local, transparent) => {
    expect(isLocalLabel(name)).toBe(local);
    expect(isTransparentLabel(name)).toBe(transparent);
  });
});

describe('classifySmallData', () => {
  const text = src(
    '\t.extern\tsmall_ext, 4',
    '\t.extern\tbig_ext, 16',
    '\t.extern\tunsized',
    '\t.extern\tdefined_here, 4',
    '\t.comm\tsmall_comm,4',
    '\t.comm\tbig_comm,100',
    '\t.lcomm\tlocal_comm,2',
    '\t.sdata',
    'in_sdata:',
    '\t.word\t1',
    '\t.sbss',
    'in_sbss:',
    '\t.space\t4',
    '\t.data',
    'in_data:',
    'defined_here:',
    '\t.word\t0',
  );

  it('uses .sdata/.sbss labels, small commons, and small externs (VERIFY-1)', () => {
    expect([...classifySmallData(table(text).symbols, 8, true).values()]).toEqual([
      { name: 'small_ext', reason: 'extern', size: 4 },
      { name: 'small_comm', reason: 'common', size: 4 },
      { name: 'local_comm', reason: 'common', size: 2 },
      { name: 'in_sdata', reason: 'sdata' },
      { name: 'in_sbss', reason: 'sbss' },
    ]);
  });

  it('can leave externs out, and has nothing small at -G 0', () => {
    const { symbols } = table(text);
    expect([...classifySmallData(symbols, 8, false).keys()]).not.toContain('small_ext');
    expect(classifySmallData(symbols, 0, true).size).toBe(0);
  });
});
