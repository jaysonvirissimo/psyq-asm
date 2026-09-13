# psyq-asm

An `ASPSX` 2.81-compatible assembler and R3000 encoder/decoder in TypeScript,
for PlayStation 1 matching-decompilation tooling in the browser and Node.js.

> **Status:** under development; not yet published.

[`psyq-wasm`](https://github.com/jaysonvirissimo/psyq-wasm) produces the exact
assembly text the PsyQ 4.4 compiler emits. That text is not what a PlayStation
executable contains: Sony's assembler, `ASPSX`, expands macro instructions,
inserts `nop`s for delay slots and hardware hazards, and addresses small data
through `$gp`. `psyq-asm` reproduces that step with no WebAssembly, no worker,
and no runtime dependencies, so a browser can turn compiler output into the
machine words a matching decompilation compares against.

```
C source ──psyq-wasm──▶ cc1psx assembly ──psyq-asm──▶ R3000 words + relocations + provenance
```

## Install

```sh
npm install psyq-asm
```

## License

MIT. Ground-truth fixtures and behaviour rules derive from
[maspsx](https://github.com/mkst/maspsx) (MIT); see [LICENSE](LICENSE).
