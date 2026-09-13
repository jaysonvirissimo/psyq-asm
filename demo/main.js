// SPDX-License-Identifier: MIT
// Static demo: no bundler, no backend. Serve the repository root after a build
// (npm run build && npm run serve) and open /demo/.
import { assemble, decode, decodeWords, format, formatProgram } from '../dist/index.js';

const SAMPLE_SOURCE = `\t.extern\tg_counter, 4
\t.text
\t.ent\tinc
inc:
\t.frame\t$sp,0,$31
\tlbu\t$3,4($4)
\tlbu\t$2,5($4)
\taddu\t$3,$3,1
\tsll\t$2,$2,3
\t.set\tnoreorder
\t.set\tnomacro
\tj\t$31
\tsb\t$3,4($4)
\t.set\tmacro
\t.set\treorder
\t.end\tinc
\t.ent\tglob
glob:
\tlw\t$3,g_counter
\t#nop
\tsll\t$2,$3,1
\tdiv\t$2,$2,$3
\tj\t$31
\t.end\tglob
`;

const SAMPLE_WORDS = `27BDFFE8 AFBF0010 0C000000 00000000
8FBF0010 03E00008 27BD0018`;

const $ = (id) => document.getElementById(id);
const hex8 = (value) => `0x${(value >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;

function cell(row, text, className) {
  const td = row.insertCell();
  td.textContent = text;
  if (className !== undefined) td.className = className;
}

function runAssemble() {
  const gpSize = Number(document.querySelector('input[name="gp"]:checked').value);
  const result = assemble($('source').value, {
    gpSize,
    partialDivExpansion: $('partial').checked,
    filename: 'demo.s',
  });
  const list = $('diagnostics');
  list.replaceChildren(
    ...result.diagnostics.map((d) => {
      const item = document.createElement('li');
      item.className = d.severity;
      item.textContent = `line ${String(d.line)}: ${d.severity}: ${d.message}`;
      return item;
    }),
  );
  const body = $('words').tBodies[0];
  body.replaceChildren();
  if (!result.success) {
    $('status').textContent = 'failed';
    return;
  }
  let count = 0;
  for (const section of result.object.sections) {
    if (section.words === undefined) continue;
    const relocations = new Map(section.relocations.map((r) => [r.offset, r]));
    [...section.words].forEach((word, index) => {
      const origin = section.provenance[index];
      const row = body.insertRow();
      row.className = origin.kind;
      cell(row, `${section.name}+${hex8(index * 4)}`);
      cell(row, hex8(word), 'mono');
      const relocation = relocations.get(index * 4);
      const target =
        relocation === undefined
          ? ''
          : ` ← ${relocation.kind} ${relocation.target.kind === 'symbol' ? relocation.target.name : (relocation.target.label ?? relocation.target.section)}`;
      cell(row, `${format(decode(word), { pseudo: true })}${target}`, 'mono');
      cell(row, String(origin.line));
      cell(row, [origin.kind, origin.macro, origin.note].filter(Boolean).join(': '));
      count++;
    });
  }
  $('status').textContent = `ok (${String(count)} words)`;
}

function runDecode() {
  const words = [...$('hex').value.matchAll(/\b(?:0x)?([0-9a-f]{8})\b/gi)].map((m) =>
    Number.parseInt(m[1], 16),
  );
  const base = $('base').value.trim();
  try {
    const program = decodeWords(words, base === '' ? {} : { baseAddress: Number(base) });
    $('program').textContent = formatProgram(program, { pseudo: true });
  } catch (error) {
    $('program').textContent = String(error.message);
  }
}

$('source').value = SAMPLE_SOURCE;
$('hex').value = SAMPLE_WORDS;
$('assemble').addEventListener('click', runAssemble);
$('decode').addEventListener('click', runDecode);
$('assemble').disabled = false;
$('decode').disabled = false;
