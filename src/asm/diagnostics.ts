// SPDX-License-Identifier: MIT
import type { Diagnostic, DiagnosticCode } from '../public-types.js';

/** Where a diagnostic points: any statement or item carries these. */
export interface Position {
  readonly line: number;
  readonly column?: number;
}

/** Collects the diagnostics of one `assemble` call. */
export class Diagnostics {
  private readonly file: string;
  private readonly entries: Diagnostic[] = [];
  private readonly onceKeys = new Set<string>();

  constructor(file: string) {
    this.file = file;
  }

  error(at: Position, code: DiagnosticCode, message: string): void {
    this.push('error', at, code, message);
  }

  warning(at: Position, code: DiagnosticCode, message: string): void {
    this.push('warning', at, code, message);
  }

  /** A warning reported only for the first occurrence of `key` in the file. */
  warnOnce(key: string, at: Position, code: DiagnosticCode, message: string): void {
    if (this.onceKeys.has(key)) return;
    this.onceKeys.add(key);
    this.warning(at, code, message);
  }

  get hasErrors(): boolean {
    return this.entries.some((d) => d.severity === 'error');
  }

  /** All diagnostics, sorted by line (stable within a line). */
  sorted(): readonly Diagnostic[] {
    return [...this.entries].sort((a, b) => a.line - b.line);
  }

  private push(
    severity: Diagnostic['severity'],
    at: Position,
    code: DiagnosticCode,
    message: string,
  ): void {
    this.entries.push({
      severity,
      file: this.file,
      line: at.line,
      ...(at.column === undefined ? {} : { column: at.column }),
      code,
      message,
    });
  }
}
