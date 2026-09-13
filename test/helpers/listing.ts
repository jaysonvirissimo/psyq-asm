// SPDX-License-Identifier: MIT
import { decode } from '../../src/isa/decode.js';
import { format } from '../../src/isa/format.js';
import type { AssembledObject, AssembleOptions } from '../../src/public-types.js';
import { assembleOk, sectionOf } from './assembly.js';

/** A code section disassembled with numeric registers, one line per word. */
export function listingOf(object: AssembledObject, name = '.text'): string[] {
  return [...(sectionOf(object, name).words ?? [])].map((w) =>
    format(decode(w), { registers: 'numeric' }),
  );
}

/** Assemble `text` and disassemble its `.text` section. */
export function listing(text: string, options: Partial<AssembleOptions> = {}): string[] {
  return listingOf(assembleOk(text, options));
}
