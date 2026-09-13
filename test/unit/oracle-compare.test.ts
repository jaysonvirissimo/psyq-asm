// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import {
  SUMMARY_KEYS,
  compareWords,
  hashWords,
  readPsxExe,
  selectUnits,
  summarize,
  wordsAt,
  writePsxExe,
} from '../../scripts/oracle-compare.mjs';

describe('oracle comparison', () => {
  it('reads words from a PS-X EXE by address', () => {
    const exe = readPsxExe(writePsxExe(0x80010000, [0x27bdffe8, 0x0c000000, 0x03e00008]));
    expect(exe.textAddress).toBe(0x80010000);
    expect([...wordsAt(exe, 0x80010004, 2)]).toEqual([0x0c000000, 0x03e00008]);
    expect(() => wordsAt(exe, 0x80010008, 2)).toThrow('outside the executable text');
    expect(() => wordsAt(exe, 0x8000fffc, 1)).toThrow('outside the executable text');
    expect(() => wordsAt(exe, 0x80010002, 1)).toThrow('outside the executable text');
    expect(() => readPsxExe(new Uint8Array(16))).toThrow('not a PS-X EXE file');
    expect(() => readPsxExe(new Uint8Array(0x900))).toThrow('not a PS-X EXE file');
  });

  it('separates word mismatches from relocation-field differences', () => {
    const relocations = [{ offset: 4, fieldMask: 0x03ffffff }];
    expect(
      compareWords({ words: [0x27bdffe8, 0x0c000000], relocations }, [0x27bdffe8, 0x0c004567]),
    ).toEqual({ equal: true, compared: 2, wordMismatches: [], fieldMismatches: [1] });
    expect(
      compareWords({ words: [0x27bdffe8, 0x08000000], relocations }, [0x27bdfff0, 0x0c000000]),
    ).toEqual({
      equal: false,
      compared: 2,
      wordMismatches: [
        { index: 0, kind: 'instruction' },
        { index: 1, kind: 'instruction' },
      ],
      fieldMismatches: [],
    });
    expect(compareWords({ words: [1], relocations: [] }, [1, 2]).wordMismatches).toEqual([
      { index: 1, kind: 'length' },
    ]);
    expect(compareWords({ words: [1, 2], relocations: [] }, [1]).wordMismatches).toEqual([
      { index: 1, kind: 'length' },
    ]);
  });

  it('selects whole units by source and single functions by name', () => {
    const units = [
      { source: 'src/a.c', functions: [{ name: 'alpha' }, { name: 'beta' }] },
      { source: 'src/b.c', functions: [{ name: 'gamma' }, { name: 'a.c' }] },
    ];
    expect(selectUnits(units)).toEqual(units);
    expect(selectUnits(units, [])).toEqual(units);
    expect(selectUnits(units, ['src/a*'])).toEqual([units[0]]);
    expect(selectUnits(units, ['?amma', 'beta'])).toEqual([
      { source: 'src/a.c', functions: [{ name: 'beta' }] },
      { source: 'src/b.c', functions: [{ name: 'gamma' }] },
    ]);
    // Dots are literal, not "any character".
    expect(selectUnits(units, ['src/bxc'])).toEqual([]);
  });

  it('summarizes a report as counts and provenance only', () => {
    const summary = summarize(
      {
        gpSize: 8,
        results: [
          { unit: 'x.c', function: 'x', equal: true },
          { unit: 'x.c', function: 'y', equal: false },
        ],
      },
      { psyqAsmCommit: 'abc', psyqWasmVersion: '1.0.0', manifestSha256: 'def', date: '2026-01-02' },
    );
    expect(Object.keys(summary)).toEqual([...SUMMARY_KEYS]);
    expect(summary).toEqual({
      psyqAsmCommit: 'abc',
      psyqWasmVersion: '1.0.0',
      manifestSha256: 'def',
      gpSize: 8,
      functions: { total: 2, passed: 1 },
      date: '2026-01-02',
    });
    expect(JSON.stringify(summary)).not.toMatch(/x\.c|"x"|"y"/);
  });

  it('hashes words as little-endian bytes', () => {
    expect(hashWords([])).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(hashWords([0x04030201])).toBe(hashWords(Uint32Array.from([0x04030201])));
  });
});
