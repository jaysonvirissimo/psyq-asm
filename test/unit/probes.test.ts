// SPDX-License-Identifier: MIT
/**
 * The VERIFY probes (test/fixtures/probes/) are sources for a maintainer to run
 * through the real assembler. They must at least assemble here, at the -G value
 * their first line names, so the words to compare against always exist. Once
 * the real assembler's words exist beside a probe (VERIFY-n.words.json, from
 * scripts/aspsx-oracle.rb), the probe must reproduce them exactly.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { assemble } from '../../src/asm/assemble.js';
import { expectMatchesCompanion, loadCompanion } from '../helpers/companions.js';
import { fromRoot } from '../helpers/paths.js';

const PROBES = fromRoot('test', 'fixtures', 'probes');

describe('VERIFY probes', () => {
  const names = readdirSync(PROBES)
    .filter((f) => f.endsWith('.s'))
    .sort();

  it('exist', () => {
    expect(names.length).toBeGreaterThan(0);
  });

  it.each(names)('%s assembles', (name) => {
    const text = readFileSync(fromRoot('test', 'fixtures', 'probes', name), 'utf8');
    const gp = /-G (\d+)/.exec(text.split('\n')[0] ?? '');
    expect(gp, `${name} names its -G value on line 1`).not.toBeNull();
    const result = assemble(text, { gpSize: Number(gp?.[1]), filename: name });
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
    const companion = loadCompanion(fromRoot('test', 'fixtures', 'probes', name));
    if (companion !== undefined) expectMatchesCompanion(result, companion);
  });
});
