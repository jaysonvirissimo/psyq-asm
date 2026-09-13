// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { assembleOk, errorsOf, sectionOf, src } from '../../helpers/assembly.js';
import { listing } from '../../helpers/listing.js';

const noreorder = (line: string): string => src('\t.set\tnoreorder', `\t${line}`);

describe('expansion: pseudo-instructions', () => {
  it.each([
    ['nop', ['sll $0,$0,0']],
    ['move $2,$6', ['addu $2,$6,$0']],
    ['negu $2,$3', ['subu $2,$0,$3']],
    ['negu $4', ['subu $4,$0,$4']],
    ['b .+8', ['bgez $0,.+8']],
    ['beqz $2,.+8', ['beq $2,$0,.+8']],
    ['bnez $2,.-4', ['bne $2,$0,.-4']],
    ['j $31', ['jr $31']],
    ['jal $2', ['jalr $2']],
    ['jal $3,$2', ['jalr $3,$2']],
    ['j 0x100', ['j 0x100']],
    ['beq $2,$3,.+8', ['beq $2,$3,.+8']],
    ['sll $2,$4,$5', ['sllv $2,$4,$5']],
    ['srl $2,$21,$17', ['srlv $2,$21,$17']],
    ['sra $2,$4,$5', ['srav $2,$4,$5']],
    ['sll $2,$4,3', ['sll $2,$4,3']],
  ])('%s', (line, expected) => {
    expect(listing(noreorder(line))).toEqual(expected);
  });

  it('marks expansion products with their macro and line', () => {
    const object = assembleOk(src('\tli\t$2,0x10001', '\tjr\t$31'));
    expect(sectionOf(object, '.text').provenance).toEqual([
      { line: 1, kind: 'macro', macro: 'li' },
      { line: 1, kind: 'macro', macro: 'li' },
      { line: 2, kind: 'instruction' },
      { line: 2, kind: 'branch-delay-nop', note: 'the delay slot of jr under .set reorder' },
    ]);
  });
});

describe('expansion: li', () => {
  it.each([
    ['li $2,0', ['addiu $2,$0,0x0']],
    ['li $2,-1', ['addiu $2,$0,-0x1']],
    ['li $2,32767', ['addiu $2,$0,0x7FFF']],
    ['li $2,-32768', ['addiu $2,$0,-0x8000']],
    ['li $12,36024 # 0x00008cb8', ['ori $12,$0,0x8CB8']],
    ['li $2,0xffff', ['ori $2,$0,0xFFFF']],
    ['li $2,65536', ['lui $2,0x1']],
    ['li $2,0x10001', ['lui $2,0x1', 'ori $2,$2,0x1']],
    ['li $2,-32769', ['lui $2,0xFFFF', 'ori $2,$2,0x7FFF']],
    ['li $2,-858993459 # 0xcccccccd', ['lui $2,0xCCCC', 'ori $2,$2,0xCCCD']],
    ['li $2,-1840709632 # 0x92490000', ['lui $2,0x9249']],
  ])('%s', (line, expected) => {
    expect(listing(src(`\t${line}`))).toEqual(expected);
  });
});

describe('expansion: floating-point constants', () => {
  it.each([
    ['li.s $4,1.00000000000000000000e+00', ['lui $4,0x3F80']],
    ['li.s $4,-1.23450000000000000000e+00', ['lui $4,0xBF9E', 'ori $4,$4,0x419']],
    ['li.s $2,0', ['lui $2,0x0']],
    ['li.s $5,2', ['lui $5,0x4000']],
    ['li.d $2,1.00000000000000000000e+00', ['addiu $2,$0,0x0', 'lui $3,0x3FF0']],
    ['li.d $6,4.29496729600000000000e9', ['addiu $6,$0,0x0', 'lui $7,0x41F0']],
    ['li.d $2,0.1', ['lui $2,0x9999', 'ori $2,$2,0x999A', 'lui $3,0x3FB9', 'ori $3,$3,0x9999']],
  ])('%s', (line, expected) => {
    expect(listing(src(`\t${line}`))).toEqual(expected);
  });
});

describe('expansion: la', () => {
  it('loads an address with %hi/%lo, or through $gp for small data', () => {
    const large = assembleOk(src('\tla\t$4,sym'));
    expect(sectionOf(large, '.text').relocations.map((r) => [r.kind, r.target])).toEqual([
      ['HI16', { kind: 'symbol', name: 'sym', addend: 0 }],
      ['LO16', { kind: 'symbol', name: 'sym', addend: 0 }],
    ]);
    expect(listing(src('\tla\t$4,sym'))).toEqual(['lui $4,0x0', 'addiu $4,$4,0x0']);

    const text = src('\t.comm\tsym,4', '\tla\t$4,sym+4');
    expect(listing(text, { gpSize: 8 })).toEqual(['addiu $4,$28,0x0']);
    expect(sectionOf(assembleOk(text, { gpSize: 8 }), '.text').relocations).toEqual([
      {
        offset: 0,
        kind: 'GPREL16',
        fieldMask: 0xffff,
        target: { kind: 'symbol', name: 'sym', addend: 4 },
        fieldValue: 0,
      },
    ]);
  });

  it('loads a numeric address like li', () => {
    expect(listing(src('\tla\t$2,0x12345'))).toEqual(['lui $2,0x1', 'ori $2,$2,0x2345']);
  });
});

