// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../../../src/asm/diagnostics.js';
import { parse } from '../../../src/asm/parser.js';

function parsed(text: string) {
  const diagnostics = new Diagnostics('t.s');
  return { statements: parse(text, diagnostics), diagnostics: diagnostics.sorted() };
}

describe('parse', () => {
  it('reads labels, directives, and instructions with positions', () => {
    const { statements, diagnostics } = parsed(
      'gcc2_compiled.:\n$L2: lw $2,0($4)\na: b: .word 1\n\tnop\n',
    );
    expect(diagnostics).toEqual([]);
    expect(statements).toEqual([
      { kind: 'label', name: 'gcc2_compiled.', line: 1, column: 1 },
      { kind: 'label', name: '$L2', line: 2, column: 1 },
      {
        kind: 'instruction',
        mnemonic: 'lw',
        operands: [
          { kind: 'reg', number: 2 },
          { kind: 'mem', base: 4, offset: { kind: 'number', value: 0 } },
        ],
        inlineAsm: false,
        line: 2,
        column: 6,
      },
      { kind: 'label', name: 'a', line: 3, column: 1 },
      { kind: 'label', name: 'b', line: 3, column: 4 },
      {
        kind: 'directive',
        name: '.word',
        directive: { kind: 'values', unit: 4, values: [{ kind: 'number', value: 1 }] },
        line: 3,
        column: 7,
      },
      { kind: 'instruction', mnemonic: 'nop', operands: [], inlineAsm: false, line: 4, column: 2 },
    ]);
  });

  it('accepts li.s and li.d mnemonics and inline assembly', () => {
    const { statements } = parsed('#APP\n\tli.s $5,2.5\n#NO_APP\n');
    expect(statements).toEqual([
      {
        kind: 'instruction',
        mnemonic: 'li.s',
        operands: [
          { kind: 'reg', number: 5 },
          { kind: 'float', value: 2.5 },
        ],
        inlineAsm: true,
        line: 2,
        column: 2,
      },
    ]);
  });

  it('reports what it cannot parse and keeps going', () => {
    const { statements, diagnostics } = parsed(
      'LW $2,0($4)\n\tlw $2,$v9\n\taddiu $2,$2,4294967296\n\tjr $31\n',
    );
    expect(diagnostics.map((d) => [d.line, d.column, d.code, d.message])).toEqual([
      [1, 1, 'unknown-mnemonic', '"LW" is not a mnemonic.'],
      [2, 2, 'invalid-operand', 'lw: unknown register $v9.'],
      [3, 2, 'immediate-out-of-range', 'addiu: 4294967296 does not fit in 32 bits.'],
    ]);
    expect(statements).toHaveLength(1);
  });
});
