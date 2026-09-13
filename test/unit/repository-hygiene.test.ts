// SPDX-License-Identifier: MIT
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SUMMARY_KEYS } from '../../scripts/oracle-compare.mjs';
import { ROOT, fromRoot } from '../helpers/paths.js';

/** Tracked and not-yet-tracked (but not ignored) files, relative to the root. */
function repositoryFiles(): string[] {
  return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split('\n')
    .filter((f) => f !== '');
}

const files = repositoryFiles();

/** The VERIFY items in the rule-set table under `heading`, up to `end` if given. */
function verifyItems(heading: string, end?: string): string[] {
  const doc = readFileSync(fromRoot('docs/ASPSX-2.81.md'), 'utf8');
  const from = doc.indexOf(heading);
  const section =
    from === -1 ? '' : doc.slice(from, end === undefined ? undefined : doc.indexOf(end));
  return [...section.matchAll(/^\| (VERIFY-\d+) \|/gm)].map((m) => String(m[1]));
}

function firstLines(file: string, n: number): string {
  return readFileSync(fromRoot(file), 'utf8').split(/\r?\n/).slice(0, n).join('\n');
}

describe('repository hygiene', () => {
  it('marks every hand-written source, script, and config file as MIT', () => {
    const sources = files.filter(
      (f) => /\.(ts|mts|js|mjs|rb)$/.test(f) && !f.startsWith('test/fixtures/'),
    );
    expect(sources.length).toBeGreaterThan(0);
    const missing = sources.filter(
      (f) => !firstLines(f, 3).includes('SPDX-License-Identifier: MIT'),
    );
    expect(missing).toEqual([]);
  });

  it('keeps private working notes out of the repository', () => {
    expect(readFileSync(fromRoot('.gitignore'), 'utf8').split('\n')).toContain('/tmp');
    expect(files.filter((f) => f.startsWith('tmp/'))).toEqual([]);
  });

  it('names every open VERIFY item of the rule set in a code comment and a probe', () => {
    const items = verifyItems('## Open verification items', '## Settled verification items');
    expect(items.length).toBeGreaterThan(0);
    const code = files
      .filter((f) => f.startsWith('src/'))
      .map((f) => readFileSync(fromRoot(f), 'utf8'))
      .join('\n');
    expect(items.filter((item) => !new RegExp(`${item}\\b`).test(code))).toEqual([]);
    expect(items.filter((item) => !files.includes(`test/fixtures/probes/${item}.s`))).toEqual([]);
  });

  it('keeps real ASPSX words, and no code tag, for every settled VERIFY item', () => {
    const items = verifyItems('## Settled verification items');
    expect(items.length).toBeGreaterThan(0);
    expect(
      items.filter((item) => !files.includes(`test/fixtures/probes/${item}.words.json`)),
    ).toEqual([]);
    const code = files
      .filter((f) => f.startsWith('src/'))
      .map((f) => readFileSync(fromRoot(f), 'utf8'))
      .join('\n');
    expect(items.filter((item) => new RegExp(`${item}\b`).test(code))).toEqual([]);
  });

  it('commits only aggregate differential-oracle results', () => {
    // The detailed report names the matched project's files and functions and
    // stays in the ignored tmp/ directory; only counts and provenance are committed.
    const differential = files.filter((f) => f.startsWith('test/differential/'));
    expect(
      differential.filter((f) => f !== 'test/differential/summary.json' && !f.endsWith('.test.ts')),
    ).toEqual([]);
    const summary = JSON.parse(
      readFileSync(fromRoot('test/differential/summary.json'), 'utf8'),
    ) as Record<string, unknown>;
    expect(Object.keys(summary)).toEqual([...SUMMARY_KEYS]);
    expect(Object.keys(summary['functions'] as object).sort()).toEqual(['passed', 'total']);
  });

  it('contains no absolute paths from a developer machine', () => {
    // Written as escaped patterns so this file does not match itself.
    const machinePath =
      /\/Users\/[^/\s]+\/|\/home\/[a-z][^/\s]*\/|\/private\/(tmp|var)\/|[A-Z]:\\Users\\/;
    const text = files.filter((f) => !/\.(png|tgz)$/.test(f) && f !== 'package-lock.json');
    const offenders = text.filter((f) => machinePath.test(readFileSync(fromRoot(f), 'utf8')));
    expect(offenders).toEqual([]);
  });
});
