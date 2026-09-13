// SPDX-License-Identifier: MIT
import { assemble } from '../../src/asm/assemble.js';
import type {
  AssembledObject,
  AssembleOptions,
  Diagnostic,
  Section,
} from '../../src/public-types.js';

/** Join source lines with LF. */
export function src(...lines: string[]): string {
  return lines.map((line) => `${line}\n`).join('');
}

function describe(diagnostics: readonly Diagnostic[]): string {
  return diagnostics
    .map((d) => `${String(d.line)}: ${d.severity} ${d.code}: ${d.message}`)
    .join('\n');
}

/** Assemble and return the object, failing the test with the diagnostics otherwise. */
export function assembleOk(text: string, options: Partial<AssembleOptions> = {}): AssembledObject {
  const result = assemble(text, { gpSize: 0, ...options });
  if (!result.success) throw new Error(`assembly failed:\n${describe(result.diagnostics)}`);
  return result.object;
}

export type Brief = Pick<Diagnostic, 'line' | 'code' | 'message'>;

function brief(d: Diagnostic): Brief {
  return { line: d.line, code: d.code, message: d.message };
}

/** The errors of an assembly that is expected to fail. */
export function errorsOf(text: string, options: Partial<AssembleOptions> = {}): Brief[] {
  const result = assemble(text, { gpSize: 0, ...options });
  if (result.success) throw new Error('assembly unexpectedly succeeded');
  return result.diagnostics.filter((d) => d.severity === 'error').map(brief);
}

/** The warnings of an assembly that is expected to succeed. */
export function warningsOf(text: string, options: Partial<AssembleOptions> = {}): Brief[] {
  const result = assemble(text, { gpSize: 0, ...options });
  if (!result.success) throw new Error(`assembly failed:\n${describe(result.diagnostics)}`);
  return result.diagnostics.map(brief);
}

export function sectionOf(object: AssembledObject, name: string): Section {
  const section = object.sections.find((s) => s.name === name);
  if (section === undefined) throw new Error(`no section ${name}`);
  return section;
}

export function hex8(word: number): string {
  return `0x${word.toString(16).toUpperCase().padStart(8, '0')}`;
}

/** A code section's words as `0x%08X` strings. */
export function wordsOf(object: AssembledObject, name = '.text'): string[] {
  return [...(sectionOf(object, name).words ?? [])].map(hex8);
}

/** A section's bytes as space-separated lower-case hex pairs. */
export function bytesOf(object: AssembledObject, name: string): string {
  return [...sectionOf(object, name).bytes].map((b) => b.toString(16).padStart(2, '0')).join(' ');
}

/**
 * The section offsets a section's relocations against local labels point at.
 * Relocated fields hold 0, so this is where a test sees which address a label
 * received.
 */
export function labelOffsets(object: AssembledObject, name: string): (number | undefined)[] {
  return sectionOf(object, name).relocations.map((r) =>
    r.target.kind === 'section' ? r.target.offset : undefined,
  );
}
