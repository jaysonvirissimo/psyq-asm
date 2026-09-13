// SPDX-License-Identifier: MIT
/**
 * The real-assembler corpus: original C in test/fixtures/corpus/src, compiled
 * with psyq-wasm (PsyQ 4.4 cc1psx) into the assembly psyq-asm is tested on.
 * Each source yields three files of byte-exact compiler output:
 *
 *   corpus/g0/NAME.s   -O2 -G 0 -g0 -Wall
 *   corpus/g8/NAME.s   -O2 -G 8 -g0 -Wall
 *   corpus/g/NAME.s    -O2 -G 8 -g  -Wall
 *
 *   node scripts/compile-corpus.mjs            write every .s
 *   node scripts/compile-corpus.mjs --verify   fail if a committed .s is missing,
 *                                              stale, or differs
 *
 * After adding or changing a source, compile, then record what the real
 * assembler emits with scripts/aspsx-oracle.rb: the tests require a companion
 * for every corpus file.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_CPP_FLAGS, createCompiler } from 'psyq-wasm';

const CORPUS = fileURLToPath(new URL('../test/fixtures/corpus/', import.meta.url));

export const VARIANTS = Object.freeze([
  { dir: 'g0', gpSize: 0, rawFlags: ['-O2', '-g0', '-Wall'] },
  { dir: 'g8', gpSize: 8, rawFlags: ['-O2', '-g0', '-Wall'] },
  { dir: 'g', gpSize: 8, rawFlags: ['-O2', '-g', '-Wall'] },
]);

const verify = process.argv.includes('--verify');
const sources = readdirSync(join(CORPUS, 'src'))
  .filter((f) => f.endsWith('.c'))
  .sort();
const names = new Set(sources.map((f) => f.slice(0, -2)));
const problems = [];

const compiler = await createCompiler();
try {
  for (const file of sources) {
    const name = file.slice(0, -2);
    const source = readFileSync(join(CORPUS, 'src', file));
    for (const { dir, gpSize, rawFlags } of VARIANTS) {
      const result = await compiler.compileSource(source, {
        gpSize,
        filename: file,
        rawFlags,
        cppFlags: [...DEFAULT_CPP_FLAGS],
      });
      if (!result.success) {
        problems.push(`${dir}/${name}: the compiler failed: ${result.rawStderr.trim()}`);
        continue;
      }
      const out = join(CORPUS, dir, `${name}.s`);
      if (verify) {
        const committed = existsSync(out) ? readFileSync(out) : undefined;
        if (committed === undefined || Buffer.compare(committed, Buffer.from(result.asm)) !== 0) {
          problems.push(`${dir}/${name}.s is missing or differs from the compiler's output`);
        }
      } else {
        mkdirSync(join(CORPUS, dir), { recursive: true });
        writeFileSync(out, result.asm);
      }
    }
  }
} finally {
  compiler.dispose();
}

for (const { dir } of VARIANTS) {
  const path = join(CORPUS, dir);
  for (const f of existsSync(path) ? readdirSync(path) : []) {
    if (f.endsWith('.s') && !names.has(f.slice(0, -2))) {
      problems.push(`${dir}/${f} has no source in src/`);
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(
  `${String(sources.length)} sources, ${String(sources.length * VARIANTS.length)} files ${verify ? 'verified' : 'written'}`,
);
