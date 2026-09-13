// SPDX-License-Identifier: MIT
// Vite consumer: bundle psyq-asm with default settings and assemble a fixture.
import { assemble } from 'psyq-asm';

const hex8 = (w) => `0x${w.toString(16).toUpperCase().padStart(8, '0')}`;

try {
  const fixture = await (await fetch('/div.json')).json();
  const result = assemble(fixture.source, { gpSize: fixture.gpSize });
  window.result = {
    success: result.success,
    words: result.success ? [...result.object.sections[0].words].map(hex8) : [],
  };
} catch (error) {
  window.result = { success: false, error: String(error) };
}
document.getElementById('out').textContent = JSON.stringify(window.result, null, 2);
