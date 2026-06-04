// Shared build-time tokenization — single source of truth for the word-by-word
// audio highlight feature. Imported by BOTH:
//   - scripts/generate-audio.mjs   (MP3 + <hash>.words.json sidecar producer)
//   - src/rehype/inject-word-spans.mjs  (wraps speakable words in <span class="w">)
//
// NOTE: src/scripts/speech.ts (the browser runtime) keeps its OWN copies of
// normalizeForHash / getSpeakableText because it can't import a node-flavoured
// .mjs (it ships `node:crypto`; the browser uses crypto.subtle). Those copies are
// CONTROLLED DUPLICATION — kept byte-identical in behaviour and guarded by the
// build-time hash assertion in inject-word-spans.mjs. See lessons/_conventions.md §5.

import { createHash } from 'node:crypto';

// CJK detection — mirrors speech.ts cjkRatio (/[一-鿿]/ === U+4E00–U+9FFF).
const CJK_RE = /[一-鿿]/g;

// Astro's smartypants converts ' → ', " → ", -- → —, ... → …, so the rendered
// DOM text differs from the markdown source. Normalize both sides before hashing.
// Must stay behaviourally identical to speech.ts:normalizeForHash.
export function normalizeForHash(text) {
  return text
    .replace(/[‘’ʼ]/g, "'") // ‘ ’ ʼ → '
    .replace(/[“”]/g, '"')       // “ ” → "
    .replace(/…/g, '...')             // … → ...
    .replace(/[–—]/g, '-')       // – — → -
    .replace(/-{2,}/g, '-')      // raw -- / --- → - : the build hashes RAW markdown, but
                                 // smartypants renders -- as an em dash (folded above) in
                                 // the DOM. Collapse multi-hyphen runs so both sides agree.
    .replace(/\s+/g, ' ')
    .trim();
}

// Content-address: SHA-256 of normalized text, first 12 hex chars.
export function hash(text) {
  return createHash('sha256').update(normalizeForHash(text)).digest('hex').slice(0, 12);
}

export function cjkRatio(text) {
  const m = text.match(CJK_RE);
  const cjk = m ? m.length : 0;
  return text.length ? cjk / text.length : 0;
}

// Speakable predicate for blockquote paragraphs. `text` is the speakable string
// AFTER stripping a leading <strong> and collapsing whitespace.
// Mirrors speech.ts (text.length < 4 / cjkRatio >= 0.10) and generate-audio.mjs.
export function isSpeakableParagraphText(text) {
  return text.length >= 4 && cjkRatio(text) < 0.10;
}

// Split text into an alternating list of word / whitespace segments, preserving
// EVERY character (including the exact whitespace) so the segments concatenate
// back to the original string byte-for-byte. Words are runs of non-whitespace;
// gaps are runs of whitespace.
//   tokenizeWords("\nLet  me") -> [{t:'s','\n'},{t:'w','Let'},{t:'s','  '},{t:'w','me'}]
// Used by the rehype plugin to wrap only the 'w' segments, and by the sidecar
// producer to enumerate words in the same data-wi order.
export function tokenizeWords(text) {
  const out = [];
  const re = /(\s+)|(\S+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[1] !== undefined) out.push({ t: 's', value: m[1] });
    else out.push({ t: 'w', value: m[2] });
  }
  return out;
}
