// SPDX-License-Identifier: MIT
import type { Relocation, Section, WordOrigin } from '../public-types.js';

export type SectionKind = Section['kind'];

/** `.text` holds code; `.bss` and `.sbss` reserve space; everything else is data. */
export function sectionKind(name: string): SectionKind {
  if (name === '.text') return 'code';
  if (name === '.bss' || name === '.sbss') return 'bss';
  return 'data';
}

/** Accumulates one section's contents during layout. */
export class SectionBuilder {
  readonly name: string;
  readonly kind: SectionKind;
  readonly relocations: Relocation[] = [];
  private readonly data: number[] = [];
  private readonly origins: WordOrigin[] = [];
  private reserved = 0;

  constructor(name: string) {
    this.name = name;
    this.kind = sectionKind(name);
  }

  /** The current size, in bytes. */
  get offset(): number {
    return this.kind === 'bss' ? this.reserved : this.data.length;
  }

  pushWord(word: number, origin: WordOrigin): void {
    this.data.push(word & 0xff, (word >>> 8) & 0xff, (word >>> 16) & 0xff, word >>> 24);
    this.origins.push(origin);
  }

  pushBytes(bytes: Uint8Array, origin: WordOrigin): void {
    for (const byte of bytes) this.data.push(byte);
    this.coverWithOrigin(origin);
  }

  /** Reserve zeroed space: nop words where code is word-aligned, zero bytes otherwise. */
  pad(size: number, origin: WordOrigin): void {
    if (this.kind === 'bss') {
      this.reserved += size;
      return;
    }
    let remaining = size;
    if (this.kind === 'code' && this.data.length % 4 === 0) {
      for (; remaining >= 4; remaining -= 4) this.pushWord(0, origin);
    }
    this.pushBytes(new Uint8Array(remaining), origin);
  }

  private coverWithOrigin(origin: WordOrigin): void {
    if (this.kind !== 'code') return;
    while (this.origins.length * 4 < this.data.length) this.origins.push(origin);
  }

  finish(): Section {
    if (this.kind === 'code') {
      while (this.data.length % 4 !== 0) this.data.push(0);
      const bytes = Uint8Array.from(this.data);
      const view = new DataView(bytes.buffer);
      const words = new Uint32Array(bytes.length / 4);
      for (let i = 0; i < words.length; i++) words[i] = view.getUint32(i * 4, true);
      return {
        name: this.name,
        kind: this.kind,
        bytes,
        size: bytes.length,
        words,
        relocations: this.relocations,
        provenance: this.origins,
      };
    }
    return {
      name: this.name,
      kind: this.kind,
      bytes: Uint8Array.from(this.data),
      size: this.offset,
      relocations: this.relocations,
    };
  }
}
