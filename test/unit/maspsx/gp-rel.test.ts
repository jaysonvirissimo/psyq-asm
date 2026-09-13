// SPDX-License-Identifier: MIT
/**
 * Ported from mkst/maspsx (MIT), tests/test_gp_rel.py.
 *
 * ASPSX 2.81 addresses `symbol+offset` and `la` through $gp, so the upstream
 * cases that model older assemblers (gp_allow_offset=False on a .comm symbol,
 * gp_allow_la=False) are not ported. Upstream passes sdata_limit=65536.
 */
import { describe, expect, it } from 'vitest';
import { assembleOk, sectionOf, src } from '../../helpers/assembly.js';
import { listing } from '../../helpers/listing.js';

const options = { gpSize: 65536 };

function addends(text: string): number[] {
  return sectionOf(assembleOk(text, options), '.text').relocations.map((r) =>
    r.kind === 'GPREL16' && r.target.kind === 'symbol' ? r.target.addend : Number.NaN,
  );
}

describe('maspsx test_gp_rel', () => {
  it('test_gp_rel_load_with_offset', () => {
    const text = src(
      '\t.comm\tsavedInfoTracker,16',
      '\tlw\t$4,savedInfoTracker+4',
      '\tlw\t$2,savedInfoTracker+8',
    );
    expect(listing(text, options)).toEqual(['lw $4,0x0($28)', 'lw $2,0x0($28)']);
    expect(addends(text)).toEqual([4, 8]);
  });

  it('test_gp_rel_comm_with_alignment', () => {
    expect(
      listing(src('\t.comm\tsavedInfoTracker,16,4', '\tlw\t$4,savedInfoTracker'), options),
    ).toEqual(['lw $4,0x0($28)']);
  });

  it('test_gp_rel_load_with_offset_not_allowed_lcomm (same result on 2.81)', () => {
    const text = src(
      '\t.lcomm\tsavedInfoTracker,16',
      '\tlw\t$4,savedInfoTracker+4',
      '\tlw\t$2,savedInfoTracker+8',
    );
    expect(listing(text, options)).toEqual(['lw $4,0x0($28)', 'lw $2,0x0($28)']);
  });

  it('test_gp_rel_load_with_offset_not_allowed_sdata (same result on 2.81)', () => {
    const text = src(
      '\t.sdata',
      '\tsavedInfoTracker:',
      '\t.word\t1',
      '\t.word\t2',
      '\t.word\t3',
      '\t.word\t4',
      '\t.section .text',
      '\tlw\t$4,savedInfoTracker+4',
      '\tlw\t$2,savedInfoTracker+8',
    );
    expect(listing(text, options)).toEqual(['lw $4,0x0($28)', 'lw $2,0x0($28)']);
    expect(addends(text)).toEqual([4, 8]);
  });

  it('test_gp_rel_store_with_offset', () => {
    const text = src(
      '\t.comm\tsavedInfoTracker,16',
      '\tsw\t$4,savedInfoTracker+4',
      '\tsw\t$2,savedInfoTracker+8',
    );
    expect(listing(text, options)).toEqual(['sw $4,0x0($28)', 'sw $2,0x0($28)']);
  });

  it('test_gp_rel_load_address_with_offset', () => {
    const text = src('\t.comm\tRaziel,1464', '\tla\t$5,Raziel+1380');
    expect(listing(text, options)).toEqual(['addiu $5,$28,0x0']);
    expect(addends(text)).toEqual([1380]);
  });

  it('test_gp_rel_load_address_gp_allow_la_true', () => {
    expect(
      listing(src('\t.comm\tDefaultStateTable,248', '\tla\t$2,DefaultStateTable'), options),
    ).toEqual(['addiu $2,$28,0x0']);
  });
});
