// SPDX-License-Identifier: MIT
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from '../helpers/paths.js';

interface PackageJson {
  name: string;
  version: string;
  type: string;
  license: string;
  sideEffects: boolean;
  engines: { node: string };
  files: string[];
  exports: Record<string, string | Record<string, string>>;
  bin: Record<string, string>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts: Record<string, string>;
}

const pkg = JSON.parse(readFileSync(fromRoot('package.json'), 'utf8')) as PackageJson;

describe('package.json', () => {
  it('is an MIT ESM package with no runtime dependencies', () => {
    expect(pkg.name).toBe('psyq-asm');
    expect(pkg.license).toBe('MIT');
    expect(pkg.type).toBe('module');
    expect(pkg.sideEffects).toBe(false);
    expect(pkg.dependencies).toBeUndefined();
    expect(pkg.peerDependencies).toBeUndefined();
    expect(pkg.engines.node).toBe('>=22');
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('ships dist, the CLI, and the documents only', () => {
    expect([...pkg.files].sort()).toEqual(
      ['dist/', 'bin/', 'LICENSE', 'CHANGELOG.md', 'README.md'].sort(),
    );
  });

  it('has one environment-neutral entry point and a CLI', () => {
    expect(pkg.exports).toEqual({
      '.': { types: './dist/index.d.ts', default: './dist/index.js' },
      './package.json': './package.json',
    });
    expect(pkg.bin).toEqual({ 'psyq-asm': './bin/psyq-asm.mjs' });
  });

  it('wires the CI scripts', () => {
    for (const script of [
      'format:check',
      'lint',
      'typecheck',
      'test',
      'test:coverage',
      'test:differential',
      'test:browser',
      'test:package',
      'build',
      'check',
    ]) {
      expect(pkg.scripts[script], script).toBeDefined();
    }
  });
});
