// SPDX-License-Identifier: MIT
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { assemble } from '../../src/asm/assemble.js';

/** Fragments of cc1psx output, recombined into mostly-malformed sources. */
const TOKENS = [
  '\t',
  ' ',
  ',',
  ':',
  ';',
  '#',
  '"',
  '(',
  ')',
  '\\',
  '$2',
  '$sp',
  '$31',
  '$v9',
  '$L1',
  '$L1:',
  'sym',
  'sym+4',
  '0',
  '-1',
  '0x8000',
  '70000',
  '1.5',
  '1e999',
  '.',
  '.+8',
  '%hi(sym)',
  '%lo(sym)',
  '%gp_rel(g)',
  'lw',
  'sw',
  'lwc2',
  'li',
  'la',
  'li.s',
  'li.d',
  'div',
  'rem',
  'divu',
  'mflo',
  'mfhi',
  'mult',
  'addu',
  'subu',
  'sltu',
  'j',
  'jal',
  'jr',
  'beq',
  'bnez',
  'b',
  'move',
  'negu',
  'nop',
  'break',
  'sll',
  'cop2',
  'mfc2',
  'ctc2',
  '.word',
  '.half',
  '.byte',
  '.ascii',
  '.asciiz',
  '.space',
  '.align',
  '.comm',
  '.lcomm',
  '.extern',
  '.globl',
  '.ent',
  '.end',
  '.frame',
  '.mask',
  '.set',
  'noreorder',
  'reorder',
  '.text',
  '.data',
  '.sdata',
  '.sbss',
  '.bss',
  '.rdata',
  '.section',
  '.loc',
  '.stabs',
  '#APP',
  '#NO_APP',
  'g',
  'f',
  '4',
  '8',
  '15',
];

const line = fc
  .array(fc.constantFrom(...TOKENS), { maxLength: 8 })
  .map((tokens) => tokens.join(''));
const source = fc.array(line, { maxLength: 24 }).map((lines) => lines.join('\n'));

describe('robustness (property)', () => {
  it('reports malformed input as diagnostics and never throws', () => {
    fc.assert(
      fc.property(
        fc.oneof(source, fc.string(), fc.uint8Array()),
        fc.constantFrom(0, 8),
        fc.boolean(),
        (input, gpSize, partialDivExpansion) => {
          const result = assemble(input, { gpSize, partialDivExpansion });
          if (!result.success) {
            expect(result.diagnostics.some((d) => d.severity === 'error')).toBe(true);
          } else {
            expect(result.diagnostics.every((d) => d.severity === 'warning')).toBe(true);
          }
        },
      ),
      { numRuns: 3000 },
    );
  });
});
