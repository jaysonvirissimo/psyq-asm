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

// ---- assembling ------------------------------------------------------------

export interface AssembleOptions {
  /**
   * The small-data threshold, the -G value given to ASPSX. A non-negative
   * integer; PsyQ builds use 0 or 8. Required; never guessed.
   */
  readonly gpSize: number;
  /** Emulated assembler version. Only '2.81' is accepted. Default '2.81'. */
  readonly aspsxVersion?: AspsxVersion;
  /** Reproduce `ASPSX -0`: `div`/`rem` without divide-by-zero and overflow traps. Default false. */
  readonly partialDivExpansion?: boolean;
  /** Logical file name used in diagnostics. A single path segment. Default 'input.s'. */
  readonly filename?: string;
}

export type AssembleResult = AssembleSuccess | AssembleFailure;

export interface AssembleSuccess {
  readonly success: true;
  readonly object: AssembledObject;
  /** Warnings only. */
  readonly diagnostics: readonly Diagnostic[];
}

export interface AssembleFailure {
  readonly success: false;
  /** At least one error, sorted by line. */
  readonly diagnostics: readonly Diagnostic[];
}

export type DiagnosticCode =
  | 'unknown-mnemonic'
  | 'unknown-directive'
  | 'unsupported-syntax'
  | 'invalid-operand'
  | 'invalid-directive'
  | 'undefined-label'
  | 'duplicate-label'
  | 'immediate-out-of-range'
  | 'branch-out-of-range'
  | 'ignored-directive'
  | 'function-mismatch';

export interface Diagnostic {
  readonly severity: 'error' | 'warning';
  /** `AssembleOptions.filename`. */
  readonly file: string;
  /** 1-based source line. */
  readonly line: number;
  /** 1-based column of the statement, when known. */
  readonly column?: number;
  readonly code: DiagnosticCode;
  readonly message: string;
}

// ---- output model ----------------------------------------------------------

/** A section name; the common ones are listed, but any name is allowed. */
export type SectionName =
  '.text' | '.data' | '.rdata' | '.sdata' | '.sbss' | '.bss' | (string & Record<never, never>);

export interface AssembledObject {
  readonly info: {
    readonly aspsxVersion: AspsxVersion;
    readonly gpSize: number;
    readonly partialDivExpansion: boolean;
  };
  /** In order of first appearance; `.comm` allocations create `.sbss`/`.bss` last. */
  readonly sections: readonly Section[];
  readonly symbols: readonly SymbolEntry[];
  readonly functions: readonly FunctionRange[];
  /** Symbols addressed through `$gp` at this -G value, with the reason. */
  readonly smallData: readonly SmallDataEntry[];
}

export interface Section {
  readonly name: SectionName;
  readonly kind: 'code' | 'data' | 'bss';
  /**
   * Section contents. Empty for a bss section that holds only reserved space;
   * a bss section that data was written into has all its bytes.
   */
  readonly bytes: Uint8Array;
  /** Size in bytes, including reserved bss space. */
  readonly size: number;
  /** Code sections only: `bytes` as little-endian words. */
  readonly words?: Uint32Array;
  readonly relocations: readonly Relocation[];
  /** Code sections only: where each word came from, one entry per word. */
  readonly provenance?: readonly WordOrigin[];
}

export type RelocationKind = 'HI16' | 'LO16' | 'GPREL16' | 'MIPS26' | 'WORD32';

export interface Relocation {
  /** Byte offset of the patched word in its section. */
  readonly offset: number;
  readonly kind: RelocationKind;
  /** Bits of the word the linker patches: 0xFFFF, 0x03FFFFFF, or 0xFFFFFFFF. */
  readonly fieldMask: number;
  readonly target: RelocationTarget;
  /** The value already encoded in the patched field. */
  readonly fieldValue: number;
}

/**
 * A symbol this file does not define (an extern or a `.comm`), with its addend;
 * or, for anything the file defines, that label's section and offset.
 */
export type RelocationTarget =
  | { readonly kind: 'symbol'; readonly name: string; readonly addend: number }
  | {
      readonly kind: 'section';
      readonly section: SectionName;
      /** Offset in `section`, addend included. */
      readonly offset: number;
      /** The label or symbol the offset came from. */
      readonly label?: string;
    };

export interface SymbolEntry {
  readonly name: string;
  readonly binding: 'global' | 'local' | 'extern' | 'common';
  /** Absent for extern symbols; for a `.comm` symbol, the section it belongs to. */
  readonly section?: SectionName;
  /** Absent for extern and `.comm` symbols, which the linker places. */
  readonly offset?: number;
  /** From `.comm`, `.lcomm`, or `.extern`. */
  readonly size?: number;
}

export interface FunctionRange {
  /** From `.ent`. */
  readonly name: string;
  readonly section: '.text';
  /** First word index. */
  readonly start: number;
  /** Word index at `.end`, exclusive. */
  readonly end: number;
  readonly frame?: { readonly reg: number; readonly size: number; readonly returnReg: number };
  readonly mask?: { readonly bits: number; readonly offset: number };
  readonly fmask?: { readonly bits: number; readonly offset: number };
}

export type WordOriginKind =
  | 'instruction'
  | 'macro'
  | 'branch-delay-nop'
  | 'load-delay-nop'
  | 'hilo-gap-nop'
  | 'cop-delay-nop'
  | 'gte-gap-nop'
  | 'align'
  | 'data';

export interface WordOrigin {
  /** Source line that produced the word. */
  readonly line: number;
  readonly kind: WordOriginKind;
  /** The macro that expanded, e.g. 'li' or 'div'. */
  readonly macro?: string;
  /** Why the word exists, for inserted nops. */
  readonly note?: string;
}

export interface SmallDataEntry {
  readonly name: string;
  /** Defined in `.sdata`/`.sbss`, or declared by `.comm`/`.lcomm`. */
  readonly reason: 'sdata' | 'sbss' | 'common';
  readonly size?: number;
}

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

// ---- whole programs --------------------------------------------------------

export interface DecodeOptions {
  /** Address of the first word: labels are named by address and jump targets resolved. */
  readonly baseAddress?: number;
  /** Prefix of synthetic label names. Default 'L'. */
  readonly labelPrefix?: string;
}

export interface DecodedProgram {
  readonly instructions: readonly (Instruction | UnknownInstruction)[];
  /** Word index to synthetic label, for every branch (and jump) target inside the program. */
  readonly labels: ReadonlyMap<number, string>;
  /** Instruction index to target word index, for branches (and jumps) whose target is labelled. */
  readonly branchTargets: ReadonlyMap<number, number>;
  readonly baseAddress?: number;
}
