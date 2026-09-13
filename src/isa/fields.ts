// SPDX-License-Identifier: MIT
/**
 * Operand slots and the bit fields they occupy in an R3000 word.
 *
 * Bit layout: op[31:26] rs[25:21] rt[20:16] rd[15:11] sa[10:6] fn[5:0],
 * imm[15:0], target[25:0].
 */

/** Where an operand lives in the word and how it is written in assembly. */
export type Slot =
  | 'rd' // general-purpose register in rd
  | 'rs' // general-purpose register in rs
  | 'rt' // general-purpose register in rt
  | 'sa' // shift amount
  | 'imm16s' // signed 16-bit immediate
  | 'imm16u' // unsigned 16-bit immediate
  | 'mem' // offset(base): signed 16-bit offset, base in rs
  | 'branch' // signed 16-bit displacement in instructions, relative to pc+4
  | 'target' // 26-bit jump index
  | 'code20' // syscall code in [25:6]
  | 'break20' // break code, low 10 bits in [25:16] and high 10 bits in [15:6] (VERIFY-13)
  | 'code10' // trap code in [15:6]
  | 'imm25' // coprocessor 2 command
  | CopSlot;

/** Coprocessor register slots: which unit, which register space, which field. */
export type CopSlot =
  | 'cop0' // coprocessor 0 register in rd
  | 'cop2d' // GTE data register in rd
  | 'cop2c' // GTE control register in rd
  | 'cop2dRt'; // GTE data register in rt (lwc2, swc2)

export const COP_SLOTS: Readonly<
  Record<
    CopSlot,
    { readonly unit: 0 | 2; readonly space: 'data' | 'control'; readonly shift: 11 | 16 }
  >
> = Object.freeze({
  cop0: { unit: 0, space: 'data', shift: 11 },
  cop2d: { unit: 2, space: 'data', shift: 11 },
  cop2c: { unit: 2, space: 'control', shift: 11 },
  cop2dRt: { unit: 2, space: 'data', shift: 16 },
});

/** The bits of the word each slot owns. */
export const SLOT_BITS: Readonly<Record<Slot, number>> = Object.freeze({
  rd: 0x0000f800,
  rs: 0x03e00000,
  rt: 0x001f0000,
  sa: 0x000007c0,
  imm16s: 0x0000ffff,
  imm16u: 0x0000ffff,
  mem: 0x03e0ffff,
  branch: 0x0000ffff,
  target: 0x03ffffff,
  code20: 0x03ffffc0,
  break20: 0x03ffffc0,
  code10: 0x0000ffc0,
  imm25: 0x01ffffff,
  cop0: 0x0000f800,
  cop2d: 0x0000f800,
  cop2c: 0x0000f800,
  cop2dRt: 0x001f0000,
});

/** Sign-extend the low 16 bits of `value`. */
export function signExtend16(value: number): number {
  return (value << 16) >> 16;
}

/**
 * The `%hi` half of a 32-bit value: the upper 16 bits, adjusted so that adding
 * the sign-extended `%lo` half reconstructs the value.
 */
export function hi16(value: number): number {
  return ((value + 0x8000) >>> 16) & 0xffff;
}

/** The `%lo` half of a 32-bit value, as a field (0 to 0xFFFF). */
export function lo16(value: number): number {
  return value & 0xffff;
}
