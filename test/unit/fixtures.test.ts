// SPDX-License-Identifier: MIT
import { readdirSync } from 'node:fs';
import { basename } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  loadAspsxFixture,
  loadAspsxFixtures,
  loadCompilerFixtures,
  loadCorpusFixtures,
  parseWord,
} from '../helpers/fixtures.js';
import { fromRoot } from '../helpers/paths.js';

describe('ASPSX ground-truth fixtures', () => {
  const fixtures = loadAspsxFixtures();

  it('imports every maspsx fixture, for ASPSX 2.77 and 2.81', () => {
    const names = fixtures.filter((f) => f.aspsxVersion === '2.81').map((f) => f.name);
    expect(fixtures.filter((f) => f.aspsxVersion === '2.77').map((f) => f.name)).toEqual(names);
    expect(names).toEqual([
      'addu_at',
      'cfc2',
      'div',
      'expand_li',
      'expand_lw',
      'expand_sb',
      'expand_sw',
      'gp',
      'gp_offset',
      'la',
      'lwc2',
      'lwlw',
      'mflomt',
      'sltu_at',
      'v0_at',
    ]);
    expect(fixtures).toHaveLength(2 * names.length);
  });

  it('records well-formed words, one disassembly comment each, and the origin', () => {
    for (const f of fixtures) {
      expect(f.expectedWords.length, f.name).toBeGreaterThan(0);
      expect(f.disassembly, f.name).toHaveLength(f.expectedWords.length);
      for (const w of f.expectedWords) expect(w).toMatch(/^0x[0-9A-F]{8}$/);
      expect(f.origin).toMatch(
        new RegExp(`^mkst/maspsx aspsx/fixtures/${f.name}\\.yaml @ [0-9a-f]{7,40}$`),
      );
      expect(Number.isInteger(f.gpSize) && f.gpSize >= 0).toBe(true);
    }
  });

  it('keeps the upstream -G values and sources', () => {
    expect(
      fixtures
        .filter((f) => f.aspsxVersion === '2.81' && f.gpSize !== 0)
        .map((f) => [f.name, f.gpSize]),
    ).toEqual([
      ['gp', 999],
      ['gp_offset', 999],
      ['la', 999],
      ['v0_at', 8],
    ]);
    const div = loadAspsxFixture('div');
    expect(div.source.trim()).toBe('div $2,$4,$6');
    expect(div.expectedWords.map(parseWord)[0]).toBe(0x0086001a);
    // la is where the versions differ: 2.77 does not address small data through $gp.
    expect(loadAspsxFixture('la', '2.77').expectedWords).toHaveLength(2);
    expect(loadAspsxFixture('la').expectedWords).toHaveLength(1);
    expect(() => loadAspsxFixture('shadow-moses')).toThrow('no ASPSX fixture named shadow-moses');
  });
});

describe('compiler fixtures', () => {
  const fixtures = loadCompilerFixtures();

  it('holds t01 to t20 at -G 0 and -G 8, and t07_struct compiled with -g', () => {
    expect(fixtures).toHaveLength(41);
    expect(fixtures.filter((f) => f.gpSize === 8)).toHaveLength(21);
    expect(fixtures[0]?.name).toBe('t01_arith-g0');
    expect(fixtures.filter((f) => f.name.endsWith('-g')).map((f) => [f.name, f.gpSize])).toEqual([
      ['t07_struct-g', 8],
    ]);
  });

  it('keeps the compiler CRLF line endings', () => {
    for (const f of fixtures) {
      const lines = f.text.split('\n').slice(0, -1);
      expect(
        lines.every((l) => l.endsWith('\r')),
        f.name,
      ).toBe(true);
    }
  });
});

describe('corpus fixtures', () => {
  const fixtures = loadCorpusFixtures();
  const sources = readdirSync(fromRoot('test', 'fixtures', 'corpus', 'src'))
    .filter((f) => f.endsWith('.c'))
    .map((f) => basename(f, '.c'));

  it('compiles every source at -G 0, at -G 8, and at -G 8 with -g', () => {
    expect(sources.length).toBeGreaterThan(0);
    expect(fixtures.map((f) => f.name).sort()).toEqual(
      sources.flatMap((s) => [`${s}-g`, `${s}-g0`, `${s}-g8`]).sort(),
    );
  });

  it('keeps the compiler CRLF line endings', () => {
    for (const f of fixtures) {
      const lines = f.text.split('\n').slice(0, -1);
      expect(
        lines.every((l) => l.endsWith('\r')),
        f.name,
      ).toBe(true);
    }
  });
});
