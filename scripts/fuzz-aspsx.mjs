// SPDX-License-Identifier: MIT
/**
 * Fuzz psyq-asm against the real ASPSX 2.81. For each seed: generate C
 * (scripts/gen-corpus.mjs), compile it with psyq-wasm at -G 0, -G 8, and
 * -G 8 -g, record what ASPSX emits for all of it in one run
 * (scripts/aspsx-oracle.rb --files), then compare psyq-asm's output with that
 * record the way the tests compare the corpus.
 *
 *   npm run build
 *   node scripts/fuzz-aspsx.mjs --aspsx <ASPSX.EXE> --seeds 1..200
 *                               [--functions 4] [--wine <command>] [--out <dir>]
 *
 * ASPSX runs in Docker unless --wine names a local wine. Work files go to
 * tmp/fuzz/ (ignored) unless --out says otherwise, and stay there for triage. A
 * mismatch prints the seed and the differences, and the run exits 1: reduce it
 * to a regression fixture in test/fixtures/regressions/. Nothing is committed.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_CPP_FLAGS, createCompiler } from 'psyq-wasm';
import { generate } from './gen-corpus.mjs';
import { differences } from './object-data.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const VARIANTS = [
  { suffix: 'g0', gpSize: 0, rawFlags: ['-O2', '-g0', '-Wall'] },
  { suffix: 'g8', gpSize: 8, rawFlags: ['-O2', '-g0', '-Wall'] },
  { suffix: 'g', gpSize: 8, rawFlags: ['-O2', '-g', '-Wall'] },
];

const args = process.argv.slice(2);
const arg = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const usage = () => {
  console.error(
    'usage: node scripts/fuzz-aspsx.mjs --aspsx <ASPSX.EXE> --seeds <first>..<last> [--functions n] [--wine <command>] [--out <dir>]',
  );
  process.exit(2);
};
const aspsx = arg('--aspsx');
const range = /^(\d+)\.\.(\d+)$/.exec(arg('--seeds') ?? '');
const functions = Number(arg('--functions') ?? '4');
if (aspsx === undefined || range === null || !Number.isInteger(functions) || functions < 1) usage();
const first = Number(range[1]);
const last = Number(range[2]);
if (last < first) usage();
const out = resolve(arg('--out') ?? join(ROOT, 'tmp', 'fuzz'));
if (!existsSync(join(ROOT, 'dist', 'index.js'))) {
  console.error('dist/index.js is missing; run `npm run build` first.');
  process.exit(2);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const problems = [];

const compiler = await createCompiler();
try {
  for (let seed = first; seed <= last; seed++) {
    const source = generate(seed, functions);
    writeFileSync(join(out, `seed${String(seed)}.c`), source);
    for (const { suffix, gpSize, rawFlags } of VARIANTS) {
      const result = await compiler.compileSource(source, {
        gpSize,
        filename: `seed${String(seed)}.c`,
        rawFlags,
        cppFlags: [...DEFAULT_CPP_FLAGS],
      });
      if (result.success) writeFileSync(join(out, `seed${String(seed)}-${suffix}.s`), result.asm);
      else
        problems.push([
          `seed${String(seed)}-${suffix}`,
          [`does not compile: ${result.rawStderr.trim()}`],
        ]);
    }
  }
} finally {
  compiler.dispose();
}

const wine = arg('--wine');
const recorder = spawnSync(
  'ruby',
  [
    join(ROOT, 'scripts', 'aspsx-oracle.rb'),
    '--aspsx',
    aspsx,
    ...(wine === undefined ? ['--docker'] : ['--wine', wine]),
    '--files',
    out,
  ],
  { stdio: ['ignore', 'ignore', 'inherit'] },
);
if (recorder.status !== 0 && recorder.status !== 1) process.exit(recorder.status ?? 1);

const { assemble } = await import('../dist/index.js');
const files = readdirSync(out)
  .filter((f) => f.endsWith('.s'))
  .sort();
for (const file of files) {
  const name = file.slice(0, -2);
  const companion = join(out, `${name}.words.json`);
  if (!existsSync(companion)) {
    problems.push([name, ['the real assembler rejected it (see the recorder output above)']]);
    continue;
  }
  const result = assemble(readFileSync(join(out, file)), {
    gpSize: name.endsWith('-g0') ? 0 : 8,
    filename: file,
  });
  const lines = differences(result, JSON.parse(readFileSync(companion, 'utf8')));
  if (lines.length > 0) problems.push([name, lines]);
}

for (const [name, lines] of problems) {
  console.log(`MISMATCH ${name}`);
  for (const line of lines) console.log(`  ${line}`);
}
console.log(
  `${String(files.length)} files from seeds ${String(first)}..${String(last)}: ${String(problems.length)} mismatches (work files in ${out})`,
);
process.exit(problems.length === 0 ? 0 : 1);
