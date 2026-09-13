// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../../../src/asm/diagnostics.js';
import { decodeString } from '../../../src/asm/directives.js';
import { parse } from '../../../src/asm/parser.js';

function interpret(text: string) {
  const diagnostics = new Diagnostics('t.s');
  const statements = parse(text, diagnostics);
  const first = statements[0];
  return {
    directive: first?.kind === 'directive' ? first.directive : undefined,
    diagnostics: diagnostics.sorted().map((d) => [d.severity, d.code, d.message]),
  };
}

describe('directives', () => {
  it.each([
    ['.text', { kind: 'section', name: '.text' }],
    ['.sbss', { kind: 'section', name: '.sbss' }],
    ['.section .rodata,"a"', { kind: 'section', name: '.rodata' }],
    ['.align 3', { kind: 'align', power: 3 }],
    ['.globl foo', { kind: 'globl', name: 'foo' }],
    ['.global foo', { kind: 'globl', name: 'foo' }],
    ['.extern g_counter, 4', { kind: 'extern', name: 'g_counter', size: 4 }],
    ['.extern g', { kind: 'extern', name: 'g' }],
    ['.comm g_arr,100', { kind: 'common', name: 'g_arr', size: 100, local: false }],
    ['.lcomm x,8,4', { kind: 'common', name: 'x', size: 8, local: true, align: 4 }],
    [
      '.word 7, $LC0, sym+4',
      {
        kind: 'values',
        unit: 4,
        values: [
          { kind: 'number', value: 7 },
          { kind: 'symbol', name: '$LC0', addend: 0 },
          { kind: 'symbol', name: 'sym', addend: 4 },
        ],
      },
    ],
    ['.half 1', { kind: 'values', unit: 2, values: [{ kind: 'number', value: 1 }] }],
    ['.short 2', { kind: 'values', unit: 2, values: [{ kind: 'number', value: 2 }] }],
    ['.byte 255', { kind: 'values', unit: 1, values: [{ kind: 'number', value: 255 }] }],
    [
      '.ascii "hello\\000"',
      { kind: 'bytes', bytes: Uint8Array.from([104, 101, 108, 108, 111, 0]) },
    ],
    ['.ascii "a", "b"', { kind: 'bytes', bytes: Uint8Array.from([97, 98]) }],
    ['.asciiz "x"', { kind: 'bytes', bytes: Uint8Array.from([120, 0]) }],
    ['.space 3', { kind: 'space', size: 3 }],
    ['.skip 2', { kind: 'space', size: 2 }],
    ['.ent f', { kind: 'ent', name: 'f' }],
    ['.end f', { kind: 'end', name: 'f' }],
    ['.end', { kind: 'end' }],
    ['.frame $sp,24,$31', { kind: 'frame', reg: 29, size: 24, returnReg: 31 }],
    ['.mask 0x80000000,-8', { kind: 'mask', bits: 0x80000000, offset: -8 }],
    ['.fmask 0x00000000,0', { kind: 'fmask', bits: 0, offset: 0 }],
    ['.set noreorder', { kind: 'set', option: 'noreorder' }],
    ['.file 1 "t01_arith.c"', { kind: 'ignored', transparent: false }],
    ['.loc 1 23', { kind: 'ignored', transparent: true }],
  ])('%s', (text, expected) => {
    expect(interpret(text)).toEqual({ directive: expected, diagnostics: [] });
  });

  it.each([
    ['.text foo', 'invalid-directive', '.text takes 0 arguments, not 1.'],
    ['.section', 'invalid-directive', '.section needs a section name.'],
    ['.align 16', 'immediate-out-of-range', '.align: 16 is outside 0 to 15.'],
    ['.align x', 'invalid-directive', '.align: "x" is not an integer.'],
    [
      '.align 99999999999',
      'immediate-out-of-range',
      '.align: 99999999999 does not fit in 32 bits.',
    ],
    ['.globl 1x', 'invalid-directive', '.globl: "1x" is not a symbol name.'],
    ['.comm x', 'invalid-directive', '.comm takes 2 to 3 arguments, not 1.'],
    ['.ent', 'invalid-directive', '.ent takes 1 argument, not 0.'],
    ['.word', 'invalid-directive', '.word needs at least one argument.'],
    ['.ascii', 'invalid-directive', '.ascii needs at least one argument.'],
    ['.word %%', 'invalid-directive', '.word: cannot parse "%%".'],
    ['.word 99999999999', 'immediate-out-of-range', '.word: 99999999999 does not fit in 32 bits.'],
    ['.half sym', 'unsupported-syntax', '.half can hold only numbers; use .word for sym.'],
    ['.ascii hello', 'invalid-directive', '.ascii: hello is not a quoted string.'],
    ['.ascii "', 'invalid-directive', '.ascii: " is not a quoted string.'],
    ['.frame x,1,$31', 'invalid-directive', '.frame: "x" is not a register.'],
    ['.include "x.inc"', 'unknown-directive', 'unknown directive .include.'],
  ])('rejects %s', (text, code, message) => {
    expect(interpret(text)).toEqual({
      directive: undefined,
      diagnostics: [['error', code, message]],
    });
  });

  it('warns about unknown .set options', () => {
    expect(interpret('.set bogus').diagnostics).toEqual([
      ['warning', 'ignored-directive', '.set bogus is not a known option and is ignored.'],
    ]);
  });

  it('warns once about debugging directives, keeping maspsx lookahead transparency', () => {
    const diagnostics = new Diagnostics('t.s');
    const statements = parse('.stabs "x"\n.def x; .scl 2; .endef\n.bend\n', diagnostics);
    expect(statements.map((s) => (s.kind === 'directive' ? s.directive : s))).toEqual([
      { kind: 'ignored', transparent: true },
      { kind: 'ignored', transparent: true },
      { kind: 'ignored', transparent: false },
      { kind: 'ignored', transparent: false },
      { kind: 'ignored', transparent: true },
    ]);
    expect(diagnostics.sorted()).toHaveLength(1);
  });
});

describe('decodeString', () => {
  it('decodes C escapes and encodes other characters as UTF-8', () => {
    expect(decodeString('\\n\\t\\r\\b\\f\\v\\\\\\"\\\'\\x41\\101\\q')).toEqual([
      10, 9, 13, 8, 12, 11, 92, 34, 39, 0x41, 0x41, 113,
    ]);
    expect(decodeString('\\1234é')).toEqual([83, 52, 0xc3, 0xa9]);
    expect(decodeString('\\274\\376')).toEqual([0xbc, 0xfe]);
  });
});
