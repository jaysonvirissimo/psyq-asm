// SPDX-License-Identifier: MIT
/**
 * Informational timing of `assemble` on a large translation unit.
 *
 *   npm run build
 *   node scripts/bench.mjs [--lines 20000] [--iterations 20] [--json out.json]
 *
 * The unit is the -G 8 compiler fixtures repeated, with every label and symbol
 * definition renamed per copy so the copies do not collide. Nothing asserts on
 * the numbers; docs/PERFORMANCE.md records them.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FIXTURES = join(ROOT, 'test', 'fixtures', 'compiler', 'g8');

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {string} text one fixture
 * @param {number} copy which copy this is
 * @returns {string} the fixture with its definitions renamed
 */
function renamed(text, copy) {
  const defined = new Set([...text.matchAll(/^([A-Za-z_][A-Za-z0-9_.]*):/gm)].map((m) => m[1]));
  for (const m of text.matchAll(/^\t\.comm\t([A-Za-z_][A-Za-z0-9_]*),/gm)) defined.add(m[1]);
  let out = text.replace(
    /\$L([A-Za-z]*)(\d+)/g,
    (_, kind, n) => `$L${kind}${String(Number(n) + copy * 100000)}`,
  );
  for (const name of defined) {
    out = out.replace(
      new RegExp(`(?<![A-Za-z0-9_$.])${escapeRegExp(name)}(?![A-Za-z0-9_])`, 'g'),
      `${name}__${String(copy)}`,
    );
  }
  return out;
}

/**
 * @param {number} lines the minimum number of lines
 * @returns {string} a translation unit of at least that many lines
 */
export function generateUnit(lines) {
  const sources = readdirSync(FIXTURES)
    .filter((f) => f.endsWith('.s') && f !== 't17_error.s')
    .sort()
    .map((f) => readFileSync(join(FIXTURES, f), 'utf8').replaceAll('\r', ''));
  const parts = [];
  let count = 0;
  for (let copy = 0; count < lines; copy++) {
    for (const [index, source] of sources.entries()) {
      // Every fixture defines gcc2_compiled. and the like, so rename per fixture copy.
      const part = renamed(source, copy * sources.length + index);
      parts.push(part);
      count += part.split('\n').length;
    }
  }
  return parts.join('\n');
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href
) {
  const arg = (name, fallback) => {
    const index = process.argv.indexOf(name);
    return index === -1 ? fallback : process.argv[index + 1];
  };
  const { assemble } = await import('../dist/index.js');
  const unit = generateUnit(Number(arg('--lines', '20000')));
  const iterations = Number(arg('--iterations', '20'));
  const first = assemble(unit, { gpSize: 8 });
  if (!first.success) {
    console.error(first.diagnostics.slice(0, 5));
    process.exit(1);
  }
  for (let i = 0; i < 3; i++) assemble(unit, { gpSize: 8 });
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    assemble(unit, { gpSize: 8 });
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const text = first.object.sections.find((s) => s.name === '.text');
  const result = {
    node: process.version,
    lines: unit.split('\n').length,
    words: text.words.length,
    iterations,
    medianMs: Number(times[Math.floor(times.length / 2)].toFixed(1)),
    minMs: Number(times[0].toFixed(1)),
    maxMs: Number(times[times.length - 1].toFixed(1)),
  };
  console.log(JSON.stringify(result, null, 2));
  const json = arg('--json', undefined);
  if (json !== undefined) writeFileSync(json, `${JSON.stringify(result, null, 2)}\n`);
}
