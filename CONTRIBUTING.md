# Contributing

Thanks for helping make PsyQ assembler output reproducible in the browser. This
project holds itself to production-library standards; the rules below keep
assembler fidelity and code quality verifiable.

## Development process

Work test-first: write the failing test, make it pass with the smallest change,
then refactor. Pull requests are expected to show that shape (tests land with,
or before, the code they cover). For fidelity work the test is a word list: a
fixture or probe states what `ASPSX` emits, and the implementation follows.

```sh
npm ci
npm run check             # format, lint, typecheck, unit + property + fixture tests, 99% coverage gate
npm run build             # tsc -> dist/
npx playwright install    # once
npm run test:browser      # Chromium, Firefox, WebKit
npm run test:package      # npm pack + consumer apps (needs network)
npm run test:differential # the oracle; skips unless configured (see below)
npm run bench             # informational timings for docs/PERFORMANCE.md
npm run size              # informational bundle sizes for docs/PERFORMANCE.md
npm run serve             # http://127.0.0.1:4173/demo/
```

Unit, property, and fixture tests never need a build. The browser and package
suites do, and they fail (never skip) when `dist/` is missing.

Development tooling runs on Node 24, TypeScript 6.0, and Vitest 5. Keep the
`.npmrc` legacy-peer workaround for local npm 11 installs; `npm ci` is the
standard clean-install path. CI exercises Node 22 and 24 on Linux and Node 24
on macOS and Windows.

## Test layers

| Layer          | Location                 | Runs where   | Needs                                        |
| -------------- | ------------------------ | ------------ | -------------------------------------------- |
| Unit           | `test/unit`              | Vitest, Node | nothing                                      |
| Property       | `test/property`          | Vitest, Node | nothing (fast-check)                         |
| ASPSX fixtures | `test/fixtures/aspsx`    | Vitest, Node | nothing                                      |
| Compiler       | `test/fixtures/compiler` | Vitest, Node | nothing                                      |
| Differential   | `test/differential`      | Vitest, Node | a matched decompilation checkout (see below) |
| Browser        | `test/browser`           | Playwright   | `dist/`, browsers installed                  |
| Package        | `test/package`           | Node script  | `dist/`, network                             |

`npm run test:package` packs the library and exercises its consumers: Node (the
library and the CLI), TypeScript (`tsc --noEmit` against the shipped
declarations), Vite, bare browser ESM with an import map and no bundler, and the
demo site served from a project subpath the way GitHub Pages serves it.

## Coverage exclusions

Coverage is measured on `src/**/*.ts` with a 99% threshold on statements,
branches, functions, and lines. The following files are excluded, each for a
reason:

- `src/public-types.ts`: type-only module; no statements.

`bin/psyq-asm.mjs` is outside `src/` and so outside the measurement; the
packaging test runs it end to end.

Do not add exclusions to get a change merged; add tests.

## Fixtures

Everything under `test/fixtures/` is byte-exact reference material. Never
reformat it; `.gitattributes` and `.editorconfig` keep tools away from it. Never
add code from a game, an SDK, or a decompilation project.

- `test/fixtures/aspsx/` holds ground truth from real `ASPSX` binaries, imported
  from maspsx. To refresh it after a maspsx upgrade, clone maspsx at the new
  commit and run `ruby scripts/import-maspsx-fixtures.rb <clone> <commit>`.
  Only the `2.81` case of each fixture is kept.
- `test/fixtures/compiler/` holds `psyq-wasm`'s compiler output fixtures, copied
  unchanged. A file gains a `.words.json` companion once an oracle has verified
  its words.
- `test/fixtures/corpus/` holds original C and its compiler output. After adding
  or changing a source, run `npm run corpus:compile`, then record what the real
  assembler emits with `ruby scripts/aspsx-oracle.rb --aspsx <ASPSX.EXE> --docker
--only 'test/fixtures/corpus/**/*.s'`.
- `test/fixtures/probes/` holds a minimal source for every `VERIFY-n` item, with
  the real assembler's words beside each settled one.

## Closing a VERIFY item

Every behaviour that no fixture proves is tagged `VERIFY-n` in
`docs/ASPSX-2.81.md`, in the README fidelity table, and in a `// VERIFY-n:`
comment at the implementing code. To close one:

1. Obtain the words real `ASPSX` 2.81 emits for the item's probe
   (`ruby scripts/aspsx-oracle.rb --aspsx <ASPSX.EXE> --docker --only <probe>`), or find
   the construct in code the differential oracle has verified.
