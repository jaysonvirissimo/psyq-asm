// SPDX-License-Identifier: MIT
import type { AspsxVersion } from '../public-types.js';

/** What changes between the ASPSX versions psyq-asm emulates. */
export interface VersionRules {
  /**
   * `la` of a small-data symbol is one `addiu rd,$gp,%gp_rel(sym)`. ASPSX 2.77
   * uses `lui`/`addiu` instead; loads and stores use `$gp` in both.
   */
  readonly gpAddressesLa: boolean;
}

const RULES: Readonly<Record<AspsxVersion, VersionRules>> = Object.freeze({
  '2.77': Object.freeze({ gpAddressesLa: false }),
  '2.81': Object.freeze({ gpAddressesLa: true }),
});

/** The rules of one supported ASPSX version (docs/ASPSX-2.81.md, "Versions"). */
export function rulesFor(version: AspsxVersion): VersionRules {
  return RULES[version];
}
