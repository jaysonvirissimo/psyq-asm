// SPDX-License-Identifier: MIT
/**
 * Package smoke test: pack the library with `npm pack`, check the tarball
 * contents, install it into small consumer applications, and run them.
 *
 *   node test/package/run.mjs [--skip-vite]
 *
 * Requires a build (`npm run build`) and network access for installing the
 * consumer apps' dependencies. --skip-vite skips every step that needs a
 * browser: the Vite app, the bare browser ESM app, and the Pages site.
 */
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { connect, createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const HERE = join(ROOT, 'test', 'package');
const OUT = join(HERE, 'out');
const skipVite = process.argv.includes('--skip-vite');
const rootPkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const tsVersion = rootPkg.devDependencies.typescript;
const typesNodeVersion = rootPkg.devDependencies['@types/node'];
const divFixture = join(ROOT, 'test', 'fixtures', 'aspsx', 'div.json');
const expectedWords = JSON.parse(readFileSync(divFixture, 'utf8')).expectedWords;

function step(name) {
  console.log(`\n==> ${name}`);
}

function run(cmd, args, cwd) {
  console.log(`$ ${cmd} ${args.join(' ')}`);
  // npm.cmd cannot be executed directly on Windows. Invoke npm's JS entry
  // with the current Node executable, preserving arguments without a shell.
  const npmCli =
    process.env.npm_execpath ?? join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  const useNpmCli = cmd === 'npm' && existsSync(npmCli);
  return execFileSync(useNpmCli ? process.execPath : cmd, useNpmCli ? [npmCli, ...args] : args, {
    cwd,
    stdio: ['ignore', 'pipe', 'inherit'],
    encoding: 'utf8',
    env: { ...process.env, PSYQ_ASM_FIXTURES: join(ROOT, 'test', 'fixtures') },
  });
}

/** Path to a JS entry point inside a consumer app's node_modules, run with process.execPath. */
function nodeBin(app, ...segments) {
  return join(app, 'node_modules', ...segments);
}

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`ok   ${message}`);
}

function install(app, extra = {}) {
  writeFileSync(
    join(app, 'package.json'),
    JSON.stringify(
      {
        name: `psyq-asm-smoke-${app
          .split(/[\\/]/)
          .pop()
          .replace(/[^a-z-]/g, '')}`,
        private: true,
        type: 'module',
        dependencies: { 'psyq-asm': `file:${tarball}` },
        ...extra,
      },
      null,
      2,
    ),
  );
  run('npm', ['install', '--no-audit', '--no-fund', '--no-package-lock', '--ignore-scripts'], app);
}

async function freePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolvePort(port));
    });
  });
}

/** Resolve once 127.0.0.1:port accepts connections; reject if the child exits first. */
async function waitForPort(port, child, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let exitCode = null;
  child.on('exit', (code) => {
    exitCode = code;
  });
  while (Date.now() < deadline) {
    if (exitCode !== null) throw new Error(`server exited with ${String(exitCode)}`);
    const open = await new Promise((resolveOpen) => {
      const socket = connect({ host: '127.0.0.1', port });
      socket.once('connect', () => {
        socket.destroy();
        resolveOpen(true);
      });
      socket.once('error', () => resolveOpen(false));
    });
    if (open) return;
    await new Promise((resolveTick) => setTimeout(resolveTick, 250));
  }
  throw new Error('server did not start');
}

/** Run `server` (a spawned process listening on `port`) and drive `path` with headless Chromium. */
async function checkInBrowser(label, server, port, path, drive) {
  try {
    await waitForPort(port, server, 30_000);
    const { chromium } = await import('@playwright/test');
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(`http://127.0.0.1:${String(port)}${path}`);
      await drive(page);
      assert(errors.length === 0, `${label}: no page errors (${errors.join('; ')})`);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill();
  }
}

