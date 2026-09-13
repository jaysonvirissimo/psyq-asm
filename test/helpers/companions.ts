// SPDX-License-Identifier: MIT
import { existsSync, readFileSync } from 'node:fs';
import type { AssembleResult } from '../../src/public-types.js';
import { hex8 } from './assembly.js';

/** Words the real ASPSX emitted for a source, written by scripts/aspsx-oracle.rb. */
export interface WordsCompanion {
  readonly origin: string;
  readonly gpSize: number;
  readonly words: readonly string[];
}

/** The `<source>.words.json` beside a `.s` file, when an oracle has produced one. */
export function loadCompanion(sourcePath: string): WordsCompanion | undefined {
  const path = sourcePath.replace(/\.s$/, '.words.json');
  if (!existsSync(path)) return undefined;
  const companion = JSON.parse(readFileSync(path, 'utf8')) as WordsCompanion;
  if (
    typeof companion.origin !== 'string' ||
    !Number.isInteger(companion.gpSize) ||
    !Array.isArray(companion.words) ||
    !companion.words.every((w: unknown) => typeof w === 'string' && /^0x[0-9A-F]{8}$/.test(w))
  ) {
    throw new Error(`${path} is not a words companion`);
  }
  return companion;
}

/** This package's `.text` words for a result, formatted as companions store them. */
export function textWords(result: AssembleResult): string[] {
  if (!result.success) return [];
  const text = result.object.sections.find((s) => s.name === '.text');
  return Array.from(text?.words ?? []).map(hex8);
}
