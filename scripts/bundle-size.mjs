// SPDX-License-Identifier: MIT
/**
 * Informational bundle sizes for docs/PERFORMANCE.md: dist/ bundled with Vite's
 * default minifier, for the whole package and for a consumer that imports only
 * `decode` and `format`.
 *
 *   npm run build
 *   node scripts/bundle-size.mjs [--json <out.json>]
 *
 * Nothing asserts on the numbers.
 */
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');

/** @param {string} dir */
function jsBytes(dir) {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) total += jsBytes(path);
    else if (name.endsWith('.js')) total += statSync(path).size;
  }
  return total;
}

/**
 * @param {string} source an entry module
 * @returns {Promise<{ minified: number, gzipped: number }>}
 */
async function bundle(source) {
  const work = mkdtempSync(join(tmpdir(), 'psyq-asm-bundle-'));
  try {
    const entry = join(work, 'entry.js');
    writeFileSync(entry, source);
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      root: work,
      build: {
        write: false,
        minify: true,
        lib: { entry, formats: ['es'], fileName: 'bundle' },
      },
    });
    const outputs = (Array.isArray(result) ? result : [result]).flatMap((r) => r.output);
    const code = outputs
      .filter((o) => o.type === 'chunk')
      .map((o) => o.code)
      .join('');
    return { minified: Buffer.byteLength(code), gzipped: gzipSync(code).byteLength };
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

const index = JSON.stringify(join(DIST, 'index.js'));
readFileSync(join(DIST, 'index.js'));
const report = {
  unminified: jsBytes(DIST),
  full: await bundle(`export * from ${index};\n`),
  decodeFormat: await bundle(`export { decode, format } from ${index};\n`),
};
const kb = (n) => `${(n / 1000).toFixed(1)} KB`;
console.log(`dist/**/*.js, unminified          ${kb(report.unminified)}`);
console.log(`whole package, minified           ${kb(report.full.minified)}`);
console.log(`whole package, minified + gzip    ${kb(report.full.gzipped)}`);
console.log(`decode and format, minified       ${kb(report.decodeFormat.minified)}`);
console.log(`decode and format, minified + gzip ${kb(report.decodeFormat.gzipped)}`);
const jsonIndex = process.argv.indexOf('--json');
if (jsonIndex !== -1 && process.argv[jsonIndex + 1] !== undefined) {
  writeFileSync(process.argv[jsonIndex + 1], `${JSON.stringify(report, null, 2)}\n`);
}
