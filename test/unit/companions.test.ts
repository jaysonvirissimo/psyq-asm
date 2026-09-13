// SPDX-License-Identifier: MIT
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { assemble } from '../../src/asm/assemble.js';
import { loadCompanion, textWords } from '../helpers/companions.js';

const work = mkdtempSync(join(tmpdir(), 'psyq-asm-companion-'));

afterAll(() => {
  rmSync(work, { recursive: true, force: true });
});

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
    expect(textWords(assemble('\tfoo\n', { gpSize: 0 }))).toEqual([]);
    expect(textWords(assemble('\t.data\n\t.word 1\n', { gpSize: 0 }))).toEqual([]);
  });
});
