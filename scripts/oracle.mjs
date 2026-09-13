// SPDX-License-Identifier: MIT
/**
 * Differential oracle: compile the C of an already-matched decompilation with
 * psyq-wasm, assemble it with this package, and compare each listed function
 * with the words of the original executable under relocation field masks.
 *
 *   npm run build
 *   node scripts/oracle.mjs --checkout <dir> --executable <file> --manifest <file>
 *                           [--status <file>] [--summary <file>] [--only <glob>]...
 *
 * The checkout, the executable, and the manifest stay on the local machine.
 *
 * - The status file (default tmp/oracle/status.json, which git ignores) is the
 *   detailed report for triage: source file and function names, the indices of
 *   mismatching words with both sides disassembled, and a hash of the words
 *   this package produced. It names the matched project's code, so it is never
 *   committed.
 * - The summary file (written only with --summary) holds counts and provenance
 *   and no names; test/differential/summary.json is the committed copy.
 *
 * --only keeps the units whose source matches a glob, and the functions whose
 * names match, in other units; repeat it for several patterns.
 *
 * The manifest is a JSON file describing the build being reproduced. A unit may
 * override gpSize and rawFlags, and add cppFlags after the manifest's own:
 *
 *   {
 *     "gpSize": 8,
 *     "rawFlags": ["-O2", "-g0", "-Wall"],        (optional; this is the default)
 *     "cppFlags": ["-D__CHAR_UNSIGNED__"],       (added to psyq-wasm's DEFAULT_CPP_FLAGS)
 *     "includeDirs": ["include"],                 (relative to the checkout; every .h is supplied)
 *     "limits": { "maxHeaderCount": 4096 },       (optional psyq-wasm compiler limits)
 *     "units": [
 *       { "source": "source/example.c", "gpSize": 0, "cppFlags": ["-DEXAMPLE"],
 *         "functions": [{ "name": "example", "address": "0x80012345" }] }
 *     ]
 *   }
 *
 * scripts/oracle-manifest.rb writes a manifest from a symbol list.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  compareWords,
  hashWords,
  readPsxExe,
  selectUnits,
  summarize,
  wordsAt,
} from './oracle-compare.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DEFAULT_RAW_FLAGS = ['-O2', '-g0', '-Wall'];

/** Where the detailed report goes unless --status says otherwise. */
export const DEFAULT_STATUS = join(ROOT, 'tmp', 'oracle', 'status.json');

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

/** @returns {string | null} */
function psyqAsmCommit() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

/** @returns {string | null} */
function psyqWasmVersion() {
  try {
    const json = readFileSync(join(ROOT, 'node_modules', 'psyq-wasm', 'package.json'), 'utf8');
    return JSON.parse(json).version;
  } catch {
    return null;
  }
}

/**
 * @param {string} path
 * @param {unknown} value
 */
function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

/**
 * @param {{ checkout: string, executable: string, manifest: string, status?: string, summary?: string, only?: readonly string[] }} options
 * @returns {Promise<{ gpSize: number, results: object[], summary: Record<string, unknown> }>}
 */
export async function runOracle({
  checkout,
  executable,
  manifest,
  status = DEFAULT_STATUS,
  summary,
  only,
}) {
  const manifestBytes = readFileSync(manifest);
  const config = JSON.parse(manifestBytes.toString('utf8'));
  const exe = readPsxExe(readFileSync(executable));
  const { assemble, decode, format } = await import('../dist/index.js');
  const { DEFAULT_CPP_FLAGS, createCompiler } = await import('psyq-wasm');
  const includeDirs = config.includeDirs ?? [];
  const headers = collectHeaders(checkout, includeDirs);
  const compiler = await createCompiler(
    config.limits === undefined ? undefined : { limits: config.limits },
  );
  const results = [];
  try {
    for (const unit of selectUnits(config.units, only)) {
      const filename = basename(unit.source);
      const gpSize = unit.gpSize ?? config.gpSize;
      const fail = (error) =>
        results.push({ unit: unit.source, function: null, equal: false, error });
      const compiled = await compiler.compileSource(readFileSync(join(checkout, unit.source)), {
        gpSize,
        filename,
        rawFlags: unit.rawFlags ?? config.rawFlags ?? DEFAULT_RAW_FLAGS,
        cppFlags: [
          ...DEFAULT_CPP_FLAGS,
          ...(config.cppFlags ?? []),
          ...(unit.cppFlags ?? []),
          ...includeDirs.map((d) => `-I${d}`),
        ],
        headers,
      });
      if (!compiled.success) {
        fail(`compile failed: ${compiled.rawStderr.trim()}`);
        continue;
      }
      const assembled = assemble(compiled.asm, {
        gpSize,
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
          wordMismatches: comparison.wordMismatches.map((m) =>
            m.kind === 'length'
              ? m
              : {
                  ...m,
                  actual: format(decode(words[m.index])),
                  expected: format(decode(expected[m.index])),
                },
          ),
          fieldMismatches: comparison.fieldMismatches,
          sha256: hashWords(words),
        });
      }
    }
  } finally {
    compiler.dispose();
  }
  const report = { gpSize: config.gpSize, results };
  writeJson(status, report);
  const aggregate = summarize(report, {
    psyqAsmCommit: psyqAsmCommit(),
    psyqWasmVersion: psyqWasmVersion(),
    manifestSha256: createHash('sha256').update(manifestBytes).digest('hex'),
    date: new Date().toISOString().slice(0, 10),
  });
  if (summary !== undefined) writeJson(summary, aggregate);
  return { ...report, summary: aggregate };
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href
) {
  const args = process.argv.slice(2);
  const arg = (name) => {
    const index = args.indexOf(name);
    return index === -1 ? undefined : args[index + 1];
  };
  const only = args.flatMap((a, i) => (a === '--only' && i + 1 < args.length ? [args[i + 1]] : []));
  const checkout = arg('--checkout');
  const executable = arg('--executable');
  const manifest = arg('--manifest');
  if (checkout === undefined || executable === undefined || manifest === undefined) {
    console.error(
      'usage: node scripts/oracle.mjs --checkout <dir> --executable <file> --manifest <file> [--status <file>] [--summary <file>] [--only <glob>]...',
    );
    process.exit(2);
  }
  const status = arg('--status') ?? DEFAULT_STATUS;
  const report = await runOracle({
    checkout,
    executable,
    manifest,
    status,
    summary: arg('--summary'),
    only,
  });
  const failed = report.results.filter((r) => !r.equal);
  console.log(
    `${String(report.results.length - failed.length)}/${String(report.results.length)} functions match (details: ${relative(process.cwd(), status)})`,
  );
  for (const result of failed) {
    console.log(`MISMATCH ${result.unit} ${String(result.function)} ${result.error ?? ''}`);
    for (const m of result.wordMismatches ?? []) {
      console.log(
        m.kind === 'length'
          ? `  [${String(m.index)}] length differs`
          : `  [${String(m.index)}] ${m.actual}  expected  ${m.expected}`,
      );
    }
  }
  process.exit(failed.length === 0 ? 0 : 1);
}
