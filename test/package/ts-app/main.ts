// SPDX-License-Identifier: MIT
// TypeScript consumer: the package must type-check through its `exports` map's
// `types` condition, exercising the declarations a TS user actually resolves.
// This is compiled with `tsc --noEmit`; it is never executed.
import {
  InvalidInstructionError,
  InvalidOptionsError,
  PsyqAsmError,
  REGISTER_NAMES,
  SUPPORTED_ASPSX_VERSIONS,
  assemble,
  decode,
  decodeWords,
  encode,
  format,
  formatProgram,
  parseRegister,
  type AssembledObject,
  type AssembleOptions,
  type AssembleResult,
  type DecodedProgram,
  type Diagnostic,
  type ErrorCode,
  type FunctionRange,
  type Instruction,
  type Mnemonic,
  type Operand,
  type Relocation,
  type Section,
  type SymbolEntry,
  type UnknownInstruction,
  type WordOrigin,
} from 'psyq-asm';

export function textWords(source: string, gpSize: number): readonly number[] {
  const options: AssembleOptions = { gpSize, partialDivExpansion: false };
  const result: AssembleResult = assemble(source, options);
  if (!result.success) {
    const diagnostics: readonly Diagnostic[] = result.diagnostics;
    throw new Error(diagnostics.map((d) => `${String(d.line)}: ${d.message}`).join('\n'));
  }
  const object: AssembledObject = result.object;
  const text: Section | undefined = object.sections.find((s) => s.kind === 'code');
  const origins: readonly WordOrigin[] = text?.provenance ?? [];
  const relocations: readonly Relocation[] = text?.relocations ?? [];
  const functions: readonly FunctionRange[] = object.functions;
  const symbols: readonly SymbolEntry[] = object.symbols;
  console.log(origins.length, relocations.length, functions.length, symbols.length);
  return [...(text?.words ?? [])];
}

export function describe(word: number): string {
  const decoded: Instruction | UnknownInstruction = decode(word);
  if (decoded.mnemonic === '.word') return decoded.reason;
  const mnemonic: Mnemonic = decoded.mnemonic;
  const operands: readonly Operand[] = decoded.operands;
  return `${mnemonic} ${String(operands.length)} ${String(encode(decoded))} ${format(decoded, { pseudo: true })}`;
}

export function disassemble(words: readonly number[]): string {
  const program: DecodedProgram = decodeWords(words, { baseAddress: 0x80010000 });
  return formatProgram(program, { registers: 'numeric' });
}

try {
  textWords('', -1);
} catch (error: unknown) {
  if (error instanceof InvalidOptionsError) {
    const code: 'invalid-options' = error.code;
    console.log(code);
  } else if (error instanceof InvalidInstructionError) {
    const code: 'invalid-instruction' = error.code;
    console.log(code);
  } else if (error instanceof PsyqAsmError) {
    const code: ErrorCode = error.code;
    console.log(code);
  }
}

console.log(SUPPORTED_ASPSX_VERSIONS[0], REGISTER_NAMES[29], parseRegister('$sp'));
