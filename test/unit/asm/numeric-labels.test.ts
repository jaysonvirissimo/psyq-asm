// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { assemble } from '../../../src/asm/assemble.js';
import { isLocalLabel, isNumericLabel, isTransparentLabel } from '../../../src/asm/symbols.js';
import { assembleOk, sectionOf, src, wordsOf } from '../../helpers/assembly.js';

describe('GNU numeric local labels', () => {
  it('resolve forward and backward references to the nearest definition', () => {
    const object = assembleOk(
      src(
        '\t.set\tnoreorder',
        '1:',
        '\tbeq\t$2,$0,1f',
        '\tnop',
        '1:',
        '\tbne\t$2,$0,1B',
        '\tnop',
        '\tb\t2f',
        '\tnop',
        '2:\tjr\t$31',
        '\tnop',
        '\t.data',
        '\t.word\t1b',
      ),
    );
    expect(wordsOf(object)).toEqual([
      '0x10400001',
      '0x00000000',
      '0x1440FFFF',
      '0x00000000',
      '0x04010001',
      '0x00000000',
      '0x03E00008',
      '0x00000000',
    ]);
    expect(object.symbols).toEqual([]);
    expect(sectionOf(object, '.data').relocations.map((r) => r.target)).toEqual([
      { kind: 'section', section: '.text', offset: 8, label: '1:2' },
    ]);
  });

  it('resolve references inside memory operands and %hi/%lo', () => {
    const object = assembleOk(
      src(
        '\t.set\tnoreorder',
        '\tlui\t$2,%hi(1f)',
        '\tlw\t$2,%lo(1f)($2)',
        '\t.data',
        '1:',
        '\t.word\t0',
      ),
    );
    expect(sectionOf(object, '.text').relocations.map((r) => r.target)).toEqual([
      { kind: 'section', section: '.data', offset: 0, label: '1:1' },
      { kind: 'section', section: '.data', offset: 0, label: '1:1' },
    ]);
  });

  it('report a reference with no definition in that direction', () => {
    const result = assemble(src('\tb\t1b', '1:', '\tb\t1f', '\tb\t3f'), { gpSize: 0 });
    expect(result.success).toBe(false);
    const messages = result.diagnostics.map((d) => d.message).join('\n');
    expect(messages).toContain('1b');
    expect(messages).toContain('1f');
    expect(messages).toContain('3f');
  });

  it('are local, transparent to the nop pass, and never plain numbers', () => {
    expect(['1:2', '1f', '12b'].map(isNumericLabel)).toEqual([true, true, true]);
    expect(['10', '1:', 'f1', '$L1'].map(isNumericLabel)).toEqual([false, false, false, false]);
    expect(isLocalLabel('1:2')).toBe(true);
    expect(isTransparentLabel('1:2')).toBe(true);
  });
});
