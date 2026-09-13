// SPDX-License-Identifier: MIT
/**
 * The pure parts of the differential oracle (scripts/oracle.mjs): reading
 * words out of a PS-X EXE and comparing them with assembled words under each
 * relocation's field mask. Kept free of other I/O so they can be unit-tested
 * with synthetic data; no executable content is ever needed for the tests.
 */
import { createHash } from 'node:crypto';

const HEADER_SIZE = 0x800;

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
 * Compare assembled words with target words. A word matches when the bits
 * outside every relocation field at its offset are equal; relocated fields
 * hold addresses only the linker knows.
 *
 * @param {{ words: ArrayLike<number>, relocations: readonly { offset: number, fieldMask: number }[] }} actual
 * @param {ArrayLike<number>} expected
 * @returns {{ equal: boolean, compared: number, relocated: number, mismatches: { index: number, kind: 'instruction' | 'length' }[] }}
 */
export function compareWords(actual, expected) {
  const masks = new Map();
  for (const relocation of actual.relocations) {
    masks.set(relocation.offset, (masks.get(relocation.offset) ?? 0) | relocation.fieldMask);
  }
  const mismatches = [];
  let relocated = 0;
  const compared = Math.max(actual.words.length, expected.length);
  for (let index = 0; index < compared; index++) {
    if (index >= actual.words.length || index >= expected.length) {
      mismatches.push({ index, kind: 'length' });
      continue;
    }
    const keep = ~(masks.get(index * 4) ?? 0) >>> 0;
    const a = actual.words[index] >>> 0;
    const e = expected[index] >>> 0;
    if ((a & keep) >>> 0 !== (e & keep) >>> 0) mismatches.push({ index, kind: 'instruction' });
    else if (a !== e) relocated++;
  }
  return { equal: mismatches.length === 0, compared, relocated, mismatches };
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