describe('expansion: immediate operands', () => {
  it.each([
    ['addu $2,$4,1', ['addiu $2,$4,0x1']],
    ['addu $3,$3,-1', ['addiu $3,$3,-0x1']],
    ['addu $3,$sp,252', ['addiu $3,$29,0xFC']],
    ['addu $2,$2,40000', ['ori $1,$0,0x9C40', 'addu $2,$2,$1']],
    ['add $2,$2,5', ['addi $2,$2,0x5']],
    ['subu $sp,$sp,48', ['addiu $29,$29,-0x30']],
    ['subu $2,$2,-32768', ['addiu $2,$2,-0x8000']],
    ['sub $2,$2,5', ['addi $2,$2,-0x5']],
    ['and $2,$2,255', ['andi $2,$2,0xFF']],
    ['or $2,$2,-1', ['addiu $1,$0,-0x1', 'or $2,$2,$1']],
    ['xor $2,$2,0x8000', ['xori $2,$2,0x8000']],
    ['slt $2,$4,100', ['slti $2,$4,0x64']],
    ['sltu $3,$3,-23', ['sltiu $3,$3,-0x17']],
    ['slt $2,$5,9000', ['slti $2,$5,0x2328']],
    ['sltu $2,$4,40000', ['ori $1,$0,0x9C40', 'sltu $2,$4,$1']],
    ['addu $2,$3,$4', ['addu $2,$3,$4']],
  ])('%s', (line, expected) => {
    expect(listing(src(`\t${line}`))).toEqual(expected);
  });
});

describe('expansion: divide', () => {
  const signedTraps = [
    'bne $6,$0,.+12',
    'sll $0,$0,0',
    'break 7,0',
    'addiu $1,$0,-0x1',
    'bne $6,$1,.+20',
    'lui $1,0x8000',
    'bne $4,$1,.+12',
    'sll $0,$0,0',
    'break 6,0',
  ];

  it.each([
    ['div $2,$4,$6', ['div $4,$6', ...signedTraps, 'mflo $2']],
    ['rem $2,$4,$6', ['div $4,$6', ...signedTraps, 'mfhi $2']],
    ['divu $2,$4,$6', ['divu $4,$6', 'bne $6,$0,.+12', 'sll $0,$0,0', 'break 7,0', 'mflo $2']],
    ['remu $2,$4,$6', ['divu $4,$6', 'bne $6,$0,.+12', 'sll $0,$0,0', 'break 7,0', 'mfhi $2']],
    ['div $0,$4,$6', ['div $4,$6']],
    ['rem $zero,$4,$6', ['div $4,$6']],
    ['divu $4,$5', ['divu $4,$5']],
    ['rem $4,$5', ['div $4,$5']],
    ['remu $4,$5', ['divu $4,$5']],
  ])('%s', (line, expected) => {
    expect(listing(src(`\t${line}`))).toEqual(expected);
  });

  it('omits the traps under partialDivExpansion (ASPSX -0)', () => {
    expect(
      listing(src('\tdiv\t$2,$4,$6', '\tremu\t$3,$4,$5'), { partialDivExpansion: true }),
    ).toEqual(['div $4,$6', 'mflo $2', 'sll $0,$0,0', 'sll $0,$0,0', 'divu $4,$5', 'mfhi $3']);
  });
});

