// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { InvalidInstructionError, InvalidOptionsError, PsyqAsmError } from '../../src/errors.js';

describe('errors', () => {
  it('narrows on code and keeps the class name', () => {
    const errors: PsyqAsmError[] = [
      new InvalidOptionsError('gpSize must be a non-negative integer.'),
      new InvalidInstructionError('addiu immediate 65536 does not fit in 16 bits.'),
    ];
    expect(errors.map((e) => [e.name, e.code])).toEqual([
      ['InvalidOptionsError', 'invalid-options'],
      ['InvalidInstructionError', 'invalid-instruction'],
    ]);
    for (const error of errors) {
      expect(error).toBeInstanceOf(PsyqAsmError);
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('carries a cause through the base class', () => {
    const cause = new Error('shadow');
    const error = new PsyqAsmError('invalid-options', 'moses', { cause });
    expect(error.name).toBe('PsyqAsmError');
    expect(error.message).toBe('moses');
    expect(error.cause).toBe(cause);
  });
});
