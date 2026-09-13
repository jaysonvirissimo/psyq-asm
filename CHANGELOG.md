# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

Fidelity changes, which alter the words `assemble` emits for some input without
changing the API, are listed under **Fidelity**, separately from API changes.
A fidelity fix is not a breaking change even when it changes output.

## [Unreleased]

### Fidelity

- Names starting with `L` are ordinary symbols unless they are `LM<digits>`
  debugging markers: calls to external functions such as `LoadThing` no longer
  fail, and such globals and statics appear in the object's symbols.
- `.bss` may hold data (`.section .bss` then `.word 0`), which is kept, as
  ASPSX does, instead of being an error. `.lcomm` offsets in such a section still count
  from 0 beside the data, as ASPSX's do.

## [0.1.0] - 2026-09-13

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
- Tooling for the real assembler: `scripts/aspsx-oracle.rb` runs ASPSX 2.81
  under wine, locally or in an x86-64 Docker container
  (`scripts/aspsx-wine.Dockerfile`), first replaying the 15 ground-truth
  fixtures, then recording words for the VERIFY probes and compiler fixtures;
  objects are read with `scripts/psyq-object.mjs`, and tests require any
  recorded words exactly.
- A real-assembler corpus: 25 original C programs (`test/fixtures/corpus/`)
  compiled with psyq-wasm at `-G 0`, `-G 8`, and `-G 8 -g`
  (`npm run corpus:compile`, verified in CI with `npm run corpus:verify`), each
  with the output of the real ASPSX 2.81 recorded beside it.
- GNU numeric local labels (`1:`, `1f`, `1b`), which `cc1psx` emits in `long
  long` code.
- `npm run fuzz` (`scripts/fuzz-aspsx.mjs`): seeded C from
  `scripts/gen-corpus.mjs`, compiled at three settings and compared with what
  the real ASPSX 2.81 emits for it.

### Removed

- `options.experimental`, `ExperimentalBehaviours`, and `DEFAULT_EXPERIMENTAL`
  (present in the 0.0.1 placeholder). Real ASPSX 2.81 settled both switches:
  `.extern` sizes never make a symbol small data, and the `mfc2`/`cfc2` delay
  nop is always inserted. `SmallDataEntry.reason` no longer includes `'extern'`.

### Fidelity

- The initial rule set, [docs/ASPSX-2.81.md](docs/ASPSX-2.81.md): all 15 ASPSX
  2.81 ground-truth fixtures are word-exact.
- A relocation against a symbol leaves its field 0 and carries the addend in the
  relocation, as the `lwlw` fixture shows for `lw $2,Savemap+2944`.
- `break` carries two 10-bit codes. A single source code is split as maspsx does;
  the divide traps are `break 7,0` and `break 6,0`.
- Checked against real ASPSX 2.81, run in Docker by `scripts/aspsx-oracle.rb`:
  all 41 compiler fixtures (one compiled with `-g`) and all 20 probes match word for word, settling all 20 verification items (VERIFY-1 and 5 to 23), and so do the 1,500 files of 500 fuzzing seeds. The rest of this list is what
  changed as a result.
- Relocated fields against local labels hold 0: `j $L9`, `%lo($LC1)`, and
  jump-table `.word $L15` entries no longer carry the label's offset.
- `.extern sym,size` no longer makes a symbol small data.
- `.comm` allocates nothing: the linker places common symbols, which keep their
  size and `.sbss`/`.bss` section but no offset. `.lcomm` still allocates, in
  order, aligned to its size rounded up to a power of two (at most 16) rather
  than capped at 8.
- Relocations against anything the file defines (functions, globals, statics,
  `.lcomm`) target its section and offset, as `$L` labels already did; only
  externs and `.comm` symbols stay symbol-relative.
- A load made under `.set noreorder` gets no delay nop.
- The multiply gap: a load between `mflo`/`mfhi` and `mult`/`div` no longer
  cancels the gap nop, and that one nop also serves as the load delay; a
  multi-word expansion between them fills the gap.
- `b label` assembles as `bgez $0,label`, and `subu rd,rs,-32768` as a single
  `addiu rd,rs,-0x8000`.

[Unreleased]: https://github.com/jaysonvirissimo/psyq-asm/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/jaysonvirissimo/psyq-asm/releases/tag/v0.1.0
