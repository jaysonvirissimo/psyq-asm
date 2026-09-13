// SPDX-License-Identifier: MIT
/**
 * psyq-asm's side of the real-assembler comparison: an assembled object
 * described the way scripts/psyq-object.mjs describes a real one, and the
 * differences between the two. The tests (test/helpers/companions.ts) and
 * scripts/fuzz-aspsx.mjs share it.
 */

/**
 * @typedef {import('../src/public-types.js').AssembleResult} AssembleResult
 * @typedef {import('../src/public-types.js').SymbolEntry} SymbolEntry
 * @typedef {{ symbol: string, addend: number } | { section: string, offset: number } | { value: number } | { unsupported: string }} RecordedTarget
 * @typedef {{ name: string, section: string, offset: number }} PlacedSymbol
 * @typedef {{ name: string, section: string, size: number }} CommonSymbol
 * @typedef {{ section: string, offset: number, kind: string, target: RecordedTarget }} RecordedRelocation
 * @typedef {{ sections: Record<string, number>, relocations: RecordedRelocation[], symbols: { exports: PlacedSymbol[], commons: CommonSymbol[], locals: PlacedSymbol[] } }} ObjectData
 * @typedef {{ words: readonly string[], data?: ObjectData }} Recorded
 */

/**
 * @param {{ name: string }} a
 * @param {{ name: string }} b
 */
const byName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

/** @param {number} word */
const hex8 = (word) => `0x${(word >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;

/**
 * @param {SymbolEntry} symbol
 * @returns {PlacedSymbol}
 */
const placed = (symbol) => ({
  name: symbol.name,
  section: symbol.section ?? '',
  offset: symbol.offset ?? 0,
});

/**
 * This package's `.text` words for a result, formatted as companions store them.
 *
 * @param {AssembleResult} result
 * @returns {string[]}
 */
export function textWords(result) {
  if (!result.success) return [];
  const text = result.object.sections.find((s) => s.name === '.text');
  return Array.from(text?.words ?? []).map(hex8);
}

/**
 * The object as scripts/psyq-object.mjs's `dataOf` describes a real one:
 * section sizes other than .text, relocations, global definitions, commons,
 * and the locals ASPSX always writes (`.lcomm` symbols and static functions,
 * which are labels named by `.ent`).
 *
 * @param {AssembleResult} result
 * @returns {ObjectData | undefined}
 */
export function assembledData(result) {
  if (!result.success) return undefined;
  const { sections, symbols, functions } = result.object;
  const functionNames = new Set(functions.map((f) => f.name));
  /** @type {Record<string, number>} */
  const sizes = {};
  for (const section of [...sections].sort(byName)) {
    if (section.name !== '.text' && section.size > 0) sizes[section.name] = section.size;
  }
  const relocations = sections
    .flatMap((section) =>
      section.relocations.map((r) => ({
        section: section.name,
        offset: r.offset,
        kind: r.kind,
        target:
          r.target.kind === 'symbol'
            ? { symbol: r.target.name, addend: r.target.addend | 0 }
            : { section: r.target.section, offset: r.target.offset >>> 0 },
      })),
    )
    .sort((a, b) =>
      a.section === b.section ? a.offset - b.offset : a.section < b.section ? -1 : 1,
    );
  return {
    sections: sizes,
    relocations,
    symbols: {
      exports: symbols
        .filter((s) => s.binding === 'global' && s.section !== undefined)
        .map(placed)
        .sort(byName),
      commons: symbols
        .filter((s) => s.binding === 'common')
        .map((s) => ({ name: s.name, section: s.section ?? '', size: s.size ?? 0 }))
        .sort(byName),
      locals: symbols
        .filter((s) => s.binding === 'local' && (s.size !== undefined || functionNames.has(s.name)))
        .map(placed)
        .sort(byName),
    },
  };
}

/**
 * Every named local label of the object, where it is placed.
 *
 * @param {AssembleResult} result
 * @returns {PlacedSymbol[]}
 */
export function assembledLocals(result) {
  if (!result.success) return [];
  return result.object.symbols
    .filter((s) => s.binding === 'local' && s.section !== undefined)
    .map(placed);
}

/**
 * The locals that disagree: recorded ones psyq-asm does not have in the same
 * place, and ones psyq-asm requires that were not recorded. ASPSX writes locals
 * for `.lcomm` and static functions, and with -g for other named statics too,
 * while psyq-asm lists every named label, so neither side has to be complete.
 *
 * @param {AssembleResult} result
 * @param {ObjectData} recorded
 * @returns {{ misplaced: PlacedSymbol[], unrecorded: PlacedSymbol[] }}
 */
export function localDifferences(result, recorded) {
  const known = new Map(assembledLocals(result).map((s) => [s.name, s]));
  const misplaced = recorded.symbols.locals.filter((l) => {
    const k = known.get(l.name);
    return k?.section !== l.section || k.offset !== l.offset;
  });
  const recordedNames = new Set(recorded.symbols.locals.map((l) => l.name));
  const unrecorded = (assembledData(result)?.symbols.locals ?? []).filter(
    (l) => !recordedNames.has(l.name),
  );
  return { misplaced, unrecorded };
}

/**
 * Everything that differs between an assembled result and what the real
 * assembler recorded, as readable lines; empty when they match.
 *
 * @param {AssembleResult} result
 * @param {Recorded} recorded
 * @returns {string[]}
 */
export function differences(result, recorded) {
  const lines = [];
  if (!result.success) {
    return result.diagnostics
      .filter((d) => d.severity === 'error')
      .slice(0, 5)
      .map((d) => `psyq-asm error at line ${String(d.line)}: ${d.message}`);
  }
  const words = textWords(result);
  const differing = [];
  for (let i = 0; i < Math.max(words.length, recorded.words.length); i++) {
    if (words[i] !== recorded.words[i]) differing.push(i);
  }
  for (const i of differing.slice(0, 5)) {
    lines.push(`word ${String(i)}: psyq-asm ${words[i] ?? '-'}, ASPSX ${recorded.words[i] ?? '-'}`);
  }
  if (differing.length > 5) lines.push(`${String(differing.length - 5)} more words differ`);
  const data = recorded.data;
  if (data === undefined) return lines;
  const ours = assembledData(result);
  if (ours === undefined) return lines;
  const show = (value) => JSON.stringify(value);
  if (show(ours.sections) !== show(data.sections)) {
    lines.push(`sections: psyq-asm ${show(ours.sections)}, ASPSX ${show(data.sections)}`);
  }
  const relocations = Math.max(ours.relocations.length, data.relocations.length);
  const relocationLines = [];
  for (let i = 0; i < relocations; i++) {
    if (show(ours.relocations[i]) !== show(data.relocations[i])) {
      relocationLines.push(
        `relocation ${String(i)}: psyq-asm ${show(ours.relocations[i])}, ASPSX ${show(data.relocations[i])}`,
      );
    }
  }
  lines.push(...relocationLines.slice(0, 5));
  for (const key of /** @type {const} */ (['exports', 'commons'])) {
    if (show(ours.symbols[key]) !== show(data.symbols[key])) {
      lines.push(`${key}: psyq-asm ${show(ours.symbols[key])}, ASPSX ${show(data.symbols[key])}`);
    }
  }
  const { misplaced, unrecorded } = localDifferences(result, data);
  if (misplaced.length > 0) lines.push(`locals ASPSX placed elsewhere: ${show(misplaced)}`);
  if (unrecorded.length > 0) lines.push(`locals ASPSX did not write: ${show(unrecorded)}`);
  return lines;
}