async function serveStatic(label, root, path, drive) {
  const port = await freePort();
  const server = spawn(process.execPath, [join(ROOT, 'scripts/serve.mjs'), String(port), root], {
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  await checkInBrowser(label, server, port, path, drive);
}

async function expectWordsOnPage(label, page) {
  await page.waitForFunction(() => window.result !== undefined, undefined, { timeout: 30_000 });
  const result = await page.evaluate(() => window.result);
  console.log(`  ${JSON.stringify(result)}`);
  assert(result.success === true, `${label}: assembled`);
  assert(
    JSON.stringify(result.words) === JSON.stringify(expectedWords),
    `${label}: words are exact`,
  );
}

// ---------------------------------------------------------------------------
step('build check');
for (const rel of ['dist/index.js', 'dist/index.d.ts', 'bin/psyq-asm.mjs']) {
  assert(existsSync(join(ROOT, rel)), `${rel} exists (run npm run build first)`);
}

// ---------------------------------------------------------------------------
step('npm pack');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const packJson = JSON.parse(run('npm', ['pack', '--json', '--pack-destination', OUT], ROOT));
const tarball = join(OUT, packJson[0].filename);
const files = packJson[0].files.map((f) => f.path);
console.log(`packed ${packJson[0].filename} (${String(files.length)} files)`);
for (const required of [
  'dist/index.js',
  'dist/index.d.ts',
  'dist/asm/assemble.js',
  'dist/isa/table.js',
  'bin/psyq-asm.mjs',
  'LICENSE',
  'README.md',
  'CHANGELOG.md',
  'package.json',
]) {
  assert(files.includes(required), `tarball contains ${required}`);
}
for (const prefix of ['src/', 'test/', 'scripts/', 'demo/', 'docs/', 'tmp/', '.github/']) {
  assert(!files.some((f) => f.startsWith(prefix)), `tarball has no ${prefix}`);
}

// ---------------------------------------------------------------------------
step('node consumer app');
const nodeApp = join(OUT, 'node app #encoded');
cpSync(join(HERE, 'node-app'), nodeApp, { recursive: true });
install(nodeApp);
const nodeOut = run(process.execPath, ['main.mjs'], nodeApp);
console.log(nodeOut.trim());
assert(nodeOut.includes('NODE-SMOKE-OK'), 'node consumer assembled the fixtures word-exactly');

// ---------------------------------------------------------------------------
step('command line');
const cli = nodeBin(nodeApp, 'psyq-asm', 'bin', 'psyq-asm.mjs');
const jsonOut = join(OUT, 't03_muldiv.json');
run(
  process.execPath,
  [cli, '-G', '8', '--json', jsonOut, join(ROOT, 'test/fixtures/compiler/g8/t03_muldiv.s')],
  nodeApp,
);
const cliObject = JSON.parse(readFileSync(jsonOut, 'utf8'));
assert(
  cliObject.sections.some((s) => s.name === '.text' && s.words.length > 0),
  'CLI wrote the assembled object as JSON',
);
assert(
  cliObject.functions.some((f) => f.name === 'div_'),
  'CLI JSON carries function ranges',
);
const listing = run(
  process.execPath,
  [cli, '-G8', divFixture.replace(/div\.json$/, '../compiler/g0/t01_arith.s')],
  nodeApp,
);
assert(/0x00000000 {2}0x[0-9A-F]{8}/.test(listing), 'CLI prints a listing');
const wordsFile = join(OUT, 'words.txt');
writeFileSync(wordsFile, 'dw 0x27BDFFA8\ndw 0xAFBF0054\n');
const decoded = run(process.execPath, [cli, '--decode', wordsFile], nodeApp);
assert(decoded.includes('addiu $sp,$sp,-0x58'), 'CLI decodes words');
const missingG = spawnSync(process.execPath, [cli, wordsFile], { encoding: 'utf8' });
assert(
  missingG.status === 2 && missingG.stderr.includes('-G <n> is required'),
  'CLI reports usage errors with status 2',
);

// ---------------------------------------------------------------------------
step('typescript consumer app');
const tsApp = join(OUT, 'ts-app');
cpSync(join(HERE, 'ts-app'), tsApp, { recursive: true });
install(tsApp, { devDependencies: { typescript: tsVersion, '@types/node': typesNodeVersion } });
// The JavaScript consumers never read a declaration file, so only this step
// catches a package that resolves at runtime but not for a TypeScript user.
run(process.execPath, [nodeBin(tsApp, 'typescript', 'bin', 'tsc'), '--noEmit'], tsApp);
assert(true, 'typescript consumer type-checks against the packed declarations');

if (skipVite) {
  console.log('\n(vite, browser ESM, and Pages consumers skipped)');
} else {
  // -------------------------------------------------------------------------
  step('vite consumer app');
  const viteApp = join(OUT, 'vite-app');
  cpSync(join(HERE, 'vite-app'), viteApp, { recursive: true });
  mkdirSync(join(viteApp, 'public'), { recursive: true });
  cpSync(divFixture, join(viteApp, 'public', 'div.json'));
  install(viteApp, { devDependencies: { vite: rootPkg.devDependencies.vite } });
  const vite = nodeBin(viteApp, 'vite', 'bin', 'vite.js');
  run(process.execPath, [vite, 'build', '--logLevel', 'warn'], viteApp);
  const port = await freePort();
  // Bind to 127.0.0.1 explicitly: vite's default "localhost" can resolve to ::1.
  const preview = spawn(
    process.execPath,
    [vite, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    { cwd: viteApp, stdio: ['ignore', 'inherit', 'inherit'] },
  );
  await checkInBrowser('vite', preview, port, '/', (page) => expectWordsOnPage('vite', page));

  // -------------------------------------------------------------------------
  step('direct browser ESM consumer (no bundler)');
  const esmApp = join(OUT, 'esm-app');
  cpSync(join(HERE, 'esm-app'), esmApp, { recursive: true });
  cpSync(divFixture, join(esmApp, 'div.json'));
  install(esmApp);
  await serveStatic('browser ESM', esmApp, '/', (page) => expectWordsOnPage('browser ESM', page));

  // -------------------------------------------------------------------------
  step('GitHub Pages consumer (project subpath)');
  // Pages serves a project site from /<repo>/, so the site is assembled inside
  // a subdirectory and served from its parent. Only a fully relative site works.
  const pagesRoot = join(OUT, 'pages');
  const { assembleSite } = await import(
    pathToFileURL(join(ROOT, 'scripts/assemble-site.mjs')).href
  );
  assembleSite(join(pagesRoot, 'psyq-asm'));
  await serveStatic('GitHub Pages', pagesRoot, '/psyq-asm/demo/', async (page) => {
    await page.waitForSelector('#assemble:not([disabled])', { timeout: 30_000 });
    await page.click('#assemble');
    await page.waitForFunction(
      () => /^ok \(\d+ words\)$/.test(document.getElementById('status')?.textContent ?? ''),
      undefined,
      { timeout: 30_000 },
    );
    const rows = await page.evaluate(() => document.querySelectorAll('#words tbody tr').length);
    assert(rows > 0, `GitHub Pages: the demo listed ${String(rows)} words from a project subpath`);
  });
}

console.log('\nPACKAGE-SMOKE-OK');
