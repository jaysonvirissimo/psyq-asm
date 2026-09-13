// SPDX-License-Identifier: MIT
/**
 * Read a PsyQ LNK object file (what ASPSX writes), so the output of the real
 * assembler can be compared with this package's.
 *
 *   node scripts/psyq-object.mjs <file.obj>
 *
 * prints { "words": ["0x........", ...], "data": {...} }: the .text words, and
 * the object's section sizes, relocations, and defined symbols in the form
 * `dataOf` describes.
 *
 * The record layouts follow the published notes on the format (the ones
 * pcsx-redux's psyq-obj-parser and maspsx's aspsx/util.py are based on); this is
 * an independent implementation. A relocation's offset counts from where the
 * section's most recent BYTES record began, which is how the linker reads it.
 */
import { readFileSync } from 'node:fs';

const RELOCATION_KINDS = new Map([
  [16, 'WORD32'],
  [74, 'MIPS26'],
  [82, 'HI16'],
  [84, 'LO16'],
  [100, 'GPREL16'],
]);

/**
 * @typedef {{ symbol: string, addend: number } | { section: string, offset: number } | { value: number } | { unsupported: string }} PatchTarget
 * @typedef {{ type: number, kind: string, offset: number, target: PatchTarget }} Patch
 * @typedef {{ name: string, section: string, offset: number }} PlacedSymbol
 * @typedef {{ name: string, section: string, size: number }} CommonSymbol
 * @typedef {{ sections: Map<string, { bytes: Uint8Array, size: number, patches: Patch[] }>, symbols: { exports: PlacedSymbol[], locals: PlacedSymbol[], commons: CommonSymbol[], imports: { name: string }[] } }} PsyqObject
 */

/**
 * @param {Uint8Array} bytes the whole object file
 * @returns {PsyqObject}
 */
