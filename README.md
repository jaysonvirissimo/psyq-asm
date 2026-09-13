# psyq-asm

An ASPSX 2.81-compatible assembler and R3000 encoder/decoder in TypeScript, for
PlayStation 1 matching-decompilation tooling in the browser and Node.js.

[psyq-wasm](https://github.com/jaysonvirissimo/psyq-wasm) produces the exact
assembly text the PsyQ 4.4 compiler (`cc1psx`) emits. That text is not what a
PlayStation executable contains. Sony's assembler, ASPSX, expands macro
instructions such as `li` and `div`, inserts `nop`s for delay slots and hardware
hazards, and addresses small data through `$gp`. `psyq-asm` reproduces that step,
so a page or a build tool can turn compiler output into the machine words a
matching decompilation compares against.

It is synchronous, has no runtime dependencies, and uses no WebAssembly, no
worker, and no network. Every word it emits says where it came from: a source
instruction, a macro expansion, or a nop inserted for a stated reason.

```
C source ──psyq-wasm──▶ cc1psx assembly ──psyq-asm──▶ R3000 words + relocations + provenance
```

> **Status:** unreleased. See [the fidelity contract](#the-fidelity-contract) for
> what is verified.

## Install

```sh
npm install psyq-asm
```

Node.js 22 or later, or any current browser. ESM only.

## Usage

### Assembling

```js
import { assemble } from 'psyq-asm';

const result = assemble(asmText, { gpSize: 8 });
if (!result.success) {
  for (const d of result.diagnostics) console.error(`${d.file}:${d.line}: ${d.message}`);
} else {
  const text = result.object.sections.find((s) => s.name === '.text');
  text.words; // Uint32Array of little-endian words
  text.relocations; // [{ offset, kind: 'HI16', fieldMask: 0xffff, target, fieldValue }, ...]
  text.provenance; // [{ line: 21, kind: 'load-delay-nop', note: '$3 is written by lw and read by sll' }, ...]
  result.object.functions; // [{ name: 'glob', section: '.text', start: 6, end: 11 }, ...]
}
```

`source` may be a string or a `Uint8Array` (decoded as UTF-8); CRLF and LF line
endings give the same result. `gpSize` is the `-G` value of the build being
reproduced and is required: PsyQ projects use 0 or 8.

Straight from psyq-wasm:

```js
import { createCompiler } from 'psyq-wasm';
import { assemble } from 'psyq-asm';

const compiler = await createCompiler();
const compiled = await compiler.compilePreprocessed(preprocessedC, {
  gpSize: 8,
  filename: 'codec.i',
  rawFlags: ['-O2', '-g0', '-Wall'],
});
if (compiled.success) {
  const result = assemble(compiled.asm, { gpSize: 8, filename: 'codec.s' });
}
```

### Comparing with target words

Assembled words hold relocation addends where a linked executable holds
addresses, so compare the bits outside each relocation's `fieldMask`:

```js
function matches(section, target) {
  const masks = new Map();
  for (const r of section.relocations)
    masks.set(r.offset, (masks.get(r.offset) ?? 0) | r.fieldMask);
  return [...section.words].every((word, i) => {
    const keep = ~(masks.get(i * 4) ?? 0) >>> 0;
    return (word & keep) >>> 0 === (target[i] & keep) >>> 0;
  });
}
```

### Single instructions

```js
import { decode, encode, format } from 'psyq-asm';

const instruction = decode(0x27bdffa8);
format(instruction); // 'addiu $sp,$sp,-0x58'
format(instruction, { registers: 'numeric', hex: false }); // 'addiu $29,$29,-88'
instruction.reads; // [29]
encode(instruction); // 0x27bdffa8
format(decode(0x00000000), { pseudo: true }); // 'nop'
decode(0xffffffff); // { mnemonic: '.word', word: 0xffffffff, reason: 'unknown opcode 0x3F' }
```

### Programs

`decodeWords` decodes a run of words and labels the branch targets inside it;
`formatProgram` prints assembly that `assemble` accepts:

```js
import { decodeWords, formatProgram } from 'psyq-asm';

const program = decodeWords([0x2442ffff, 0x1440fffe, 0x00000000, 0x03e00008]);
formatProgram(program);
// .set noreorder
// L_0:
//   addiu $v0,$v0,-0x1
//   bne $v0,$zero,L_0
//   sll $zero,$zero,0
//   jr $ra
```

Pass `{ baseAddress: 0x800c56c0 }` to name labels by address and resolve `j`/`jal`
targets. Re-assembling the text reproduces the words whenever ASPSX would insert
no nop into them (no loads, `mflo`/`mfhi`, or `mfc2`/`cfc2` followed by a reader).

## The fidelity contract

`psyq-asm` emulates one version pair: PsyQ 4.4 `cc1psx` output assembled by
ASPSX 2.81, invoked as `aspsx -G<n>`. The rule set is
[docs/ASPSX-2.81.md](docs/ASPSX-2.81.md), with the evidence for every rule.

What is verified today:

- all 15 ASPSX 2.81 ground-truth word lists from
  [maspsx](https://github.com/mkst/maspsx) assemble word for word;
- the 2.81-applicable unit tests of maspsx are ported and pass;
- all 41 psyq-wasm compiler fixtures (t01 to t20 at `-G 0` and `-G 8`, plus `t07_struct` compiled with `-g`), the 75 files of a corpus of 25 original C programs (`-G 0`, `-G 8`, and `-G 8 -g`), and all 20 verification probes match what real ASPSX 2.81 emits for them (recorded with `scripts/aspsx-oracle.rb`): the words exactly, and the section sizes, relocations, and symbols; every word has provenance;
- seeded fuzzing: 500 generated C programs (`npm run fuzz`, seeds 1 to 500), each compiled at `-G 0`, `-G 8`, and `-G 8 -g`, match the real ASPSX 2.81 in the same way;
- property tests: every instruction encodes and decodes symmetrically, decoded
  programs re-assemble to their words, output is deterministic, and no input
  makes `assemble` throw.

What is not verified yet: nothing in the rule set. Real ASPSX 2.81 output settled all 20 verification items, listed at the end of it. A differential oracle,
which compares assembled words with an already-matched decompilation's original
executable, is in place (`scripts/oracle.mjs`).

## Options

| Option                | Default     | Meaning                                                |
| --------------------- | ----------- | ------------------------------------------------------ |
| `gpSize`              | required    | The `-G` small-data threshold: a non-negative integer. |
| `aspsxVersion`        | `'2.81'`    | The only accepted value.                               |
| `partialDivExpansion` | `false`     | Reproduce `ASPSX -0`: `div`/`rem` without trap checks. |
| `filename`            | `'input.s'` | The name diagnostics use. A single path segment.       |

## Output model

| Field                | Contents                                                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `object.sections[]`  | `name`, `kind` (`code`, `data`, `bss`), `bytes`, `size`, `relocations`; code sections also `words` and `provenance`. First-appearance order; `.lcomm` allocations create `.sbss`/`.bss` last.                                   |
| `relocations[]`      | `offset` (bytes), `kind` (`HI16`, `LO16`, `GPREL16`, `MIPS26`, `WORD32`), `fieldMask`, `target` (a symbol and addend for an extern or `.comm`, or a section offset for anything the file defines), and `fieldValue`.            |
| `provenance[]`       | One per word: source `line`, `kind` (`instruction`, `macro`, `branch-delay-nop`, `load-delay-nop`, `hilo-gap-nop`, `cop-delay-nop`, `gte-gap-nop`, `align`, `data`), the `macro` that expanded, and a `note` for inserted nops. |
| `object.symbols[]`   | `name`, `binding` (`global`, `local`, `extern`, `common`), `section`, `offset` (not for `extern` or `common`), `size`.                                                                                                          |
| `object.functions[]` | From `.ent`/`.end`: `name`, `start` and `end` word indices, `frame`, `mask`, `fmask`.                                                                                                                                           |
| `object.smallData[]` | The symbols addressed through `$gp`, with the reason.                                                                                                                                                                           |

## Errors

Problems in the assembly are diagnostics in a failed result (`success: false`),
each with a `code` such as `unknown-mnemonic`, `undefined-label`,
`immediate-out-of-range`, or `unsupported-syntax`. Nothing that looks like an
instruction is ever skipped silently. Exceptions are reserved for caller
mistakes:

| Error                     | `code`                | Thrown when                                                                     |
| ------------------------- | --------------------- | ------------------------------------------------------------------------------- |
| `InvalidOptionsError`     | `invalid-options`     | `options` or `style` is malformed, or `source` is not a string or `Uint8Array`. |
| `InvalidInstructionError` | `invalid-instruction` | `encode` gets an operand that cannot be encoded, or `decode` a non-integer.     |

Both extend `PsyqAsmError`, and `code` narrows to the subclass.

## Command line

```sh
psyq-asm -G 8 codec.s                     # listing: offset, word, instruction, why
psyq-asm -G 8 --json codec.json codec.s   # the whole object as JSON
psyq-asm --decode --base 0x800C56C0 words.txt
```

Decoding reads every eight-digit hexadecimal word in the file, so `dw 0x27BDFFA8`
lines work as they are.

## Demo

`npm run build && npm run serve`, then open <http://127.0.0.1:4173/demo/>: paste
compiler output and see the words with the reason for each, or paste words and
see the program. The same page is published to GitHub Pages.

## Stability

Semantic versioning covers the exported functions, types, options, and error
codes. A change to the words emitted for some input is a fidelity fix, not a
breaking change, and is listed under **Fidelity** in the
[changelog](CHANGELOG.md).

## License and credits

MIT; see [LICENSE](LICENSE). The ASPSX ground truth, the ported unit tests, and
much of the rule set come from [maspsx](https://github.com/mkst/maspsx) by Mark
Street (MIT). The compiler fixtures come from
[psyq-wasm](https://github.com/jaysonvirissimo/psyq-wasm) (MIT). No Sony software
or game data is included.
