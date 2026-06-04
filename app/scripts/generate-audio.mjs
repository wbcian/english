#!/usr/bin/env node
// Pre-generate MP3 files for every speakable unit in ../lessons/*.md
// using Microsoft Edge's free neural TTS.
//
// Speakable units (must match speech.ts logic):
//   1. Each <p> inside a <blockquote>, after stripping a leading <strong>
//      (speaker label), whose CJK character ratio is <= 10% and length >= 4.
//   2. Each cell in a <table> column whose <th> text equals "word"
//      (lowercase, exact match).
//
// Output:
//   - app/public/audio/<sha256-12>.mp3            (one per unique text)
//   - app/src/data/audio-manifest.json            { "<hash>": true, ... }
//
// Idempotent: content-addressable cache by sha256 of normalized text.
// Already-generated files are skipped. Edge TTS failures don't fail the
// build — missing files just fall back to Web Speech at runtime.

import process from 'node:process';
import { readdir, readFile, writeFile, mkdir, stat, unlink } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// Shared tokenization (single source of truth, also used by the rehype plugin).
import {
  normalizeForHash,
  hash,
  cjkRatio,
  tokenizeWords,
  isSpeakableParagraphText,
} from '../src/lib/word-tokens.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(__dirname, '..');                   // english/app/
const LESSONS_DIR = resolve(APP_DIR, '..', 'lessons');      // english/lessons/
const VOCAB_DIR = resolve(APP_DIR, '..', 'vocab');          // english/vocab/
const AUDIO_DIR = resolve(APP_DIR, 'public', 'audio');
const MANIFEST_PATH = resolve(APP_DIR, 'src', 'data', 'audio-manifest.json');

const VOICE = 'en-US-AriaNeural';
const FORMAT = OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3;

// ---- markdown text extraction (mirrors speech.ts) ----

function extractText(node) {
  if (!node) return '';
  // A hard line break (line ending in `\` or two trailing spaces) is an mdast
  // `break` node with no value/children. The rendered DOM is `<br>\n`, i.e. one
  // whitespace that collapses to a single space. Emit a space here too — else the
  // words on either side glue ("how" + "" + "this" = "howthis") and the build hash
  // diverges from the runtime DOM hash → silent MP3 miss.
  if (node.type === 'break' || node.type === 'thematicBreak') return ' ';
  if (typeof node.value === 'string') return node.value;
  if (Array.isArray(node.children)) {
    return node.children.map(extractText).join('');
  }
  return '';
}

function paragraphSpeakableText(paragraph) {
  const children = paragraph.children ?? [];
  const skipFirst = children[0]?.type === 'strong';
  const parts = [];
  for (let i = 0; i < children.length; i++) {
    if (skipFirst && i === 0) continue;
    parts.push(extractText(children[i]));
  }
  return parts.join('').replace(/\s+/g, ' ').trim();
}

// Every spoken word of a paragraph, in order, tagged `isSpan`:
//   isSpan=true  → a top-level text-node word the rehype plugin wraps as a
//                  <span class="w"> (these define data-wi order; their count === n).
//   isSpan=false → a word inside an inline element (em/strong/link/code). The TTS
//                  engine SPEAKS these, but they get no span. We still feed them
//                  to the aligner so Edge's token stream lines up, then drop them
//                  from the output — otherwise a repeated word after the element
//                  could bind to the element's earlier timing (mis-highlight).
// Mirrors inject-word-spans.mjs: skip a leading <strong> (speaker label), wrap
// only top-level text nodes; here we additionally keep the inline words for
// alignment context.
function paragraphAlignTokens(paragraph) {
  const children = paragraph.children ?? [];
  const skipFirst = children[0]?.type === 'strong';
  const toks = [];
  children.forEach((child, i) => {
    if (skipFirst && i === 0) return;
    const isSpan = child.type === 'text';
    // extractText returns a text node's own value, so it covers both cases.
    for (const seg of tokenizeWords(extractText(child))) {
      if (seg.t === 'w') toks.push({ word: seg.value, isSpan });
    }
  });
  return toks;
}

