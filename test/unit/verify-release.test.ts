// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { verifyRelease } from '../../scripts/verify-release.mjs';

const changelog = '# Changelog\n\n## [Unreleased]\n\n## [0.1.0] - 2026-10-01\n\n### Added\n';

describe('verifyRelease', () => {
  it('accepts a tag that matches the version and a dated changelog section', () => {
    expect(verifyRelease({ tag: 'v0.1.0', version: '0.1.0', changelog })).toEqual([]);
  });

  it('reports a malformed tag, a version mismatch, and a missing section', () => {
    expect(verifyRelease({ tag: 'release-1', version: '0.2.0', changelog })).toEqual([
      'tag "release-1" is not of the form vX.Y.Z.',
      'tag "release-1" does not match package.json version 0.2.0.',
      'CHANGELOG.md has no "## [0.2.0] - YYYY-MM-DD" section.',
    ]);
  });

  it('does not treat dots in the version as wildcards', () => {
    expect(
      verifyRelease({ tag: 'v0.1.0', version: '0.1.0', changelog: '## [0a1b0] - 2026-10-01\n' }),
    ).toEqual(['CHANGELOG.md has no "## [0.1.0] - YYYY-MM-DD" section.']);
  });
});
