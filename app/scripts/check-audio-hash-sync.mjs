#!/usr/bin/env node
// Guards the audio content-hashing pipeline against SILENT build-vs-runtime hash
// drift. Each speakable clip's MP3 is named by SHA-256 of its normalized text. If
// the build-time hash (scripts/generate-audio.mjs, over RAW markdown) and the
// runtime hash (src/scripts/speech.ts, over the RENDERED DOM) ever diverge for the
// same text, the runtime can't find the MP3 and silently falls back to robot Web
// Speech site-wide — with nothing failing. This check fails the build instead.
//
// Two independent checks:
//
//   A. BUILD-vs-RUNTIME PARITY. For a battery of markdown fixtures that exercise
//      smartypants (`--` -> em dash) and hard line breaks (`<br>`), assert the
//      build-side hash equals the runtime-side hash. The runtime side is rendered
//      with Astro's own processor (@astrojs/markdown-remark, smartypants on), so
//      it is the TRUE DOM text — not an approximation. The build side reuses the
//      real extraction helpers exported from generate-audio.mjs.
//
//   B. speech.ts MIRRORS THE LIB. The browser runtime keeps a hand-duplicated copy
//      of normalizeForHash (it can't import the node-flavoured .mjs lib). The
//      build-time hash assertion in rehype/inject-word-spans.mjs only checks
//      lib-vs-lib — editing the lib normalizer without mirroring speech.ts gives a
//      GREEN build and a broken runtime. This extracts speech.ts's normalizeForHash
//      and runs a fixture battery through both copies, asserting identical output.
//
// Run: node scripts/check-audio-hash-sync.mjs   (wired into `prebuild`). Exits 1 on drift.

import process from 'node:process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { fromHtml } from 'hast-util-from-html';

import { hash, normalizeForHash } from '../src/lib/word-tokens.mjs';
import { collectSpeakable } from './generate-audio.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPEECH_TS = resolve(__dirname, '..', 'src', 'scripts', 'speech.ts');

const failures = [];

// ---- Part A: build-vs-runtime hash parity ----------------------------------

// Each fixture is a self-contained markdown snippet with exactly one speakable
// unit. `kind` selects how the runtime DOM text is extracted (mirrors speech.ts).
const FIXTURES = [
  { name: 'control: plain sentence', kind: 'paragraph',
    md: '> This is a perfectly normal sentence.' },
  { name: 'control: curly quotes + apostrophe', kind: 'paragraph',
    md: `> It's a "real" test, isn't it.` },
  { name: 'control: ellipsis', kind: 'paragraph',
    md: '> Wait for it ... here it comes.' },
  { name: 'gap1: double hyphen -> em dash', kind: 'paragraph',
    md: '> This is great -- really good stuff.' },
  { name: 'gap1: double hyphen, no spaces', kind: 'paragraph',
    md: '> A well--known phrase appears here.' },
  { name: 'gap1: triple hyphen', kind: 'paragraph',
    md: '> Hold on --- what just happened here.' },
  { name: 'gap1: speaker label + double hyphen', kind: 'paragraph',
    md: `> **Max:** Let's go -- right now, please.` },
  { name: 'gap2: hard break via trailing backslash', kind: 'paragraph',
    md: '> tell me how\\\n> this works in practice.' },
  { name: 'gap2: hard break via two trailing spaces', kind: 'paragraph',
    md: '> tell me how  \n> this works in practice too.' },
  { name: 'gap1+2: double hyphen and a hard break', kind: 'paragraph',
    md: '> wait -- listen\\\n> to this part now.' },
  { name: 'table word cell: double hyphen', kind: 'word',
    md: '| word | meaning |\n| --- | --- |\n| state--of--the--art | 最先進的 |' },
];

// Render markdown the way Astro does (smartypants on) and pull the speakable
// text out of the rendered DOM, mirroring speech.ts getSpeakableText (paragraph)
// / the table `word`-column wiring.
const processor = await createMarkdownProcessor({});

function hastTextContent(node) {
  if (node.type === 'text') return node.value ?? '';
  if (Array.isArray(node.children)) return node.children.map(hastTextContent).join('');
  return '';
}

function findFirst(tree, pred) {
  let found = null;
  (function walk(node, parent) {
    if (found) return;
    if (node.type === 'element' && pred(node, parent)) { found = node; return; }
    for (const c of node.children ?? []) walk(c, node);
  })(tree, null);
  return found;
}

// Mirror of speech.ts getSpeakableText over a <p>: skip a leading <strong>
// speaker label, concat the textContent of the rest, collapse whitespace.
function paragraphRuntimeText(p) {
  const kids = p.children ?? [];
  const skip = kids[0]?.type === 'element' && kids[0].tagName === 'strong';
  let s = '';
  kids.forEach((c, i) => { if (!(skip && i === 0)) s += hastTextContent(c); });
  return s.replace(/\s+/g, ' ').trim();
}

