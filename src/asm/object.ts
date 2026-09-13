// SPDX-License-Identifier: MIT
import type { NormalizedAssembleOptions } from '../options.js';
import type { AssembledObject, SmallDataEntry, SymbolEntry } from '../public-types.js';
import { commonSection, type Layout } from './layout.js';
import { isLocalLabel, type SymbolTable } from './symbols.js';

function symbolEntries(table: SymbolTable, laidOut: Layout, gpSize: number): SymbolEntry[] {
  const entries: SymbolEntry[] = [];
  for (const name of table.order) {
    if (isLocalLabel(name)) continue;
    const location = laidOut.labels.get(name);
    const common = table.labels.has(name) ? undefined : table.commons.get(name);
    if (common !== undefined && !common.local) {
      // The linker places a .comm symbol; the object records its section and size.
      entries.push({
        name,
        binding: 'common',
        section: commonSection(common.size, gpSize),
        size: common.size,
      });
    } else if (location === undefined) {
      const size = table.externs.get(name);
      entries.push({ name, binding: 'extern', ...(size === undefined ? {} : { size }) });
    } else if (common !== undefined) {
      entries.push({
        name,
        binding: 'local',
        section: location.section,
        offset: location.offset,
        size: common.size,
      });
    } else {
      entries.push({
        name,
        binding: table.globals.has(name) ? 'global' : 'local',
        section: location.section,
        offset: location.offset,
      });
    }
  }
  return entries;
}

export function buildObject(
  options: NormalizedAssembleOptions,
  laidOut: Layout,
  table: SymbolTable,
  smallData: ReadonlyMap<string, SmallDataEntry>,
): AssembledObject {
  return {
    info: {
      aspsxVersion: options.aspsxVersion,
      gpSize: options.gpSize,
      partialDivExpansion: options.partialDivExpansion,
    },
    sections: laidOut.sections,
    symbols: symbolEntries(table, laidOut, options.gpSize),
    functions: laidOut.functions,
    smallData: [...smallData.values()],
  };
}
