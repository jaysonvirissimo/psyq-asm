// SPDX-License-Identifier: MIT
/**
 * The ASPSX 2.81 ground truth: every imported maspsx fixture must assemble to
 * exactly the words the real assembler produced.
 */
import { describe, expect, it } from 'vitest';
import { assembleOk, wordsOf } from '../helpers/assembly.js';
import { loadAspsxFixtures } from '../helpers/fixtures.js';

describe('ASPSX 2.81 ground truth', () => {
  it.each(loadAspsxFixtures().map((f) => [f.name, f.sourceFile, f.gpSize, f] as const))(
    '%s (%s, -G %i)',
    (_, __, gpSize, fixture) => {
      expect(wordsOf(assembleOk(fixture.source, { gpSize }))).toEqual(fixture.expectedWords);
    },
  );
});
