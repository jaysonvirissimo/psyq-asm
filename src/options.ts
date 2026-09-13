// SPDX-License-Identifier: MIT
/**
 * Validation and normalization of caller options. Validators accept `unknown`
 * so that JavaScript callers get the same errors as TypeScript callers.
 */
import { InvalidOptionsError } from './errors.js';
import type { AspsxVersion } from './public-types.js';

/** Every ASPSX version `assemble` accepts. */
export const SUPPORTED_ASPSX_VERSIONS: readonly ['2.81'] = Object.freeze(['2.81'] as const);

/** The version used when `aspsxVersion` is omitted. */
export const DEFAULT_ASPSX_VERSION: AspsxVersion = '2.81';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export interface NormalizedFormatStyle {
  readonly registers: 'numeric' | 'abi';
  readonly pseudo: boolean;
  readonly hex: boolean;
}

const DEFAULT_FORMAT_STYLE: NormalizedFormatStyle = Object.freeze({
  registers: 'abi',
  pseudo: false,
  hex: true,
});

function optionalBoolean(
  record: Record<string, unknown>,
  key: string,
  fallback: boolean,
  what: string,
): boolean {
  const value = record[key];
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') {
    throw new InvalidOptionsError(
      `${what}.${key} must be a boolean, not ${JSON.stringify(value)}.`,
    );
  }
  return value;
}

/** Validate and normalize a `FormatStyle`. */
export function validateFormatStyle(style: unknown, what = 'style'): NormalizedFormatStyle {
  if (style === undefined) return DEFAULT_FORMAT_STYLE;
  if (!isRecord(style)) throw new InvalidOptionsError(`${what} must be an object.`);
  const registers = style['registers'];
  if (registers !== undefined && registers !== 'numeric' && registers !== 'abi') {
    throw new InvalidOptionsError(
      `${what}.registers must be 'numeric' or 'abi', not ${JSON.stringify(registers)}.`,
    );
  }
  return {
    registers: registers ?? DEFAULT_FORMAT_STYLE.registers,
    pseudo: optionalBoolean(style, 'pseudo', DEFAULT_FORMAT_STYLE.pseudo, what),
    hex: optionalBoolean(style, 'hex', DEFAULT_FORMAT_STYLE.hex, what),
  };
}
