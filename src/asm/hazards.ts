// SPDX-License-Identifier: MIT
/**
 * The nop pass: where ASPSX 2.81 inserts nops (docs/ASPSX-2.81.md, "Hazard
 * nops"). Rules, after maspsx:
 *
 * - H1: after every branch and jump under `.set reorder`.
 * - H2: after a load, when the next instruction's first word reads the loaded
 *   register. A `div`/`rem` expansion's final mflo/mfhi counts as a load.
 * - H3: between mflo/mfhi and the next mult/div there must be two instructions.
 * - H4 (VERIFY-18): after mfc2/cfc2, like H2, when enabled.
 *
 * The pass works on the expanded stream, so "the next instruction" is always
 * the first word of the next group: a macro that starts with `lui $at` does not
 * read the loaded register, while a one-word `$gp`-relative rewrite may.
 * Nops are anchored exactly where maspsx places them, because anchoring decides
 * which address a label between the two instructions receives.
 */
import { hazardReadsOf, registersOf } from '../isa/instruction.js';
import { ISA_ROWS } from '../isa/table.js';
import type { WordOriginKind } from '../public-types.js';
import type { Group, Item, PendingWord } from './stream.js';

export interface HazardOptions {
  /** VERIFY-18: apply the load-delay rule to mfc2/cfc2. */
  readonly copMoveDelayNop: boolean;
}

/** The first row of the table is `sll`, whose all-zero word is the nop. */
const SLL = ISA_ROWS[0];

function nopWord(origin: WordOriginKind, note: string): PendingWord {
  return {
    row: SLL,
    args: [
      { slot: 'rd', value: { kind: 'gpr', number: 0 } },
      { slot: 'rt', value: { kind: 'gpr', number: 0 } },
      { slot: 'sa', value: { kind: 'value', expr: { kind: 'number', value: 0 } } },
    ],
    origin,
    note,
  };
}

/** A group's first and last words (a nop for the never-produced empty group). */
export function endsOf(group: Group): readonly [PendingWord, PendingWord] {
  const { words } = group;
  const fallback = nopWord('instruction', 'empty group');
  return [words[0] ?? fallback, words[words.length - 1] ?? fallback];
}

/** A word with only its register fields filled in: enough to ask the table about register use. */
function registerWord(word: PendingWord): number {
  let bits = word.row.value;
  for (const { slot, value } of word.args) {
    if (value.kind === 'gpr')
      bits |= value.number << (slot === 'rd' ? 11 : slot === 'rs' ? 21 : 16);
    else if (value.kind === 'mem') bits |= value.base << 21;
  }
  return bits >>> 0;
}

function readsOf(word: PendingWord): number[] {
  return hazardReadsOf(word.row, registerWord(word));
}

function writesOf(word: PendingWord): number[] {
  return registersOf(word.row.writes, registerWord(word));
}

function nop(near: Group, origin: WordOriginKind, note: string): Group {
  return {
    kind: 'group',
    line: near.line,
    column: near.column,
    section: near.section,
    reorder: near.reorder,
    words: [nopWord(origin, note)],
  };
}

interface Next {
  readonly group: Group;
  readonly index: number;
  /** Index of a `.set noreorder` crossed on the way to this group. */
  readonly noreorderAt: number | undefined;
}

/**
 * The next `count` groups after `from`, looking past `.set` options and
 * transparent labels and stopping at any other item, as maspsx's lookahead
 * does.
 */
function following(items: readonly Item[], from: number, count: number): Next[] {
  const found: Next[] = [];
  let noreorderAt: number | undefined;
  for (const [offset, item] of items.slice(from + 1).entries()) {
    if (found.length === count) break;
    const index = from + 1 + offset;
    if (item.kind === 'set') {
      if (item.option === 'noreorder' && noreorderAt === undefined) noreorderAt = index;
      continue;
    }
    if (item.kind === 'label' && item.transparent) continue;
    if (item.kind !== 'group') break;
    found.push({ group: item, index, noreorderAt });
    noreorderAt = undefined;
  }
  return found;
}

