// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { parseExpr, parseInteger, parseOperand } from '../../../src/asm/operands.js';

const sym = (name: string, addend = 0) => ({ kind: 'symbol', name, addend }) as const;
const num = (value: number) => ({ kind: 'number', value }) as const;

describe('parseOperand', () => {
  it.each([
    ['$2', { kind: 'reg', number: 2 }],
    ['$sp', { kind: 'reg', number: 29 }],
    [' 4($sp) ', { kind: 'mem', base: 29, offset: num(4) }],
    ['0( $4 )', { kind: 'mem', base: 4, offset: num(0) }],
    ['($4)', { kind: 'mem', base: 4, offset: num(0) }],
    ['-32768($16)', { kind: 'mem', base: 16, offset: num(-32768) }],
    ['%lo(x)($at)', { kind: 'mem', base: 1, offset: { kind: 'reloc', fn: 'lo', inner: sym('x') } }],
    [
      '%gp_rel(localCommonVar+4)($gp)',
      {
        kind: 'mem',
        base: 28,
        offset: { kind: 'reloc', fn: 'gp_rel', inner: sym('localCommonVar', 4) },
      },
    ],
    ['ctlbuf($2)', { kind: 'mem', base: 2, offset: sym('ctlbuf') }],
    ['%hi(sym)', { kind: 'expr', expr: { kind: 'reloc', fn: 'hi', inner: sym('sym') } }],
    ['%hi(0x8000)', { kind: 'expr', expr: { kind: 'reloc', fn: 'hi', inner: num(0x8000) } }],
    ['sym+8', { kind: 'expr', expr: sym('sym', 8) }],
    ['sym + 0x10', { kind: 'expr', expr: sym('sym', 16) }],
    ['gPartyMemberSlain-1', { kind: 'expr', expr: sym('gPartyMemberSlain', -1) }],
    ['D_us_8017863C.4', { kind: 'expr', expr: sym('D_us_8017863C.4') }],
    ['$L23', { kind: 'expr', expr: sym('$L23') }],
    ['gcc2_compiled.', { kind: 'expr', expr: sym('gcc2_compiled.') }],
    ['-1840709632', { kind: 'expr', expr: num(-1840709632) }],
    ['0x0000007f', { kind: 'expr', expr: num(127) }],
    ['0xcccccccd', { kind: 'expr', expr: num(-858993459) }],
    ['.+12', { kind: 'expr', expr: { kind: 'dot', offset: 12 } }],
    ['.-4', { kind: 'expr', expr: { kind: 'dot', offset: -4 } }],
    ['.', { kind: 'expr', expr: { kind: 'dot', offset: 0 } }],
    ['1.00000000000000095367e10', { kind: 'float', value: 1.00000000000000095367e10 }],
    ['9.99999977648258209229e-3', { kind: 'float', value: 9.99999977648258209229e-3 }],
    ['2.5', { kind: 'float', value: 2.5 }],
    ['-.5', { kind: 'float', value: -0.5 }],
    ['1e3', { kind: 'float', value: 1000 }],
  ])('parses %s', (text, expected) => {
    expect(parseOperand(text)).toEqual({ ok: true, value: expected });
  });

  it.each([
    ['', 'invalid-operand', 'missing operand.'],
    ['$v9', 'invalid-operand', 'unknown register $v9.'],
    // A register in parentheses makes this a memory operand with a bad offset.
    ['%lo($2)', 'invalid-operand', 'cannot parse "%lo".'],
    ['%hi($2+4)', 'invalid-operand', 'register $2 cannot be used here.'],
    ['sym+', 'invalid-operand', 'cannot parse "sym+".'],
    ['x)', 'invalid-operand', 'cannot parse "x)".'],
    ['(sym)', 'invalid-operand', 'cannot parse "(sym)".'],
    ['.+x', 'invalid-operand', 'cannot parse ".+x".'],
    ['4294967296', 'immediate-out-of-range', '4294967296 does not fit in 32 bits.'],
    ['-2147483649', 'immediate-out-of-range', '-2147483649 does not fit in 32 bits.'],
    ['.+99999999999', 'immediate-out-of-range', '99999999999 does not fit in 32 bits.'],
    ['sym+99999999999', 'immediate-out-of-range', '99999999999 does not fit in 32 bits.'],
    ['%hi(99999999999)', 'immediate-out-of-range', '99999999999 does not fit in 32 bits.'],
    ['%hi(1+2)($4)', 'invalid-operand', 'cannot parse "1+2".'],
  ])('rejects %j', (text, code, message) => {
    expect(parseOperand(text)).toEqual({ ok: false, code, message });
  });
});

describe('parseInteger', () => {
  it('reads decimal and hexadecimal 32-bit values', () => {
    expect(parseInteger(' +5 ')).toEqual({ ok: true, value: 5 });
    expect(parseInteger('0010001')).toEqual({ ok: true, value: 10001 });
    expect(parseInteger('0xFFFFFFFF')).toEqual({ ok: true, value: -1 });
    expect(parseInteger('abc')).toEqual({
      ok: false,
      code: 'invalid-operand',
      message: '"abc" is not an integer.',
    });
  });
});

describe('parseExpr', () => {
  it('trims and accepts spaces inside relocation functions', () => {
    expect(parseExpr(' %hi( sym ) ')).toEqual({
      ok: true,
      value: { kind: 'reloc', fn: 'hi', inner: sym('sym') },
    });
  });
});
