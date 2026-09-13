// SPDX-License-Identifier: MIT
/**
 * psyq-asm: an ASPSX 2.81-compatible assembler and R3000 encoder/decoder.
 */
export type {
  AspsxVersion,
  AssembledObject,
  AssembleFailure,
  AssembleOptions,
  AssembleResult,
  AssembleSuccess,
  Diagnostic,
  DiagnosticCode,
  EncodableInstruction,
  ErrorCode,
  ExperimentalBehaviours,
  FormatStyle,
  FunctionRange,
  HazardClass,
  Instruction,
  InstructionFormat,
  Mnemonic,
  Operand,
  Relocation,
  RelocationKind,
  RelocationTarget,
  Section,
  SectionName,
  SmallDataEntry,
  SymbolEntry,
  UnknownInstruction,
  WordOrigin,
  WordOriginKind,
} from './public-types.js';
export { InvalidInstructionError, InvalidOptionsError, PsyqAsmError } from './errors.js';
export { DEFAULT_EXPERIMENTAL, SUPPORTED_ASPSX_VERSIONS } from './options.js';
export { assemble } from './asm/assemble.js';
export { decode } from './isa/decode.js';
export { encode } from './isa/encode.js';
export { format } from './isa/format.js';
export { REGISTER_NAMES, parseRegister } from './isa/registers.js';
