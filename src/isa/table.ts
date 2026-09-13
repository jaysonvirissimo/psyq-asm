// SPDX-License-Identifier: MIT
/**
 * THE instruction table. One row per mnemonic drives the encoder, the decoder,
 * the formatter, operand validation in the assembler, and the register
 * read/write sets the hazard pass reasons about. Nothing else in the package
 * knows an opcode.
 */
import type { HazardClass, InstructionFormat } from '../public-types.js';
import type { CopSlot, Slot } from './fields.js';

/** A register named by the field holding it, or the implicit return address. */
export type RegisterRef = 'rs' | 'rt' | 'rd' | 31;

export interface IsaRow {
  readonly mnemonic: string;
  readonly format: InstructionFormat;
  /** Bits that select this row, and their required value. */
  readonly mask: number;
  readonly value: number;
  /** Operand slots in assembly order. */
  readonly syntax: readonly Slot[];
  /** General-purpose registers the instruction reads (architecturally). */
  readonly reads: readonly RegisterRef[];
  /** General-purpose registers the instruction writes. */
  readonly writes: readonly RegisterRef[];
  /**
   * Registers that count as read for the load-delay rule, when they differ from
   * `reads`. See the `lwl`/`lwr` rows.
   */
  readonly hazardReads?: readonly RegisterRef[];
  readonly hazard: HazardClass;
  /**
   * `leading-ra`: the first operand may be omitted and defaults to `$31`
   * (`jalr rs`). `trailing-zero`: the last operand may be omitted and defaults
   * to 0 (`syscall`, `break`, `tge`).
   */
  readonly optional?: 'leading-ra' | 'trailing-zero';
}

type Refs = readonly RegisterRef[];

interface RowOptions {
  readonly hazard?: HazardClass;
  readonly hazardReads?: Refs;
  readonly optional?: IsaRow['optional'];
}

function row<const M extends string>(
  mnemonic: M,
  format: InstructionFormat,
  mask: number,
  value: number,
  syntax: readonly Slot[],
  reads: Refs,
  writes: Refs,
  options: RowOptions = {},
): IsaRow & { readonly mnemonic: M } {
  return Object.freeze({
    mnemonic,
    format,
    mask,
    value,
    syntax,
    reads,
    writes,
    hazard: options.hazard ?? 'none',
    ...(options.hazardReads === undefined ? {} : { hazardReads: options.hazardReads }),
    ...(options.optional === undefined ? {} : { optional: options.optional }),
  });
}

/** SPECIAL (op 0x00), selected by fn. */
function special<const M extends string>(
  mnemonic: M,
  fn: number,
  syntax: readonly Slot[],
  reads: Refs,
  writes: Refs,
  options?: RowOptions,
): IsaRow & { readonly mnemonic: M } {
  return row(mnemonic, 'R', 0xfc00003f, fn, syntax, reads, writes, options);
}

/** REGIMM (op 0x01), selected by rt. */
function regimm<const M extends string>(
  mnemonic: M,
  rt: number,
  writes: Refs,
): IsaRow & { readonly mnemonic: M } {
  return row(
    mnemonic,
    'I',
    0xfc1f0000,
    (0x04000000 | (rt << 16)) >>> 0,
    ['rs', 'branch'],
    ['rs'],
    writes,
    {
      hazard: 'branch',
    },
  );
}

/** A primary opcode. */
function primary<const M extends string>(
  mnemonic: M,
  op: number,
  format: InstructionFormat,
  syntax: readonly Slot[],
  reads: Refs,
  writes: Refs,
  options?: RowOptions,
): IsaRow & { readonly mnemonic: M } {
  return row(mnemonic, format, 0xfc000000, (op << 26) >>> 0, syntax, reads, writes, options);
}

/** A coprocessor register move, selected by op and rs. */
function copMove<const M extends string>(
  mnemonic: M,
  unit: 0 | 2,
  rs: number,
  slot: CopSlot,
  direction: 'from' | 'to',
): IsaRow & { readonly mnemonic: M } {
  const value = (((0x10 | unit) << 26) | (rs << 21)) >>> 0;
  return row(
    mnemonic,
    'COP',
    0xffe00000,
    value,
    ['rt', slot],
    direction === 'to' ? ['rt'] : [],
    direction === 'from' ? ['rt'] : [],
    { hazard: direction === 'from' ? 'cop-from' : 'cop-to' },
  );
}

