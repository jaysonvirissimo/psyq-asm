// SPDX-License-Identifier: MIT
/**
 * The differential oracle (see scripts/oracle.mjs and CONTRIBUTING.md). It needs
 * a local checkout of an already-matched decompilation, its original executable,
 * and a manifest, named by environment variables, plus `npm run build`. Without
 * them the suite skips. The detailed report goes to tmp/oracle/status.json (never
 * committed); only the aggregate summary.json beside this file is updated.
 */
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const checkout = process.env['PSYQ_ASM_ORACLE_CHECKOUT'];
const executable = process.env['PSYQ_ASM_ORACLE_EXECUTABLE'];
const manifest = process.env['PSYQ_ASM_ORACLE_MANIFEST'];

describe('differential oracle', () => {
  if (checkout === undefined || executable === undefined || manifest === undefined) {
    it.skip('skipped: set PSYQ_ASM_ORACLE_CHECKOUT, PSYQ_ASM_ORACLE_EXECUTABLE, and PSYQ_ASM_ORACLE_MANIFEST', () => {
      // Nothing to run without the oracle inputs.
    });
    return;
  }

  it('assembles every manifest function to the executable words under relocation masks', async () => {
    const { runOracle } = await import('../../scripts/oracle.mjs');
    const summary = fileURLToPath(new URL('./summary.json', import.meta.url));
    const report = await runOracle({ checkout, executable, manifest, summary });
    expect(report.results.length).toBeGreaterThan(0);
    expect(report.results.filter((result) => !(result as { equal: boolean }).equal)).toEqual([]);
  });
});