export function readPsyqObject(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let ptr = 0;
  const need = (count, what) => {
    if (ptr + count > bytes.byteLength) {
      throw new Error(`truncated object: ${what} at byte 0x${ptr.toString(16)}`);
    }
  };
  const u8 = (what) => {
    need(1, what);
    return bytes[ptr++];
  };
  const u16 = (what) => {
    need(2, what);
    const value = view.getUint16(ptr, true);
    ptr += 2;
    return value;
  };
  const u32 = (what) => {
    need(4, what);
    const value = view.getUint32(ptr, true);
    ptr += 4;
    return value;
  };
  const skip = (count, what) => {
    need(count, what);
    ptr += count;
  };
  const string = (what) => {
    const length = u8(what);
    need(length, what);
    const text = new TextDecoder().decode(bytes.subarray(ptr, ptr + length));
    ptr += length;
    return text;
  };
  const expression = () => {
    const at = ptr;
    const op = u8('expression');
    switch (op) {
      case 0:
        return { op: 'value', value: u32('expression value') };
      case 2:
        return { op: 'symbol', id: u16('expression operand') };
      case 4:
        return { op: 'base', id: u16('expression operand') };
      case 12:
        return { op: 'start', id: u16('expression operand') };
      case 22:
        return { op: 'end', id: u16('expression operand') };
      case 44:
      case 46:
      case 50: {
        const right = expression();
        const left = expression();
        return { op: op === 44 ? 'add' : op === 46 ? 'sub' : 'div', left, right };
      }
      default:
        throw new Error(`unknown expression operator ${String(op)} at byte 0x${at.toString(16)}`);
    }
  };

  if (bytes.byteLength < 4 || new TextDecoder().decode(bytes.subarray(0, 3)) !== 'LNK') {
    throw new Error('not a PsyQ object (missing LNK signature)');
  }
  if (bytes[3] !== 2) throw new Error(`unknown PsyQ object version ${String(bytes[3])}`);
  ptr = 4;

  /** @type {Map<number, string>} */
  const sectionNames = new Map();
  /** @type {Map<number, string>} */
  const symbolNames = new Map();
  const contents = new Map();
  const raw = { exports: [], locals: [], commons: [], imports: [] };
  let current;
  const section = () => {
    if (current === undefined) {
      throw new Error(`section data before any SWITCH at byte 0x${ptr.toString(16)}`);
    }
    return current;
  };

  records: while (ptr < bytes.byteLength) {
    const at = ptr;
    const opcode = u8('record');
    switch (opcode) {
      case 0: // end
        break records;
      case 2: {
        // bytes
        const size = u16('BYTES size');
        need(size, 'BYTES payload');
        const target = section();
        target.pointer = target.size;
        target.chunks.push(bytes.slice(ptr, ptr + size));
        target.size += size;
        ptr += size;
        break;
      }
      case 6: {
        // switch section
        const id = u16('SWITCH');
        const name = sectionNames.get(id);
        if (name === undefined) throw new Error(`SWITCH to unknown section ${String(id)}`);
        if (!contents.has(name))
          contents.set(name, { chunks: [], size: 0, pointer: 0, patches: [] });
        current = contents.get(name);
        break;
      }
      case 8: {
        // zeroes
        const size = u32('ZEROES size');
        const target = section();
        target.chunks.push(new Uint8Array(size));
        target.size += size;
        break;
      }
      case 10: {
        // relocation
        const type = u8('RELOCATION type');
        const offset = u16('RELOCATION offset');
        const expr = expression();
        const target = section();
        target.patches.push({ type, offset: target.pointer + offset, expr });
        break;
      }
      case 12: {
        // exported symbol
        const id = u16('EXPORTED_SYMBOL');
        const sectionId = u16('EXPORTED_SYMBOL');
        const offset = u32('EXPORTED_SYMBOL');
        const name = string('EXPORTED_SYMBOL name');
        symbolNames.set(id, name);
        raw.exports.push({ name, sectionId, offset });
        break;
      }
      case 14: {
        // imported symbol
        const id = u16('IMPORTED_SYMBOL');
        const name = string('IMPORTED_SYMBOL name');
        symbolNames.set(id, name);
        raw.imports.push({ name });
        break;
      }
      case 16: {
        // section
        const id = u16('SECTION id');
        skip(3, 'SECTION group and alignment');
        sectionNames.set(id, string('SECTION name'));
        break;
      }
      case 18: {
        // local symbol
        const sectionId = u16('LOCAL_SYMBOL');
        const offset = u32('LOCAL_SYMBOL');
        const name = string('LOCAL_SYMBOL name');
        raw.locals.push({ name, sectionId, offset });
        break;
      }
      case 28: // file name
        skip(2, 'FILENAME');
        string('FILENAME name');
        break;
      case 46: // program type
        skip(1, 'PROGRAMTYPE');
        break;
      case 48: {
        // uninitialized (a common symbol the linker places)
        const id = u16('UNINITIALIZED');
        const sectionId = u16('UNINITIALIZED');
        const size = u32('UNINITIALIZED');
        const name = string('UNINITIALIZED name');
        symbolNames.set(id, name);
        raw.commons.push({ name, sectionId, size });
        break;
      }
      case 50: // line number +1
        skip(2, 'INC_SLD_LINENUM');
        break;
      case 52: // line number by byte
        skip(3, 'INC_SLD_LINENUM_BY_BYTE');
        break;
      case 54: // line number by word
        skip(4, 'INC_SLD_LINENUM_BY_WORD');
        break;
      case 56: // set line number
        skip(6, 'SET_SLD_LINENUM');
        break;
      case 58: // set line number and file
        skip(8, 'SET_SLD_LINENUM_FILE');
        break;
      case 60: // end of line numbers
        skip(2, 'END_SLD');
        break;
      case 74: // function start
        skip(28, 'FUNCTION');
        string('FUNCTION name');
        break;
      case 76: // function end
      case 78: // block start
      case 80: // block end
        skip(10, 'FUNCTION_END or BLOCK');
        break;
      case 82: // definition
        skip(14, 'SECTION_DEF');
        string('SECTION_DEF name');
        break;
      case 84: {
        // definition with dimensions
        skip(14, 'SECTION_DEF2');
        const dims = u16('SECTION_DEF2 dimensions');
        skip(dims * 2, 'SECTION_DEF2 dimensions');
        string('SECTION_DEF2 tag');
        string('SECTION_DEF2 name');
        break;
      }
      case 86: // function start, second form
        skip(36, 'FUNCTION_START2');
        string('FUNCTION_START2 name');
        break;
      default:
        throw new Error(`unknown object record ${String(opcode)} at byte 0x${at.toString(16)}`);
    }
  }

  const sectionName = (id) => sectionNames.get(id) ?? `#${String(id)}`;
  // Reduce an expression to one anchor (a symbol or a section base) plus a
  // constant; anything else is reported, not guessed.
  const evaluate = (e) => {
    switch (e.op) {
      case 'value':
        return { addend: e.value };
      case 'symbol':
        return { symbol: symbolNames.get(e.id) ?? `#${String(e.id)}`, addend: 0 };
      case 'base':
        return { section: sectionName(e.id), addend: 0 };
      case 'add': {
        const left = evaluate(e.left);
        const right = evaluate(e.right);
        if ('unsupported' in left) return left;
        if ('unsupported' in right) return right;
        const anchors = [left, right].filter((t) => 'symbol' in t || 'section' in t);
        if (anchors.length > 1) return { unsupported: 'add' };
        return { ...anchors[0], addend: (left.addend + right.addend) >>> 0 };
      }
      default:
        return { unsupported: e.op };
    }
  };
  const targetOf = (expr) => {
    const t = evaluate(expr);
    if ('unsupported' in t) return { unsupported: t.unsupported };
    if ('symbol' in t) return { symbol: t.symbol, addend: t.addend | 0 };
    if ('section' in t) return { section: t.section, offset: t.addend >>> 0 };
    return { value: t.addend >>> 0 };
  };

  const sections = new Map();
  for (const [name, { chunks, size, patches }] of contents) {
    const joined = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      joined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    sections.set(name, {
      bytes: joined,
      size,
      patches: patches.map((p) => ({
        type: p.type,
        kind: RELOCATION_KINDS.get(p.type) ?? `type-${String(p.type)}`,
        offset: p.offset,
        target: targetOf(p.expr),
      })),
    });
  }
  const place = ({ name, sectionId, offset }) => ({
    name,
    section: sectionName(sectionId),
    offset,
  });
  return {
    sections,
    symbols: {
      exports: raw.exports.map(place),
      locals: raw.locals.map(place),
      commons: raw.commons.map(({ name, sectionId, size }) => ({
        name,
        section: sectionName(sectionId),
        size,
      })),
      imports: raw.imports,
    },
  };
}

