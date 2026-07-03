import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8');
const ico = await readFile(new URL('../public/favicon.ico', import.meta.url));
const layout = await readFile(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');

assert.match(svg, /viewBox="0 0 128 128"/);
assert.equal((svg.match(/<rect\b/g) ?? []).length, 7);
for (const color of ['#f7f3ea', '#9a3b12', '#f59e0b', '#1b1916', '#e2875a', '#fbbf24']) {
  assert.ok(svg.toLowerCase().includes(color), `favicon.svg must include ${color}`);
}
assert.match(svg, /prefers-color-scheme:\s*dark/);

assert.match(layout, /rel="icon"\s+type="image\/svg\+xml"/);
assert.match(layout, /favicon\.svg/);
assert.match(layout, /favicon\.ico/);

assert.equal(ico.readUInt16LE(0), 0);
assert.equal(ico.readUInt16LE(2), 1);
const count = ico.readUInt16LE(4);
const sizes = new Set();
for (let index = 0; index < count; index += 1) {
  const offset = 6 + index * 16;
  const width = ico[offset] || 256;
  const height = ico[offset + 1] || 256;
  if (width === height) sizes.add(width);
}
assert.ok(sizes.has(16), 'favicon.ico must contain a 16x16 image');
assert.ok(sizes.has(32), 'favicon.ico must contain a 32x32 image');

console.log('favicon contract: ok');
