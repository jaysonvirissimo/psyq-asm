// SPDX-License-Identifier: MIT
/**
 * The ASPSX 2.81 ground truth: every imported maspsx fixture must assemble to
 * exactly the words the real assembler produced.
 */
import { describe, expect, it } from 'vitest';
import { assembleOk, wordsOf } from '../helpers/assembly.js';
import { loadAspsxFixtures } from '../helpers/fixtures.js';

/** Fixtures whose words depend on nop insertion, which is not implemented yet. */
const NEEDS_NOP_PASS: ReadonlySet<string> = new Set(['addu_at', 'cfc2', 'expand_sb', 'mflomt']);

describe('ASPSX 2.81 ground truth', () => {
  for (const fixture of loadAspsxFixtures()) {
    const test = NEEDS_NOP_PASS.has(fixture.name) ? it.fails : it;
    test(`${fixture.name} (${fixture.sourceFile}, -G ${String(fixture.gpSize)})`, () => {
      const object = assembleOk(fixture.source, { gpSize: fixture.gpSize });
      expect(wordsOf(object)).toEqual(fixture.expectedWords);
    });
  }
});
