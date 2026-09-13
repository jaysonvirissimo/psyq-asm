// SPDX-License-Identifier: MIT
// Consumer smoke test: import the packed library the way a user would, assemble
// ASPSX ground-truth fixtures, and compare the words exactly.
import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SUPPORTED_ASPSX_VERSIONS, assemble, decode, format } from 'psyq-asm';

// The runner points PSYQ_ASM_FIXTURES at test/fixtures; default assumes an in-place run.
const fixtures =
  process.env.PSYQ_ASM_FIXTURES === undefined
    ? new URL('../../fixtures/', import.meta.url)
    : pathToFileURL(resolve(process.env.PSYQ_ASM_FIXTURES) + sep);
const hex8 = (w) => `0x${w.toString(16).toUpperCase().padStart(8, '0')}`;

let failures = 0;
for (const name of ['div', 'expand_li', 'gp', 'mflomt', 'cfc2']) {
  const fixture = JSON.parse(readFileSync(new URL(`aspsx/${name}.json`, fixtures), 'utf8'));
  const result = assemble(fixture.source, { gpSize: fixture.gpSize });
  const text = result.success ? result.object.sections.find((s) => s.name === '.text') : undefined;
  const words = [...(text?.words ?? [])].map(hex8);
  if (JSON.stringify(words) !== JSON.stringify(fixture.expectedWords)) {
    console.error(`${name}: got ${words.join(' ')}`);
    failures++;
  }
}

const compilerOutput = readFileSync(new URL('compiler/g8/t03_muldiv.s', fixtures));
const compiled = assemble(compilerOutput, { gpSize: 8, filename: 't03_muldiv.s' });
if (!compiled.success) {
  console.error(compiled.diagnostics);
  failures++;
}

console.log(`ASPSX ${SUPPORTED_ASPSX_VERSIONS.join()}: ${format(decode(0x27bdffa8))}`);
if (failures > 0) process.exit(1);
console.log('NODE-SMOKE-OK');
