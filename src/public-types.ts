// SPDX-License-Identifier: MIT
/**
 * The public type surface. Type-only: no runtime code lives here, which is why
 * the module is excluded from coverage (see CONTRIBUTING.md).
 */
import type { TableMnemonic } from './isa/table.js';

/** ASPSX versions this package emulates. */
export type AspsxVersion = '2.81';

/** Discriminant of every error thrown by psyq-asm. */
export type ErrorCode = 'invalid-options' | 'invalid-instruction';

// ---- single instructions ---------------------------------------------------

/** Every mnemonic in the R3000 instruction table. */
export type Mnemonic = TableMnemonic;

/** Encoding family: SPECIAL/R-type, immediate, jump, coprocessor move, GTE command. */
export type InstructionFormat = 'R' | 'I' | 'J' | 'COP' | 'COP2CMD';

/** How an instruction takes part in ASPSX's nop insertion. */
export type HazardClass =
  'none' | 'load' | 'branch' | 'jump' | 'mult' | 'div' | 'mflo' | 'mtlo' | 'cop-from' | 'cop-to';

/** One operand, in assembly-syntax order. */
export type Operand =
  /** A general-purpose register, 0 to 31. */
  | { readonly kind: 'gpr'; readonly number: number }
  /** A coprocessor register, 0 to 31, in the data or control space. */
  | {
      readonly kind: 'cop';
      readonly number: number;
      readonly unit: 0 | 2;
      readonly space: 'data' | 'control';
    }
  /** An immediate or code field. `bits` is its width; `signed` whether it is sign-extended. */
  | {
      readonly kind: 'imm';
      readonly value: number;
      readonly bits: 10 | 16 | 20 | 25;
      readonly signed: boolean;
    }
  /** A shift amount, 0 to 31. */
  | { readonly kind: 'shamt'; readonly value: number }
  /** `offset(base)`, with a signed 16-bit offset. */
  | { readonly kind: 'mem'; readonly base: number; readonly offset: number }
  /** A branch displacement in instructions, relative to the delay slot (pc + 4). */
  | { readonly kind: 'branch'; readonly displacement: number }
  /** The 26-bit index field of `j`/`jal`; the target address is `(pc & 0xF0000000) | index << 2`. */
  | { readonly kind: 'target'; readonly index: number };

/** A decoded (or encodable) R3000 instruction. */
export interface Instruction {
  readonly mnemonic: Mnemonic;
  readonly format: InstructionFormat;
  readonly operands: readonly Operand[];
  /** General-purpose registers read, excluding `$0`. */
  readonly reads: readonly number[];
  /** General-purpose registers written, excluding `$0`. */
  readonly writes: readonly number[];
  readonly hazardClass: HazardClass;
}

/** What `encode` needs: the derived fields of `Instruction` are ignored. */
export type EncodableInstruction = Pick<Instruction, 'mnemonic' | 'operands'>;

/** A word that is not a valid R3000 instruction. */
export interface UnknownInstruction {
  readonly mnemonic: '.word';
  readonly word: number;
  readonly reason: string;
}

export interface FormatStyle {
  /** `$v0` (default `'abi'`) or `$2` (`'numeric'`). Coprocessor registers are always numeric. */
  readonly registers?: 'numeric' | 'abi';
  /** Render `nop`, `move`, `beqz`, and `bnez` where they apply. Default false. */
  readonly pseudo?: boolean;
  /** Immediates, offsets, and targets in hexadecimal. Default true. */
  readonly hex?: boolean;
}
