// SPDX-License-Identifier: MIT
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
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

  it('contains no absolute paths from a developer machine', () => {
    // Written as escaped patterns so this file does not match itself.
    const machinePath =
      /\/Users\/[^/\s]+\/|\/home\/[a-z][^/\s]*\/|\/private\/(tmp|var)\/|[A-Z]:\\Users\\/;
    const text = files.filter((f) => !/\.(png|tgz)$/.test(f) && f !== 'package-lock.json');
    const offenders = text.filter((f) => machinePath.test(readFileSync(fromRoot(f), 'utf8')));
    expect(offenders).toEqual([]);
  });
});
