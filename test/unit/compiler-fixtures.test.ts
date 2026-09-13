// SPDX-License-Identifier: MIT
/**
 * Every compiled fixture assembles without error at its -G value, and every
 * code word it produces carries provenance. When the real assembler's output
 * is recorded beside a fixture (<name>.words.json for ASPSX 2.81 and
 * <name>.aspsx-2.77.words.json for 2.77, from scripts/aspsx-oracle.rb),
 * psyq-asm emulating that version must reproduce it: the .text words exactly,
 * and the section sizes, relocations, and symbols it records. Every corpus file
 * must have both.
 */
import { describe, expect, it } from 'vitest';
import { assemble } from '../../src/asm/assemble.js';
import { SUPPORTED_ASPSX_VERSIONS } from '../../src/options.js';
import type { AspsxVersion, AssembleResult } from '../../src/public-types.js';
import { expectMatchesCompanion, loadCompanion } from '../helpers/companions.js';
import {
  loadCompilerFixtures,
  loadCorpusFixtures,
  type CompilerFixture,
} from '../helpers/fixtures.js';

function assembleFixture(fixture: CompilerFixture, aspsxVersion: AspsxVersion): AssembleResult {
  const result = assemble(fixture.text, {
    gpSize: fixture.gpSize,
    filename: `${fixture.name}.s`,
    aspsxVersion,
  });
  expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
  const sections = result.success ? result.object.sections : [];
  for (const section of sections.filter((s) => s.kind === 'code')) {
    expect(section.provenance?.length).toBe(section.words?.length);
  }
  return result;
}

function cases(fixtures: readonly CompilerFixture[]) {
  return fixtures.flatMap((fixture) =>
    SUPPORTED_ASPSX_VERSIONS.map((version) => [fixture.name, version, fixture] as const),
  );
}

describe('compiler fixtures', () => {
  it.each(cases(loadCompilerFixtures()))('%s (ASPSX %s)', (_, version, fixture) => {
    const result = assembleFixture(fixture, version);
    const companion = loadCompanion(fixture.path, version);
    if (companion !== undefined) {
      expect(companion.gpSize).toBe(fixture.gpSize);
      expectMatchesCompanion(result, companion);
    }
  });
});

describe('corpus', () => {
  it.each(cases(loadCorpusFixtures()))('%s (ASPSX %s)', (name, version, fixture) => {
    const result = assembleFixture(fixture, version);
    const companion = loadCompanion(fixture.path, version);
    expect(companion, `${name} has ASPSX ${version}'s output recorded`).toBeDefined();
    if (companion === undefined) return;
    expect(companion.gpSize).toBe(fixture.gpSize);
    expectMatchesCompanion(result, companion);
  });
});
