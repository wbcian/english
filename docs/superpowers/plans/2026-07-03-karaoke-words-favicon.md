# Karaoke Words Favicon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Astro placeholder favicon with the approved Karaoke Words mark, including SVG dark-mode support and a crisp 16/32 px ICO fallback.

**Architecture:** Keep the favicon as static public assets. Add explicit icon declarations to the shared Astro layout and a small Node contract test that verifies the SVG geometry/color roles, layout links, and ICO directory sizes without adding runtime dependencies.

**Tech Stack:** Astro, SVG, Node.js assertions, Python Pillow for deterministic binary ICO generation.

---

### Task 1: Add a failing favicon contract test

**Files:**
- Create: `app/scripts/test-favicon.mjs`
- Modify: `app/package.json`

- [ ] **Step 1: Create the contract test**

```js
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
```

- [ ] **Step 2: Add the package script**

Add this entry to `app/package.json` under `scripts`:

```json
"test:favicon": "node scripts/test-favicon.mjs"
```

- [ ] **Step 3: Run the test and verify the old favicon fails**

Run: `npm run test:favicon`

Expected: FAIL because the current Astro favicon does not contain the approved geometry, colors, explicit layout links, and both ICO sizes.

### Task 2: Implement the SVG, ICO, and layout links

**Files:**
- Modify: `app/public/favicon.svg`
- Modify: `app/public/favicon.ico`
- Modify: `app/src/layouts/Layout.astro:10-15`

- [ ] **Step 1: Replace the SVG with the approved vector mark**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img">
  <title>English read-along</title>
  <style>
    .paper { fill: #f7f3ea; }
    .brand { fill: #9a3b12; }
    .audio { fill: #f59e0b; }
    @media (prefers-color-scheme: dark) {
      .paper { fill: #1b1916; }
      .brand { fill: #e2875a; }
      .audio { fill: #fbbf24; }
    }
  </style>
  <rect class="paper" x="8" y="8" width="112" height="112" rx="24" />
  <rect class="brand" x="24" y="29" width="9" height="70" rx="4.5" />
  <rect class="audio" x="44" y="34" width="18" height="14" rx="7" />
  <rect class="audio" x="70" y="34" width="14" height="14" rx="7" />
  <rect class="brand" x="92" y="34" width="20" height="14" rx="7" />
  <rect class="audio" x="44" y="72" width="30" height="14" rx="7" />
  <rect class="brand" x="82" y="72" width="28" height="14" rx="7" />
</svg>
```

- [ ] **Step 2: Generate a two-frame ICO with pixel-aligned artwork**

Use the bundled Python runtime and Pillow to draw dedicated 16 px and 32 px frames, encode them as PNG, and pack them into one ICO directory. Use the light palette for this fallback.

```python
from io import BytesIO
from pathlib import Path
import struct
from PIL import Image, ImageDraw

PAPER = '#f7f3ea'
BRAND = '#9a3b12'
AUDIO = '#f59e0b'

def frame(size):
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    if size == 16:
        draw.rounded_rectangle((1, 1, 15, 15), radius=3, fill=PAPER)
        draw.rectangle((3, 4, 3, 12), fill=BRAND)
        draw.rectangle((6, 4, 7, 5), fill=AUDIO)
        draw.rectangle((9, 4, 10, 5), fill=AUDIO)
        draw.rectangle((12, 4, 14, 5), fill=BRAND)
        draw.rectangle((6, 9, 9, 10), fill=AUDIO)
        draw.rectangle((11, 9, 14, 10), fill=BRAND)
    else:
        draw.rounded_rectangle((2, 2, 30, 30), radius=6, fill=PAPER)
        draw.rounded_rectangle((6, 7, 8, 25), radius=1, fill=BRAND)
        draw.rounded_rectangle((11, 9, 16, 12), radius=2, fill=AUDIO)
        draw.rounded_rectangle((18, 9, 21, 12), radius=2, fill=AUDIO)
        draw.rounded_rectangle((23, 9, 28, 12), radius=2, fill=BRAND)
        draw.rounded_rectangle((11, 18, 19, 22), radius=2, fill=AUDIO)
        draw.rounded_rectangle((21, 18, 28, 22), radius=2, fill=BRAND)
    return image

payloads = []
for size in (16, 32):
    output = BytesIO()
    frame(size).save(output, format='PNG')
    payloads.append((size, output.getvalue()))

header = struct.pack('<HHH', 0, 1, len(payloads))
offset = 6 + 16 * len(payloads)
entries = []
for size, payload in payloads:
    entries.append(struct.pack('<BBBBHHII', size, size, 0, 0, 1, 32, len(payload), offset))
    offset += len(payload)

Path('app/public/favicon.ico').write_bytes(header + b''.join(entries) + b''.join(data for _, data in payloads))
```

- [ ] **Step 3: Declare SVG and ICO assets in the shared layout**

Insert after the color-scheme meta tag:

```astro
<link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}favicon.svg`} />
<link rel="icon" type="image/x-icon" href={`${import.meta.env.BASE_URL}favicon.ico`} />
```

- [ ] **Step 4: Run the contract test**

Run: `npm run test:favicon`

Expected: PASS with `favicon contract: ok`.

### Task 3: Visual and build verification

**Files:**
- Verify: `app/public/favicon.svg`
- Verify: `app/public/favicon.ico`
- Verify: `app/src/layouts/Layout.astro`

- [ ] **Step 1: Render the assets at target sizes**

Render the SVG at 16, 32, and 128 px in both light and dark modes. Inspect the ICO's 16 px and 32 px frames. Confirm the five word pills stay separate and the mark does not collapse into an E or menu.

- [ ] **Step 2: Run the app build**

Run: `npm run build`

Expected: exit code 0 and Astro reports a successful build.

- [ ] **Step 3: Run the project-required simplification pass**

Review only the changed favicon test, SVG, layout links, and generation result for unnecessary duplication or complexity. Make behavior-preserving cleanup only, then rerun `npm run test:favicon` and `npm run build`.

- [ ] **Step 4: Verify in the browser**

Open the built app homepage and one lesson page. Confirm the tab uses the new mark and that both `/favicon.svg` and `/favicon.ico` return successfully.

- [ ] **Step 5: Commit the implementation**

```bash
git add app/public/favicon.svg app/public/favicon.ico app/src/layouts/Layout.astro app/scripts/test-favicon.mjs app/package.json
git commit -m "feat: add karaoke words favicon"
```
