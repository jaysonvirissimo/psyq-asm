// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { isLocalLabel, isTransparentLabel } from '../../../src/asm/symbols.js';
import { assembleOk, sectionOf, src } from '../../helpers/assembly.js';

describe('names starting with L', () => {
  it('are debugging labels only in the LM<digits> form cc1psx emits', () => {
    expect(['LM12', 'LM1'].map(isLocalLabel)).toEqual([true, true]);
    expect(['LM12', 'LM1'].map(isTransparentLabel)).toEqual([true, true]);
    expect(['LoadThing', 'Lower', 'LMx', 'L_2'].map(isLocalLabel)).toEqual([
      false,
      false,
      false,
      false,
    ]);
    expect(['LoadThing', 'Lower'].map(isTransparentLabel)).toEqual([false, false]);
  });

  it('are ordinary symbols otherwise: called when external, exported when global', () => {
    const object = assembleOk(
      src(
        '\t.set\tnoreorder',
        '\t.globl\tLoadThing',
        'LoadThing:',
        '\tjal\tLockOnTarget',
        '\tnop',
        'Lower:',
        '\tjr\t$31',
        '\tnop',
        '\tjal\tLower',
        '\tnop',
      ),
    );
    expect(sectionOf(object, '.text').relocations.map((r) => r.target)).toEqual([
      { kind: 'symbol', name: 'LockOnTarget', addend: 0 },
      { kind: 'section', section: '.text', offset: 8, label: 'Lower' },
    ]);
    expect(object.symbols).toContainEqual({
      name: 'LoadThing',
      binding: 'global',
      section: '.text',
      offset: 0,
    });
    expect(object.symbols).toContainEqual({
      name: 'Lower',
      binding: 'local',
      section: '.text',
      offset: 8,
    });
  });
});
