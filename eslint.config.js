// SPDX-License-Identifier: MIT
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'coverage/',
      'tmp/',
      'test/fixtures/',
      'test/package/**/dist/',
      'test/package/**/node_modules/',
      'test/package/out/',
      // Type-checked against the packed tarball by test/package/run.mjs, not
      // against the working tree; see the note in tsconfig.json.
      'test/package/ts-app/',
      'playwright-report/',
      'test-results/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        // vitest.config.ts is deliberately outside tsconfig.json's `include`
        // (see the comment there), so lint it against an inferred project.
        projectService: { allowDefaultProject: ['vitest.config.ts'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      // An explicit `default` is a deliberate catch-all; switches without one
      // (the instruction table's slots, for example) must list every case.
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: true },
      ],
      eqeqeq: ['error', 'always'],
      'no-console': 'error',
    },
  },
  {
    // Plain JavaScript (scripts, demo, CLI, config): no type information available.
    files: ['**/*.js', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: { '@typescript-eslint/explicit-module-boundary-types': 'off' },
  },
  {
    files: ['bin/**', 'demo/**', 'scripts/**', 'test/package/**', 'test/browser/page/**'],
    rules: { 'no-console': 'off' },
  },
  prettier,
);
