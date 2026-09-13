#!/usr/bin/env node
// SPDX-License-Identifier: MIT
/**
 * psyq-asm command line.
 *
 *   psyq-asm -G <n> [--partial-div] [--json <out.json>] <input.s>
 *   psyq-asm --decode [--base <address>] [--numeric] [--pseudo] <words.txt>
 *
 * Assembling prints a listing (offset, word, instruction, and why the word
 * exists) or, with --json, writes the whole object. Diagnostics go to stderr.
 * Decoding reads every 8-digit hexadecimal word in the file (`0x27BDFFA8`,
 * `dw 0x27BDFFA8`, or `27BDFFA8`) and prints assembly that re-assembles.
 *
 * Exit status: 0 on success, 1 when the input has errors, 2 for usage errors.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import {
  PsyqAsmError,
  assemble,
  decode,
  decodeWords,
  format,
  formatProgram,
} from '../dist/index.js';

const USAGE = `usage: psyq-asm -G <n> [--partial-div] [--json <out.json>] <input.s>
       psyq-asm --decode [--base <address>] [--numeric] [--pseudo] <words.txt>`;

function usage(message) {
  console.error(`psyq-asm: ${message}`);
  console.error(USAGE);
  process.exit(2);
}

function parseArgs(argv) {
  const options = { decode: false, partialDiv: false, numeric: false, pseudo: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      const next = argv[++i];
      if (next === undefined) usage(`${arg} needs a value.`);
      return next;
    };
    if (arg === '-h' || arg === '--help') {
      console.log(USAGE);
      process.exit(0);
    } else if (arg === '-G') options.gpSize = value();
    else if (/^-G\d+$/.test(arg)) options.gpSize = arg.slice(2);
    else if (arg === '--partial-div') options.partialDiv = true;
    else if (arg === '--json') options.json = value();
    else if (arg === '--decode') options.decode = true;
    else if (arg === '--base') options.base = value();
    else if (arg === '--numeric') options.numeric = true;
    else if (arg === '--pseudo') options.pseudo = true;
    else if (arg.startsWith('-')) usage(`unknown option ${arg}.`);
    else if (options.input === undefined) options.input = arg;
    else usage(`unexpected argument ${arg}.`);
  }
  if (options.input === undefined) usage('no input file.');
  return options;
}

const hex8 = (value) => `0x${(value >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;

function toJson(object) {
  return {
    ...object,
    sections: object.sections.map((section) => ({
      name: section.name,
      kind: section.kind,
      size: section.size,
      bytes: Buffer.from(section.bytes).toString('hex'),
      ...(section.words === undefined ? {} : { words: [...section.words].map(hex8) }),
      relocations: section.relocations,
      ...(section.provenance === undefined ? {} : { provenance: section.provenance }),
    })),
  };
}

function printListing(object) {
  for (const section of object.sections) {
    if (section.words === undefined) continue;
    console.log(`${section.name}:`);
    const relocations = new Map(section.relocations.map((r) => [r.offset, r]));
    [...section.words].forEach((word, index) => {
      const origin = section.provenance[index];
      const text = format(decode(word), { pseudo: true });
      const why = [origin.kind, origin.macro, origin.note].filter(Boolean).join(': ');
      console.log(
        `  ${hex8(index * 4)}  ${hex8(word)}  ${text.padEnd(28)} ; line ${String(origin.line)} ${why}`,
      );
      const relocation = relocations.get(index * 4);
      if (relocation !== undefined) {
        const target =
          relocation.target.kind === 'symbol'
            ? `${relocation.target.name}${relocation.target.addend === 0 ? '' : `+${String(relocation.target.addend)}`}`
            : `${relocation.target.section}+${hex8(relocation.target.offset)}`;
        console.log(`  ${' '.repeat(22)}${relocation.kind} ${target}`);
      }
    });
  }
}

function runAssemble(options) {
  if (options.gpSize === undefined) usage('-G <n> is required: PsyQ builds use -G 0 or -G 8.');
  const result = assemble(readFileSync(options.input), {
    gpSize: Number(options.gpSize),
    partialDivExpansion: options.partialDiv,
    filename: basename(options.input),
  });
  for (const d of result.diagnostics) {
    const at = d.column === undefined ? String(d.line) : `${String(d.line)}:${String(d.column)}`;
    console.error(`${d.file}:${at}: ${d.severity}: ${d.message} [${d.code}]`);
  }
  if (!result.success) process.exit(1);
  if (options.json === undefined) printListing(result.object);
  else writeFileSync(options.json, `${JSON.stringify(toJson(result.object), null, 2)}\n`);
}

function runDecode(options) {
  const text = readFileSync(options.input, 'utf8');
  const words = [...text.matchAll(/\b(?:0x)?([0-9a-f]{8})\b/gi)].map((m) =>
    Number.parseInt(m[1], 16),
  );
  const program = decodeWords(
    words,
    options.base === undefined ? {} : { baseAddress: Number(options.base) },
  );
  process.stdout.write(
    formatProgram(program, {
      registers: options.numeric ? 'numeric' : 'abi',
      pseudo: options.pseudo,
    }),
  );
}

const options = parseArgs(process.argv.slice(2));
try {
  if (options.decode) runDecode(options);
  else runAssemble(options);
} catch (error) {
  if (error instanceof PsyqAsmError) usage(error.message);
  if (error?.code === 'ENOENT') {
    console.error(`psyq-asm: cannot read ${options.input}.`);
    process.exit(2);
  }
  throw error;
}
