// SPDX-License-Identifier: MIT
import { decodeSource, validateAssembleOptions } from '../options.js';
import type { AssembleOptions, AssembleResult } from '../public-types.js';
import { Diagnostics } from './diagnostics.js';
import { expand } from './expand.js';
import { insertNops } from './hazards.js';
import { layout } from './layout.js';
import { buildObject } from './object.js';
import { parse } from './parser.js';
import { classifySmallData, collectSymbols } from './symbols.js';

/**
 * Assemble PsyQ 4.4 `cc1psx` output into the words ASPSX 2.81 produces.
 *
 * Problems in the input are reported as diagnostics in a failed result; this
 * function throws only `InvalidOptionsError`, for a malformed `options` or a
 * `source` that is neither a string nor a `Uint8Array`.
 */
export function assemble(source: string | Uint8Array, options: AssembleOptions): AssembleResult {
  const normalized = validateAssembleOptions(options);
  const text = decodeSource(source);
  const diagnostics = new Diagnostics(normalized.filename);

  const statements = parse(text, diagnostics);
  const symbols = collectSymbols(statements, diagnostics);
  const smallData = classifySmallData(
    symbols,
    normalized.gpSize,
    normalized.experimental.externSmallData,
  );
  const items = expand(statements, {
    gpSize: normalized.gpSize,
    smallData,
    partialDivExpansion: normalized.partialDivExpansion,
    diagnostics,
  });
  const withNops = insertNops(items, {
    copMoveDelayNop: normalized.experimental.copMoveDelayNop,
  });
  const laidOut = layout(withNops, symbols, normalized.gpSize, diagnostics);

  if (diagnostics.hasErrors) return { success: false, diagnostics: diagnostics.sorted() };
  return {
    success: true,
    object: buildObject(normalized, laidOut, symbols, smallData),
    diagnostics: diagnostics.sorted(),
  };
}
