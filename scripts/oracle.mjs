// SPDX-License-Identifier: MIT
/**
 * Differential oracle: compile the C of an already-matched decompilation with
 * psyq-wasm, assemble it with this package, and compare each listed function
 * with the words of the original executable under relocation field masks.
 *
 *   npm run build
 *   node scripts/oracle.mjs --checkout <dir> --executable <file> --manifest <file> [--status <out.json>]
 *
 * The checkout and the executable stay on the local machine. Nothing from the
 * executable is written anywhere: the status file records source file names,
 * function names, pass or fail, the indices of mismatching words, and a hash of
 * the words this package produced.
 *
 * The manifest is a JSON file describing the build being reproduced:
 *
 *   {
 *     "gpSize": 8,
 *     "rawFlags": ["-O2", "-g0", "-Wall"],        (optional; this is the default)
 *     "cppFlags": ["-D__CHAR_UNSIGNED__"],       (added to psyq-wasm's DEFAULT_CPP_FLAGS)
 *     "includeDirs": ["include"],                 (relative to the checkout; every .h is supplied)
 *     "limits": { "maxHeaderCount": 4096 },       (optional psyq-wasm compiler limits)
 *     "units": [
 *       { "source": "source/example.c", "functions": [{ "name": "example", "address": "0x80012345" }] }
 *     ]
 *   }
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, relative, sep } from 'node:path';
import { compareWords, hashWords, readPsxExe, wordsAt } from './oracle-compare.mjs';

const DEFAULT_RAW_FLAGS = ['-O2', '-g0', '-Wall'];

/**
 * @param {string} checkout
 * @param {readonly string[]} dirs
 * @returns {Record<string, Uint8Array>}
 */
function collectHeaders(checkout, dirs) {
  const headers = {};
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.h'))
        headers[relative(checkout, full).split(sep).join('/')] = readFileSync(full);
    }
  };
  for (const dir of dirs) walk(join(checkout, dir));
  return headers;
}

/**
 * @param {{ checkout: string, executable: string, manifest: string, status?: string }} options
 * @returns {Promise<{ gpSize: number, results: object[] }>}
 */
export async function runOracle({ checkout, executable, manifest, status }) {
  const config = JSON.parse(readFileSync(manifest, 'utf8'));
  const exe = readPsxExe(readFileSync(executable));
  const { assemble } = await import('../dist/index.js');
  const { DEFAULT_CPP_FLAGS, createCompiler } = await import('psyq-wasm');
  const includeDirs = config.includeDirs ?? [];
  const headers = collectHeaders(checkout, includeDirs);
  const compiler = await createCompiler(
    config.limits === undefined ? undefined : { limits: config.limits },
  );
  const results = [];
  try {
    for (const unit of config.units) {
      const filename = basename(unit.source);
      const fail = (error) =>
        results.push({ unit: unit.source, function: null, equal: false, error });
      const compiled = await compiler.compileSource(readFileSync(join(checkout, unit.source)), {
        gpSize: config.gpSize,
        filename,
        rawFlags: config.rawFlags ?? DEFAULT_RAW_FLAGS,
        cppFlags: [
          ...DEFAULT_CPP_FLAGS,
          ...(config.cppFlags ?? []),
          ...includeDirs.map((d) => `-I${d}`),
        ],
        headers,
      });
      if (!compiled.success) {
        fail(`compile failed: ${compiled.rawStderr.trim()}`);
        continue;
      }
      const assembled = assemble(compiled.asm, {
        gpSize: config.gpSize,
        filename: filename.replace(/\.c$/, '.s'),
      });
      if (!assembled.success) {
        fail(
          `assembly failed: ${assembled.diagnostics.map((d) => `${String(d.line)}: ${d.message}`).join('; ')}`,
        );
        continue;
      }
      const text = assembled.object.sections.find((s) => s.name === '.text');
      for (const target of unit.functions) {
        const range = assembled.object.functions.find((f) => f.name === target.name);
        if (range === undefined || text === undefined) {
          results.push({
            unit: unit.source,
            function: target.name,
            equal: false,
            error: 'function not found',
          });
          continue;
        }
        const words = text.words.slice(range.start, range.end);
        const relocations = text.relocations
          .filter((r) => r.offset >= range.start * 4 && r.offset < range.end * 4)
          .map((r) => ({ offset: r.offset - range.start * 4, fieldMask: r.fieldMask }));
        const expected = wordsAt(exe, Number(target.address), range.end - range.start);
        const comparison = compareWords({ words, relocations }, expected);
        results.push({
          unit: unit.source,
          function: target.name,
          words: words.length,
          equal: comparison.equal,
          relocated: comparison.relocated,
          mismatches: comparison.mismatches.map((m) => m.index),
          sha256: hashWords(words),
        });
      }
    }
  } finally {
    compiler.dispose();
  }
  const report = { gpSize: config.gpSize, results };
  if (status !== undefined) writeFileSync(status, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href
) {
  const arg = (name) => {
    const index = process.argv.indexOf(name);
    return index === -1 ? undefined : process.argv[index + 1];
  };
  const checkout = arg('--checkout');
  const executable = arg('--executable');
  const manifest = arg('--manifest');
  if (checkout === undefined || executable === undefined || manifest === undefined) {
    console.error(
      'usage: node scripts/oracle.mjs --checkout <dir> --executable <file> --manifest <file> [--status <out.json>]',
    );
    process.exit(2);
  }
  const report = await runOracle({ checkout, executable, manifest, status: arg('--status') });
  const failed = report.results.filter((r) => !r.equal);
  console.log(
    `${String(report.results.length - failed.length)}/${String(report.results.length)} functions match`,
  );
  for (const result of failed)
    console.log(`MISMATCH ${result.unit} ${String(result.function)} ${result.error ?? ''}`);
  process.exit(failed.length === 0 ? 0 : 1);
}
