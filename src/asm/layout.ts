// SPDX-License-Identifier: MIT
/**
 * Layout: pass A assigns every label its section offset (after expansion and
 * nop insertion have fixed each group's size, and after `.lcomm` allocation);
 * pass B resolves operands and encodes words into section buffers.
 */
import { encode } from '../isa/encode.js';
import type { FunctionRange, Mnemonic, Operand, Section, WordOrigin } from '../public-types.js';
import type { Diagnostics } from './diagnostics.js';
import type { Directive } from './directives.js';
import {
  isError,
  resolveArg,
  resolveData,
  type LabelLocation,
  type RelocationDraft,
} from './relocations.js';
import { SectionBuilder } from './sections.js';
import type { Group, Item, PendingWord } from './stream.js';
import type { SymbolTable } from './symbols.js';

export interface Layout {
  readonly sections: readonly Section[];
  readonly labels: ReadonlyMap<string, LabelLocation>;
  readonly functions: readonly FunctionRange[];
}

/**
 * Alignment of an `.lcomm` allocation when none is given: its size rounded up to
 * a power of two, at most 16, as ASPSX 2.81 lays them out (probe VERIFY-23).
 */
export function commonAlignment(size: number, explicit: number | undefined): number {
  if (explicit !== undefined) return explicit;
  let alignment = 1;
  while (alignment < size && alignment < 16) alignment *= 2;
  return alignment;
}

function padding(offset: number, alignment: number): number {
  return (alignment - (offset % alignment)) % alignment;
}

/** Commons no larger than the -G threshold belong to `.sbss`, the rest to `.bss`. */
export function commonSection(size: number, gpSize: number): string {
  return gpSize > 0 && size <= gpSize ? '.sbss' : '.bss';
}

function contentSize(directive: Directive): number {
  switch (directive.kind) {
    case 'values':
      return directive.unit * directive.values.length;
    case 'bytes':
      return directive.bytes.length;
    case 'space':
      return directive.size;
    default:
      return 0;
  }
}

function assignLabels(
  items: readonly Item[],
  symbols: SymbolTable,
  gpSize: number,
): Map<string, LabelLocation> {
  const sizes = new Map<string, number>();
  const labels = new Map<string, LabelLocation>();
  const at = (section: string): number => sizes.get(section) ?? 0;
  const bind = (name: string, location: LabelLocation): void => {
    if (!labels.has(name)) labels.set(name, location);
  };
  let section = '.text';
  for (const item of items) {
    if (item.kind === 'label') {
      bind(item.name, { section, offset: at(section) });
    } else if (item.kind === 'group') {
      sizes.set(item.section, at(item.section) + 4 * item.words.length);
    } else if (item.kind === 'directive') {
      const d = item.directive;
      if (d.kind === 'section') section = d.name;
      else if (d.kind === 'align')
        sizes.set(section, at(section) + padding(at(section), 2 ** d.power));
      else sizes.set(section, at(section) + contentSize(d));
    }
  }
  // Only .lcomm is allocated here, on its own cursor beside any data in the
  // section (probe VERIFY-24); the linker places .comm symbols.
  const reserved = new Map<string, number>();
  for (const common of symbols.commons.values()) {
    if (!common.local) continue;
    const target = commonSection(common.size, gpSize);
    const at = reserved.get(target) ?? 0;
    const offset = at + padding(at, commonAlignment(common.size, common.align));
    bind(common.name, { section: target, offset });
    reserved.set(target, offset + common.size);
  }
  return labels;
}

function originOf(group: Group, word: PendingWord): WordOrigin {
  return {
    line: group.line,
    kind: word.origin,
    ...(group.macro === undefined || word.origin !== 'macro' ? {} : { macro: group.macro }),
    ...(word.note === undefined ? {} : { note: word.note }),
  };
}

interface OpenFunction {
  name: string;
  line: number;
  start: number;
  frame?: FunctionRange['frame'];
  mask?: FunctionRange['mask'];
  fmask?: FunctionRange['fmask'];
}

class Emitter {
  private readonly builders = new Map<string, SectionBuilder>();
  private readonly functions: FunctionRange[] = [];
  private open: OpenFunction | undefined;
  private section = '.text';

  constructor(
    private readonly labels: ReadonlyMap<string, LabelLocation>,
    private readonly symbols: SymbolTable,
    private readonly gpSize: number,
    private readonly diagnostics: Diagnostics,
  ) {}

  private builder(name: string): SectionBuilder {
    let builder = this.builders.get(name);
    if (builder === undefined) {
      builder = new SectionBuilder(name);
      this.builders.set(name, builder);
    }
    return builder;
  }

