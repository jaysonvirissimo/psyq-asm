// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import * as api from '../../src/index.js';

describe('public entry point', () => {
  it('supports exactly ASPSX 2.77 and 2.81, as a frozen list', () => {
    expect(api.SUPPORTED_ASPSX_VERSIONS).toEqual(['2.77', '2.81']);
    expect(Object.isFrozen(api.SUPPORTED_ASPSX_VERSIONS)).toBe(true);
  });

  it('exports the error hierarchy', () => {
    expect(new api.InvalidOptionsError('x')).toBeInstanceOf(api.PsyqAsmError);
    expect(new api.InvalidInstructionError('x')).toBeInstanceOf(api.PsyqAsmError);
  });
});
