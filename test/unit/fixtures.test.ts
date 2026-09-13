// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import {
  loadAspsxFixture,
  loadAspsxFixtures,
  loadCompilerFixtures,
  parseWord,
} from '../helpers/fixtures.js';

describe('ASPSX ground-truth fixtures', () => {
  const fixtures = loadAspsxFixtures();

  it('imports every maspsx fixture, for ASPSX 2.81 only', () => {
    expect(fixtures.map((f) => f.name)).toEqual([
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
    for (const f of fixtures) expect(f.aspsxVersion).toBe('2.81');
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
    expect(fixtures.filter((f) => f.gpSize !== 0).map((f) => [f.name, f.gpSize])).toEqual([
      ['gp', 999],
      ['gp_offset', 999],
      ['la', 999],
      ['v0_at', 8],
    ]);
    const div = loadAspsxFixture('div');
    expect(div.source.trim()).toBe('div $2,$4,$6');
    expect(div.expectedWords.map(parseWord)[0]).toBe(0x0086001a);
    expect(() => loadAspsxFixture('shadow-moses')).toThrow('no ASPSX fixture named shadow-moses');
  });
});

describe('compiler fixtures', () => {
  const fixtures = loadCompilerFixtures();

  it('holds t01 to t20 at -G 0 and -G 8', () => {
    expect(fixtures).toHaveLength(40);
    expect(fixtures.filter((f) => f.gpSize === 8)).toHaveLength(20);
    expect(fixtures[0]?.name).toBe('t01_arith-g0');
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
