<!-- SPDX-License-Identifier: MIT -->

# Test fixtures

Reference material for the assembler. Everything here is byte-exact: never
reformat it. `.gitattributes` (`test/fixtures/** -text`) and `.editorconfig`
keep tools from touching line endings or whitespace.

Nothing here comes from a game, an SDK, or a decompilation project.

## `aspsx/`

Ground truth produced by real `ASPSX` binaries, imported from
[maspsx](https://github.com/mkst/maspsx) (MIT, Copyright (c) 2023 Mark Street)
by `scripts/import-maspsx-fixtures.rb`. Each JSON file holds:

| Field           | Meaning                                                                      |
| --------------- | ---------------------------------------------------------------------------- |
| `name`          | the upstream fixture name                                                    |
| `origin`        | upstream file and commit                                                     |
| `aspsxVersion`  | always `2.81`; other versions' cases are not imported                        |
| `sourceFile`    | the upstream assembly source name under `aspsx/ASM/`                         |
| `source`        | that source, verbatim (CRLF line endings, as upstream)                       |
| `gpSize`        | the `-G` value ASPSX was run with (0 when upstream passed none)              |
| `expectedWords` | the `.text` section as little-endian words, formatted `0x%08X`               |
| `disassembly`   | upstream's disassembly comment for each word (spimdisasm, pseudo-ops on)     |

The words were produced upstream by running `ASPSX.EXE` under wine and reading
the `.text` section back out of the PSYQ object file.

## `compiler/`

`g0/*.s` and `g8/*.s` are the compiler output fixtures of
[psyq-wasm](https://github.com/jaysonvirissimo/psyq-wasm) (MIT), copied
unchanged: the assembly the PsyQ 4.4 `cc1psx` emits at `-O2 -g0 -Wall` with
`-G 0` and `-G 8` for that project's original C test programs. They keep the
compiler's CRLF line endings. The C sources live in the psyq-wasm repository.

A fixture gains a `<name>.words.json` companion beside it once
`scripts/aspsx-oracle.rb` has recorded the words the real `ASPSX` 2.81 emits for
it; the test then requires those `.text` words exactly. Until then it asserts
only that the fixture assembles without error and that every word has
provenance.

## `regressions/`

Minimal hand-written sources for discrepancies an oracle found, each with the
words it must assemble to. See `regressions/README.md`. Nothing in them comes
from a matched project or its executable.

## `probes/`

One minimal source for each `VERIFY-n` item in `docs/ASPSX-2.81.md`. A settled
item keeps the words real ASPSX 2.81 emitted for its probe beside it; an open
one waits for them.
