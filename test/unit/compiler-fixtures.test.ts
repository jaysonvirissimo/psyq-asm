// SPDX-License-Identifier: MIT
/**
 * Every compiled fixture assembles without error at its -G value, and every
 * code word it produces carries provenance. When the real assembler's output
 * is recorded beside a fixture (<name>.words.json, from scripts/aspsx-oracle.rb),
 * psyq-asm must reproduce it: the .text words exactly, and the section sizes,
 * relocations, and symbols it records. Every corpus file must have one.
 */
import { describe, expect, it } from 'vitest';
import { assemble } from '../../src/asm/assemble.js';
import type { AssembleResult } from '../../src/public-types.js';
import { expectMatchesCompanion, loadCompanion } from '../helpers/companions.js';
import {
  loadCompilerFixtures,
  loadCorpusFixtures,
  type CompilerFixture,
} from '../helpers/fixtures.js';

function assembleFixture(name: string, fixture: CompilerFixture): AssembleResult {
  const result = assemble(fixture.text, { gpSize: fixture.gpSize, filename: `${name}.s` });
  expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
  const sections = result.success ? result.object.sections : [];
  for (const section of sections.filter((s) => s.kind === 'code')) {
    expect(section.provenance?.length).toBe(section.words?.length);
  }
  return result;
}

describe('compiler fixtures', () => {
  it.each(loadCompilerFixtures().map((f) => [f.name, f] as const))('%s', (name, fixture) => {
    const result = assembleFixture(name, fixture);
    const companion = loadCompanion(fixture.path);
    if (companion !== undefined) {
      expect(companion.gpSize).toBe(fixture.gpSize);
      expectMatchesCompanion(result, companion);
    }
  });
});

describe('corpus', () => {
  it.each(loadCorpusFixtures().map((f) => [f.name, f] as const))('%s', (name, fixture) => {
    const result = assembleFixture(name, fixture);
    const companion = loadCompanion(fixture.path);
    expect(companion, `${name} has the real assembler's output recorded`).toBeDefined();
    if (companion === undefined) return;
    expect(companion.gpSize).toBe(fixture.gpSize);
    expectMatchesCompanion(result, companion);
  });
});
