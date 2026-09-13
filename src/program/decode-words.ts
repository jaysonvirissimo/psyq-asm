// SPDX-License-Identifier: MIT
/** A whole-program view of decoded words: branch targets resolved to labels. */
import { InvalidOptionsError } from '../errors.js';
import { decode } from '../isa/decode.js';
import { isRecord } from '../options.js';
import type {
  DecodedProgram,
  DecodeOptions,
  Instruction,
  UnknownInstruction,
} from '../public-types.js';

const SYMBOL_NAME = /^[A-Za-z_.$][A-Za-z0-9_.$]*$/;
const KNOWN_OPTIONS: readonly string[] = ['baseAddress', 'labelPrefix'];

interface NormalizedDecodeOptions {
  readonly baseAddress: number | undefined;
  readonly labelPrefix: string;
}

function validateDecodeOptions(options: unknown): NormalizedDecodeOptions {
  if (options === undefined) return { baseAddress: undefined, labelPrefix: 'L' };
  if (!isRecord(options)) throw new InvalidOptionsError('options must be an object.');
  for (const key of Object.keys(options)) {
    if (!KNOWN_OPTIONS.includes(key))
      throw new InvalidOptionsError(`options.${key} is not a known option.`);
  }
  const { baseAddress, labelPrefix } = options;
  if (
    baseAddress !== undefined &&
    (typeof baseAddress !== 'number' ||
      !Number.isInteger(baseAddress) ||
      baseAddress < 0 ||
      baseAddress > 0xfffffffc ||
      baseAddress % 4 !== 0)
  ) {
    throw new InvalidOptionsError('baseAddress must be a word-aligned 32-bit address.');
  }
  if (
    labelPrefix !== undefined &&
    (typeof labelPrefix !== 'string' || !SYMBOL_NAME.test(labelPrefix))
  ) {
    throw new InvalidOptionsError(
      `labelPrefix ${JSON.stringify(labelPrefix)} must be a symbol name.`,
    );
  }
  return { baseAddress, labelPrefix: labelPrefix ?? 'L' };
}

function hex8(value: number): string {
  return value.toString(16).toUpperCase().padStart(8, '0');
}

/** The instruction index a branch or (with a base address) a jump reaches, if inside the program. */
function targetIndex(
  instruction: Instruction | UnknownInstruction,
  index: number,
  length: number,
  baseAddress: number | undefined,
): number | undefined {
  if (instruction.mnemonic === '.word') return undefined;
  for (const operand of instruction.operands) {
    if (operand.kind === 'branch') {
      const target = index + 1 + operand.displacement;
      return target >= 0 && target <= length ? target : undefined;
    }
    if (operand.kind === 'target' && baseAddress !== undefined) {
      const pc = (baseAddress + (index + 1) * 4) >>> 0;
      const address = ((pc & 0xf0000000) | (operand.index << 2)) >>> 0;
      const offset = address - baseAddress;
      return offset >= 0 && offset <= length * 4 ? offset / 4 : undefined;
    }
  }
  return undefined;
}

/**
 * Decode a sequence of words as a program. Branches whose targets fall inside
 * the sequence (or at its end) get synthetic labels: `L_12` by word index, or
 * `L_800C56C0` by address when `baseAddress` is given. With a base address,
 * `j`/`jal` targets inside the sequence are labelled too.
 */
export function decodeWords(words: ArrayLike<number>, options?: DecodeOptions): DecodedProgram {
  const { baseAddress, labelPrefix } = validateDecodeOptions(options);
  const candidate: unknown = words;
  if (
    typeof candidate !== 'object' ||
    candidate === null ||
    typeof (candidate as { length?: unknown }).length !== 'number'
  ) {
    throw new InvalidOptionsError('words must be an array-like of 32-bit integers.');
  }
  const instructions = Array.from(words, (word) => decode(word));
  const name = (index: number): string =>
    baseAddress === undefined
      ? `${labelPrefix}_${String(index)}`
      : `${labelPrefix}_${hex8((baseAddress + index * 4) >>> 0)}`;

  const targets = new Map<number, number>();
  instructions.forEach((instruction, index) => {
    const target = targetIndex(instruction, index, instructions.length, baseAddress);
    if (target !== undefined) targets.set(index, target);
  });
  const labels = new Map(
    [...new Set(targets.values())]
      .sort((a, b) => a - b)
      .map((index) => [index, name(index)] as const),
  );
  return {
    instructions,
    labels,
    branchTargets: targets,
    ...(baseAddress === undefined ? {} : { baseAddress }),
  };
}
