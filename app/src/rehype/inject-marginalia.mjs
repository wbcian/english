// Rehype plugin: restructure ONE opt-in lesson into the "MARGINALIA" wide-screen
// layout — each `## section` becomes a book "page": a heading, its reading well,
// and a margin rail carrying that section's apparatus (TOEIC chips, quiz answers,
// Sentence-Anatomy annotations, the Coach Max aside). Narrow screens collapse back
// to a single-column stack (CSS-only; see app/src/styles/marginalia.css).
//
// RELOCATION-ONLY — the decisive safety property (same as inject-bilingual). This
// plugin NEVER reads, rewrites, splits, or reorders a speakable node: a
// `blockquote`, a `blockquote > p`, a leading `<strong>` speaker label, a
// `<span class="w">` karaoke word, a `word`-column table cell, or their text. It
// only:
//   1. re-parents intact block nodes (blockquotes, tables, .bilingual, the <h2>)
//      into new <section>/<div> wrappers, and
//   2. moves author-marked, NON-SPEAKABLE rail callouts into the rail.
// Because the content-addressed audio hash is a pure function of the speakable
// `<p>` subtree (computed by inject-word-spans earlier in this same run, and by
// generate-audio's independent raw-markdown parse), and because every speech.ts /
// generate-audio selector is anchored at `blockquote`/`table` (never at <article>
// or a fixed depth), relocating those nodes deeper is invisible to hashing and
// karaoke. No audio regeneration → build stays generated=0.
//
// Rail callouts are authored as NON-BLOCKQUOTE markdown (top-level paragraphs /
// lists) prefixed with a `[!type]` marker. This is load-bearing: generate-audio's
// collectSpeakable only extracts from `blockquote` and `word`-tables, so a
// non-blockquote paragraph — even one containing an English example sentence —
// is never hashed. inject-lang / inject-word-spans likewise only touch
// `blockquote`, so these callouts never become speakable. See lessons/_conventions.md.
//
// Runs LAST in astro.config.mjs (after inject-bilingual) so the `.bilingual`
// Close-Reading div already exists and all hash-sensitive transforms have finished
// on the intact subtree first.

import { readFileSync } from 'node:fs';
import { hastText } from './hast-speakable.mjs';

// The layout's CSS is injected as an inline <style> INSIDE this lesson's content
// (below), so no shared page/layout file is touched — every other lesson stays
// byte-identical. Read once at module load.
const MARGINALIA_CSS = readFileSync(new URL('../styles/marginalia.css', import.meta.url), 'utf8');

const RAIL_MARKERS = ['chips', 'note', 'anno', 'answer'];

const isEl = (n, tag) => !!n && n.type === 'element' && (!tag || n.tagName === tag);
const isH2 = (n) => isEl(n, 'h2');
const isHr = (n) => isEl(n, 'hr');
const isTable = (n) => isEl(n, 'table');
const isBilingual = (n) =>
  isEl(n, 'div') && (n.properties?.className ?? []).includes('bilingual');
const isWhitespace = (n) => n?.type === 'text' && !n.value.trim();
const pad = (x) => String(x).padStart(2, '0');
const el = (tagName, className, children, extra = {}) => ({
  type: 'element',
  tagName,
  properties: { ...(className.length ? { className } : {}), ...extra },
  children,
});
const textNode = (value) => ({ type: 'text', value });

// Index of the next element sibling at/after i (skipping whitespace-only text).
function nextElementIndex(children, i) {
  let j = i;
  while (j < children.length && !isEl(children[j])) j++;
  return j;
}

// The rail-callout marker (`chips`/`note`/`anno`/`answer`) at the start of a
// paragraph's text, or null. Takes already-extracted text so the caller walks the
// subtree once.
function markerOf(text) {
  return RAIL_MARKERS.find((m) => text.startsWith(`[!${m}]`)) ?? null;
}

// Remove the `[!type]` prefix from the paragraph's leading text node in place.
function stripMarker(node, type) {
  const first = node.children?.[0];
  if (first?.type === 'text') {
    first.value = first.value.replace(new RegExp(`^\\s*\\[!${type}\\]\\s*`), '');
    if (first.value === '') node.children.shift();
  }
}

