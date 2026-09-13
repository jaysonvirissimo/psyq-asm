// SPDX-License-Identifier: MIT
/** Directive recognition and argument parsing (see docs/ASPSX-2.81.md, "Directives"). */
import { parseRegister } from '../isa/registers.js';
import type { Diagnostics, Position } from './diagnostics.js';
import { splitTopLevel } from './lexer.js';
import { parseExpr, parseInteger, type Expr } from './operands.js';

export type Directive =
  | { readonly kind: 'section'; readonly name: string }
  | { readonly kind: 'align'; readonly power: number }
  | { readonly kind: 'globl'; readonly name: string }
  | { readonly kind: 'extern'; readonly name: string; readonly size?: number }
  | {
      readonly kind: 'common';
      readonly name: string;
      readonly size: number;
      readonly align?: number;
      readonly local: boolean;
    }
  | { readonly kind: 'values'; readonly unit: 1 | 2 | 4; readonly values: readonly Expr[] }
  | { readonly kind: 'bytes'; readonly bytes: Uint8Array }
  | { readonly kind: 'space'; readonly size: number }
  | { readonly kind: 'ent'; readonly name: string }
  | { readonly kind: 'end'; readonly name?: string }
  | {
      readonly kind: 'frame';
      readonly reg: number;
      readonly size: number;
      readonly returnReg: number;
    }
  | { readonly kind: 'mask' | 'fmask'; readonly bits: number; readonly offset: number }
  | { readonly kind: 'set'; readonly option: string }
  /**
   * Accepted and ignored. `transparent` directives are invisible to the nop
   * pass's lookahead, as they are to maspsx's (`.loc` and COFF debugging
   * records); the others end the lookahead.
   */
  | { readonly kind: 'ignored'; readonly transparent: boolean };

const SECTIONS = new Set(['.text', '.data', '.rdata', '.sdata', '.sbss', '.bss']);
const SET_OPTIONS = new Set([
  'reorder',
  'noreorder',
  'macro',
  'nomacro',
  'at',
  'noat',
  'volatile',
  'novolatile',
]);
const TRANSPARENT_DEBUG = new Set(['.stabs', '.stabn', '.stabd', '.def', '.begin', '.bend']);
const OPAQUE_DEBUG = new Set(['.type', '.size', '.val', '.scl', '.endef', '.dim', '.tag', '.line']);
const SYMBOL_NAME = /^[A-Za-z_.$][A-Za-z0-9_.$]*$/;

/** Internal: a malformed directive, turned into a diagnostic by `interpretDirective`. */
class DirectiveError extends Error {
  readonly code: 'invalid-directive' | 'unsupported-syntax' | 'immediate-out-of-range';

  constructor(message: string, code: DirectiveError['code'] = 'invalid-directive') {
    super(message);
    this.code = code;
  }
}

function args(text: string): string[] {
  return text === '' ? [] : splitTopLevel(text, ',').map((p) => p.text.trim());
}

function expectCount(name: string, list: readonly string[], min: number, max: number): void {
  if (list.length < min || list.length > max) {
    const range = min === max ? String(min) : `${String(min)} to ${String(max)}`;
    throw new DirectiveError(
      `${name} takes ${range} argument${max === 1 ? '' : 's'}, not ${String(list.length)}.`,
    );
  }
}

function symbolArg(name: string, text: string | undefined): string {
  const t = String(text);
  if (!SYMBOL_NAME.test(t))
    throw new DirectiveError(`${name}: ${JSON.stringify(t)} is not a symbol name.`);
  return t;
}

function integerArg(name: string, text: string | undefined, min: number, max: number): number {
  const parsed = parseInteger(String(text));
  if (!parsed.ok)
    throw new DirectiveError(
      `${name}: ${parsed.message}`,
      parsed.code === 'invalid-operand' ? 'invalid-directive' : parsed.code,
    );
  if (parsed.value < min || parsed.value > max) {
    throw new DirectiveError(
      `${name}: ${String(parsed.value)} is outside ${String(min)} to ${String(max)}.`,
      'immediate-out-of-range',
    );
  }
  return parsed.value;
}

function registerArg(name: string, text: string | undefined): number {
  const n = parseRegister(String(text));
  if (n === undefined)
    throw new DirectiveError(`${name}: ${JSON.stringify(String(text))} is not a register.`);
  return n;
}

const SIMPLE_ESCAPES: Readonly<Record<string, number>> = {
  n: 10,
  t: 9,
  r: 13,
  b: 8,
  f: 12,
  v: 11,
  '\\': 92,
  '"': 34,
  "'": 39,
};

/** Decode the C-style escapes of a `.ascii` string body into bytes. */
export function decodeString(body: string): number[] {
  const bytes: number[] = [];
  const encoder = new TextEncoder();
  for (let i = 0; i < body.length; i++) {
    const c = String(body[i]);
    if (c !== '\\') {
      bytes.push(...encoder.encode(c));
      continue;
    }
    const rest = body.slice(i + 1);
    const octal = /^[0-7]{1,3}/.exec(rest);
    const hex = /^x([0-9a-fA-F]+)/.exec(rest);
    if (octal !== null) {
      bytes.push(Number.parseInt(octal[0], 8) & 0xff);
      i += octal[0].length;
    } else if (hex !== null) {
      bytes.push(Number.parseInt(String(hex[1]), 16) & 0xff);
      i += hex[0].length;
    } else {
      const next = rest.charAt(0);
      bytes.push(SIMPLE_ESCAPES[next] ?? next.charCodeAt(0));
      i += 1;
    }
  }
  return bytes;
}

