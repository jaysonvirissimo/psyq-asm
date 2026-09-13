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

A fixture gains a `<name>-<g0|g8>.words.json` companion once an oracle has
verified the words `ASPSX` 2.81 produces for it; until then the test asserts only
that it assembles without error and that every word has provenance.

## `probes/`

Minimal sources for the open `VERIFY-n` items in `docs/ASPSX-2.81.md`, for a
maintainer with access to the real assembler to run.
