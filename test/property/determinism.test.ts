// SPDX-License-Identifier: MIT
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { assemble } from '../../src/asm/assemble.js';
import { loadAspsxFixtures, loadCompilerFixtures } from '../helpers/fixtures.js';

const inputs = [
  ...loadCompilerFixtures().map((f) => ({ text: f.text, gpSize: f.gpSize })),
  ...loadAspsxFixtures().map((f) => ({ text: f.source, gpSize: f.gpSize })),
];

describe('determinism (property)', () => {
  it('assembling the same input twice gives equal results', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...inputs),
        fc.boolean(),
        ({ text, gpSize }, partialDivExpansion) => {
          const options = { gpSize, partialDivExpansion };
          expect(assemble(text, options)).toEqual(assemble(text, options));
        },
      ),
      { numRuns: 60 },
    );
  });
});
