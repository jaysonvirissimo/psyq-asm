// SPDX-License-Identifier: MIT
/**
 * The expanded stream: what the expansion pass produces, the nop pass edits,
 * and the layout pass encodes. Instructions become groups of pending words
 * whose symbolic operands are resolved only at layout.
 */
import type { Slot } from '../isa/fields.js';
import type { IsaRow } from '../isa/table.js';
import type { WordOriginKind } from '../public-types.js';
import type { Directive } from './directives.js';
import type { Expr } from './operands.js';

/** An operand whose value may still depend on symbols or label addresses. */
export type Pending =
  | { readonly kind: 'gpr'; readonly number: number }
  | {
      readonly kind: 'cop';
      readonly number: number;
      readonly unit: 0 | 2;
      readonly space: 'data' | 'control';
    }
  /** Immediates, shift amounts, codes, and jump targets. */
  | { readonly kind: 'value'; readonly expr: Expr }
  | { readonly kind: 'mem'; readonly base: number; readonly offset: Expr }
  | { readonly kind: 'branch'; readonly target: Expr };

export interface PendingArg {
  readonly slot: Slot;
  readonly value: Pending;
}

export interface PendingWord {
  readonly row: IsaRow;
  readonly args: readonly PendingArg[];
  readonly origin: WordOriginKind;
  readonly note?: string;
}

/** The words one source statement became. */
export interface Group {
  readonly kind: 'group';
  readonly line: number;
  readonly column: number;
  readonly section: string;
  /** Whether `.set reorder` was in effect. */
  readonly reorder: boolean;
  readonly words: readonly PendingWord[];
  /** The macro mnemonic, when the statement expanded. */
  readonly macro?: string;
  /** For a `div`/`rem` expansion, the register its final `mflo`/`mfhi` writes. */
  readonly divMove?: number;
}

export type Item =
  | Group
  | {
      readonly kind: 'label';
      readonly name: string;
      readonly line: number;
      readonly column: number;
      readonly transparent: boolean;
    }
  /** `.set` options: never end the nop pass's lookahead. */
  | { readonly kind: 'set'; readonly option: string; readonly line: number }
  /** Any other directive: ends the nop pass's lookahead. */
  | {
      readonly kind: 'directive';
      readonly directive: Directive;
      readonly line: number;
      readonly column: number;
    };
