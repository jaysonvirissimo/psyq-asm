// SPDX-License-Identifier: MIT
import { existsSync, readFileSync } from 'node:fs';
import { expect } from 'vitest';
import {
  assembledData,
  localDifferences,
  textWords as assembledWords,
  type ObjectData,
} from '../../scripts/object-data.mjs';
import type { AssembleResult } from '../../src/public-types.js';

export type { ObjectData, RecordedTarget } from '../../scripts/object-data.mjs';

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
  return assembledWords(result);
}

/** This package's object described the way the real assembler's is recorded. */
export function dataOf(result: AssembleResult): ObjectData | undefined {
  return assembledData(result);
}

/**
 * Hold an assembled result to everything its companion recorded (the comparison
 * scripts/fuzz-aspsx.mjs also uses, through scripts/object-data.mjs): the words,
 * the section sizes, relocations, exports, and commons exactly, and the locals
 * both ways, since neither side lists every one.
 */
export function expectMatchesCompanion(result: AssembleResult, companion: WordsCompanion): void {
  expect(textWords(result)).toEqual(companion.words);
  const recorded = companion.data;
  if (recorded === undefined) return;
  const withoutLocals = (d: ObjectData | undefined): unknown =>
    d === undefined ? undefined : { ...d, symbols: { ...d.symbols, locals: [] } };
  expect(withoutLocals(dataOf(result))).toEqual(withoutLocals(recorded));
  expect(localDifferences(result, recorded)).toEqual({ misplaced: [], unrecorded: [] });
}
