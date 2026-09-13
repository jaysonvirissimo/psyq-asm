// SPDX-License-Identifier: MIT
/**
 * Read the section contents of a PsyQ LNK object file (what ASPSX writes), so
 * words from the real assembler can be compared with this package's words.
 *
 *   node scripts/psyq-object.mjs <file.obj>     prints { "words": ["0x........", ...] } for .text
 *
 * The record layouts follow the published notes on the format (the ones
 * pcsx-redux's psyq-obj-parser and maspsx's aspsx/util.py are based on); this is
 * an independent implementation. Relocation records are parsed to keep the
 * reader in step and are reported with their raw type and offset, but not
 * interpreted: the section bytes are exactly what the assembler wrote.
 */
import { readFileSync } from 'node:fs';

/**
 * @param {Uint8Array} bytes the whole object file
 * @returns {{ sections: Map<string, { bytes: Uint8Array, patches: { type: number, offset: number }[] }> }}
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
    const op = u8('expression');
    switch (op) {
      case 0: // value
        skip(4, 'expression value');
        return;
      case 2: // symbol
      case 4: // section base
      case 12: // section start
      case 22: // section end
        skip(2, 'expression operand');
        return;
      case 44: // add
      case 46: // subtract
      case 50: // divide
        expression();
        expression();
        return;
      default:
        throw new Error(
          `unknown expression operator ${String(op)} at byte 0x${(ptr - 1).toString(16)}`,
        );
    }
  };

  if (bytes.byteLength < 4 || new TextDecoder().decode(bytes.subarray(0, 3)) !== 'LNK') {
    throw new Error('not a PsyQ object (missing LNK signature)');
  }
  if (bytes[3] !== 2) throw new Error(`unknown PsyQ object version ${String(bytes[3])}`);
  ptr = 4;

  /** @type {Map<number, string>} */
  const names = new Map();
  /** @type {Map<string, { chunks: Uint8Array[], size: number, patches: { type: number, offset: number }[] }>} */
  const contents = new Map();
  let current;
  const section = () => {
    if (current === undefined)
      throw new Error(`section data before any SWITCH at byte 0x${ptr.toString(16)}`);
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
        target.chunks.push(bytes.slice(ptr, ptr + size));
        target.size += size;
        ptr += size;
        break;
      }
      case 6: {
        // switch section
        const id = u16('SWITCH');
        const name = names.get(id);
        if (name === undefined) throw new Error(`SWITCH to unknown section ${String(id)}`);
        if (!contents.has(name)) contents.set(name, { chunks: [], size: 0, patches: [] });
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
        expression();
        section().patches.push({ type, offset });
        break;
      }
      case 12: // exported symbol
        skip(8, 'EXPORTED_SYMBOL');
        string('EXPORTED_SYMBOL name');
        break;
      case 14: // imported symbol
        skip(2, 'IMPORTED_SYMBOL');
        string('IMPORTED_SYMBOL name');
        break;
      case 16: {
        // section
        const id = u16('SECTION id');
        skip(3, 'SECTION group and alignment');
        names.set(id, string('SECTION name'));
        break;
      }
      case 18: // local symbol
        skip(6, 'LOCAL_SYMBOL');
        string('LOCAL_SYMBOL name');
        break;
      case 28: // file name
        skip(2, 'FILENAME');
        string('FILENAME name');
        break;
      case 46: // program type
        skip(1, 'PROGRAMTYPE');
        break;
      case 48: // uninitialized
        skip(8, 'UNINITIALIZED');
        string('UNINITIALIZED name');
        break;
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

  const sections = new Map();
  for (const [name, { chunks, size, patches }] of contents) {
    const joined = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      joined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    sections.set(name, { bytes: joined, patches });
  }
  return { sections };
}

/**
 * @param {Uint8Array} bytes
 * @returns {number[]} little-endian words; a trailing partial word is an error
 */
export function wordsOf(bytes) {
  if (bytes.byteLength % 4 !== 0)
    throw new Error(`${String(bytes.byteLength)} bytes is not whole words`);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return Array.from({ length: bytes.byteLength / 4 }, (_, i) => view.getUint32(i * 4, true));
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
  const text = readPsyqObject(readFileSync(file)).sections.get('.text');
  const words = text === undefined ? [] : wordsOf(text.bytes);
  console.log(
    JSON.stringify({
      words: words.map((w) => `0x${w.toString(16).toUpperCase().padStart(8, '0')}`),
    }),
  );
}
