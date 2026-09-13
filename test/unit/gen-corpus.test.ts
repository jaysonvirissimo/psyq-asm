// SPDX-License-Identifier: MIT
import { DEFAULT_CPP_FLAGS, createCompiler } from 'psyq-wasm';
import { describe, expect, it } from 'vitest';
import { generate } from '../../scripts/gen-corpus.mjs';

describe('corpus generator', () => {
  it('is deterministic and varies with the seed and function count', () => {
    expect(generate(7)).toBe(generate(7));
    expect(generate(7)).not.toBe(generate(8));
    expect(generate(7, 2)).not.toBe(generate(7, 3));
    expect(generate(7, 2).match(/^(?:static )?int f\d+\(/gm)).toHaveLength(2);
  });

  it('writes C that the compiler accepts at every setting', async () => {
    const compiler = await createCompiler();
    try {
      for (let seed = 1; seed <= 12; seed++) {
        for (const [gpSize, debug] of [
          [0, '-g0'],
          [8, '-g0'],
          [8, '-g'],
        ] as const) {
          const result = await compiler.compileSource(generate(seed), {
            gpSize,
            filename: `seed${String(seed)}.c`,
            rawFlags: ['-O2', debug, '-Wall'],
            cppFlags: [...DEFAULT_CPP_FLAGS],
          });
          expect(
            result.success,
            result.success ? '' : `seed ${String(seed)}: ${result.rawStderr}`,
          ).toBe(true);
        }
      }
    } finally {
      compiler.dispose();
    }
  }, 120_000);
});