function runtimeTextFromHtml(html, kind) {
  const tree = fromHtml(html, { fragment: true });
  if (kind === 'paragraph') {
    const p = findFirst(tree, (n, parent) => n.tagName === 'p' && parent?.tagName === 'blockquote');
    return p ? paragraphRuntimeText(p) : null;
  }
  // kind === 'word': find the cell in the column whose <th> is exactly "word".
  const table = findFirst(tree, (n) => n.tagName === 'table');
  if (!table) return null;
  const ths = [];
  (function walk(n) { if (n.tagName === 'th') ths.push(n); for (const c of n.children ?? []) walk(c); })(table);
  const wordIdx = ths.findIndex((th) => hastTextContent(th).trim().toLowerCase() === 'word');
  if (wordIdx === -1) return null;
  const firstBodyRow = findFirst(table, (n, parent) => n.tagName === 'tr' && parent?.tagName === 'tbody');
  if (!firstBodyRow) return null;
  const cells = (firstBodyRow.children ?? []).filter((c) => c.tagName === 'td');
  const cell = cells[wordIdx];
  return cell ? hastTextContent(cell).replace(/\s+/g, ' ').trim() : null;
}

// Build side: the real generate-audio extraction over the raw-markdown mdast.
const mdProcessor = unified().use(remarkParse).use(remarkGfm);
function buildTextFromMarkdown(md, kind) {
  const ast = mdProcessor.parse(md);
  const units = collectSpeakable(ast);
  const unit = units.find((u) => u.kind === kind) ?? units[0];
  return unit ? unit.text : null;
}

for (const fx of FIXTURES) {
  const buildText = buildTextFromMarkdown(fx.md, fx.kind);
  const { code } = await processor.render(fx.md);
  const runtimeText = runtimeTextFromHtml(code, fx.kind);

  if (buildText == null || runtimeText == null) {
    failures.push(`[A] ${fx.name}: could not extract (build=${JSON.stringify(buildText)} runtime=${JSON.stringify(runtimeText)})`);
    continue;
  }
  const buildHash = hash(buildText);
  const runtimeHash = hash(runtimeText);
  if (buildHash !== runtimeHash) {
    failures.push(
      `[A] ${fx.name}: HASH DRIFT\n` +
      `      build  ${buildHash}  ${JSON.stringify(buildText)}\n` +
      `      runtime ${runtimeHash}  ${JSON.stringify(runtimeText)}`,
    );
  }
}

// ---- Part B: speech.ts normalizeForHash mirrors the lib --------------------

// Pull speech.ts's hand-duplicated normalizeForHash out of source and rebuild it
// as a runnable JS function (its body carries no TS type annotations), so we can
// execute it on fixtures and compare against the lib's authoritative copy.
function extractSpeechNormalizer() {
  const src = readFileSync(SPEECH_TS, 'utf-8');
  const m = src.match(/function normalizeForHash\(text: string\): string \{\n([\s\S]*?)\n\}/);
  if (!m) {
    failures.push('[B] could not locate normalizeForHash in speech.ts (signature changed?)');
    return null;
  }
  try {
    // eslint-disable-next-line no-new-func
    return new Function('text', m[1]);
  } catch (err) {
    failures.push(`[B] speech.ts normalizeForHash failed to compile: ${err.message}`);
    return null;
  }
}

const NORMALIZER_FIXTURES = [
  'plain text',
  "it's a ‘quote’ and “type”",   // curly quotes/apostrophes
  'ellipsis… here',                               // …
  'en – and em — dash',                      // – —
  'great -- really',                                   // raw double hyphen
  'a---b and c----d',                                  // raw triple/quad hyphen
  'micro-lesson stays',                                // single hyphen untouched
  'collapse   multiple    spaces',
  'hard\nbreak\tnewline',
  '   trim me   ',
  'state--of--the--art',
];

const speechNormalize = extractSpeechNormalizer();
if (speechNormalize) {
  for (const f of NORMALIZER_FIXTURES) {
    const a = normalizeForHash(f);
    let b;
    try { b = speechNormalize(f); } catch (err) {
      failures.push(`[B] speech.ts normalizeForHash threw on ${JSON.stringify(f)}: ${err.message}`);
      continue;
    }
    if (a !== b) {
      failures.push(
        `[B] normalizer drift on ${JSON.stringify(f)}\n` +
        `      lib       ${JSON.stringify(a)}\n` +
        `      speech.ts ${JSON.stringify(b)}`,
      );
    }
  }
}

// ---- report ----------------------------------------------------------------

if (failures.length > 0) {
  console.error(`\n[check-audio-hash-sync] ${failures.length} failure(s):\n`);
  for (const f of failures) console.error('  ' + f);
  console.error('\nFix the normalizer / extractor so build and runtime hash identically.\n');
  process.exit(1);
}
console.log(`[check-audio-hash-sync] OK — ${FIXTURES.length} parity fixtures + ${NORMALIZER_FIXTURES.length} normalizer fixtures in sync.`);