const R3 = ['rd', 'rs', 'rt'] as const;
const SHIFT = ['rd', 'rt', 'sa'] as const;
const SHIFTV = ['rd', 'rt', 'rs'] as const;
const IMM_S = ['rt', 'rs', 'imm16s'] as const;
const IMM_U = ['rt', 'rs', 'imm16u'] as const;
const MEM = ['rt', 'mem'] as const;

export const ISA_ROWS = [
  // SPECIAL
  special('sll', 0x00, SHIFT, ['rt'], ['rd']),
  special('srl', 0x02, SHIFT, ['rt'], ['rd']),
  special('sra', 0x03, SHIFT, ['rt'], ['rd']),
  special('sllv', 0x04, SHIFTV, ['rt', 'rs'], ['rd']),
  special('srlv', 0x06, SHIFTV, ['rt', 'rs'], ['rd']),
  special('srav', 0x07, SHIFTV, ['rt', 'rs'], ['rd']),
  special('jr', 0x08, ['rs'], ['rs'], [], { hazard: 'jump' }),
  special('jalr', 0x09, ['rd', 'rs'], ['rs'], ['rd'], { hazard: 'jump', optional: 'leading-ra' }),
  special('syscall', 0x0c, ['code20'], [], [], { optional: 'trailing-zero' }),
  special('break', 0x0d, ['break20'], [], [], { optional: 'trailing-zero' }),
  special('mfhi', 0x10, ['rd'], [], ['rd'], { hazard: 'mflo' }),
  special('mthi', 0x11, ['rs'], ['rs'], [], { hazard: 'mtlo' }),
  special('mflo', 0x12, ['rd'], [], ['rd'], { hazard: 'mflo' }),
  special('mtlo', 0x13, ['rs'], ['rs'], [], { hazard: 'mtlo' }),
  special('mult', 0x18, ['rs', 'rt'], ['rs', 'rt'], [], { hazard: 'mult' }),
  special('multu', 0x19, ['rs', 'rt'], ['rs', 'rt'], [], { hazard: 'mult' }),
  special('div', 0x1a, ['rs', 'rt'], ['rs', 'rt'], [], { hazard: 'div' }),
  special('divu', 0x1b, ['rs', 'rt'], ['rs', 'rt'], [], { hazard: 'div' }),
  special('add', 0x20, R3, ['rs', 'rt'], ['rd']),
  special('addu', 0x21, R3, ['rs', 'rt'], ['rd']),
  special('sub', 0x22, R3, ['rs', 'rt'], ['rd']),
  special('subu', 0x23, R3, ['rs', 'rt'], ['rd']),
  special('and', 0x24, R3, ['rs', 'rt'], ['rd']),
  special('or', 0x25, R3, ['rs', 'rt'], ['rd']),
  special('xor', 0x26, R3, ['rs', 'rt'], ['rd']),
  special('nor', 0x27, R3, ['rs', 'rt'], ['rd']),
  special('slt', 0x2a, R3, ['rs', 'rt'], ['rd']),
  special('sltu', 0x2b, R3, ['rs', 'rt'], ['rd']),
  // Not emitted by the compiler or by ASPSX 2.81; present so older divide
  // expansions (`tge $zero,$zero,93`) decode.
  special('tge', 0x30, ['rs', 'rt', 'code10'], ['rs', 'rt'], [], { optional: 'trailing-zero' }),

  // REGIMM
  regimm('bltz', 0x00, []),
  regimm('bgez', 0x01, []),
  regimm('bltzal', 0x10, [31]),
  regimm('bgezal', 0x11, [31]),

  // Primary opcodes
  primary('j', 0x02, 'J', ['target'], [], [], { hazard: 'jump' }),
  primary('jal', 0x03, 'J', ['target'], [], [31], { hazard: 'jump' }),
  primary('beq', 0x04, 'I', ['rs', 'rt', 'branch'], ['rs', 'rt'], [], { hazard: 'branch' }),
  primary('bne', 0x05, 'I', ['rs', 'rt', 'branch'], ['rs', 'rt'], [], { hazard: 'branch' }),
  primary('blez', 0x06, 'I', ['rs', 'branch'], ['rs'], [], { hazard: 'branch' }),
  primary('bgtz', 0x07, 'I', ['rs', 'branch'], ['rs'], [], { hazard: 'branch' }),
  primary('addi', 0x08, 'I', IMM_S, ['rs'], ['rt']),
  primary('addiu', 0x09, 'I', IMM_S, ['rs'], ['rt']),
  primary('slti', 0x0a, 'I', IMM_S, ['rs'], ['rt']),
  primary('sltiu', 0x0b, 'I', IMM_S, ['rs'], ['rt']),
  primary('andi', 0x0c, 'I', IMM_U, ['rs'], ['rt']),
  primary('ori', 0x0d, 'I', IMM_U, ['rs'], ['rt']),
  primary('xori', 0x0e, 'I', IMM_U, ['rs'], ['rt']),
  primary('lui', 0x0f, 'I', ['rt', 'imm16u'], [], ['rt']),
  primary('lb', 0x20, 'I', MEM, ['rs'], ['rt'], { hazard: 'load' }),
  primary('lh', 0x21, 'I', MEM, ['rs'], ['rt'], { hazard: 'load' }),
  // lwl and lwr merge into the destination, so they read rt architecturally.
  // ASPSX does not count that read for the load-delay nop: `lwl $3,3($8)`
  // followed by `lwr $3,0($8)` gets no nop (maspsx test_lwl_lwr_no_nop).
  primary('lwl', 0x22, 'I', MEM, ['rs', 'rt'], ['rt'], { hazard: 'load', hazardReads: ['rs'] }),
  primary('lw', 0x23, 'I', MEM, ['rs'], ['rt'], { hazard: 'load' }),
  primary('lbu', 0x24, 'I', MEM, ['rs'], ['rt'], { hazard: 'load' }),
  primary('lhu', 0x25, 'I', MEM, ['rs'], ['rt'], { hazard: 'load' }),
  primary('lwr', 0x26, 'I', MEM, ['rs', 'rt'], ['rt'], { hazard: 'load', hazardReads: ['rs'] }),
  primary('sb', 0x28, 'I', MEM, ['rs', 'rt'], []),
  primary('sh', 0x29, 'I', MEM, ['rs', 'rt'], []),
  primary('swl', 0x2a, 'I', MEM, ['rs', 'rt'], []),
  primary('sw', 0x2b, 'I', MEM, ['rs', 'rt'], []),
  primary('swr', 0x2e, 'I', MEM, ['rs', 'rt'], []),
  // lwc2/swc2 move a coprocessor 2 data register; only the base is a GPR.
  primary('lwc2', 0x32, 'I', ['cop2dRt', 'mem'], ['rs'], []),
  primary('swc2', 0x3a, 'I', ['cop2dRt', 'mem'], ['rs'], []),

  // Coprocessor 0
  copMove('mfc0', 0, 0x00, 'cop0', 'from'),
  copMove('mtc0', 0, 0x04, 'cop0', 'to'),
  row('rfe', 'COP', 0xffffffff, 0x42000010, [], [], []),

  // Coprocessor 2 (GTE)
  copMove('mfc2', 2, 0x00, 'cop2d', 'from'),
  copMove('cfc2', 2, 0x02, 'cop2c', 'from'),
  copMove('mtc2', 2, 0x04, 'cop2d', 'to'),
  copMove('ctc2', 2, 0x06, 'cop2c', 'to'),
  row('cop2', 'COP2CMD', 0xfe000000, 0x4a000000, ['imm25'], [], []),
] as const;

/** Every mnemonic in the instruction table. */
export type TableMnemonic = (typeof ISA_ROWS)[number]['mnemonic'];

const BY_MNEMONIC: ReadonlyMap<string, IsaRow> = new Map(ISA_ROWS.map((r) => [r.mnemonic, r]));

/** Look up a table row by mnemonic. */
export function rowFor(mnemonic: string): IsaRow | undefined {
  return BY_MNEMONIC.get(mnemonic);
}
