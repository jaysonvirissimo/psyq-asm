<!-- SPDX-License-Identifier: MIT -->

# Regression fixtures

One minimal source per discrepancy the differential oracle or the real
assembler has found. Each is written by hand for this repository and never
copies code, instructions, or words from a matched project or its executable.

- `<slug>.s`: line 1 is `# <slug>, -G <n>: <what went wrong>`.
- `<slug>.words.json`: `{ "origin", "gpSize", "words" }`, the `.text` words the
  source must assemble to. `origin` says where they come from: the rule in
  `docs/ASPSX-2.81.md` they follow, or `ASPSX 2.81 via scripts/aspsx-oracle.rb`.

`test/unit/regressions.test.ts` requires every source to have its words and to
reproduce them exactly. The fix, the fixture, and a CHANGELOG **Fidelity**
entry land in one commit (see "Oracle discrepancies" in CONTRIBUTING.md).
