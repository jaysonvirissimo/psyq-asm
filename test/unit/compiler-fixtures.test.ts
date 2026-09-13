// SPDX-License-Identifier: MIT
/**
 * Every psyq-wasm compiler fixture assembles without error at its -G value, and
 * every code word it produces carries provenance. Exact words are asserted once
 * an oracle has verified them (see test/fixtures/README.md).
 */
import { describe, expect, it } from 'vitest';
import { assemble } from '../../src/asm/assemble.js';
import { loadCompilerFixtures } from '../helpers/fixtures.js';

describe('compiler fixtures', () => {
  it.each(loadCompilerFixtures().map((f) => [f.name, f] as const))('%s', (name, fixture) => {
    const result = assemble(fixture.text, { gpSize: fixture.gpSize, filename: `${name}.s` });
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
    const sections = result.success ? result.object.sections : [];
    for (const section of sections.filter((s) => s.kind === 'code')) {
      expect(section.provenance?.length).toBe(section.words?.length);
    }
  });
});
