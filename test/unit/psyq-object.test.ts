// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { readPsyqObject, wordsOf } from '../../scripts/psyq-object.mjs';

/** Assemble a synthetic LNK object from record descriptions. */
function object(...records: (number | string | number[])[][]): Uint8Array {
  const out: number[] = [0x4c, 0x4e, 0x4b, 2];
  for (const record of records) {
    for (const field of record) {
      if (typeof field === 'string') {
        out.push(field.length, ...new TextEncoder().encode(field));
      } else if (Array.isArray(field)) {
        out.push(...field);
      } else {
        out.push(field);
      }
    }
  }
  return Uint8Array.from(out);
}
const u16 = (n: number): number[] => [n & 0xff, (n >>> 8) & 0xff];
const u32 = (n: number): number[] => [...u16(n & 0xffff), ...u16(n >>> 16)];
const word = (n: number): number[] => u32(n);

describe('PsyQ object reader', () => {
  it('collects section bytes across records and skips symbols and debug records', () => {
    const bytes = object(
      [46, 7],
      [16, u16(1), u16(0), 4, '.text'],
      [16, u16(2), u16(0), 4, '.data'],
      [28, u16(1), 'probe.s'],
      [6, u16(1)],
      [2, u16(8), word(0x27bdffe8), word(0x3c020000)],
      // HI16 against (symbol 3 + 4)
      [10, 82, u16(4), 44, 2, u16(3), 0, u32(4)],
      [14, u16(3), 'g_counter'],
      [12, u16(4), u16(1), u32(0), 'probe'],
      [18, u16(1), u32(4), 'local'],
      [48, u16(5), u16(2), u32(4), 'bss_item'],
      [8, u32(4)],
      [6, u16(2)],
      [2, u16(4), word(0x12345678)],
      [6, u16(1)],
      [2, u16(4), word(0x03e00008)],
      [10, 84, u16(0), 46, 4, u16(2), 50, 12, u16(1), 22, u16(1)],
      [50, u16(0)],
      [52, u16(0), 1],
      [54, u16(0), u16(1)],
      [56, u16(0), u32(1)],
      [58, u16(0), u32(1), u16(1)],
      [60, u16(0)],
      [74, new Array<number>(32).fill(0), 'probe'],
      [76, new Array<number>(10).fill(0)],
      [78, new Array<number>(10).fill(0)],
      [80, new Array<number>(10).fill(0)],
      [82, new Array<number>(14).fill(0), 'def'],
      [84, new Array<number>(14).fill(0), u16(2), u16(3), u16(4), 'tag', 'def2'],
      [86, new Array<number>(40).fill(0), 'probe2'],
      [0],
      [0xff], // after END: ignored
    );
    const { sections } = readPsyqObject(bytes);
    const text = sections.get('.text');
    expect(wordsOf(text?.bytes ?? new Uint8Array())).toEqual([
      0x27bdffe8, 0x3c020000, 0, 0x03e00008,
    ]);
    expect(text?.patches).toEqual([
      { type: 82, offset: 4 },
      { type: 84, offset: 0 },
    ]);
    expect(wordsOf(sections.get('.data')?.bytes ?? new Uint8Array())).toEqual([0x12345678]);
  });

  it('rejects what it cannot read', () => {
    expect(() => readPsyqObject(Uint8Array.from([1, 2, 3, 4]))).toThrow('missing LNK signature');
    expect(() => readPsyqObject(Uint8Array.from([0x4c, 0x4e]))).toThrow('missing LNK signature');
    expect(() => readPsyqObject(Uint8Array.from([0x4c, 0x4e, 0x4b, 1]))).toThrow('version 1');
    expect(() => readPsyqObject(object([99]))).toThrow('unknown object record 99 at byte 0x4');
    expect(() => readPsyqObject(object([6, u16(9)]))).toThrow('SWITCH to unknown section 9');
    expect(() => readPsyqObject(object([2, u16(4), word(0)]))).toThrow('before any SWITCH');
    expect(() => readPsyqObject(object([8, u32(4)]))).toThrow('before any SWITCH');
    expect(() =>
      readPsyqObject(object([16, u16(1), u16(0), 4, '.text'], [6, u16(1)], [2, u16(8), word(0)])),
    ).toThrow('truncated object: BYTES payload');
    expect(() =>
      readPsyqObject(object([16, u16(1), u16(0), 4, '.text'], [6, u16(1)], [10, 82, u16(0), 7])),
    ).toThrow('unknown expression operator 7');
    expect(() => readPsyqObject(object([16, u16(1)]))).toThrow('truncated object');
    expect(() => readPsyqObject(object([14, u16(1), [5, 0x61]]))).toThrow(
      'truncated object: IMPORTED_SYMBOL name',
    );
    expect(() => wordsOf(new Uint8Array(3))).toThrow('3 bytes is not whole words');
  });
});
