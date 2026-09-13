// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { lex, splitTopLevel, stripComment } from '../../../src/asm/lexer.js';

describe('lex', () => {
  it('drops comments and blank lines, keeping line and column', () => {
    expect(lex('\tlw\t$2,0($4)  # load\r\n#nop\r\n\r\n\t.set\tnoreorder\r\n')).toEqual([
      { line: 1, column: 2, text: 'lw\t$2,0($4)', inlineAsm: false },
      { line: 4, column: 2, text: '.set\tnoreorder', inlineAsm: false },
    ]);
  });

  it('splits inline assembly statements and flags #APP regions', () => {
    const text = ' #APP\n\tlwc2 $0, 0( $4 );lwc2 $1, 4( $4 )\n #NO_APP\naddu $2,$3,$4';
    expect(lex(text)).toEqual([
      { line: 2, column: 2, text: 'lwc2 $0, 0( $4 )', inlineAsm: true },
      { line: 2, column: 19, text: 'lwc2 $1, 4( $4 )', inlineAsm: true },
      { line: 4, column: 1, text: 'addu $2,$3,$4', inlineAsm: false },
    ]);
  });
});

describe('stripComment', () => {
  it('leaves # inside strings alone', () => {
    expect(stripComment('.ascii "a#b" # c')).toBe('.ascii "a#b" ');
    expect(stripComment('.ascii "a\\"#" #x')).toBe('.ascii "a\\"#" ');
    expect(stripComment('jr $31')).toBe('jr $31');
  });
});

describe('splitTopLevel', () => {
  it('splits outside parentheses and quotes', () => {
    expect(splitTopLevel('%lo(a,b),"x,y",c', ',')).toEqual([
      { text: '%lo(a,b)', start: 0 },
      { text: '"x,y"', start: 9 },
      { text: 'c', start: 15 },
    ]);
    expect(splitTopLevel('a),b', ',').map((p) => p.text)).toEqual(['a)', 'b']);
    expect(splitTopLevel('"a\\",b"', ',').map((p) => p.text)).toEqual(['"a\\",b"']);
  });
});
