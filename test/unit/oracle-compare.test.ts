// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { compareWords, hashWords, readPsxExe, wordsAt } from '../../scripts/oracle-compare.mjs';

/** A synthetic PS-X EXE: header, then three words of text at 0x80010000. */
function syntheticExe(): Uint8Array {
  const bytes = new Uint8Array(0x800 + 12);
  bytes.set(new TextEncoder().encode('PS-X EXE'));
  const view = new DataView(bytes.buffer);
  view.setUint32(0x18, 0x80010000, true);
  view.setUint32(0x1c, 12, true);
  [0x27bdffe8, 0x0c000000, 0x03e00008].forEach((word, i) => {
    view.setUint32(0x800 + i * 4, word, true);
  });
  return bytes;
}

describe('oracle comparison', () => {
  it('reads words from a PS-X EXE by address', () => {
    const exe = readPsxExe(syntheticExe());
    expect(exe.textAddress).toBe(0x80010000);
    expect([...wordsAt(exe, 0x80010004, 2)]).toEqual([0x0c000000, 0x03e00008]);
    expect(() => wordsAt(exe, 0x80010008, 2)).toThrow('outside the executable text');
    expect(() => wordsAt(exe, 0x8000fffc, 1)).toThrow('outside the executable text');
    expect(() => wordsAt(exe, 0x80010002, 1)).toThrow('outside the executable text');
    expect(() => readPsxExe(new Uint8Array(16))).toThrow('not a PS-X EXE file');
    expect(() => readPsxExe(new Uint8Array(0x900))).toThrow('not a PS-X EXE file');
  });

  it('ignores relocated fields and reports instruction and length mismatches', () => {
    const relocations = [{ offset: 4, fieldMask: 0x03ffffff }];
    expect(
      compareWords({ words: [0x27bdffe8, 0x0c000000], relocations }, [0x27bdffe8, 0x0c004567]),
    ).toEqual({
      equal: true,
      compared: 2,
      relocated: 1,
      mismatches: [],
    });
    expect(
      compareWords({ words: [0x27bdffe8, 0x08000000], relocations }, [0x27bdfff0, 0x0c000000]),
    ).toEqual({
      equal: false,
      compared: 2,
      relocated: 0,
      mismatches: [
        { index: 0, kind: 'instruction' },
        { index: 1, kind: 'instruction' },
      ],
    });
    expect(compareWords({ words: [1], relocations: [] }, [1, 2]).mismatches).toEqual([
      { index: 1, kind: 'length' },
    ]);
    expect(compareWords({ words: [1, 2], relocations: [] }, [1]).mismatches).toEqual([
      { index: 1, kind: 'length' },
    ]);
  });

  it('hashes words as little-endian bytes', () => {
    expect(hashWords([])).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(hashWords([0x04030201])).toBe(hashWords(Uint32Array.from([0x04030201])));
  });
});
