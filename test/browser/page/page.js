// SPDX-License-Identifier: MIT
// Harness page for the Playwright suite: exposes the built library on window.
import {
  assemble,
  decode,
  decodeWords,
  encode,
  format,
  formatProgram,
} from '../../../dist/index.js';

const hex8 = (value) => `0x${(value >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;

window.psyqAsm = {
  /** Assemble and return the .text words as 0x%08X strings, or the diagnostics. */
  words(source, gpSize, aspsxVersion) {
    const result = assemble(source, { gpSize, aspsxVersion });
    if (!result.success) return { diagnostics: result.diagnostics };
    const text = result.object.sections.find((section) => section.name === '.text');
    return { words: [...(text?.words ?? [])].map(hex8) };
  },
  roundTrip(words) {
    const text = formatProgram(decodeWords(words));
    const result = assemble(text, { gpSize: 0 });
    return result.success ? [...result.object.sections[0].words] : null;
  },
  describe(word) {
    const instruction = decode(word);
    return {
      text: format(instruction),
      encoded: instruction.mnemonic === '.word' ? null : encode(instruction),
    };
  },
};
window.psyqAsmReady = true;
