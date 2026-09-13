// SPDX-License-Identifier: MIT
import type { FormatStyle, Instruction, Operand, UnknownInstruction } from '../public-types.js';
import { validateFormatStyle, type NormalizedFormatStyle } from '../options.js';
import { REGISTER_NAMES } from './registers.js';

function register(n: number, style: NormalizedFormatStyle): string {
  return style.registers === 'numeric' ? `$${String(n)}` : `$${REGISTER_NAMES[n] ?? String(n)}`;
}

/** A number in the chosen radix; hexadecimal digits are upper case. */
export function formatNumber(value: number, hex: boolean): string {
  if (!hex) return String(value);
  const digits = Math.abs(value).toString(16).toUpperCase();
  return value < 0 ? `-0x${digits}` : `0x${digits}`;
}

/** A branch target relative to the branch itself: `.+12` is two instructions past the delay slot. */
export function formatDisplacement(displacement: number): string {
  const bytes = 4 + displacement * 4;
  return bytes < 0 ? `.-${String(-bytes)}` : `.+${String(bytes)}`;
}

export function formatOperand(operand: Operand, style: NormalizedFormatStyle): string {
  switch (operand.kind) {
    case 'gpr':
      return register(operand.number, style);
    case 'cop':
      return `$${String(operand.number)}`;
    case 'imm':
      // Trap and syscall codes read naturally in decimal (`break 7`).
      return formatNumber(operand.value, style.hex && (operand.bits === 16 || operand.bits === 25));
    case 'shamt':
      return String(operand.value);
    case 'mem':
      return `${formatNumber(operand.offset, style.hex)}(${register(operand.base, style)})`;
    case 'branch':
      return formatDisplacement(operand.displacement);
    case 'target':
      return formatNumber(operand.index * 4, style.hex);
  }
}

function isZeroRegister(operand: Operand | undefined): boolean {
  return operand?.kind === 'gpr' && operand.number === 0;
}

/** Apply the pseudo-instruction spellings, and drop optional operands at their defaults. */
function spelling(
  instruction: Instruction,
  pseudo: boolean,
): { name: string; operands: readonly Operand[] } {
  const { mnemonic, operands } = instruction;
  const [first, second, third] = operands;
  if (pseudo) {
    if (
      mnemonic === 'sll' &&
      operands.length === 3 &&
      isZeroRegister(first) &&
      isZeroRegister(second)
    ) {
      if (third?.kind === 'shamt' && third.value === 0) return { name: 'nop', operands: [] };
    }
    if (mnemonic === 'addu' && operands.length === 3 && isZeroRegister(third)) {
      return { name: 'move', operands: [first, second].filter((o) => o !== undefined) };
    }
    if (
      (mnemonic === 'beq' || mnemonic === 'bne') &&
      operands.length === 3 &&
      isZeroRegister(second)
    ) {
      return {
        name: mnemonic === 'beq' ? 'beqz' : 'bnez',
        operands: [first, third].filter((o) => o !== undefined),
      };
    }
  }
  if (
    mnemonic === 'jalr' &&
    operands.length === 2 &&
    first?.kind === 'gpr' &&
    first.number === 31
  ) {
    return { name: mnemonic, operands: operands.slice(1) };
  }
  const last = operands.at(-1);
  if (
    (mnemonic === 'syscall' ||
      mnemonic === 'break' ||
      (mnemonic === 'tge' && operands.length === 3)) &&
    last?.kind === 'imm' &&
    last.value === 0
  ) {
    return { name: mnemonic, operands: operands.slice(0, -1) };
  }
  return { name: mnemonic, operands };
}

/**
 * Render one instruction as assembly text: `lw $v0,0x20($s0)`,
 * `cop2 0x180001`, `.word 0xFFFFFFFF` for an unknown word. Branch targets are
 * written relative to the branch (`.+12`); `formatProgram` writes labels.
 */
export function format(instruction: Instruction | UnknownInstruction, style?: FormatStyle): string {
  const normalized = validateFormatStyle(style);
  if (instruction.mnemonic === '.word') {
    return `.word 0x${instruction.word.toString(16).toUpperCase().padStart(8, '0')}`;
  }
  const { name, operands } = spelling(instruction, normalized.pseudo);
  if (operands.length === 0) return name;
  return `${name} ${operands.map((o) => formatOperand(o, normalized)).join(',')}`;
}
