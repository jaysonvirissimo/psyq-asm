// SPDX-License-Identifier: MIT
/**
 * Compare psyq-asm with the real ASPSX over many sources: generated from seeds
 * (scripts/gen-corpus.mjs, compiled with psyq-wasm at -G 0, -G 8, and -G 8 -g),
 * or taken from a directory of existing assembly. Everything is recorded with
 * the real assembler in one run (scripts/aspsx-oracle.rb --files), then
 * psyq-asm's output is compared with that record the way the tests compare
 * the corpus.
 *
 *   npm run build
 *   node scripts/fuzz-aspsx.mjs --aspsx <ASPSX.EXE> --seeds 1..200 [--functions 4]
 *   node scripts/fuzz-aspsx.mjs --aspsx <ASPSX.EXE> --sources <dir>
 *        [--version 2.77|2.81] [--wine <command>] [--out <dir>]
 *
 * --version names the version of the ASPSX.EXE given (2.81 by default) and the
 * version psyq-asm emulates. With --sources, the .s files directly in <dir> are
 * compared: a name ending in -g0.s assembles at -G 0 and any other at -G 8.
 * ASPSX runs in Docker unless --wine names a local wine. Work files go to
 * tmp/fuzz/ (ignored) unless --out says otherwise, and stay there for triage. A
 * mismatch prints the file and the differences, and the run exits 1: reduce it
 * to a regression fixture in test/fixtures/regressions/. Nothing is committed.
 */
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
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
    'usage: node scripts/fuzz-aspsx.mjs --aspsx <ASPSX.EXE> (--seeds <first>..<last> [--functions n] | --sources <dir>) [--version 2.77|2.81] [--wine <command>] [--out <dir>]',
  );
  process.exit(2);
};
const aspsx = arg('--aspsx');
const version = arg('--version') ?? '2.81';
const sources = arg('--sources');
const range = /^(\d+)\.\.(\d+)$/.exec(arg('--seeds') ?? '');
const functions = Number(arg('--functions') ?? '4');
if (aspsx === undefined || !['2.77', '2.81'].includes(version)) usage();
if ((sources === undefined) === (range === null)) usage();
if (!Number.isInteger(functions) || functions < 1) usage();
if (range !== null && Number(range[2]) < Number(range[1])) usage();
const out = resolve(arg('--out') ?? join(ROOT, 'tmp', 'fuzz'));
if (!existsSync(join(ROOT, 'dist', 'index.js'))) {
  console.error('dist/index.js is missing; run `npm run build` first.');
  process.exit(2);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const problems = [];
let described;

if (sources !== undefined) {
  const files = readdirSync(sources).filter((f) => f.endsWith('.s'));
  for (const file of files) copyFileSync(join(sources, file), join(out, file));
  described = `${String(files.length)} files from ${sources}`;
} else {
  const first = Number(range[1]);
  const last = Number(range[2]);
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
  described = `seeds ${String(first)}..${String(last)}`;
}

const wine = arg('--wine');
const recorder = spawnSync(
  'ruby',
  [
    join(ROOT, 'scripts', 'aspsx-oracle.rb'),
    '--aspsx',
    aspsx,
    '--version',
    version,
    ...(wine === undefined ? ['--docker'] : ['--wine', wine]),
    '--files',
    out,
  ],
  { stdio: ['ignore', 'ignore', 'inherit'] },
);
if (recorder.status !== 0 && recorder.status !== 1) process.exit(recorder.status ?? 1);

const { assemble } = await import('../dist/index.js');
const suffix = version === '2.81' ? '.words.json' : `.aspsx-${version}.words.json`;
const files = readdirSync(out)
  .filter((f) => f.endsWith('.s'))
  .sort();
for (const file of files) {
  const name = file.slice(0, -2);
  const companion = join(out, `${name}${suffix}`);
  if (!existsSync(companion)) {
    problems.push([name, ['the real assembler rejected it (see the recorder output above)']]);
    continue;
  }
  const result = assemble(readFileSync(join(out, file)), {
    gpSize: name.endsWith('-g0') ? 0 : 8,
    filename: file,
    aspsxVersion: version,
  });
  const lines = differences(result, JSON.parse(readFileSync(companion, 'utf8')));
  if (lines.length > 0) problems.push([name, lines]);
}

for (const [name, lines] of problems) {
  console.log(`MISMATCH ${name}`);
  for (const line of lines) console.log(`  ${line}`);
}
console.log(
  `ASPSX ${version}: ${String(files.length)} files (${described}): ${String(problems.length)} mismatches (work files in ${out})`,
);
process.exit(problems.length === 0 ? 0 : 1);
