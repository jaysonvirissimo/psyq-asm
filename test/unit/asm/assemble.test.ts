// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { assemble } from '../../../src/asm/assemble.js';
import { InvalidOptionsError } from '../../../src/errors.js';
import {
  assembleOk,
  errorsOf,
  sectionOf,
  src,
  warningsOf,
  wordsOf,
} from '../../helpers/assembly.js';

describe('assemble: native instructions', () => {
  const text = src(
    '\t.text',
    '\t.ent\tinc',
    'inc:',
    '\t.frame\t$sp,0,$31',
    '\t.mask\t0x00000000,0',
    '\t.fmask\t0x00000000,0',
    '\tlbu\t$3,4($4)',
    '\tlbu\t$2,5($4)',
    '\taddiu\t$3,$3,1',
    '\tsll\t$2,$2,3',
    '\t.set\tnoreorder',
    '\t.set\tnomacro',
    '\tjr\t$31',
    '\tsb\t$3,4($4)',
    '\t.set\tmacro',
    '\t.set\treorder',
    '\t.end\tinc',
  );

  it('encodes words, functions, symbols, and provenance', () => {
    const object = assembleOk(text);
    expect(object.info).toEqual({ aspsxVersion: '2.81', gpSize: 0, partialDivExpansion: false });
    expect(wordsOf(object)).toEqual([
      '0x90830004',
      '0x90820005',
      '0x24630001',
      '0x000210C0',
      '0x03E00008',
      '0xA0830004',
    ]);
    expect(object.functions).toEqual([
      {
        name: 'inc',
        section: '.text',
        start: 0,
        end: 6,
        frame: { reg: 29, size: 0, returnReg: 31 },
        mask: { bits: 0, offset: 0 },
        fmask: { bits: 0, offset: 0 },
      },
    ]);
    expect(object.symbols).toEqual([
      { name: 'inc', binding: 'local', section: '.text', offset: 0 },
    ]);
    expect(sectionOf(object, '.text').provenance).toEqual(
      [7, 8, 9, 10, 13, 14].map((line) => ({ line, kind: 'instruction' })),
    );
    expect(object.smallData).toEqual([]);
  });

  it('accepts bytes with CRLF line endings and gives the same object', () => {
    const bytes = new TextEncoder().encode(text.replaceAll('\n', '\r\n'));
    const result = assemble(bytes, { gpSize: 0 });
    expect(result).toEqual({ success: true, object: assembleOk(text), diagnostics: [] });
  });

  it('fills omitted optional operands', () => {
    const text = src('\t.set\tnoreorder', '\tjalr\t$2', '\tsyscall', '\tbreak', '\ttge\t$1,$2');
    expect(wordsOf(assembleOk(text))).toEqual([
      '0x0040F809',
      '0x0000000C',
      '0x0000000D',
      '0x00220030',
    ]);
  });

  it('encodes coprocessor moves, GTE loads, and raw GTE commands', () => {
    expect(
      wordsOf(
        assembleOk(
          src(
            '#APP',
            '\tcfc2    $4, $8',
            '\tlwc2 $5, 4( $4 );cop2 0x180001',
            '#NO_APP',
            '\tmfc0\t$2,$12',
          ),
        ),
      ),
    ).toEqual(['0x48444000', '0x00000000', '0xC8850004', '0x4A180001', '0x40026000']);
  });

  it('assembles an empty source', () => {
    expect(assembleOk('')).toEqual({
      info: { aspsxVersion: '2.81', gpSize: 0, partialDivExpansion: false },
      sections: [],
      symbols: [],
      functions: [],
      smallData: [],
    });
  });

  it('throws only for caller mistakes', () => {
    expect(() => assemble(5 as unknown as string, { gpSize: 0 })).toThrow(InvalidOptionsError);
    expect(() => assemble('', {} as never)).toThrow(InvalidOptionsError);
  });
});

