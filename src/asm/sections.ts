// SPDX-License-Identifier: MIT
import type { Relocation, Section, WordOrigin } from '../public-types.js';

export type SectionKind = Section['kind'];

/**
 * `.text` holds code; `.bss` and `.sbss` reserve space (and may also hold data,
 * which ASPSX keeps); everything else is data.
 */
export function sectionKind(name: string): SectionKind {
  if (name === '.text') return 'code';
  if (name === '.bss' || name === '.sbss') return 'bss';
  return 'data';
}

function padding(offset: number, alignment: number): number {
  return (alignment - (offset % alignment)) % alignment;
}

/**
 * Accumulates one section's contents during layout. A bss section has two
 * cursors, as in ASPSX 2.81: one for what `.byte`, `.word`, `.space`, and
 * `.align` put there, and one for `.lcomm` allocations, which counts from zero
 * beside the first (probe VERIFY-24). Its size is the two together.
 */
export class SectionBuilder {
  readonly name: string;
  readonly kind: SectionKind;
  readonly relocations: Relocation[] = [];
  private readonly data: number[] = [];
  private readonly origins: WordOrigin[] = [];
  /** bss only: zero bytes at the end of the data cursor, not yet written out. */
  private zeros = 0;
  /** bss only: the `.lcomm` cursor. */
  private reserved = 0;

  constructor(name: string) {
    this.name = name;
    this.kind = sectionKind(name);
  }

  /** The data cursor, in bytes. */
  get offset(): number {
    return this.data.length + this.zeros;
  }

  pushWord(word: number, origin: WordOrigin): void {
    this.data.push(word & 0xff, (word >>> 8) & 0xff, (word >>> 16) & 0xff, word >>> 24);
    this.origins.push(origin);
  }

  pushBytes(bytes: Uint8Array, origin: WordOrigin): void {
    for (; this.zeros > 0; this.zeros--) this.data.push(0);
    for (const byte of bytes) this.data.push(byte);
    this.coverWithOrigin(origin);
  }

  /** Reserve zeroed space: nop words where code is word-aligned, zero bytes otherwise. */
  pad(size: number, origin: WordOrigin): void {
    if (this.kind === 'bss') {
      this.zeros += size;
      return;
    }
    let remaining = size;
    if (this.kind === 'code' && this.data.length % 4 === 0) {
      for (; remaining >= 4; remaining -= 4) this.pushWord(0, origin);
    }
    this.pushBytes(new Uint8Array(remaining), origin);
  }

  /** bss only: allocate an `.lcomm` on its own cursor, returning its offset. */
  reserve(size: number, alignment: number): number {
    const offset = this.reserved + padding(this.reserved, alignment);
    this.reserved = offset + size;
    return offset;
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
    const size = this.offset + this.reserved;
    // A bss section that never held data has no contents; one that did has all of them.
    const bytes = this.data.length === 0 ? new Uint8Array(0) : new Uint8Array(size);
    bytes.set(this.data);
    return { name: this.name, kind: this.kind, bytes, size, relocations: this.relocations };
  }
}
