// SPDX-License-Identifier: MIT
/**
 * Regression fixtures (test/fixtures/regressions/): minimal hand-written sources
 * for discrepancies an oracle found. Each must carry its expected words and
 * reproduce them exactly.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { assemble } from '../../src/asm/assemble.js';
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

  it.each(names)('%s reproduces its recorded words', (name) => {
    const path = fromRoot('test', 'fixtures', 'regressions', name);
    const text = readFileSync(path, 'utf8');
    const header = /^# [\w-]+, -G (\d+): \S/.exec(text.split('\n')[0] ?? '');
    expect(header, `${name} line 1 is "# <slug>, -G <n>: <what>"`).not.toBeNull();
    const companion = loadCompanion(path);
    expect(companion, `${name} has a .words.json companion`).toBeDefined();
    expect(companion?.gpSize).toBe(Number(header?.[1]));
    const result = assemble(text, { gpSize: Number(header?.[1]), filename: name });
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([]);
    if (companion !== undefined) expectMatchesCompanion(result, companion);
  });
});