describe('assemble: branches and labels', () => {
  it('computes displacements to labels and to "."', () => {
    const object = assembleOk(
      src(
        '\t.set\tnoreorder',
        '$L1:',
        '\taddiu\t$2,$2,-1',
        '\tbne\t$2,$0,$L1',
        '\tsll\t$0,$0,0',
        '\tbeq\t$0,$0,$L2',
        '\tsll\t$0,$0,0',
        '$L2:',
        '\tjr\t$31',
        '\tbeq\t$0,$0,.+8',
      ),
    );
    expect(wordsOf(object)).toEqual([
      '0x2442FFFF',
      '0x1440FFFE',
      '0x00000000',
      '0x10000001',
      '0x00000000',
      '0x03E00008',
      '0x10000001',
    ]);
    expect(object.symbols).toEqual([]);
  });
});

describe('assemble: warnings', () => {
  it('reports misplaced function bookkeeping but still succeeds', () => {
    expect(
      warningsOf(
        src(
          '\t.frame\t$sp,0,$31',
          '\t.mask\t0,0',
          '\t.end\tf',
          '\t.ent\tf',
          '\t.ent\tg',
          '\tjr\t$31',
          '\t.end\tg',
          '\t.end',
          '\t.ent\th',
          '\t.end\tother',
          '\t.ent\tlast',
        ),
      ),
    ).toEqual([
      { line: 1, code: 'function-mismatch', message: '.frame appears outside a function.' },
      { line: 2, code: 'function-mismatch', message: '.mask appears outside a function.' },
      { line: 3, code: 'function-mismatch', message: '.end f does not close an open .ent.' },
      { line: 5, code: 'function-mismatch', message: '.ent g appears before .end f.' },
      { line: 8, code: 'function-mismatch', message: '.end does not close an open .ent.' },
      { line: 10, code: 'function-mismatch', message: '.end other does not close an open .ent.' },
      { line: 11, code: 'function-mismatch', message: '.ent last has no matching .end.' },
    ]);
  });

  it('records the function that .end closes after a stray .ent', () => {
    const object = assembleOk(src('\t.ent\tf', '\t.ent\tg', '\tjr\t$31', '\t.end\tg'));
    // The jr's delay-slot nop belongs to g as well.
    expect(object.functions).toEqual([{ name: 'g', section: '.text', start: 0, end: 2 }]);
  });
});

