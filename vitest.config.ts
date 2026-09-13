// SPDX-License-Identifier: MIT
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['test/unit/**/*.test.ts', 'test/property/**/*.test.ts'],
        },
      },
      {
        test: {
          // Needs a matched decompilation checkout and its executable; see
          // CONTRIBUTING.md ("Differential oracle"). Skips when they are absent.
          name: 'differential',
          environment: 'node',
          include: ['test/differential/**/*.test.ts'],
          passWithNoTests: true,
          testTimeout: 600_000,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Exclusions are documented in CONTRIBUTING.md ("Coverage exclusions").
      exclude: ['src/public-types.ts'],
      thresholds: { statements: 99, branches: 99, functions: 99, lines: 99 },
      reporter: ['text', 'lcov', 'json-summary'],
    },
  },
});
