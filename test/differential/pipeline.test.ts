// SPDX-License-Identifier: MIT
/**
 * The oracle pipeline end to end on synthetic inputs: a hand-written C file
 * compiled with psyq-wasm, and a PS-X EXE built from this package's own words.
 * No matched project or executable is involved, so this always runs; like the
 * browser and package suites it needs `npm run build` and fails without it.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_CPP_FLAGS, createCompiler } from 'psyq-wasm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { writePsxExe } from '../../scripts/oracle-compare.mjs';
import { runOracle } from '../../scripts/oracle.mjs';
import { assemble } from '../../src/index.js';
import { fromRoot } from '../helpers/paths.js';

const BASE = 0x80010000;
const SOURCE = [
  '#include "calc.h"',
  'int counter;',
  'int add_scaled(int a, int b) { return a + b * SCALE; }',
  'int bump(void) { counter += 1; return counter; }',
  '',
].join('\n');

const work = mkdtempSync(join(tmpdir(), 'psyq-asm-oracle-'));
const checkout = join(work, 'checkout');
const manifest = join(work, 'manifest.json');
let words: number[] = [];
let relocations: { offset: number; fieldMask: number }[] = [];
const address: Record<string, number> = {};

beforeAll(async () => {
  if (!existsSync(fromRoot('dist/index.js'))) {
    throw new Error('dist/index.js is missing; run `npm run build` first.');
  }
  mkdirSync(join(checkout, 'source'), { recursive: true });
  mkdirSync(join(checkout, 'include'), { recursive: true });
  writeFileSync(join(checkout, 'source', 'calc.c'), SOURCE);
  writeFileSync(join(checkout, 'include', 'calc.h'), '#define SCALE 3\nextern int counter;\n');
  writeFileSync(
    manifest,
    JSON.stringify({
      gpSize: 8,
      includeDirs: ['include'],
      units: [
        {
          source: 'source/calc.c',
          functions: [
            { name: 'add_scaled', address: '0x80010000' },
            { name: 'bump', address: '0x80010000' },
          ],
        },
      ],
    }),
  );

  // Assemble the same unit here to lay out the synthetic executable.
  const compiler = await createCompiler();
  try {
    const compiled = await compiler.compileSource(SOURCE, {
      gpSize: 8,
      filename: 'calc.c',
      rawFlags: ['-O2', '-g0', '-Wall'],
      cppFlags: [...DEFAULT_CPP_FLAGS, '-Iinclude'],
      headers: { 'include/calc.h': readFileSync(join(checkout, 'include', 'calc.h')) },
    });
    if (!compiled.success) throw new Error(compiled.rawStderr);
    const assembled = assemble(compiled.asm, { gpSize: 8, filename: 'calc.s' });
    if (!assembled.success) throw new Error(JSON.stringify(assembled.diagnostics));
    const text = assembled.object.sections.find((s) => s.name === '.text');
    if (text === undefined) throw new Error('no .text');
    words = Array.from(text.words ?? []);
    relocations = text.relocations.map((r) => ({ offset: r.offset, fieldMask: r.fieldMask }));
    for (const f of assembled.object.functions) address[f.name] = BASE + f.start * 4;
  } finally {
    compiler.dispose();
  }
  // Point the manifest at the real layout.
  const config = JSON.parse(readFileSync(manifest, 'utf8')) as {
    units: { functions: { name: string; address: string }[] }[];
  };
  for (const f of config.units[0]?.functions ?? []) {
    f.address = `0x${(address[f.name] ?? 0).toString(16)}`;
  }
  writeFileSync(manifest, JSON.stringify(config));
});

afterAll(() => {
  rmSync(work, { recursive: true, force: true });
});

function executable(name: string, patched: number[]): string {
  const path = join(work, name);
  writeFileSync(path, writePsxExe(BASE, patched));
  return path;
}

interface Result {
  function: string | null;
  equal: boolean;
  error?: string;
  wordMismatches?: { index: number; kind: string; actual?: string; expected?: string }[];
  fieldMismatches?: number[];
}

describe('oracle pipeline', () => {
  it('matches an executable built from the same words, and keeps names out of the summary', async () => {
    const status = join(work, 'out', 'status.json');
    const summary = join(work, 'out', 'summary.json');
    const report = await runOracle({
      checkout,
      executable: executable('same.exe', words),
      manifest,
      status,
      summary,
    });
    const results = report.results as Result[];
    expect(results.map((r) => [r.function, r.equal, r.error])).toEqual([
      ['add_scaled', true, undefined],
      ['bump', true, undefined],
    ]);
    expect(readFileSync(status, 'utf8')).toContain('add_scaled');
    const written = readFileSync(summary, 'utf8');
    expect(JSON.parse(written)).toMatchObject({
      gpSize: 8,
      functions: { total: 2, passed: 2 },
      psyqWasmVersion: expect.any(String) as unknown,
      manifestSha256: expect.stringMatching(/^[0-9a-f]{64}$/) as unknown,
    });
    expect(written).not.toMatch(/calc|add_scaled|bump/);
  });

  it('fails on a changed instruction and only records a changed relocation field', async () => {
    const start = ((address['add_scaled'] ?? 0) - BASE) / 4;
    const patched = [...words];
    patched[start] = (patched[start] ?? 0) ^ 0x00200000; // a register bit
    const relocation = relocations.find((r) => r.offset / 4 >= ((address['bump'] ?? 0) - BASE) / 4);
    expect(relocation).toBeDefined();
    const fieldIndex = (relocation?.offset ?? 0) / 4;
    patched[fieldIndex] =
      ((patched[fieldIndex] ?? 0) ^ ((relocation?.fieldMask ?? 0) & 0x1234)) >>> 0;

    const report = await runOracle({
      checkout,
      executable: executable('patched.exe', patched),
      manifest,
      status: join(work, 'out', 'patched.json'),
    });
    const [addScaled, bump] = report.results as Result[];
    expect(addScaled?.equal).toBe(false);
    expect(addScaled?.wordMismatches).toEqual([
      {
        index: 0,
        kind: 'instruction',
        actual: expect.any(String) as unknown,
        expected: expect.any(String) as unknown,
      },
    ]);
    expect(addScaled?.wordMismatches?.[0]?.actual).not.toBe(
      addScaled?.wordMismatches?.[0]?.expected,
    );
    expect(bump?.equal).toBe(true);
    expect(bump?.fieldMismatches).toEqual([fieldIndex - ((address['bump'] ?? 0) - BASE) / 4]);
  });

  it('narrows a run with --only patterns', async () => {
    const report = await runOracle({
      checkout,
      executable: executable('only.exe', words),
      manifest,
      status: join(work, 'out', 'only.json'),
      only: ['bu*'],
    });
    expect((report.results as Result[]).map((r) => r.function)).toEqual(['bump']);
  });
});
