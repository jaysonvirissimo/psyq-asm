// SPDX-License-Identifier: MIT
/**
 * Lines to statement text: comments stripped, `;`-separated statements split,
 * `#APP`/`#NO_APP` inline-assembly regions flagged. Works on CRLF or LF input
 * and keeps the original line and column of every piece.
 */

/** One statement's text with its source position. */
export interface SourcePiece {
  readonly line: number;
  readonly column: number;
  readonly text: string;
  /** Between `#APP` and `#NO_APP`: inline assembly from a C macro. */
  readonly inlineAsm: boolean;
}

export interface Part {
  readonly text: string;
  readonly start: number;
}

/** Split `text` at `separator` wherever it is outside double quotes and parentheses. */
export function splitTopLevel(text: string, separator: string): Part[] {
  const parts: Part[] = [];
  let depth = 0;
  let inString = false;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (c === '\\') i++;
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
    } else if (c === '(') {
      depth++;
    } else if (c === ')') {
      depth = Math.max(0, depth - 1);
    } else if (c === separator && depth === 0) {
      parts.push({ text: text.slice(start, i), start });
      start = i + 1;
    }
  }
  parts.push({ text: text.slice(start), start });
  return parts;
}

/** Remove a `#` comment, leaving `#` inside string literals alone. */
export function stripComment(text: string): string {
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (c === '\\') i++;
      else if (c === '"') inString = false;
    } else if (c === '"') {
      inString = true;
    } else if (c === '#') {
      return text.slice(0, i);
    }
  }
  return text;
}

export function lex(source: string): SourcePiece[] {
  const pieces: SourcePiece[] = [];
  let inlineAsm = false;
  source.split(/\r?\n/).forEach((raw, index) => {
    const marker = raw.trim();
    if (marker === '#APP') {
      inlineAsm = true;
      return;
    }
    if (marker === '#NO_APP') {
      inlineAsm = false;
      return;
    }
    for (const part of splitTopLevel(stripComment(raw), ';')) {
      const text = part.text.trim();
      if (text === '') continue;
      const leading = part.text.length - part.text.trimStart().length;
      pieces.push({ line: index + 1, column: part.start + leading + 1, text, inlineAsm });
    }
  });
  return pieces;
}
