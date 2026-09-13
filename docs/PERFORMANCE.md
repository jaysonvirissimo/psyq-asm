# Performance

These are single-machine numbers, not thresholds. **Nothing in CI asserts
them.** Shared CI runners are too noisy to hold latency to a bound without
flaky failures, so the targets below are reporting targets.

## What is measured

`npm run build && npm run bench` times `assemble` on a translation unit built
from the `-G 8` compiler fixtures, repeated with every label and symbol renamed
per copy (`scripts/bench.mjs`). Each run warms up three times, then reports the
median, minimum, and maximum of the timed iterations.

## Assembly time

Apple M1, Node.js 24.21.0.

| Unit | Source lines | Words emitted | Iterations | Median | Min | Max |
| --- | --- | --- | --- | --- | --- | --- |
| `--lines 2000` | 3,885 | 1,303 | 50 | 5.0 ms | 4.2 ms | 9.8 ms |
| `--lines 20000` | 23,310 | 7,818 | 20 | 65.6 ms | 61.5 ms | 81.0 ms |

The target is a 20,000-line translation unit in under 200 ms on a laptop. A
single function assembles in well under a millisecond, which is why the library
is synchronous and needs no worker.

## Bundle size

`npm run build && npm run size` bundles the library on its own with Vite's default
minifier (`scripts/bundle-size.mjs`).

| Measure | Size |
| --- | --- |
| `dist/**/*.js`, unminified | 116.9 KB |
| Minified | 62.9 KB |
| Minified and gzipped | 17.8 KB |

The informational target is 60 KB minified; the current build is about 3 KB
over it. Most of the size is the assembler: the expansion rules, the nop pass,
and diagnostic messages. A consumer that imports only `decode` and `format`
bundles none of it:

| Measure | Size |
| --- | --- |
| `decode` and `format` only, minified | 11.8 KB |
| `decode` and `format` only, minified and gzipped | 3.7 KB |
