// SPDX-License-Identifier: MIT
/**
 * The ASPSX ground truth: every imported maspsx fixture, for ASPSX 2.77 and
 * 2.81, must assemble to exactly the words that version produced.
 */
import { describe, expect, it } from 'vitest';
import { assembleOk, wordsOf } from '../helpers/assembly.js';
import { loadAspsxFixtures } from '../helpers/fixtures.js';

describe('ASPSX ground truth', () => {
  it.each(
    loadAspsxFixtures().map((f) => [f.name, f.aspsxVersion, f.sourceFile, f.gpSize, f] as const),
  )('%s, ASPSX %s (%s, -G %i)', (_, aspsxVersion, __, gpSize, fixture) => {
    expect(wordsOf(assembleOk(fixture.source, { gpSize, aspsxVersion }))).toEqual(
      fixture.expectedWords,
    );
  });
});
