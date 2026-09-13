// SPDX-License-Identifier: MIT
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { assemble } from '../../src/asm/assemble.js';
import { dataOf, expectMatchesCompanion, loadCompanion, textWords } from '../helpers/companions.js';

const work = mkdtempSync(join(tmpdir(), 'psyq-asm-companion-'));

afterAll(() => {
  rmSync(work, { recursive: true, force: true });
});

const SOURCE = [
  '\t.set\tnoreorder',
  '\t.globl\tf',
  'f:',
  '\tjal\text',
  '\tnop',
  '$L1:',
  '\tjr\t$31',
  '\tnop',
  '\t.data',
  '\t.word\t$L1',
  '\t.word\text+4',
  '',
].join('\n');

describe('words companions', () => {
  it('are optional', () => {
    expect(loadCompanion(join(work, 'absent.s'))).toBeUndefined();
  });

  it('load, validate, and compare with assembled .text words', () => {
    const source = join(work, 'probe.s');
    writeFileSync(
      join(work, 'probe.words.json'),
      JSON.stringify({ origin: 'test', gpSize: 0, words: ['0x27BDFFE8', '0x03E00008'] }),
    );
    const companion = loadCompanion(source);
    const result = assemble('\t.set\tnoreorder\n\taddiu $sp,$sp,-24\n\tjr $ra\n', { gpSize: 0 });
    expect(textWords(result)).toEqual(companion?.words);

    writeFileSync(
      join(work, 'bad.words.json'),
      JSON.stringify({ origin: 'test', gpSize: 0, words: ['27BDFFE8'] }),
    );
    expect(() => loadCompanion(join(work, 'bad.s'))).toThrow('is not a words companion');
    writeFileSync(
      join(work, 'bad-data.words.json'),
      JSON.stringify({ origin: 'test', gpSize: 0, words: [], data: 5 }),
    );
    expect(() => loadCompanion(join(work, 'bad-data.s'))).toThrow('is not a words companion');
    expect(textWords(assemble('\tfoo\n', { gpSize: 0 }))).toEqual([]);
    expect(textWords(assemble('\t.data\n\t.word 1\n', { gpSize: 0 }))).toEqual([]);
  });

  it('describe an object the way recorded ASPSX data does', () => {
    const result = assemble(SOURCE, { gpSize: 0 });
    const data = dataOf(result);
    expect(data).toEqual({
      sections: { '.data': 8 },
      relocations: [
        { section: '.data', offset: 0, kind: 'WORD32', target: { section: '.text', offset: 8 } },
        { section: '.data', offset: 4, kind: 'WORD32', target: { symbol: 'ext', addend: 4 } },
        { section: '.text', offset: 0, kind: 'MIPS26', target: { symbol: 'ext', addend: 0 } },
      ],
      symbols: { exports: [{ name: 'f', section: '.text', offset: 0 }], commons: [], locals: [] },
    });
    if (data === undefined) throw new Error('no data');
    const words = textWords(result);
    expect(() => {
      expectMatchesCompanion(result, { origin: 'test', gpSize: 0, words, data });
    }).not.toThrow();
    expect(() => {
      expectMatchesCompanion(result, {
        origin: 'test',
        gpSize: 0,
        words,
        data: { ...data, sections: {} },
      });
    }).toThrow();
    expect(dataOf(assemble('\tfoo\n', { gpSize: 0 }))).toBeUndefined();
  });
});