describe('assemble: errors', () => {
  it.each([
    ['frobnicate $2', 'unknown-mnemonic', 'unknown mnemonic frobnicate.'],
    [
      '\taddiu $2,$2,40000',
      'immediate-out-of-range',
      'addiu: 40000 does not fit in a signed 16-bit field.',
    ],
    [
      '\tori $2,$2,-1',
      'immediate-out-of-range',
      'ori: -1 does not fit in an unsigned 16-bit field.',
    ],
    [
      '\taddiu $2,$2,sym',
      'unsupported-syntax',
      'addiu: sym needs %hi, %lo, or %gp_rel in a 16-bit field.',
    ],
    ['\taddiu $2,$2,.', 'unsupported-syntax', 'addiu: "." is valid only as a branch target.'],
    ['\taddiu $2,$0,%gp_rel(5)', 'unsupported-syntax', 'addiu: %gp_rel needs a symbol.'],
    ['\tlw $2,$3', 'invalid-operand', 'lw operand 2 must be offset(base).'],
    ['\taddu $2,$3', 'invalid-operand', 'addu takes 3 operands, not 2.'],
    ['\tjr', 'invalid-operand', 'jr takes 1 operand, not 0.'],
    ['\tjr 5', 'invalid-operand', 'jr operand 1 must be a register.'],
    [
      '\tmtc2 $2,sym',
      'invalid-operand',
      'mtc2 operand 2 must be a coprocessor register such as $8.',
    ],
    ['\tbeq $2,$3,$2', 'invalid-operand', 'beq operand 3 must be a branch target.'],
    ['\tsll $2,$2,0($3)', 'invalid-operand', 'sll operand 3 must be an immediate value.'],
    ['\tjal sym,$3', 'invalid-operand', 'jal expects a target, a register, or two registers.'],
    ['\tjal 0($4)', 'invalid-operand', 'jal operand 1 must be a jump target.'],
    [
      '\taddiu $2,$2,1.5',
      'invalid-operand',
      'addiu operand 3: a floating-point constant is valid only for li.s and li.d.',
    ],
    ['\tbeq $0,$0,$Lnope', 'undefined-label', 'beq: $Lnope is not defined.'],
    ['\tbeq $0,$0,5', 'unsupported-syntax', 'beq: a branch target must be a label.'],
    ['\tbeq $0,$0,.+2', 'unsupported-syntax', 'beq: a branch target must be word-aligned.'],
    ['\tsll $2,$2,32', 'immediate-out-of-range', 'sll: the shift amount 32 is outside 0 to 31.'],
    ['\tsll $2,$2,x', 'unsupported-syntax', 'sll: the shift amount must be a number.'],
    [
      '\tbreak 0x100000',
      'immediate-out-of-range',
      'break: the code 1048576 is outside 0 to 1048575.',
    ],
    ['\ttge $2,$3,1024', 'immediate-out-of-range', 'tge: the code 1024 is outside 0 to 1023.'],
    [
      '\tcop2 0x2000000',
      'immediate-out-of-range',
      'cop2: the command 33554432 is outside 0 to 33554431.',
    ],
    ['\tj 5', 'unsupported-syntax', 'j: a jump target must be word-aligned.'],
    ['\tjal %hi(x)', 'unsupported-syntax', 'jal: a jump target must be a symbol or an address.'],
    ['\tjal $Lmissing', 'undefined-label', 'jal: $Lmissing is not defined.'],
    ['\tlw $2,%lo($Lmissing)($3)', 'undefined-label', 'lw: $Lmissing is not defined.'],
  ])('%s', (line, code, message) => {
    expect(errorsOf(src(line))).toEqual([{ line: 1, code, message }]);
  });

  it('rejects branches to other sections and out of range', () => {
    expect(errorsOf(src('\t.data', 'x:', '\t.text', '\tbeq\t$0,$0,x'))).toEqual([
      { line: 4, code: 'unsupported-syntax', message: 'beq: x is in .data, not .text.' },
    ]);
    expect(errorsOf(src('\tbeq\t$0,$0,$Lfar', '\t.space\t0x20000', '$Lfar:'))).toEqual([
      {
        line: 1,
        code: 'branch-out-of-range',
        message: 'beq: the target is 32769 instructions away.',
      },
    ]);
  });

  it('rejects bad data and instructions outside code', () => {
    expect(
      errorsOf(
        src(
          '\t.data',
          '\t.half\t70000',
          '\t.byte\t-129',
          '\t.word\t%hi(x)',
          '\t.word\t$Lnone',
          '\taddu\t$2,$3,$4',
        ),
      ),
    ).toEqual([
      { line: 2, code: 'immediate-out-of-range', message: '70000 does not fit in 16 bits.' },
      { line: 3, code: 'immediate-out-of-range', message: '-129 does not fit in 8 bits.' },
      {
        line: 4,
        code: 'unsupported-syntax',
        message: 'data values must be numbers, symbols, or labels.',
      },
      { line: 5, code: 'undefined-label', message: '$Lnone is not defined.' },
      {
        line: 6,
        code: 'unsupported-syntax',
        message: 'instructions belong in a code section, not .data.',
      },
    ]);
  });

  it('sorts diagnostics by line and names the file', () => {
    const result = assemble(src('\tbeq\t$0,$0,$Lx', '\t.bogus'), {
      gpSize: 0,
      filename: 'codec.s',
    });
    expect(result.diagnostics.map((d) => [d.file, d.line, d.column, d.code])).toEqual([
      ['codec.s', 1, 2, 'undefined-label'],
      ['codec.s', 2, 2, 'unknown-directive'],
    ]);
  });
});
