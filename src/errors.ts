// SPDX-License-Identifier: MIT
import type { ErrorCode } from './public-types.js';

/**
 * Base class of every error thrown by psyq-asm. Problems in the assembly input
 * are diagnostics in a failed result, not errors; errors are reserved for
 * caller mistakes.
 *
 * Each subclass redeclares `code` as its own literal, so `code` is a
 * discriminant. The redeclarations are `declare`-only; the base constructor is
 * what assigns the value. A generic base would read better but would make
 * `code` `any` after `x instanceof PsyqAsmError`, since instanceof narrowing
 * fills a generic class's type arguments with `any`.
 */
export class PsyqAsmError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
    this.name = 'PsyqAsmError';
  }
}

/** Options given to `assemble`, `decodeWords`, or `format` are malformed. */
export class InvalidOptionsError extends PsyqAsmError {
  declare readonly code: 'invalid-options';

  constructor(message: string) {
    super('invalid-options', message);
    this.name = 'InvalidOptionsError';
  }
}

/** `encode` was given an instruction whose operands cannot be encoded. */
export class InvalidInstructionError extends PsyqAsmError {
  declare readonly code: 'invalid-instruction';

  constructor(message: string) {
    super('invalid-instruction', message);
    this.name = 'InvalidInstructionError';
  }
}
