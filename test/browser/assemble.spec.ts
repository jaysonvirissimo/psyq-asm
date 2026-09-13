// SPDX-License-Identifier: MIT
/**
 * Browser integration tests: the built dist/ in Chromium, Firefox, and WebKit,
 * loaded as plain ES modules from the harness page in test/browser/page/.
 */
import { expect, test, type Page } from '@playwright/test';
import { loadAspsxFixtures } from '../helpers/fixtures.js';

interface Harness {
  psyqAsm: {
    words: (source: string, gpSize: number) => { words?: string[]; diagnostics?: unknown[] };
    roundTrip: (words: number[]) => number[] | null;
    describe: (word: number) => { text: string; encoded: number | null };
  };
  psyqAsmReady?: boolean;
}

async function openHarness(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/test/browser/page/');
  await page.waitForFunction(() => (window as unknown as Harness).psyqAsmReady === true);
  return errors;
}

test.describe('psyq-asm in the browser', () => {
  test('assembles the ASPSX 2.81 ground truth word-exact', async ({ page }) => {
    const errors = await openHarness(page);
    for (const fixture of loadAspsxFixtures()) {
      const outcome = await page.evaluate(
        ([source, gpSize]) => (window as unknown as Harness).psyqAsm.words(source, gpSize),
        [fixture.source, fixture.gpSize] as const,
      );
      expect(outcome, fixture.name).toEqual({ words: fixture.expectedWords });
    }
    expect(errors).toEqual([]);
  });

  test('decodes, formats, encodes, and round-trips a program', async ({ page }) => {
    const errors = await openHarness(page);
    const described = await page.evaluate(() =>
      (window as unknown as Harness).psyqAsm.describe(0x27bdffa8),
    );
    expect(described).toEqual({ text: 'addiu $sp,$sp,-0x58', encoded: 0x27bdffa8 });
    const words = [0x2442ffff, 0x1440fffe, 0x00000000, 0x10000001, 0x03e00008];
    const again = await page.evaluate(
      (input) => (window as unknown as Harness).psyqAsm.roundTrip(input),
      words,
    );
    expect(again).toEqual(words);
    expect(errors).toEqual([]);
  });
});