// Turn one marked paragraph into its typed rail element (relocation of intact
// inline children; the marker text is the only thing dropped).
function makeRailItem(type, p) {
  stripMarker(p, type);
  if (type === 'answer') {
    p.properties = {};
    return el(
      'details',
      ['m-note', 'm-answer'],
      [el('summary', [], [textNode('答案 + 解析')]), p],
      { 'data-rail': true },
    );
  }
  // note → m-note, anno → m-anno (answer handled above; chips never reaches here)
  p.tagName = 'aside';
  p.properties = { className: [`m-${type}`], 'data-rail': true };
  return p;
}

// Build one <section class="m-sec"> in SOURCE ORDER (heading → well/full content →
// rail), so the narrow single-column stack reads content-first and never surfaces
// a quiz answer before its question.
function buildSection(h2, body, n, total) {
  h2.properties = h2.properties ?? {};
  h2.properties.className = [...(h2.properties.className ?? []), 'm-h2'];

  const railItems = [];
  const flow = []; // .m-well + .m-full in source order (direct children of .m-sec)
  let well = [];
  const flushWell = () => {
    if (well.length) {
      flow.push(el('div', ['m-well'], well));
      well = [];
    }
  };

  for (let k = 0; k < body.length; k++) {
    const node = body[k];
    if (isWhitespace(node) || isHr(node)) continue; // hr replaced by the ::before hairline
    // Only paragraphs can be rail callouts; walk the text once and reuse it.
    const text = isEl(node, 'p') ? hastText(node).trimStart() : '';
    const marker = text ? markerOf(text) : null;
    if (marker === 'chips') {
      // `[!chips] <optional label>` paragraph + the following list → one chips
      // aside (the label, if any, becomes a small heading above the pills).
      const label = text.replace(/^\[!chips\]\s*/, '').trim();
      const ui = nextElementIndex(body, k + 1);
      if (isEl(body[ui], 'ul')) {
        const children = [];
        if (label) children.push(el('div', ['m-chips-label'], [textNode(label)]));
        children.push(body[ui]);
        railItems.push(el('aside', ['m-chips'], children, { 'data-rail': true }));
        k = ui;
      }
      continue;
    }
    if (marker) {
      railItems.push(makeRailItem(marker, node));
      continue;
    }
    if (isTable(node) || isBilingual(node)) {
      flushWell();
      flow.push(el('div', ['m-full'], [node])); // .bilingual moved whole (never dissolved)
      continue;
    }
    well.push(node);
  }
  flushWell();

  const folio = el('span', ['m-folio'], [textNode(`${pad(n)} / ${pad(total)}`)]);
  const rail = el('aside', ['m-rail'], [folio, ...railItems]);
  return el('section', ['m-sec'], [h2, ...flow, rail]);
}

export default function rehypeInjectMarginalia() {
  return (tree, file) => {
    // Opt-in per lesson: only `wide_layout: 'marginalia'` lessons are restructured.
    // Every other page is left byte-for-byte untouched (Astro exposes raw
    // frontmatter on the vfile; this runs before it's zod-validated).
    if (file?.data?.astro?.frontmatter?.wide_layout !== 'marginalia') return;

    const kids = tree.children;
    const firstH2 = kids.findIndex(isH2);
    if (firstH2 === -1) return;
    const total = kids.filter(isH2).length;

    const head = kids.slice(0, firstH2); // H1 + subtitle → full-frame head, untouched
    const sections = [];
    let i = firstH2;
    let n = 0;
    while (i < kids.length) {
      const h2 = kids[i];
      n += 1;
      const body = [];
      let j = i + 1;
      while (j < kids.length && !isH2(kids[j])) body.push(kids[j++]);
      sections.push(buildSection(h2, body, n, total));
      i = j;
    }
    // Inline <style> (pilot-only): scoped to the .m-sec / main:has(.m-sec) classes
    // this plugin emits, which exist on no other page. `style` is a raw-text element,
    // so hast serialization leaves the CSS unescaped.
    const style = el('style', [], [textNode(MARGINALIA_CSS)]);
    tree.children = [style, ...head, ...sections];
  };
}
