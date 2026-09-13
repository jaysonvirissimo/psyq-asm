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
 * Compiler-generated labels that are not symbols: `$L12`, `$LC0`, and `LM439`
 * (debugging line markers), plus GNU numeric labels. They are resolved against
 * their section rather than exported. Any other name, `LoadThing` included, is
 * an ordinary symbol.
 */
export function isLocalLabel(name: string): boolean {
  return name.startsWith('$L') || /^LM\d+$/.test(name) || isNumericLabel(name);
}

/**
 * A GNU numeric local label as the parser renames it (`1:2` is the second
 * `1:`), or a `1f`/`1b` reference left unresolved because no such definition
 * exists.
 */
export function isNumericLabel(name: string): boolean {
  return /^\d+(?::\d+|[fb])$/i.test(name);
}

/**
 * Labels the nop pass looks past, as maspsx does: numbered code labels (`$L12`,
 * `$Lb3`, `$Le3`) and `LM` line markers. Any other label ends the
 * lookahead.
 */
export function isTransparentLabel(name: string): boolean {
  return /^\$L[be]?\d+$/.test(name) || /^LM\d+$/.test(name) || isNumericLabel(name);
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
 * `.sdata`/`.sbss`, and commons no larger than the
 * threshold. `.extern` sizes never count: ASPSX 2.81, like maspsx, ignores them.
 */
export function classifySmallData(table: SymbolTable, gpSize: number): Map<string, SmallDataEntry> {
  const small = new Map<string, SmallDataEntry>();
  if (gpSize === 0) return small;
  for (const name of table.order) {
    const label = table.labels.get(name);
    const common = table.commons.get(name);
    if (label !== undefined) {
      if (label.section === '.sdata' || label.section === '.sbss') {
        small.set(name, { name, reason: label.section === '.sdata' ? 'sdata' : 'sbss' });
      }
    } else if (common !== undefined) {
      if (common.size <= gpSize) small.set(name, { name, reason: 'common', size: common.size });
    }
  }
  return small;
}
