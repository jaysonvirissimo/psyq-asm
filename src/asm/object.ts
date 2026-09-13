// SPDX-License-Identifier: MIT
import type { NormalizedAssembleOptions } from '../options.js';
import type { AssembledObject, SmallDataEntry, SymbolEntry } from '../public-types.js';
import type { Layout } from './layout.js';
import { isLocalLabel, type SymbolTable } from './symbols.js';

function symbolEntries(table: SymbolTable, laidOut: Layout): SymbolEntry[] {
  const entries: SymbolEntry[] = [];
  for (const name of table.order) {
    if (isLocalLabel(name)) continue;
    const location = laidOut.labels.get(name);
    const common = table.commons.get(name);
    if (location === undefined) {
      const size = table.externs.get(name);
      entries.push({ name, binding: 'extern', ...(size === undefined ? {} : { size }) });
    } else if (common !== undefined && !table.labels.has(name)) {
      entries.push({
        name,
        binding: common.local ? 'local' : 'common',
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
    symbols: symbolEntries(table, laidOut),
    functions: laidOut.functions,
    smallData: [...smallData.values()],
  };
}
