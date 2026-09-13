# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

Fidelity changes, which alter the words `assemble` emits for some input without
changing the API, are listed under **Fidelity**, separately from API changes.
A fidelity fix is not a breaking change even when it changes output.

## [Unreleased]

### Added

- `assemble(source, options)`: PsyQ 4.4 `cc1psx` output to the words ASPSX 2.81
  produces, with sections, relocations carrying field masks, symbols, function
  ranges, small-data classification, and provenance for every word. Input
  problems are diagnostics; only caller mistakes throw.
- `decode`, `encode`, and `format`: one instruction table covering the MIPS I
  integer set, coprocessor 0 and GTE register moves, `lwc2`/`swc2`, raw GTE
  commands, `rfe`, `break`, and `syscall`.
- `decodeWords` and `formatProgram`: a program view with labelled branch targets
  that re-assembles to its words.
- The `psyq-asm` command line: listings, JSON output, and decoding.
- A demo page, published to GitHub Pages.
- Tests: unit, property, the ASPSX 2.81 ground truth, ported maspsx tests,
  compiler fixtures, VERIFY probes, three browsers, and packaging with Node,
  TypeScript, Vite, bare browser ESM, and Pages consumers.
- A differential oracle (`scripts/oracle.mjs`, `npm run test:differential`):
  compares matched decompiled code with its original executable, keeps every
  name in the ignored `tmp/` directory, and commits only an aggregate summary.
  `scripts/oracle-manifest.rb` writes manifests from a symbol list; a synthetic
  pipeline test runs in CI, and the real comparison runs on demand on a
  self-hosted runner.

### Fidelity

- The initial rule set, [docs/ASPSX-2.81.md](docs/ASPSX-2.81.md): all 15 ASPSX
  2.81 ground-truth fixtures are word-exact.
- A relocation against a symbol leaves its field 0 and carries the addend in the
  relocation, as the `lwlw` fixture shows for `lw $2,Savemap+2944`.
- `break` carries two 10-bit codes. A single source code is split as maspsx does;
  the divide traps are `break 7,0` and `break 6,0`.

[Unreleased]: https://github.com/jaysonvirissimo/psyq-asm/commits/main
