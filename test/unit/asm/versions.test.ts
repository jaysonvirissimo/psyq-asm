// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { rulesFor } from '../../../src/asm/versions.js';
import { assembleOk, src, wordsOf } from '../../helpers/assembly.js';

describe('ASPSX versions', () => {
  it('address la of small data through $gp in 2.81 and with lui/addiu in 2.77', () => {
    const la = src('\t.comm\tsmall,4', '\tla\t$4,small');
    expect(wordsOf(assembleOk(la, { gpSize: 8 }))).toEqual(['0x27840000']);
    const old = assembleOk(la, { gpSize: 8, aspsxVersion: '2.77' });
    expect(wordsOf(old)).toEqual(['0x3C040000', '0x24840000']);
    expect(old.info.aspsxVersion).toBe('2.77');
    const lw = src('\t.comm\tsmall,4', '\tlw\t$4,small');
    expect(wordsOf(assembleOk(lw, { gpSize: 8, aspsxVersion: '2.77' }))).toEqual(['0x8F840000']);
  });

  it('list what differs per version', () => {
    expect(rulesFor('2.77')).toEqual({ gpAddressesLa: false });
    expect(rulesFor('2.81')).toEqual({ gpAddressesLa: true });
  });
});