2. Commit that evidence as a fixture with its origin stated.
3. Make the implementation match, remove the `VERIFY-n` comment, and mark the
   item closed in the document and the README.
4. Add a **Fidelity** entry to the CHANGELOG if emitted words changed.

## Differential oracle

`npm run test:differential` compiles the C of an already-matched decompilation
with `psyq-wasm`, assembles it with this package, and compares the result with
the corresponding words of the original executable under each relocation's
field mask. It needs a build and three local inputs, named by environment
variables:

```sh
npm run build
PSYQ_ASM_ORACLE_CHECKOUT=<checkout> \
PSYQ_ASM_ORACLE_EXECUTABLE=<executable> \
PSYQ_ASM_ORACLE_MANIFEST=<manifest.json> \
npm run test:differential
```

The manifest lists the `-G` value, preprocessor flags, include directories, and
the functions to compare with their addresses; its format is documented at the
top of `scripts/oracle.mjs`, and `scripts/oracle-manifest.rb` writes one from a
symbol list. For triage, run the script directly and narrow it with `--only`:

```sh
node scripts/oracle.mjs --checkout <checkout> --executable <executable> \
  --manifest <manifest.json> --only '<function-or-source-glob>'
```

A word mismatch (an opcode, register, or immediate differs) fails the
comparison and is printed with both sides disassembled. A field mismatch (a
difference only inside a relocation field, which the linker fills in) is
recorded but never fails it.

The inputs never enter the repository, and neither does anything that names
them:

- The detailed report, with source file and function names, goes to
  `tmp/oracle/status.json`, which git ignores. Keep manifests there too.
- `test/differential/summary.json` is the only committed result: the
  `psyq-asm` commit, the `psyq-wasm` version, the manifest's SHA-256, the `-G`
  value, the date, and pass counts. The repository hygiene test enforces its
  keys.
- Nothing from the executable is written anywhere.

Without the environment variables the suite skips. The `Differential oracle`
workflow runs only on a self-hosted runner that already holds the inputs; see
the workflow file.

### Oracle discrepancies

A discrepancy becomes a regression fixture in `test/fixtures/regressions/`: a
minimal hand-written source that reproduces the construct, with the expected
words derived from the rule (or measured with the real assembler). Never copy
words, instructions, or code from the executable or the matched project. The
fix, the fixture, and a CHANGELOG **Fidelity** entry land in one commit.

## Fuzzing against the real assembler

`scripts/fuzz-aspsx.mjs` generates C from seeds (`scripts/gen-corpus.mjs`),
compiles it at `-G 0`, `-G 8`, and `-G 8 -g`, records what the real ASPSX 2.81
emits for all of it (`scripts/aspsx-oracle.rb --files`), and compares
`psyq-asm`'s output with that record the way the tests compare the corpus:

```sh
npm run build
npm run fuzz -- --aspsx tmp/aspsx/2.81/ASPSX.EXE --seeds 1..200
```

Work files stay in `tmp/fuzz/`. Reduce a mismatch to a regression fixture (see
"Oracle discrepancies"), record its words with `ruby scripts/aspsx-oracle.rb
--aspsx <ASPSX.EXE> --docker --files test/fixtures/regressions`, and fix the
rule.

## Style

- TypeScript strict mode, ESM, no `any` outside a documented boundary.
- Prettier formats everything; ESLint (type-aware) must pass with no
  file-level disables. A local disable needs a reason in a comment.
- Prefer `@ts-expect-error` over `@ts-ignore`, and only in tests.
- Public API changes need README and CHANGELOG entries in the same pull
  request.
- Scripts that are not part of the Node toolchain are written in Ruby.

## Releases

Tag `vX.Y.Z` on `main`. The release workflow checks that the tag, the
`package.json` version, and a dated CHANGELOG section agree, then builds and
runs every test layer before publishing.

Publishing uses npm trusted publishing (OIDC) with staged publishing: the
release job mints its credential from its own `id-token`, so no `NPM_TOKEN`
secret is stored, and it can only stage the version (`npm stage publish`). The
release becomes public when a maintainer approves it with 2FA, under Staged
Packages on npmjs.com or with `npm stage approve <stage-id>`. The trusted
publisher on npm is configured for `release.yml` with direct `npm publish` not
allowed, and the package requires 2FA with no bypass tokens. The demo workflow requires GitHub Pages to be enabled. These are
repository/account settings, not prerequisites for local validation.