function stringsArg(name: string, text: string): number[] {
  const list = args(text);
  if (list.length === 0) throw new DirectiveError(`${name} needs at least one argument.`);
  return list.flatMap((item) => {
    if (item.length < 2 || !item.startsWith('"') || !item.endsWith('"')) {
      throw new DirectiveError(`${name}: ${item} is not a quoted string.`);
    }
    return decodeString(item.slice(1, -1));
  });
}

function valuesArg(name: string, text: string, unit: 1 | 2 | 4): Expr[] {
  const list = args(text);
  if (list.length === 0) throw new DirectiveError(`${name} needs at least one argument.`);
  return list.map((item) => {
    const parsed = parseExpr(item);
    if (!parsed.ok)
      throw new DirectiveError(
        `${name}: ${parsed.message}`,
        parsed.code === 'invalid-operand' ? 'invalid-directive' : parsed.code,
      );
    if (unit !== 4 && parsed.value.kind !== 'number') {
      throw new DirectiveError(
        `${name} can hold only numbers; use .word for ${item}.`,
        'unsupported-syntax',
      );
    }
    return parsed.value;
  });
}

function interpret(
  name: string,
  text: string,
  at: Position,
  diagnostics: Diagnostics,
): Directive | undefined {
  if (SECTIONS.has(name)) {
    expectCount(name, args(text), 0, 0);
    return { kind: 'section', name };
  }
  switch (name) {
    case '.section': {
      const section = text.split(/[\s,]/, 1).join('');
      if (section === '') throw new DirectiveError('.section needs a section name.');
      return { kind: 'section', name: section };
    }
    case '.align': {
      const list = args(text);
      expectCount(name, list, 1, 1);
      return { kind: 'align', power: integerArg(name, list[0], 0, 15) };
    }
    case '.globl':
    case '.global': {
      const list = args(text);
      expectCount(name, list, 1, 1);
      return { kind: 'globl', name: symbolArg(name, list[0]) };
    }
    case '.extern': {
      const list = args(text);
      expectCount(name, list, 1, 2);
      const symbol = symbolArg(name, list[0]);
      return list.length === 2
        ? { kind: 'extern', name: symbol, size: integerArg(name, list[1], 0, 0x7fffffff) }
        : { kind: 'extern', name: symbol };
    }
    case '.comm':
    case '.lcomm': {
      const list = args(text);
      expectCount(name, list, 2, 3);
      const base = {
        kind: 'common',
        name: symbolArg(name, list[0]),
        size: integerArg(name, list[1], 0, 0x7fffffff),
        local: name === '.lcomm',
      } as const;
      return list.length === 3 ? { ...base, align: integerArg(name, list[2], 1, 0x8000) } : base;
    }
    case '.word':
      return { kind: 'values', unit: 4, values: valuesArg(name, text, 4) };
    case '.half':
    case '.short':
      return { kind: 'values', unit: 2, values: valuesArg(name, text, 2) };
    case '.byte':
      return { kind: 'values', unit: 1, values: valuesArg(name, text, 1) };
    case '.ascii':
      return { kind: 'bytes', bytes: Uint8Array.from(stringsArg(name, text)) };
    case '.asciiz':
      return { kind: 'bytes', bytes: Uint8Array.from([...stringsArg(name, text), 0]) };
    case '.space':
    case '.skip': {
      const list = args(text);
      expectCount(name, list, 1, 1);
      return { kind: 'space', size: integerArg(name, list[0], 0, 0x7fffffff) };
    }
    case '.ent': {
      const list = args(text);
      expectCount(name, list, 1, 1);
      return { kind: 'ent', name: symbolArg(name, list[0]) };
    }
    case '.end': {
      const list = args(text);
      expectCount(name, list, 0, 1);
      return list.length === 1 ? { kind: 'end', name: symbolArg(name, list[0]) } : { kind: 'end' };
    }
    case '.frame': {
      const list = args(text);
      expectCount(name, list, 3, 3);
      return {
        kind: 'frame',
        reg: registerArg(name, list[0]),
        size: integerArg(name, list[1], 0, 0x7fffffff),
        returnReg: registerArg(name, list[2]),
      };
    }
    case '.mask':
    case '.fmask': {
      const list = args(text);
      expectCount(name, list, 2, 2);
      return {
        kind: name === '.mask' ? 'mask' : 'fmask',
        bits: integerArg(name, list[0], -0x80000000, 0xffffffff) >>> 0,
        offset: integerArg(name, list[1], -0x80000000, 0x7fffffff),
      };
    }
    case '.set': {
      const option = text.trim();
      if (!SET_OPTIONS.has(option)) {
        diagnostics.warning(
          at,
          'ignored-directive',
          `.set ${option} is not a known option and is ignored.`,
        );
      }
      return { kind: 'set', option };
    }
    case '.file':
      return { kind: 'ignored', transparent: false };
    case '.loc':
      return { kind: 'ignored', transparent: true };
    default:
      break;
  }
  if (TRANSPARENT_DEBUG.has(name) || OPAQUE_DEBUG.has(name)) {
    diagnostics.warnOnce(
      'debug-directives',
      at,
      'ignored-directive',
      `debugging directives such as ${name} are ignored.`,
    );
    return { kind: 'ignored', transparent: TRANSPARENT_DEBUG.has(name) };
  }
  diagnostics.error(at, 'unknown-directive', `unknown directive ${name}.`);
  return undefined;
}

/**
 * Recognize a directive and parse its arguments. Problems are reported to
 * `diagnostics` and yield `undefined`.
 */
export function interpretDirective(
  name: string,
  text: string,
  at: Position,
  diagnostics: Diagnostics,
): Directive | undefined {
  try {
    return interpret(name, text, at, diagnostics);
  } catch (error) {
    // `interpret` throws nothing but DirectiveError: argument parsing is pure.
    const failure = error as DirectiveError;
    diagnostics.error(at, failure.code, failure.message);
    return undefined;
  }
}
