// Rehype plugin: wrap each speakable word inside a <blockquote> <p> in a
// <span class="w" data-wi="N"> so the runtime can karaoke-highlight word by word
// while the pre-generated MP3 plays. Whitespace stays as bare text nodes and the
// leading <strong> speaker label / any inline element children are left untouched,
// so the paragraph's textContent is preserved byte-for-byte (see the hash assertion
// below — a drift FAILS the build instead of silently breaking the site).
//
// Mirrors the speakable predicate of speech.ts (blockquote > p, len>=4, cjk<10%,
// skip leading <strong>) and generate-audio.mjs. Shared logic lives in
// ../lib/word-tokens.mjs. See lessons/_conventions.md §5.

import { readFileSync } from 'node:fs';
import { visit } from 'unist-util-visit';
import {
  tokenizeWords,
  isSpeakableParagraphText,
  hash,
} from '../lib/word-tokens.mjs';
import { paragraphSpeakableText } from './hast-speakable.mjs';

// Load the audio manifest once so the assertion can confirm a wrapped paragraph
// still resolves to its MP3. Read via fs (not a JSON import) to avoid import-
// assertion quirks inside Astro's build pipeline.
const manifest = JSON.parse(
  readFileSync(new URL('../data/audio-manifest.json', import.meta.url), 'utf-8'),
);

export default function rehypeInjectWordSpans() {
  return (tree) => {
    visit(tree, 'element', (node, _index, parent) => {
      if (node.tagName !== 'p') return;
      if (!(parent && parent.type === 'element' && parent.tagName === 'blockquote')) return;

      const before = paragraphSpeakableText(node);
      if (!isSpeakableParagraphText(before)) return;

      const kids = node.children ?? [];
      const skipFirstStrong = kids[0]?.type === 'element' && kids[0].tagName === 'strong';

      let wi = 0;
      const newChildren = [];
      kids.forEach((child, i) => {
        // Leave the leading <strong> and ANY inline element child untouched —
        // only top-level text nodes get word-wrapped. Words inside inline
        // elements (em/strong/link/code) stay unwrapped; the sidecar producer
        // (generate-audio.mjs paragraphAlignTokens) still feeds them to the
        // aligner as isSpan=false so Edge's token stream stays in lock-step, then
        // drops them — so n still equals this span count and timings stay correct.
        if (child.type !== 'text' || (skipFirstStrong && i === 0)) {
          newChildren.push(child);
          return;
        }
        for (const seg of tokenizeWords(child.value)) {
          if (seg.t === 's') {
            newChildren.push({ type: 'text', value: seg.value });
          } else {
            newChildren.push({
              type: 'element',
              tagName: 'span',
              properties: { className: ['w'], 'data-wi': String(wi++) },
              children: [{ type: 'text', value: seg.value }],
            });
          }
        }
      });

      // --- Hash-drift guard (spec §8 雷 1) ---
      // Wrapping must not change the paragraph's speakable text. If it did, the
      // runtime would re-hash to a different value, miss the MP3, and silently
      // fall back to robot Web Speech. Catch it loudly at build time instead.
      const after = paragraphSpeakableText({ ...node, children: newChildren });
      if (before !== after) {
        throw new Error(
          `[inject-word-spans] HASH DRIFT: wrapping changed textContent.\n` +
            `  before=${JSON.stringify(before)}\n  after =${JSON.stringify(after)}`,
        );
      }
      // Only require a manifest hit when it hit BEFORE wrapping — a brand-new
      // lesson whose MP3 isn't generated yet legitimately misses and falls back.
      const h = hash(before);
      if (manifest[h] && hash(after) !== h) {
        throw new Error(`[inject-word-spans] HASH DRIFT: ${h} would no longer resolve`);
      }

      node.children = newChildren;
    });
  };
}