/**
 * @param {Uint8Array} bytes
 * @returns {number[]} little-endian words; a trailing partial word is an error
 */
export function wordsOf(bytes) {
  if (bytes.byteLength % 4 !== 0) {
    throw new Error(`${String(bytes.byteLength)} bytes is not whole words`);
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return Array.from({ length: bytes.byteLength / 4 }, (_, i) => view.getUint32(i * 4, true));
}

const byName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

/**
 * The comparable description of an object: the sizes of its sections other
 * than .text (whose words are compared directly), every relocation with its
 * target, and the symbols it defines. Imports are left out, because psyq-asm
 * lists the externs a file declares while ASPSX lists the ones it references;
 * the local symbols ASPSX writes for -g0 code are the .lcomm ones.
 *
 * @param {PsyqObject} object
 */
export function dataOf({ sections, symbols }) {
  const sizes = {};
  for (const [name, s] of [...sections].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (name !== '.text' && s.size > 0) sizes[name] = s.size;
  }
  const relocations = [...sections]
    .flatMap(([name, s]) =>
      s.patches.map((p) => ({ section: name, offset: p.offset, kind: p.kind, target: p.target })),
    )
    .sort((a, b) =>
      a.section === b.section ? a.offset - b.offset : a.section < b.section ? -1 : 1,
    );
  return {
    sections: sizes,
    relocations,
    symbols: {
      exports: [...symbols.exports].sort(byName),
      commons: [...symbols.commons].sort(byName),
      locals: [...symbols.locals].sort(byName),
    },
  };
}

if (
  process.argv[1] !== undefined &&
  import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href
) {
  const file = process.argv[2];
  if (file === undefined) {
    console.error('usage: node scripts/psyq-object.mjs <file.obj>');
    process.exit(2);
  }
  const object = readPsyqObject(readFileSync(file));
  const text = object.sections.get('.text');
  const words = text === undefined ? [] : wordsOf(text.bytes);
  console.log(
    JSON.stringify({
      words: words.map((w) => `0x${w.toString(16).toUpperCase().padStart(8, '0')}`),
      data: dataOf(object),
    }),
  );
}
