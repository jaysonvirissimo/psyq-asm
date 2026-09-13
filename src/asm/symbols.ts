// SPDX-License-Identifier: MIT
/** Pass 1: symbol definitions, bindings, common and extern sizes, and small data. */
import type { SmallDataEntry } from '../public-types.js';
import type { Diagnostics } from './diagnostics.js';
import type { Expr } from './operands.js';
import type { Statement } from './parser.js';

export interface CommonSymbol {
  readonly name: string;
  readonly size: number;
  readonly align: number | undefined;
  readonly local: boolean;
}

export interface SymbolTable {
  /** Every symbol and label name, in order of first appearance. */
  readonly order: readonly string[];
  /** Labels by name, with the section they were defined in. */
  readonly labels: ReadonlyMap<string, { readonly section: string; readonly line: number }>;
  readonly globals: ReadonlySet<string>;
  readonly externs: ReadonlyMap<string, number | undefined>;
  readonly commons: ReadonlyMap<string, CommonSymbol>;
}

/**
 * Compiler-generated labels that are not symbols: `$L12`, `$LC0`, and `L`
 * followed by a non-digit (`LM439`, debugging line markers). They are resolved
 * against their section rather than exported.
 */
export function isLocalLabel(name: string): boolean {
  return name.startsWith('$L') || /^L[^0-9]/.test(name);
}

/**
 * Labels the nop pass looks past, as maspsx does: numbered code labels (`$L12`,
 * `$Lb3`, `$Le3`) and `L`-plus-non-digit markers. Any other label ends the
 * lookahead.
 */
export function isTransparentLabel(name: string): boolean {
  return /^\$L[be]?\d+$/.test(name) || /^L[^0-9]/.test(name);
}

export function collectSymbols(
  statements: readonly Statement[],
  diagnostics: Diagnostics,
): SymbolTable {
  const order: string[] = [];
  const seen = new Set<string>();
  const labels = new Map<string, { section: string; line: number }>();
  const globals = new Set<string>();
  const externs = new Map<string, number | undefined>();
  const commons = new Map<string, CommonSymbol>();
  let section = '.text';

  const note = (name: string): void => {
    if (seen.has(name)) return;
    seen.add(name);
    order.push(name);
  };
  const noteExpr = (expr: Expr): void => {
    if (expr.kind === 'symbol') note(expr.name);
    else if (expr.kind === 'reloc' && expr.inner.kind === 'symbol') note(expr.inner.name);
  };

  for (const statement of statements) {
    switch (statement.kind) {
      case 'label': {
        const previous = labels.get(statement.name);
        if (previous !== undefined) {
          diagnostics.error(
            statement,
            'duplicate-label',
            `${statement.name} is already defined on line ${String(previous.line)}.`,
          );
        } else {
          labels.set(statement.name, { section, line: statement.line });
        }
        note(statement.name);
        break;
      }
      case 'instruction':
        for (const operand of statement.operands) {
          if (operand.kind === 'expr') noteExpr(operand.expr);
          else if (operand.kind === 'mem') noteExpr(operand.offset);
        }
        break;
      case 'directive': {
        const d = statement.directive;
        switch (d.kind) {
          case 'section':
            section = d.name;
            break;
          case 'globl':
            globals.add(d.name);
            note(d.name);
            break;
          case 'extern':
            externs.set(d.name, d.size);
            note(d.name);
            break;
          case 'common':
            if (commons.has(d.name)) {
              diagnostics.error(
                statement,
                'duplicate-label',
                `${d.name} is already a common symbol.`,
              );
            } else {
              commons.set(d.name, { name: d.name, size: d.size, align: d.align, local: d.local });
            }
            note(d.name);
            break;
          case 'values':
            d.values.forEach(noteExpr);
            break;
          default:
            break;
        }
        break;
      }
    }
  }
  return { order, labels, globals, externs, commons };
}

/**
 * The symbols ASPSX addresses through `$gp` at this -G value: labels in
 * `.sdata`/`.sbss`, commons no larger than the threshold, and (VERIFY-1)
 * externs declared no larger than it.
 */
export function classifySmallData(
  table: SymbolTable,
  gpSize: number,
  externSmallData: boolean,
): Map<string, SmallDataEntry> {
  const small = new Map<string, SmallDataEntry>();
  if (gpSize === 0) return small;
  for (const name of table.order) {
    const label = table.labels.get(name);
    const common = table.commons.get(name);
    const externSize = table.externs.get(name);
    if (label !== undefined) {
      if (label.section === '.sdata' || label.section === '.sbss') {
        small.set(name, { name, reason: label.section === '.sdata' ? 'sdata' : 'sbss' });
      }
    } else if (common !== undefined) {
      if (common.size <= gpSize) small.set(name, { name, reason: 'common', size: common.size });
    } else if (externSmallData && externSize !== undefined && externSize <= gpSize) {
      // VERIFY-1: maspsx ignores .extern sizes, but cc1psx emits them so the
      // assembler can use $gp for small globals defined in other files.
      small.set(name, { name, reason: 'extern', size: externSize });
    }
  }
  return small;
}