export function collectSpeakable(mdAst) {
  const units = [];

  function walk(node) {
    if (!node) return;
    if (node.type === 'blockquote') {
      for (const child of node.children ?? []) {
        if (child.type === 'paragraph') {
          const text = paragraphSpeakableText(child);
          if (isSpeakableParagraphText(text)) {
            units.push({ kind: 'paragraph', text, tokens: paragraphAlignTokens(child) });
          }
        }
      }
      return;
    }
    if (node.type === 'table') {
      const rows = node.children ?? [];
      if (rows.length < 2) return;
      const headerCells = rows[0].children ?? [];
      const wordIdx = headerCells.findIndex(
        (cell) => extractText(cell).trim().toLowerCase() === 'word',
      );
      if (wordIdx === -1) return;
      for (let r = 1; r < rows.length; r++) {
        const cells = rows[r].children ?? [];
        const cell = cells[wordIdx];
        if (!cell) continue;
        const text = extractText(cell).trim();
        if (text.length >= 1 && cjkRatio(text) < 0.50) {
          units.push({ kind: 'word', text });
        }
      }
      return;
    }
    if (Array.isArray(node.children)) {
      for (const c of node.children) walk(c);
    }
  }

  walk(mdAst);
  return units;
}

// normalizeForHash / hash now come from ../src/lib/word-tokens.mjs (shared with
// the rehype word-span plugin) so the build, the runtime, and the tokenizer all
// agree on what string a clip hashes to.

// ---- TTS ----

// Two memoized clients. The "words" client enables WordBoundary metadata, which
// is needed for the timing sidecars. It's a per-client flag and, once on, EVERY
// toStream() returns a live metadataStream that must be drained — so we keep a
// separate plain client for the 99% of clips that don't need word timing.
let plainClient = null;
let wordsClient = null;
async function getTtsClient(withWords) {
  if (withWords) {
    if (!wordsClient) {
      const c = new MsEdgeTTS();
      await c.setMetadata(VOICE, FORMAT, { wordBoundaryEnabled: true });
      wordsClient = c;
    }
    return wordsClient;
  }
  if (!plainClient) {
    const c = new MsEdgeTTS();
    await c.setMetadata(VOICE, FORMAT);
    plainClient = c;
  }
  return plainClient;
}

// msedge-tts feeds the text into an SSML document without escaping, so any
// raw &, <, > makes the SSML malformed and Edge returns an empty audio stream
// (a silent 0-byte file). Escape XML specials before synthesizing. This is
// transparent to hashing/lookup — the hash is computed on the unescaped text.
function escapeForSsml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Synthesize `text`. Writes the MP3 to `outPath` ONLY if a valid one doesn't
// already exist (so backfilling a sidecar never rewrites a committed binary —
// the freshly-synthesized audio is drained to nowhere). When `wantWords`, also
// drains the WordBoundary metadata stream and returns the raw boundary `Data`
// objects ([{ Offset, Duration, text:{ Text } }, ...], 100ns ticks). Otherwise
// returns [].
async function synthesizeToFile(text, outPath, { wantWords = false } = {}) {
  const tts = await getTtsClient(wantWords);
  const { audioStream, metadataStream } = tts.toStream(escapeForSsml(text));

  // Keep the freshly-synthesized audio only if there's no valid MP3 yet.
  let keepAudio = true;
  if (existsSync(outPath)) {
    const s = await stat(outPath);
    if (s.size > 0) keepAudio = false;
  }
  const out = keepAudio ? createWriteStream(outPath) : null;

  const boundaries = [];
  const audioDone = new Promise((resolve, reject) => {
    audioStream.on('error', reject);
    if (out) {
      out.on('error', reject);
      out.on('finish', resolve);
      audioStream.pipe(out);
    } else {
      // No file to write — still must drain the socket or it backpressures.
      audioStream.on('end', resolve);
      audioStream.resume();
    }
  });

  // metadataStream is non-null only on the words client; for the plain client
  // this resolves immediately.
  const metaDone = !metadataStream
    ? Promise.resolve()
    : new Promise((resolve, reject) => {
        metadataStream.on('data', (chunk) => {
          try {
            const { Metadata } = JSON.parse(chunk.toString());
            for (const m of Metadata ?? []) {
              if (m.Type === 'WordBoundary') boundaries.push(m.Data);
            }
          } catch {
            /* ignore non-JSON keepalive frames */
          }
        });
        metadataStream.once('close', resolve);
        metadataStream.once('error', reject);
      });

  await Promise.all([audioDone, metaDone]);

  if (keepAudio) {
    // Guard against silent empty output: an unreachable/rejecting TTS can finish
    // the stream with 0 bytes. Don't cache or count that as success.
    const { size } = await stat(outPath);
    if (size === 0) {
      await unlink(outPath);
      throw new Error('TTS returned an empty (0-byte) audio stream');
    }
  }
  return boundaries;
}

// ---- per-word timing sidecar (build-time alignment) ----

