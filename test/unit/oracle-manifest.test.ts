// SPDX-License-Identifier: MIT
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { fromRoot } from '../helpers/paths.js';

const hasRuby = spawnSync('ruby', ['-v']).status === 0;
const work = mkdtempSync(join(tmpdir(), 'psyq-asm-manifest-'));

afterAll(() => {
  rmSync(work, { recursive: true, force: true });
});

describe.skipIf(!hasRuby)('scripts/oracle-manifest.rb', () => {
  it('assigns listed functions to the one source that defines them', () => {
    const checkout = join(work, 'checkout');
    mkdirSync(join(checkout, 'src'), { recursive: true });
    writeFileSync(
      join(checkout, 'src', 'a.c'),
      [
        'int declared(int);',
        '/* int commented(void) { } */',
        'static int helper(int x, int (*f)(int))',
        '{',
        '    if (x) { return f(x); }',
        '    return 0;',
        '}',
        'void',
        'second(void) {}',
        'int shared(void) { return 1; }',
        '',
      ].join('\n'),
    );
    writeFileSync(join(checkout, 'src', 'b.c'), 'int shared(void) { return 2; }\n');
    const symbols = join(work, 'symbols.txt');
    writeFileSync(
      symbols,
      [
        'second = 0x80010040;',
        '0x80010000 helper',
        'shared = 0x80010080;',
        'declared = 0x800100C0;',
        'commented = 0x80010100;',
        '// not a symbol',
        '',
      ].join('\n'),
    );
    const out = join(work, 'manifest.json');
    const result = spawnSync(
      'ruby',
      [
        fromRoot('scripts/oracle-manifest.rb'),
        '--checkout',
        checkout,
        '--symbols',
        symbols,
        '--sources',
        'src/**/*.c',
        '--out',
        out,
        '--include',
        'include',
        '--cpp-flag',
        '-DX',
      ],
      { encoding: 'utf8' },
    );
    expect(result.status).toBe(0);
    expect(result.stderr).toContain('defined in several sources, skipped: shared');
    expect(result.stderr).toContain('not defined in any source: declared');
    expect(result.stderr).toContain('not defined in any source: commented');
    expect(JSON.parse(readFileSync(out, 'utf8'))).toEqual({
      gpSize: 8,
      cppFlags: ['-DX'],
      includeDirs: ['include'],
      units: [
        {
          source: 'src/a.c',
          functions: [
            { name: 'helper', address: '0x80010000' },
            { name: 'second', address: '0x80010040' },
          ],
        },
      ],
    });

    execFileSync(
      'ruby',
      [
        fromRoot('scripts/oracle-manifest.rb'),
        '--checkout',
        checkout,
        '--symbols',
        symbols,
        '--sources',
        'src/*.c',
        '--out',
        out,
        '--gp-size',
        '0',
        '--max',
        '1',
      ],
      { stdio: 'pipe' },
    );
    expect(JSON.parse(readFileSync(out, 'utf8'))).toEqual({
      gpSize: 0,
      units: [{ source: 'src/a.c', functions: [{ name: 'second', address: '0x80010040' }] }],
    });
  });

  it('exits 2 with usage when required arguments are missing', () => {
    const result = spawnSync('ruby', [fromRoot('scripts/oracle-manifest.rb')], {
      encoding: 'utf8',
    });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('usage:');
  });
});
