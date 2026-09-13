// SPDX-License-Identifier: MIT
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { encode } from '../../src/isa/encode.js';
import { ISA_ROWS } from '../../src/isa/table.js';
import { decodeWords } from '../../src/program/decode-words.js';
import { formatProgram } from '../../src/program/format-program.js';
import { operandArbitrary } from '../helpers/arbitraries.js';
import { assembleOk, hex8, wordsOf } from '../helpers/assembly.js';

/**
 * Rows after which ASPSX may insert a nop (the GTE register writes pad a later
 * GTE command); re-assembly would not round-trip them.
 */
const ROUND_TRIP_ROWS = ISA_ROWS.filter(
  (row) =>
    row.hazard !== 'load' &&
    row.hazard !== 'mflo' &&
    row.hazard !== 'cop-from' &&
    !['lwc2', 'mtc2', 'ctc2'].includes(row.mnemonic),
);

const word = fc
  .constantFrom(...ROUND_TRIP_ROWS)
  .chain((row) =>
    fc
      .tuple(...row.syntax.map(operandArbitrary))
      .map((operands) => encode({ mnemonic: row.mnemonic, operands })),
  );

describe('program view (property)', () => {
  it('assemble(formatProgram(decodeWords(words))) reproduces the words', () => {
    fc.assert(
      fc.property(
        fc.array(word, { minLength: 1, maxLength: 24 }),
        fc.boolean(),
        fc.constantFrom('abi', 'numeric'),
        (words, pseudo, registers) => {
          const text = formatProgram(decodeWords(words), { pseudo, registers });
          expect(wordsOf(assembleOk(text))).toEqual(words.map(hex8));
        },
      ),
      { numRuns: 400 },
    );
  });
});