// Strip everything that doesn't affect word identity (keep letters, digits,
// apostrophes), lowercase, so our DOM tokens and Edge's spoken tokens can be
// compared despite smartypants, punctuation, and case.
function alignKey(s) {
  return normalizeForHash(s).toLowerCase().replace(/[^\p{L}\p{N}']+/gu, '');
}

// Map Edge's WordBoundary tokens onto our word-spans and return
// { v, n, t:[[start,end]|null,...] } (t indexed by data-wi) — or null to DEGRADE
// (caller writes no sidecar, runtime keeps whole-paragraph highlight). Never
// mis-highlights: anything that doesn't align cleanly degrades.
//
// `tokens` is the FULL spoken word sequence from paragraphAlignTokens, including
// inline-element words (isSpan=false). We align Edge tokens against ALL of them
// so the streams stay in lock-step, then project timings onto the isSpan words
// only — that prevents a repeated word after an inline element binding to the
// element's earlier timing.
function buildSidecar(tokens, boundaries) {
  const allWords = tokens.map((t) => t.word);
  const keys = allWords.map(alignKey); // normalized match keys, computed once
  const N = allWords.length;
  if (N === 0) return null;
  if (!tokens.some((t) => t.isSpan)) return null;

  const edge = boundaries
    .map((b) => ({
      key: alignKey(b.text?.Text ?? ''),
      start: b.Offset / 1e7,
      end: (b.Offset + b.Duration) / 1e7,
    }))
    .filter((e) => e.key.length > 0);
  if (edge.length === 0) return null;

  // Align ALL spoken words (greedy two-pointer with merge + resync).
  const tFull = new Array(N).fill(null);
  let i = 0;
  let j = 0;
  while (i < N && j < edge.length) {
    const want = keys[i];
    if (want.length === 0) {
      i++; // punctuation-only token (e.g. a standalone "—"): no timing, skip it
      continue;
    }
    if (edge[j].key === want) {
      tFull[i] = [edge[j].start, edge[j].end];
      i++; j++;
      continue;
    }
    // many Edge tokens -> one of our words (e.g. "100" -> "one"+"hundred",
    // "micro-lesson" -> "micro"+"lesson"): merge their timings.
    {
      let acc = edge[j].key;
      let k = j;
      let start = edge[j].start;
      let end = edge[j].end;
      while (acc.length < want.length && k + 1 < edge.length) {
        k++; acc += edge[k].key; end = edge[k].end;
      }
      if (acc === want) {
        tFull[i] = [start, end];
        i++; j = k + 1;
        continue;
      }
    }
    // one Edge token -> several of our words (e.g. "hands-on" tokenized as one
    // word but spoken "hands"+"on" landing under one boundary): share the timing.
    {
      let acc = want;
      let m = i;
      while (acc.length < edge[j].key.length && m + 1 < N) {
        m++; acc += keys[m];
      }
      if (acc === edge[j].key) {
        for (let q = i; q <= m; q++) tFull[q] = [edge[j].start, edge[j].end];
        i = m + 1; j++;
        continue;
      }
    }
    // Couldn't reconcile here — skip the unexpected Edge token and try to resync.
    j++;
  }

  // Project onto the isSpan words (data-wi order) = the sidecar's t[].
  const t = [];
  let keyed = 0;
  let covered = 0;
  for (let k = 0; k < N; k++) {
    if (!tokens[k].isSpan) continue;
    const timing = tFull[k];
    t.push(timing);
    if (keys[k].length > 0) {
      keyed++;
      if (timing) covered++;
    }
  }
  const n = t.length; // === DOM .w span count
  if (keyed === 0 || covered / keyed < 0.85) return null;
  // Monotonicity sanity: matched starts must be non-decreasing.
  let prev = -Infinity;
  for (const span of t) {
    if (span) {
      if (span[0] < prev - 0.05) return null;
      prev = Math.max(prev, span[0]);
    }
  }
  return { v: 1, n, t };
}

// ---- main ----

async function main() {
  await mkdir(AUDIO_DIR, { recursive: true });
  await mkdir(dirname(MANIFEST_PATH), { recursive: true });

  const lessonFiles = (await readdir(LESSONS_DIR))
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => ({ dir: LESSONS_DIR, name: f }));
  const vocabFiles = (await readdir(VOCAB_DIR))
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => ({ dir: VOCAB_DIR, name: f }));
  const sources = [...lessonFiles, ...vocabFiles];

  // Optional: emit per-word timing sidecars (<hash>.words.json) for lessons whose
  // filename contains the --words=<substr> value. Only paragraph units get them.
  // Without the flag, behaviour is unchanged (no sidecars, plain client only).
  //   node scripts/generate-audio.mjs --words=2026-06-01-learning-styles-connected-speech
  const wordsArg = process.argv.find((a) => a.startsWith('--words='))?.slice('--words='.length);
  const wantsWordsFor = (name) => !!wordsArg && name.includes(wordsArg);
  if (wordsArg) console.log(`[generate-audio] word-timing sidecars for files matching "${wordsArg}"`);

  const allUnits = new Map(); // hash -> { text, kind, sources, wantWords }
  const processor = unified().use(remarkParse).use(remarkGfm);

  for (const { dir, name } of sources) {
    const path = join(dir, name);
    const raw = await readFile(path, 'utf-8');
    const { data: frontmatter, content } = matter(raw);
    const ast = processor.parse(content);
    const units = collectSpeakable(ast);
    // For vocab files, also generate audio for the headword itself so the
    // vocab detail page's <h1> and every vocab-list row can speak it.
    if (dir === VOCAB_DIR && typeof frontmatter.word === 'string' && frontmatter.word.trim()) {
      units.push({ kind: 'word', text: frontmatter.word.trim() });
    }
    for (const u of units) {
      const h = hash(u.text);
      const wantWords = u.kind === 'paragraph' && wantsWordsFor(name);
      if (!allUnits.has(h)) {
        allUnits.set(h, { ...u, sources: [name], wantWords });
      } else {
        const existing = allUnits.get(h);
        existing.sources.push(name);
        if (wantWords) existing.wantWords = true;
      }
    }
  }

  console.log(`[generate-audio] ${allUnits.size} unique speakable units across ${lessonFiles.length} lessons + ${vocabFiles.length} vocab files`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let wordsWritten = 0;
  let degraded = 0;

  const entries = Array.from(allUnits.entries());
  for (const [h, unit] of entries) {
    const outPath = join(AUDIO_DIR, `${h}.mp3`);
    const sidecarPath = join(AUDIO_DIR, `${h}.words.json`);

    let mp3Ok = false;
    if (existsSync(outPath)) {
      mp3Ok = (await stat(outPath)).size > 0;
    }

    if (!unit.wantWords) {
      // Unchanged path: skip when the MP3 already exists.
      if (mp3Ok) {
        skipped++;
        continue;
      }
      try {
        await synthesizeToFile(unit.text, outPath);
        generated++;
        process.stdout.write(`  [${generated}] ${h} ${unit.kind} ${unit.text.slice(0, 50).replace(/\s+/g, ' ')}\n`);
      } catch (err) {
        failed++;
        console.warn(`[generate-audio] FAILED ${h} (${unit.kind}): ${err.message}`);
      }
      continue;
    }

    // Words path: a clip needs BOTH a valid MP3 and a sidecar. Synthesize
    // (without overwriting a valid MP3) whenever the sidecar is missing.
    if (mp3Ok && existsSync(sidecarPath)) {
      skipped++;
      continue;
    }
    try {
      const boundaries = await synthesizeToFile(unit.text, outPath, { wantWords: true });
      if (!mp3Ok) generated++;
      const sidecar = buildSidecar(unit.tokens ?? [], boundaries);
      if (sidecar) {
        await writeFile(sidecarPath, JSON.stringify(sidecar) + '\n');
        wordsWritten++;
        process.stdout.write(`  [words] ${h} ${sidecar.t.filter(Boolean).length}/${sidecar.n} aligned · ${unit.text.slice(0, 40).replace(/\s+/g, ' ')}\n`);
      } else {
        degraded++;
        console.warn(`[words] DEGRADE ${h}: alignment failed -> no sidecar (${unit.text.slice(0, 44).replace(/\s+/g, ' ')})`);
      }
    } catch (err) {
      failed++;
      console.warn(`[generate-audio] FAILED ${h} (${unit.kind}): ${err.message}`);
    }
  }

  console.log(`[generate-audio] generated=${generated} skipped=${skipped} failed=${failed} words=${wordsWritten} degraded=${degraded}`);

  // Manifest: just the set of hashes that have a file on disk.
  const manifest = {};
  const onDisk = await readdir(AUDIO_DIR);
  for (const f of onDisk) {
    if (f.endsWith('.mp3')) {
      const s = await stat(join(AUDIO_DIR, f));
      if (s.size > 0) manifest[f.replace(/\.mp3$/, '')] = true;
    }
  }
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`[generate-audio] manifest: ${Object.keys(manifest).length} hashes -> ${MANIFEST_PATH}`);
}

// Run main() only when invoked as the entry script (node scripts/generate-audio.mjs).
// When imported (e.g. by scripts/check-audio-hash-sync.mjs to reuse the extraction
// helpers) this stays inert so importing never triggers a TTS run.
const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main().catch((err) => {
    // Soft-fail: don't break the build if Edge TTS is unreachable.
    console.warn(`[generate-audio] non-fatal error: ${err.message}`);
    process.exit(0);
  });
}