function isMultiplyOrDivide(group: Group): boolean {
  const hazard = endsOf(group)[0].row.hazard;
  return hazard === 'mult' || hazard === 'div';
}

type Insert = (before: number, group: Group) => void;

/**
 * H3 after an mflo/mfhi (maspsx `_handle_mflo_mfhi`). Returns true when the
 * rule took charge of what follows, which suppresses the load-delay check of a
 * div expansion.
 */
function multiplyGap(
  items: readonly Item[],
  index: number,
  producer: Group,
  insert: Insert,
): boolean {
  const [first, second] = following(items, index, 2);
  if (first === undefined) return false;
  const tail = endsOf(producer)[1].row.mnemonic;
  const gap = (): Group =>
    nop(producer, 'hilo-gap-nop', `a mult or div may not start within two instructions of ${tail}`);

  if (isMultiplyOrDivide(first.group)) {
    insert(first.index, gap());
    insert(first.index, gap());
    return true;
  }
  if (second === undefined || !isMultiplyOrDivide(second.group)) return false;

  const between = endsOf(first.group)[0];
  // VERIFY-19: a load or another mflo/mfhi in between restarts the count.
  if (between.row.hazard === 'load' || between.row.hazard === 'mflo') return false;
  if (first.group.macro === 'li') {
    if (first.group.words.length === 1) insert(first.index + 1, gap());
    return true;
  }
  if (first.noreorderAt !== undefined) {
    insert(first.noreorderAt, gap());
    return true;
  }
  if (producer.divMove !== undefined && readsOf(between).includes(producer.divMove)) {
    insert(first.index, gap());
    return true;
  }
  if (between.row.hazard === 'branch' || between.row.hazard === 'jump') {
    // Under reorder, the branch's own delay-slot nop fills the gap.
    if (!first.group.reorder) insert(first.index + 1, gap());
    return true;
  }
  // VERIFY-20: any other instruction, even a multi-word macro, gets one nop.
  insert(second.index, gap());
  return true;
}

/** The register whose load makes the next instruction wait, if any. */
function delayedRegister(
  group: Group,
  options: HazardOptions,
): { readonly register: number; readonly origin: WordOriginKind } | undefined {
  if (group.divMove !== undefined) return { register: group.divMove, origin: 'load-delay-nop' };
  const tail = endsOf(group)[1];
  const [written] = writesOf(tail);
  if (written === undefined) return undefined;
  if (tail.row.hazard === 'load') return { register: written, origin: 'load-delay-nop' };
  if (tail.row.hazard === 'cop-from' && options.copMoveDelayNop) {
    return { register: written, origin: 'cop-delay-nop' };
  }
  return undefined;
}

/** Insert the nops ASPSX 2.81 would, returning a new stream. */
export function insertNops(items: readonly Item[], options: HazardOptions): Item[] {
  const inserts = new Map<number, Group[]>();
  const insert: Insert = (before, group) => {
    inserts.set(before, [...(inserts.get(before) ?? []), group]);
  };

  items.forEach((item, index) => {
    if (item.kind !== 'group') return;
    const tail = endsOf(item)[1];
    const { hazard, mnemonic } = tail.row;

    if ((hazard === 'branch' || hazard === 'jump') && item.reorder) {
      insert(
        index + 1,
        nop(item, 'branch-delay-nop', `the delay slot of ${mnemonic} under .set reorder`),
      );
    }
    if (hazard === 'mflo' && multiplyGap(items, index, item, insert)) return;

    const delayed = delayedRegister(item, options);
    const [next] = following(items, index, 1);
    if (delayed === undefined || next === undefined) return;
    const reader = endsOf(next.group)[0];
    if (!readsOf(reader).includes(delayed.register)) return;
    insert(
      next.index,
      nop(
        item,
        delayed.origin,
        `$${String(delayed.register)} is written by ${mnemonic} and read by ${reader.row.mnemonic}`,
      ),
    );
  });

  return [
    ...items.flatMap((item, index) => [...(inserts.get(index) ?? []), item]),
    ...(inserts.get(items.length) ?? []),
  ];
}
