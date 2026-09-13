// SPDX-License-Identifier: MIT
import type { Diagnostics } from './diagnostics.js';
import { interpretDirective, type Directive } from './directives.js';
import { lex, splitTopLevel } from './lexer.js';
import { parseOperand, type SourceOperand } from './operands.js';

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

const LABEL = /^([A-Za-z_.$][A-Za-z0-9_.$]*)\s*:/;
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
  return statements;
}
