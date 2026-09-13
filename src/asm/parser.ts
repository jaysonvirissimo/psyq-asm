// SPDX-License-Identifier: MIT
import type { Diagnostics } from './diagnostics.js';
import { interpretDirective, type Directive } from './directives.js';
import { lex, splitTopLevel } from './lexer.js';
import { parseOperand, type Expr, type SourceOperand } from './operands.js';

export type Statement =
  | {
      readonly kind: 'label';
      readonly name: string;
      readonly line: number;
      readonly column: number;
    }
  | {
      readonly kind: 'directive';
      readonly name: string;
      readonly directive: Directive;
      readonly line: number;
      readonly column: number;
    }
  | {
      readonly kind: 'instruction';
      readonly mnemonic: string;
      readonly operands: readonly SourceOperand[];
      readonly inlineAsm: boolean;
      readonly line: number;
      readonly column: number;
    };

const LABEL = /^([A-Za-z_.$][A-Za-z0-9_.$]*|\d+)\s*:/;
const NUMERIC_DEFINITION = /^\d+$/;
const NUMERIC_REFERENCE = /^(\d+)([fb])$/i;
const MNEMONIC = /^[a-z][a-z0-9_]*(?:\.[sd])?$/;

/**
 * Parse assembly text into statements. Every line that cannot be parsed
 * produces a diagnostic; nothing is dropped silently.
 */
export function parse(source: string, diagnostics: Diagnostics): Statement[] {
  const statements: Statement[] = [];
  for (const piece of lex(source)) {
    let text = piece.text;
    let column = piece.column;
    for (let label = LABEL.exec(text); label !== null; label = LABEL.exec(text)) {
      statements.push({ kind: 'label', name: String(label[1]), line: piece.line, column });
      const rest = text.slice(label[0].length);
      column += label[0].length + rest.length - rest.trimStart().length;
      text = rest.trim();
    }
    if (text === '') continue;

    const at = { line: piece.line, column };
    const space = text.search(/\s/);
    const head = space === -1 ? text : text.slice(0, space);
    const rest = space === -1 ? '' : text.slice(space).trim();

    if (head.startsWith('.')) {
      const directive = interpretDirective(head, rest, at, diagnostics);
      if (directive !== undefined)
        statements.push({ kind: 'directive', name: head, directive, ...at });
      continue;
    }
    if (!MNEMONIC.test(head)) {
      diagnostics.error(at, 'unknown-mnemonic', `${JSON.stringify(head)} is not a mnemonic.`);
      continue;
    }
    const operands: SourceOperand[] = [];
    let failed = false;
    for (const part of rest === '' ? [] : splitTopLevel(rest, ',')) {
      const parsed = parseOperand(part.text);
      if (!parsed.ok) {
        diagnostics.error(at, parsed.code, `${head}: ${parsed.message}`);
        failed = true;
        break;
      }
      operands.push(parsed.value);
    }
    if (!failed) {
      statements.push({
        kind: 'instruction',
        mnemonic: head,
        operands,
        inlineAsm: piece.inlineAsm,
        ...at,
      });
    }
  }
  return resolveNumericLabels(statements);
}

/**
 * GNU numeric local labels: `1:` may be defined any number of times, and
 * `1f`/`1b` name the nearest definition after or before the reference. Each
 * definition gets a unique name (`1:2` is the second `1:`) and references are
 * rewritten to it; a reference with no such definition keeps its spelling and
 * is reported as an undefined label.
 */
function resolveNumericLabels(statements: readonly Statement[]): Statement[] {
  const totals = new Map<string, number>();
  for (const s of statements) {
    if (s.kind === 'label' && NUMERIC_DEFINITION.test(s.name)) {
      totals.set(s.name, (totals.get(s.name) ?? 0) + 1);
    }
  }
  const seen = new Map<string, number>();
  const rename = (name: string): string => {
    const match = NUMERIC_REFERENCE.exec(name);
    if (match === null) return name;
    const label = String(match[1]);
    const count = seen.get(label) ?? 0;
    const index = String(match[2]).toLowerCase() === 'b' ? count : count + 1;
    return index >= 1 && index <= (totals.get(label) ?? 0) ? `${label}:${String(index)}` : name;
  };
  const renameExpr = (expr: Expr): Expr => {
    switch (expr.kind) {
      case 'symbol':
        return { ...expr, name: rename(expr.name) };
      case 'reloc':
        return expr.inner.kind === 'symbol'
          ? { ...expr, inner: { ...expr.inner, name: rename(expr.inner.name) } }
          : expr;
      case 'number':
      case 'dot':
        return expr;
    }
  };
  const renameOperand = (operand: SourceOperand): SourceOperand => {
    switch (operand.kind) {
      case 'expr':
        return { ...operand, expr: renameExpr(operand.expr) };
      case 'mem':
        return { ...operand, offset: renameExpr(operand.offset) };
      case 'reg':
      case 'float':
        return operand;
    }
  };
  return statements.map((s): Statement => {
    switch (s.kind) {
      case 'label': {
        if (!NUMERIC_DEFINITION.test(s.name)) return s;
        const count = (seen.get(s.name) ?? 0) + 1;
        seen.set(s.name, count);
        return { ...s, name: `${s.name}:${String(count)}` };
      }
      case 'instruction':
        return { ...s, operands: s.operands.map(renameOperand) };
      case 'directive':
        return s.directive.kind === 'values'
          ? { ...s, directive: { ...s.directive, values: s.directive.values.map(renameExpr) } }
          : s;
    }
  });
}
