// SPDX-License-Identifier: MIT
import type { AspsxVersion } from './public-types.js';

/** Every ASPSX version `assemble` accepts. */
export const SUPPORTED_ASPSX_VERSIONS: readonly ['2.81'] = Object.freeze(['2.81'] as const);

/** The version used when `aspsxVersion` is omitted. */
export const DEFAULT_ASPSX_VERSION: AspsxVersion = '2.81';
