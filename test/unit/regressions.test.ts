// SPDX-License-Identifier: MIT
/**
 * Regression fixtures (test/fixtures/regressions/): minimal hand-written sources
 * for discrepancies an oracle found. Each must carry the words ASPSX 2.81 emits
 * for it, and psyq-asm must reproduce every version recorded beside it.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { assemble } from '../../src/asm/assemble.js';
import { SUPPORTED_ASPSX_VERSIONS } from '../../src/options.js';
import { expectMatchesCompanion, loadCompanion } from '../helpers/companions.js';
import { fromRoot } from '../helpers/paths.js';

const DIR = fromRoot('test', 'fixtures', 'regressions');
const names = readdirSync(DIR)
  .filter((f) => f.endsWith('.s'))
  .sort();

describe('regression fixtures', () => {
  it('are documented', () => {
    expect(existsSync(fromRoot('test', 'fixtures', 'regressions', 'README.md'))).toBe(true);
  });

  it.each(names.flatMap((name) => SUPPORTED_ASPSX_VERSIONS.map((v) => [name, v] as const)))(
    '%s reproduces its recorded words (ASPSX %s)',
    (name, aspsxVersion) => {
      const path = fromRoot('test', 'fixtures', 'regressions', name);
      const text = readFileSync(path, 'utf8');
      const header = /^# [\w-]+, -G (\d+): \S/.exec(text.split('\n')[0] ?? '');
      expect(header, `${name} line 1 is "# <slug>, -G <n>: <what>"`).not.toBeNull();
      const companion = loadCompanion(path, aspsxVersion);
      if (aspsxVersion === '2.81')
        expect(companion, `${name} has a .words.json companion`).toBeDefined();
      if (companion === undefined) return;
      expect(companion.gpSize).toBe(Number(header?.[1]));
      const result = assemble(text, { gpSize: Number(header?.[1]), filename: name, aspsxVersion });
      expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
      expectMatchesCompanion(result, companion);
    },
  );
});
