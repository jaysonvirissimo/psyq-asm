<!-- SPDX-License-Identifier: MIT -->

# VERIFY probes

One minimal source per open item in `docs/ASPSX-2.81.md`. Line 1 names the
item, the `-G` value to assemble it with, and the question. To settle an item,
assemble the probe with the real ASPSX 2.81 (`aspsx -q -G <n> probe.s -o probe.obj`),
extract the `.text` words, compare them with `psyq-asm -G <n> --json`, and follow
"Closing a VERIFY item" in CONTRIBUTING.md. `test/unit/probes.test.ts` keeps
every probe assembling here.
