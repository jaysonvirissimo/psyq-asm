// SPDX-License-Identifier: MIT
/** General-purpose register names, by number, in the o32 ABI spelling ASPSX accepts. */
export const REGISTER_NAMES: readonly string[] = Object.freeze([
  'zero',
  'at',
  'v0',
  'v1',
  'a0',
  'a1',
  'a2',
  'a3',
  't0',
  't1',
  't2',
  't3',
  't4',
  't5',
  't6',
  't7',
  's0',
  's1',
  's2',
  's3',
  's4',
  's5',
  's6',
  's7',
  't8',
  't9',
  'k0',
  'k1',
  'gp',
  'sp',
  'fp',
  'ra',
]);

const BY_NAME: ReadonlyMap<string, number> = new Map([
  ...REGISTER_NAMES.map((name, index) => [name, index] as const),
  ['s8', 30],
]);

/**
 * Parse a register spelled `$n` (0 to 31) or `$name` (`$zero`, `$v0`, `$s8`,
 * `$fp`, ...). Returns `undefined` for anything else.
 */
export function parseRegister(text: string): number | undefined {
  if (!text.startsWith('$')) return undefined;
  const body = text.slice(1);
  if (/^(0|[1-9]\d?)$/.test(body)) {
    const n = Number(body);
    return n <= 31 ? n : undefined;
  }
  return BY_NAME.get(body);
}
