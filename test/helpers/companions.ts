// SPDX-License-Identifier: MIT
import { existsSync, readFileSync } from 'node:fs';
import { expect } from 'vitest';
import type { AssembleResult, SymbolEntry } from '../../src/public-types.js';
import { hex8 } from './assembly.js';

/** A relocation target as scripts/psyq-object.mjs records it from a real object. */
export type RecordedTarget =
  | { readonly symbol: string; readonly addend: number }
  | { readonly section: string; readonly offset: number }
  | { readonly value: number }
  | { readonly unsupported: string };

interface PlacedSymbol {
  readonly name: string;
  readonly section: string;
  readonly offset: number;
}

/** An object's section sizes, relocations, and defined symbols, as recorded. */
export interface ObjectData {
  readonly sections: Readonly<Record<string, number>>;
  readonly relocations: readonly {
    readonly section: string;
    readonly offset: number;
    readonly kind: string;
    readonly target: RecordedTarget;
  }[];
  readonly symbols: {
    readonly exports: readonly PlacedSymbol[];
    readonly commons: readonly {
      readonly name: string;
      readonly section: string;
      readonly size: number;
    }[];
    readonly locals: readonly PlacedSymbol[];
  };
}

/** What the real ASPSX emitted for a source, written by scripts/aspsx-oracle.rb. */
export interface WordsCompanion {
  readonly origin: string;
  readonly gpSize: number;
  readonly words: readonly string[];
  /** The object beyond its .text words, when it was recorded. */
  readonly data?: ObjectData;
}

/** The `<source>.words.json` beside a `.s` file, when an oracle has produced one. */
export function loadCompanion(sourcePath: string): WordsCompanion | undefined {
  const path = sourcePath.replace(/\.s$/, '.words.json');
  if (!existsSync(path)) return undefined;
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  const { origin, gpSize, words, data } = raw;
  if (
    typeof origin !== 'string' ||
    !Number.isInteger(gpSize) ||
    !Array.isArray(words) ||
    !words.every((w: unknown) => typeof w === 'string' && /^0x[0-9A-F]{8}$/.test(w)) ||
    (data !== undefined && (typeof data !== 'object' || data === null))
  ) {
    throw new Error(`${path} is not a words companion`);
  }
  return raw as unknown as WordsCompanion;
}

/** This package's `.text` words for a result, formatted as companions store them. */
export function textWords(result: AssembleResult): string[] {
  if (!result.success) return [];
  const text = result.object.sections.find((s) => s.name === '.text');
  return Array.from(text?.words ?? []).map(hex8);
}

const byName = (a: { name: string }, b: { name: string }): number =>
  a.name < b.name ? -1 : a.name > b.name ? 1 : 0;

function placed(symbol: SymbolEntry): PlacedSymbol {
  return { name: symbol.name, section: symbol.section ?? '', offset: symbol.offset ?? 0 };
}

/**
 * This package's object described the way scripts/psyq-object.mjs describes a
 * real one (see `dataOf` there): section sizes other than .text, relocations,
 * global definitions, commons, and `.lcomm` locals.
 */
export function dataOf(result: AssembleResult): ObjectData | undefined {
  if (!result.success) return undefined;
  const { sections, symbols } = result.object;
  const sizes: Record<string, number> = {};
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
        .filter((s) => s.binding === 'local' && s.size !== undefined)
        .map(placed)
        .sort(byName),
    },
  };
}

/** Hold an assembled result to everything its companion recorded. */
export function expectMatchesCompanion(result: AssembleResult, companion: WordsCompanion): void {
  expect(textWords(result)).toEqual(companion.words);
  if (companion.data !== undefined) expect(dataOf(result)).toEqual(companion.data);
}
