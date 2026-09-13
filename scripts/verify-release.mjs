// SPDX-License-Identifier: MIT
/**
 * Release gate: the tag, package.json, and CHANGELOG.md must agree.
 *
 *   node scripts/verify-release.mjs --tag vX.Y.Z
 *
 * Run by the release workflow before anything is built, so a mistyped tag or a
 * forgotten changelog section fails in seconds rather than after the test run.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/**
 * @param {{ tag: string, version: string, changelog: string }} input
 * @returns {string[]} problems found; empty when the release may proceed
 */
export function verifyRelease({ tag, version, changelog }) {
  const problems = [];
  if (!/^v\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(tag)) {
    problems.push(`tag ${JSON.stringify(tag)} is not of the form vX.Y.Z.`);
  }
  if (tag !== `v${version}`) {
    problems.push(`tag ${JSON.stringify(tag)} does not match package.json version ${version}.`);
  }
  const heading = new RegExp(
    `^## \\[${version.replaceAll('.', '\\.')}\\] - \\d{4}-\\d{2}-\\d{2}$`,
    'm',
  );
  if (!heading.test(changelog)) {
    problems.push(`CHANGELOG.md has no "## [${version}] - YYYY-MM-DD" section.`);
  }
  return problems;
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href
) {
  const index = process.argv.indexOf('--tag');
  const tag = index === -1 ? undefined : process.argv[index + 1];
  if (tag === undefined) {
    console.error('usage: node scripts/verify-release.mjs --tag vX.Y.Z');
    process.exit(2);
  }
  const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const changelog = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8');
  const problems = verifyRelease({ tag, version, changelog });
  for (const problem of problems) console.error(problem);
  if (problems.length > 0) process.exit(1);
  console.log(`release ${tag} verified`);
}
