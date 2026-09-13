// SPDX-License-Identifier: MIT
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename } from 'node:path';
import { fromRoot } from './paths.js';

/** One ASPSX ground-truth case imported from maspsx (see test/fixtures/README.md). */
export interface AspsxFixture {
  readonly name: string;
  readonly origin: string;
  readonly aspsxVersion: string;
  readonly sourceFile: string;
  readonly source: string;
  readonly gpSize: number;
  readonly expectedWords: readonly string[];
  readonly disassembly: readonly string[];
}

/** A psyq-wasm compiler output fixture. */
export interface CompilerFixture {
  /** e.g. `t03_muldiv-g8` */
  readonly name: string;
  readonly gpSize: 0 | 8;
  readonly path: string;
  readonly text: string;
}

export const ASPSX_FIXTURE_DIR: string = fromRoot('test', 'fixtures', 'aspsx');
export const COMPILER_FIXTURE_DIR: string = fromRoot('test', 'fixtures', 'compiler');

export function loadAspsxFixtures(): AspsxFixture[] {
  return readdirSync(ASPSX_FIXTURE_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map(
      (f) =>
        JSON.parse(readFileSync(fromRoot('test', 'fixtures', 'aspsx', f), 'utf8')) as AspsxFixture,
    );
}

export function loadAspsxFixture(name: string): AspsxFixture {
  const fixture = loadAspsxFixtures().find((f) => f.name === name);
  if (fixture === undefined) throw new Error(`no ASPSX fixture named ${name}`);
  return fixture;
}

function loadAssemblyFixtures(set: 'compiler' | 'corpus'): CompilerFixture[] {
  // g/ holds -G 8 output compiled with -g (debugging information).
  return (['g0', 'g8', 'g'] as const).flatMap((dir) => {
    const root = fromRoot('test', 'fixtures', set, dir);
    if (!existsSync(root)) return [];
    return readdirSync(root)
      .filter((f) => f.endsWith('.s'))
      .sort()
      .map((f) => {
        const path = fromRoot('test', 'fixtures', set, dir, f);
        return {
          name: `${basename(f, '.s')}-${dir}`,
          gpSize: dir === 'g0' ? 0 : 8,
          path,
          text: readFileSync(path, 'utf8'),
        } as const;
      });
  });
}

/** psyq-wasm's compiler output fixtures (see test/fixtures/README.md). */
export function loadCompilerFixtures(): CompilerFixture[] {
  return loadAssemblyFixtures('compiler');
}

/** The real-assembler corpus: this repository's own C, compiled by scripts/compile-corpus.mjs. */
export function loadCorpusFixtures(): CompilerFixture[] {
  return loadAssemblyFixtures('corpus');
}

/** Parse a fixture word string such as `0x0086001A`. */
export function parseWord(text: string): number {
  return Number.parseInt(text.slice(2), 16) >>> 0;
}
