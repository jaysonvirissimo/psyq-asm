// SPDX-License-Identifier: MIT
/**
 * The pure parts of the differential oracle (scripts/oracle.mjs): reading
 * words out of a PS-X EXE, comparing them with assembled words under each
 * relocation's field mask, choosing manifest units, and reducing a report to
 * the aggregate summary that may be committed. Kept free of other I/O so they
 * can be unit-tested with synthetic data; no executable content is ever needed
 * for the tests.
 */
import { createHash } from 'node:crypto';

const HEADER_SIZE = 0x800;

/**
 * The keys of the committed summary, and the only ones it may have. The
 * summary carries no source file or function names.
 */
export const SUMMARY_KEYS = Object.freeze([
  'psyqAsmCommit',
  'psyqWasmVersion',
  'manifestSha256',
  'gpSize',
  'functions',
  'date',
]);

/**
 * @param {Uint8Array} bytes the whole executable
 * @returns {{ textAddress: number, text: Uint8Array }}
 */
export function readPsxExe(bytes) {
  if (
    bytes.byteLength < HEADER_SIZE ||
    new TextDecoder().decode(bytes.subarray(0, 8)) !== 'PS-X EXE'
  ) {
    throw new Error('not a PS-X EXE file');
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const textAddress = view.getUint32(0x18, true);
  const textSize = view.getUint32(0x1c, true);
  return { textAddress, text: bytes.subarray(HEADER_SIZE, HEADER_SIZE + textSize) };
}

/**
 * A minimal PS-X EXE whose text is `words` at `textAddress`. Tests build their
 * executables with it.
 *
 * @param {number} textAddress
 * @param {ArrayLike<number>} words
 * @returns {Uint8Array}
 */
export function writePsxExe(textAddress, words) {
  const bytes = new Uint8Array(HEADER_SIZE + words.length * 4);
  bytes.set(new TextEncoder().encode('PS-X EXE'));
  const view = new DataView(bytes.buffer);
  view.setUint32(0x18, textAddress, true);
  view.setUint32(0x1c, words.length * 4, true);
  for (let i = 0; i < words.length; i++) view.setUint32(HEADER_SIZE + i * 4, words[i] >>> 0, true);
  return bytes;
}

/**
 * @param {{ textAddress: number, text: Uint8Array }} exe
 * @param {number} address the address of the first word
 * @param {number} count how many words
 * @returns {Uint32Array}
 */
export function wordsAt(exe, address, count) {
  const offset = address - exe.textAddress;
  if (offset < 0 || offset % 4 !== 0 || offset + count * 4 > exe.text.byteLength) {
    throw new Error(
      `0x${address.toString(16)} (${String(count)} words) is outside the executable text`,
    );
  }
  const view = new DataView(exe.text.buffer, exe.text.byteOffset + offset, count * 4);
  return Uint32Array.from({ length: count }, (_, i) => view.getUint32(i * 4, true));
}

/**
 * Compare assembled words with target words. A word mismatch is a difference
 * outside every relocation field at that offset: an opcode, a register, or an
 * immediate the assembler chose. A field mismatch is a difference only inside
 * a relocation field; those hold addresses the linker fills in, so they are
 * expected and never make the comparison unequal.
 *
 * @param {{ words: ArrayLike<number>, relocations: readonly { offset: number, fieldMask: number }[] }} actual
 * @param {ArrayLike<number>} expected
 * @returns {{ equal: boolean, compared: number, wordMismatches: { index: number, kind: 'instruction' | 'length' }[], fieldMismatches: number[] }}
 */
export function compareWords(actual, expected) {
  const masks = new Map();
  for (const relocation of actual.relocations) {
    masks.set(relocation.offset, (masks.get(relocation.offset) ?? 0) | relocation.fieldMask);
  }
  const wordMismatches = [];
  const fieldMismatches = [];
  const compared = Math.max(actual.words.length, expected.length);
  for (let index = 0; index < compared; index++) {
    if (index >= actual.words.length || index >= expected.length) {
      wordMismatches.push({ index, kind: 'length' });
      continue;
    }
    const keep = ~(masks.get(index * 4) ?? 0) >>> 0;
    const a = actual.words[index] >>> 0;
    const e = expected[index] >>> 0;
    if ((a & keep) >>> 0 !== (e & keep) >>> 0) wordMismatches.push({ index, kind: 'instruction' });
    else if (a !== e) fieldMismatches.push(index);
  }
  return { equal: wordMismatches.length === 0, compared, wordMismatches, fieldMismatches };
}

/**
 * @param {string} pattern `*` matches any run of characters, `?` one character
 * @returns {RegExp}
 */
function globToRegExp(pattern) {
  const body = pattern
    .split('')
    .map((c) => (c === '*' ? '.*' : c === '?' ? '.' : c.replace(/[.+^${}()|[\]\\]/g, '\\$&')))
    .join('');
  return new RegExp(`^${body}$`);
}

/**
 * The manifest units to run. With no patterns, every unit. Otherwise a unit
 * whose source matches a pattern is kept whole, and any other unit keeps only
 * the functions whose names match; units left with no functions are dropped.
 *
 * @template {{ source: string, functions: readonly { name: string }[] }} Unit
 * @param {readonly Unit[]} units
 * @param {readonly string[]} [patterns]
 * @returns {Unit[]}
 */
export function selectUnits(units, patterns) {
  if (patterns === undefined || patterns.length === 0) return [...units];
  const expressions = patterns.map(globToRegExp);
  const matches = (text) => expressions.some((e) => e.test(text));
  const selected = [];
  for (const unit of units) {
    if (matches(unit.source)) {
      selected.push(unit);
      continue;
    }
    const functions = unit.functions.filter((f) => matches(f.name));
    if (functions.length > 0) selected.push({ ...unit, functions });
  }
  return selected;
}

/**
 * Reduce a report to the committed summary: counts and provenance only.
 *
 * @param {{ gpSize: number | null, results: readonly { equal: boolean, [key: string]: unknown }[] }} report
 * @param {{ psyqAsmCommit: string | null, psyqWasmVersion: string | null, manifestSha256: string, date: string }} provenance
 * @returns {Record<string, unknown>}
 */
export function summarize(report, provenance) {
  return {
    psyqAsmCommit: provenance.psyqAsmCommit,
    psyqWasmVersion: provenance.psyqWasmVersion,
    manifestSha256: provenance.manifestSha256,
    gpSize: report.gpSize,
    functions: {
      total: report.results.length,
      passed: report.results.filter((r) => r.equal).length,
    },
    date: provenance.date,
  };
}

/**
 * SHA-256 of words as little-endian bytes, for recording what was compared.
 *
 * @param {ArrayLike<number>} words
 * @returns {string}
 */
export function hashWords(words) {
  const bytes = new Uint8Array(words.length * 4);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < words.length; i++) view.setUint32(i * 4, words[i] >>> 0, true);
  return createHash('sha256').update(bytes).digest('hex');
}
