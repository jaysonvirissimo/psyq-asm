// SPDX-License-Identifier: MIT
import { format } from '../isa/format.js';
import { validateFormatStyle } from '../options.js';
import type { DecodedProgram, FormatStyle } from '../public-types.js';

/**
 * Render a decoded program as assembly `assemble` accepts, one instruction per
 * line, with its labels. The text starts with `.set noreorder`, because the
 * words already contain their delay slots.
 *
 * Re-assembling the text reproduces the words exactly when the program has no
 * instruction ASPSX would add a nop after (loads, mflo/mfhi, mfc2/cfc2) and,
 * if `baseAddress` was given, no labelled jump (which becomes a relocation).
 */
export function formatProgram(program: DecodedProgram, style?: FormatStyle): string {
  const normalized = validateFormatStyle(style);
  const lines = ['\t.set\tnoreorder'];
  program.instructions.forEach((instruction, index) => {
    const label = program.labels.get(index);
    if (label !== undefined) lines.push(`${label}:`);
    const text = format(instruction, normalized);
    const target = program.branchTargets.get(index);
    const targetLabel = target === undefined ? undefined : program.labels.get(target);
    if (targetLabel === undefined) {
      lines.push(`\t${text}`);
    } else {
      // The branch or jump target is always the last operand.
      const cut = text.lastIndexOf(',') + 1 || text.indexOf(' ') + 1;
      lines.push(`\t${text.slice(0, cut)}${targetLabel}`);
    }
  });
  const end = program.labels.get(program.instructions.length);
  if (end !== undefined) lines.push(`${end}:`);
  return `${lines.join('\n')}\n`;
}
