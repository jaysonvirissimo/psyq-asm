<!-- SPDX-License-Identifier: MIT -->

# VERIFY probes

One minimal source per open item in `docs/ASPSX-2.81.md`. Line 1 names the
item, the `-G` value to assemble it with, and the question. To settle an item,
run `ruby scripts/aspsx-oracle.rb --aspsx <ASPSX.EXE> --docker --only 'test/fixtures/probes/VERIFY-n.s'`,
which assembles the probe with the real ASPSX 2.81 under wine (in Docker) and writes
`VERIFY-n.words.json` beside it; then follow "Closing a VERIFY item" in
CONTRIBUTING.md. `test/unit/probes.test.ts` keeps
every probe assembling here.
