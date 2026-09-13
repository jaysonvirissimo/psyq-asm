// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { dataOf, readPsyqObject, wordsOf } from '../../scripts/psyq-object.mjs';

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

const SYNTHETIC = object(
  [46, 7],
  [16, u16(1), u16(0), 4, '.text'],
  [16, u16(2), u16(0), 4, '.data'],
  [16, u16(3), u16(0), 4, '.bss'],
  [28, u16(1), 'probe.s'],
  [6, u16(1)],
  [2, u16(8), word(0x27bdffe8), word(0x3c020000)],
  // HI16 at 4 against symbol 3 (declared later) + 4
  [10, 82, u16(4), 44, 2, u16(3), 0, u32(4)],
  [14, u16(3), 'g_counter'],
  [12, u16(4), u16(1), u32(0), 'probe'],
  [18, u16(2), u32(4), 'local'],
  [48, u16(5), u16(3), u32(4), 'bss_item'],
  [8, u32(4)],
  [6, u16(2)],
  [2, u16(4), word(0x12345678)],
  // WORD32 at .data 0 = base(.text) + 8
  [10, 16, u16(0), 44, 0, u32(8), 4, u16(1)],
  [6, u16(1)],
  // This BYTES record starts at .text 12 (8 bytes and 4 zeroes before it).
  [2, u16(4), word(0x03e00008)],
  [10, 84, u16(0), 46, 4, u16(2), 50, 12, u16(1), 22, u16(1)],
  [10, 74, u16(0), 0, u32(0x100)],
  [10, 100, u16(0), 44, 2, u16(3), 4, u16(1)],
  [6, u16(3)],
  [8, u32(6)],
  [50, u16(0)],
  [52, u16(0), 1],
  [54, u16(0), u16(1)],
  [56, u16(0), u32(1)],
  [58, u16(0), u32(1), u16(1)],
  [60, u16(0)],
  [74, new Array<number>(28).fill(0), 'probe'],
  [76, new Array<number>(10).fill(0)],
  [78, new Array<number>(10).fill(0)],
  [80, new Array<number>(10).fill(0)],
  [82, new Array<number>(14).fill(0), 'def'],
  [84, new Array<number>(14).fill(0), u16(2), u32(3), u32(4), 'tag', 'def2'],
  [86, new Array<number>(36).fill(0), 'probe2'],
  [0],
  [0xff], // after END: ignored
);

describe('PsyQ object reader', () => {
  it('collects section bytes, relocation targets, and symbols', () => {
    const { sections, symbols } = readPsyqObject(SYNTHETIC);
    const text = sections.get('.text');
    expect(wordsOf(text?.bytes ?? new Uint8Array())).toEqual([
      0x27bdffe8, 0x3c020000, 0, 0x03e00008,
    ]);
    expect(text?.size).toBe(16);
    expect(text?.patches).toEqual([
      { type: 82, kind: 'HI16', offset: 4, target: { symbol: 'g_counter', addend: 4 } },
      { type: 84, kind: 'LO16', offset: 12, target: { unsupported: 'sub' } },
      { type: 74, kind: 'MIPS26', offset: 12, target: { value: 256 } },
      { type: 100, kind: 'GPREL16', offset: 12, target: { unsupported: 'add' } },
    ]);
    expect(sections.get('.data')?.patches).toEqual([
      { type: 16, kind: 'WORD32', offset: 0, target: { section: '.text', offset: 8 } },
    ]);
    expect(wordsOf(sections.get('.data')?.bytes ?? new Uint8Array())).toEqual([0x12345678]);
    expect(sections.get('.bss')?.size).toBe(6);
    expect(symbols).toEqual({
      exports: [{ name: 'probe', section: '.text', offset: 0 }],
      locals: [{ name: 'local', section: '.data', offset: 4 }],
      commons: [{ name: 'bss_item', section: '.bss', size: 4 }],
      imports: [{ name: 'g_counter' }],
    });
  });

  it('describes an object for comparison', () => {
    expect(dataOf(readPsyqObject(SYNTHETIC))).toEqual({
      sections: { '.bss': 6, '.data': 4 },
      relocations: [
        { section: '.data', offset: 0, kind: 'WORD32', target: { section: '.text', offset: 8 } },
        { section: '.text', offset: 4, kind: 'HI16', target: { symbol: 'g_counter', addend: 4 } },
        { section: '.text', offset: 12, kind: 'LO16', target: { unsupported: 'sub' } },
        { section: '.text', offset: 12, kind: 'MIPS26', target: { value: 256 } },
        { section: '.text', offset: 12, kind: 'GPREL16', target: { unsupported: 'add' } },
      ],
      symbols: {
        exports: [{ name: 'probe', section: '.text', offset: 0 }],
        commons: [{ name: 'bss_item', section: '.bss', size: 4 }],
        locals: [{ name: 'local', section: '.data', offset: 4 }],
      },
    });
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