  run(items: readonly Item[]): Layout {
    for (const item of items) {
      if (item.kind === 'label') this.builder(this.section);
      else if (item.kind === 'group') this.group(item);
      else if (item.kind === 'directive') this.directive(item.directive, item);
    }
    if (this.open !== undefined) {
      this.diagnostics.warning(
        { line: this.open.line },
        'function-mismatch',
        `.ent ${this.open.name} has no matching .end.`,
      );
    }
    for (const common of this.symbols.commons.values()) {
      if (!common.local) continue;
      const builder = this.builder(commonSection(common.size, this.gpSize));
      const align = commonAlignment(common.size, common.align);
      builder.reserve(common.size, align);
    }
    return {
      sections: [...this.builders.values()].map((b) => b.finish()),
      labels: this.labels,
      functions: this.functions,
    };
  }

  private group(group: Group): void {
    const builder = this.builder(group.section);
    for (const word of group.words) {
      const offset = builder.offset;
      const ctx = { labels: this.labels, section: group.section, offset };
      const operands: Operand[] = [];
      const relocations: RelocationDraft[] = [];
      let failed = false;
      for (const { slot, value } of word.args) {
        const resolved = resolveArg(slot, value, ctx);
        if (isError(resolved)) {
          this.diagnostics.error(group, resolved.code, `${word.row.mnemonic}: ${resolved.message}`);
          failed = true;
          break;
        }
        operands.push(resolved.value);
        if (resolved.relocation !== undefined) relocations.push(resolved.relocation);
      }
      const encoded = failed ? 0 : encode({ mnemonic: word.row.mnemonic as Mnemonic, operands });
      for (const relocation of relocations) builder.relocations.push({ offset, ...relocation });
      builder.pushWord(encoded, originOf(group, word));
    }
  }

  private directive(d: Directive, at: { line: number; column: number }): void {
    const origin: WordOrigin = { line: at.line, kind: 'data' };
    switch (d.kind) {
      case 'section':
        this.section = d.name;
        this.builder(d.name);
        break;
      case 'align': {
        const builder = this.builder(this.section);
        builder.pad(padding(builder.offset, 2 ** d.power), { line: at.line, kind: 'align' });
        break;
      }
      case 'space':
        this.builder(this.section).pad(d.size, origin);
        break;
      case 'bytes':
      case 'values':
        this.data(d, at, origin);
        break;
      case 'ent':
        if (this.open !== undefined) {
          this.diagnostics.warning(
            at,
            'function-mismatch',
            `.ent ${d.name} appears before .end ${this.open.name}.`,
          );
        }
        this.open = {
          name: d.name,
          line: at.line,
          start: Math.floor(this.builder('.text').offset / 4),
        };
        break;
      case 'end':
        this.end(d, at);
        break;
      case 'frame':
      case 'mask':
      case 'fmask':
        if (this.open === undefined) {
          this.diagnostics.warning(
            at,
            'function-mismatch',
            `.${d.kind} appears outside a function.`,
          );
        } else if (d.kind === 'frame') {
          this.open.frame = { reg: d.reg, size: d.size, returnReg: d.returnReg };
        } else {
          this.open[d.kind] = { bits: d.bits, offset: d.offset };
        }
        break;
      default:
        break;
    }
  }

  private data(
    d: Extract<Directive, { kind: 'bytes' | 'values' }>,
    at: { line: number; column: number },
    origin: WordOrigin,
  ): void {
    // ASPSX accepts data in .bss and .sbss and keeps it (probe VERIFY-24).
    const builder = this.builder(this.section);
    if (d.kind === 'bytes') {
      builder.pushBytes(d.bytes, origin);
      return;
    }
    for (const expr of d.values) {
      const offset = builder.offset;
      const resolved = resolveData(d.unit, expr, {
        labels: this.labels,
        section: this.section,
        offset,
      });
      const bytes = new Uint8Array(d.unit);
      if (isError(resolved)) {
        this.diagnostics.error(at, resolved.code, resolved.message);
      } else {
        for (let i = 0; i < d.unit; i++) bytes[i] = (resolved.value >>> (8 * i)) & 0xff;
        if (resolved.relocation !== undefined)
          builder.relocations.push({ offset, ...resolved.relocation });
      }
      builder.pushBytes(bytes, origin);
    }
  }

  private end(d: Extract<Directive, { kind: 'end' }>, at: { line: number; column: number }): void {
    const open = this.open;
    this.open = undefined;
    if (open === undefined || (d.name !== undefined && d.name !== open.name)) {
      const name = d.name === undefined ? '.end' : `.end ${d.name}`;
      this.diagnostics.warning(at, 'function-mismatch', `${name} does not close an open .ent.`);
      return;
    }
    this.functions.push({
      name: open.name,
      section: '.text',
      start: open.start,
      end: Math.floor(this.builder('.text').offset / 4),
      ...(open.frame === undefined ? {} : { frame: open.frame }),
      ...(open.mask === undefined ? {} : { mask: open.mask }),
      ...(open.fmask === undefined ? {} : { fmask: open.fmask }),
    });
  }
}

export function layout(
  items: readonly Item[],
  symbols: SymbolTable,
  gpSize: number,
  diagnostics: Diagnostics,
): Layout {
  const labels = assignLabels(items, symbols, gpSize);
  return new Emitter(labels, symbols, gpSize, diagnostics).run(items);
}
