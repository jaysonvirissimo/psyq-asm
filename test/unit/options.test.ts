// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { InvalidOptionsError } from '../../src/errors.js';
import {
  DEFAULT_EXPERIMENTAL,
  decodeSource,
  validateAssembleOptions,
  validateFormatStyle,
} from '../../src/options.js';

describe('validateAssembleOptions', () => {
  it('fills defaults', () => {
    expect(validateAssembleOptions({ gpSize: 8 })).toEqual({
      gpSize: 8,
      aspsxVersion: '2.81',
      partialDivExpansion: false,
      filename: 'input.s',
      experimental: { externSmallData: false, copMoveDelayNop: true },
    });
    expect(Object.isFrozen(DEFAULT_EXPERIMENTAL)).toBe(true);
  });

  it('accepts every option', () => {
    expect(
      validateAssembleOptions({
        gpSize: 999,
        aspsxVersion: '2.81',
        partialDivExpansion: true,
        filename: 'shadow moses.s',
        experimental: { externSmallData: true },
      }),
    ).toEqual({
      gpSize: 999,
      aspsxVersion: '2.81',
      partialDivExpansion: true,
      filename: 'shadow moses.s',
      experimental: { externSmallData: true, copMoveDelayNop: true },
    });
  });

  it.each([
    [undefined, 'options must be an object with at least a gpSize.'],
    [[8], 'options must be an object with at least a gpSize.'],
    [{}, 'gpSize is required and must be a non-negative integer.'],
    [{ gpsize: 8 }, 'options.gpsize is not a known option.'],
    [{ gpSize: -1 }, 'gpSize is required and must be a non-negative integer.'],
    [{ gpSize: 1.5 }, 'gpSize is required and must be a non-negative integer.'],
    [{ gpSize: '8' }, 'gpSize is required and must be a non-negative integer.'],
    [{ gpSize: 0, aspsxVersion: '2.56' }, `aspsxVersion must be '2.81', not "2.56".`],
    [
      { gpSize: 0, partialDivExpansion: 'yes' },
      'partialDivExpansion must be a boolean, not "yes".',
    ],
    [{ gpSize: 0, filename: 5 }, 'filename must be a string.'],
    [{ gpSize: 0, filename: '' }, 'filename "" must be a single path segment.'],
    [{ gpSize: 0, filename: '..' }, 'filename ".." must be a single path segment.'],
    [{ gpSize: 0, filename: 'a/b.s' }, 'filename "a/b.s" must be a single path segment.'],
    [{ gpSize: 0, filename: 'a\\b.s' }, 'filename "a\\\\b.s" must be a single path segment.'],
    [{ gpSize: 0, filename: 'a' }, 'filename "a\\u0001" must be a single path segment.'],
    [{ gpSize: 0, experimental: 1 }, 'experimental must be an object.'],
    [{ gpSize: 0, experimental: { codec: true } }, 'experimental.codec is not a known option.'],
    [
      { gpSize: 0, experimental: { copMoveDelayNop: 'no' } },
      'experimental.copMoveDelayNop must be a boolean, not "no".',
    ],
  ])('rejects %j', (options, message) => {
    expect(() => validateAssembleOptions(options)).toThrow(new InvalidOptionsError(message));
  });
});

describe('validateFormatStyle', () => {
  it('rejects unknown keys', () => {
    expect(() => validateFormatStyle({ colour: true })).toThrow(
      new InvalidOptionsError('style.colour is not a known option.'),
    );
  });
});

describe('decodeSource', () => {
  it('passes strings through and decodes bytes as UTF-8', () => {
    expect(decodeSource('\tnop\n')).toBe('\tnop\n');
    expect(decodeSource(Uint8Array.from([0xef, 0xbb, 0xbf, 0x6e, 0xc3, 0xa9]))).toBe('né');
  });

  it('throws for anything else', () => {
    expect(() => decodeSource(5)).toThrow(
      new InvalidOptionsError('source must be a string or a Uint8Array.'),
    );
  });
});
