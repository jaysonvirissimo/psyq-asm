// SPDX-License-Identifier: MIT
/**
 * The VERIFY probes (test/fixtures/probes/) are sources run through the real
 * assembler. They must assemble here at the -G value their first line names,
 * and wherever a version's output is recorded beside a probe (VERIFY-n.words.json
 * for 2.81, VERIFY-n.aspsx-2.77.words.json for 2.77, from scripts/aspsx-oracle.rb),
 * psyq-asm emulating that version must reproduce it exactly.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { assemble } from '../../src/asm/assemble.js';
import { SUPPORTED_ASPSX_VERSIONS } from '../../src/options.js';
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

  it.each(names.flatMap((name) => SUPPORTED_ASPSX_VERSIONS.map((v) => [name, v] as const)))(
    '%s assembles (ASPSX %s)',
    (name, aspsxVersion) => {
      const path = fromRoot('test', 'fixtures', 'probes', name);
      const text = readFileSync(path, 'utf8');
      const gp = /-G (\d+)/.exec(text.split('\n')[0] ?? '');
      expect(gp, `${name} names its -G value on line 1`).not.toBeNull();
      const result = assemble(text, { gpSize: Number(gp?.[1]), filename: name, aspsxVersion });
      expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
      const companion = loadCompanion(path, aspsxVersion);
      if (companion !== undefined) expectMatchesCompanion(result, companion);
    },
  );
});
