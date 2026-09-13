// SPDX-License-Identifier: MIT

/** Pair up two lists element by element, stopping at the shorter one. */
export function zip<A, B>(first: readonly A[], second: readonly B[]): [A, B][] {
  const pairs: [A, B][] = [];
  const length = Math.min(first.length, second.length);
  for (let i = 0; i < length; i++) {
    pairs.push([first[i] as A, second[i] as B]);
  }
  return pairs;
}