describe('expansion: loads and stores', () => {
  it.each([
    ['lh $2,32768($2)', ['lui $1,0x1', 'addu $1,$2,$1', 'lh $2,-0x8000($1)']],
    ['lh $2,-32769($2)', ['lui $1,0xFFFF', 'addu $1,$2,$1', 'lh $2,0x7FFF($1)']],
    ['sw $2,56200($4)', ['lui $1,0x1', 'addu $1,$4,$1', 'sw $2,-0x2478($1)']],
    ['lw $2,ctlbuf($2)', ['lui $1,0x0', 'addu $1,$1,$2', 'lw $2,0x0($1)']],
    ['sw $4,ctlbuf($2)', ['lui $1,0x0', 'addu $1,$1,$2', 'sw $4,0x0($1)']],
    ['sb $2,10000', ['sb $2,0x2710($0)']],
    ['lw $2,0x12345678', ['lui $2,0x1234', 'lw $2,0x5678($2)']],
    ['sb $2,-2147292186', ['lui $1,0x8003', 'sb $2,-0x141A($1)']],
    ['lw $2,g', ['lui $2,0x0', 'lw $2,0x0($2)']],
    ['sw $2,g+4', ['lui $1,0x0', 'sw $2,0x0($1)']],
    ['lwc2 $5,40000($4)', ['lui $1,0x1', 'addu $1,$4,$1', 'lwc2 $5,-0x63C0($1)']],
    ['swc2 $5,100', ['swc2 $5,0x64($0)']],
    ['lwc2 $5,0x12345', ['lui $1,0x1', 'lwc2 $5,0x2345($1)']],
    ['lw $2,%lo(sym)($3)', ['lw $2,0x0($3)']],
  ])('%s', (line, expected) => {
    expect(listing(src(`\t${line}`))).toEqual(expected);
  });

  it('addresses small data through $gp, carrying the addend in the relocation', () => {
    const text = src('\t.comm\tg,8', '\tlw\t$3,g', '\tsw\t$2,g+4');
    expect(listing(text, { gpSize: 8 })).toEqual(['lw $3,0x0($28)', 'sw $2,0x0($28)']);
    expect(
      sectionOf(assembleOk(text, { gpSize: 8 }), '.text').relocations.map((r) => [
        r.kind,
        r.target,
        r.fieldValue,
      ]),
    ).toEqual([
      ['GPREL16', { kind: 'symbol', name: 'g', addend: 0 }, 0],
      ['GPREL16', { kind: 'symbol', name: 'g', addend: 4 }, 0],
    ]);
  });
});

describe('expansion: break codes', () => {
  it('splits a single code as maspsx does and takes two codes as written', () => {
    expect(listing(src('\tbreak\t7', '\tbreak\t0x407', '\tbreak\t1,2', '\tbreak'))).toEqual([
      'break 0,7',
      'break 1,7',
      'break 1,2',
      'break',
    ]);
  });
});

describe('expansion: errors', () => {
  it.each([
    ['lwc2 $5,sym', 'unsupported-syntax', 'lwc2 with a symbol address is not supported.'],
    ['lw $2,.($3)', 'unsupported-syntax', 'lw: "." cannot be used as an address.'],
    [
      'lw $2,%hi(x)',
      'unsupported-syntax',
      'lw: the address must be offset(base), a symbol, or a number.',
    ],
    ['lw $2,$3', 'invalid-operand', 'lw operand 2 must be offset(base).'],
    ['lw 5,sym', 'invalid-operand', 'lw operand 1 must be a register.'],
    ['li $2', 'invalid-operand', 'li expects a register and an integer.'],
    ['li $2,sym', 'invalid-operand', 'li expects a register and an integer.'],
    ['la $2,%hi(x)', 'invalid-operand', 'la expects a register and a symbol or an address.'],
    ['la 5,x', 'invalid-operand', 'la expects a register and a symbol or an address.'],
    ['li.s $2,sym', 'invalid-operand', 'li.s expects a register and a floating-point constant.'],
    [
      'li.d $31,1.0',
      'invalid-operand',
      'li.d expects a register other than $31, which has no pair.',
    ],
    ['nop $2', 'invalid-operand', 'nop expects no operands.'],
    ['move $2', 'invalid-operand', 'move expects two registers.'],
    ['negu 5', 'invalid-operand', 'negu expects one or two registers.'],
    ['b $2', 'invalid-operand', 'b expects a branch target.'],
    ['beqz $2', 'invalid-operand', 'beqz expects a register and a branch target.'],
    ['j $2,$3', 'invalid-operand', 'j expects a target or a register.'],
    ['jal $2,$3,$4', 'invalid-operand', 'jal expects a target, a register, or two registers.'],
    ['div $2,$3,4', 'invalid-operand', 'div expects two or three registers.'],
    ['rem $2,5', 'invalid-operand', 'rem expects two or three registers.'],
    ['beq $2,5,.+8', 'unsupported-syntax', 'beq against an immediate is not supported.'],
    ['bgt $2,$3,.+8', 'unsupported-syntax', 'bgt is not emitted by cc1psx and is not supported.'],
    ['mul $2,$3,$4', 'unsupported-syntax', 'mul is not emitted by cc1psx and is not supported.'],
    ['addu $2,$3,sym', 'unsupported-syntax', 'addu: the immediate operand must be a number.'],
    ['break -1', 'immediate-out-of-range', 'break: the code -1 is outside 0 to 1048575.'],
    [
      'break 0x100000',
      'immediate-out-of-range',
      'break: the code 1048576 is outside 0 to 1048575.',
    ],
    ['tge $2', 'invalid-operand', 'tge operand 2 must be a register.'],
  ])('%s', (line, code, message) => {
    expect(errorsOf(src(`\t${line}`))).toEqual([{ line: 1, code, message }]);
  });
});
