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
//   - app/public/audio/<sha256-12>.words.json     (karaoke word timings, when --words[-all] aligns)
//   - app/public/audio/<sha256-12>.words.skip     (degrade marker: alignment failed; skip on re-run)
//   - app/src/data/audio-manifest.json            { "<hash>": true, ... }
//
// Idempotent: content-addressable cache by sha256 of normalized text.
// Already-generated files are skipped. Edge TTS failures don't fail the
// build — missing files just fall back to Web Speech at runtime.
//
// The manifest is rebuilt from whatever .mp3 are on disk, so it never removes a
// clip whose source text was edited or deleted. To delete those orphans, run
// scripts/prune-audio.mjs — it reuses readSpeakableSources() (exported below) for
// the live hash set, so it can never disagree with this script about what's live.

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
export const AUDIO_DIR = resolve(APP_DIR, 'public', 'audio');
const MANIFEST_PATH = resolve(APP_DIR, 'src', 'data', 'audio-manifest.json');
const SPEAKER_VOICES_PATH = resolve(APP_DIR, 'src', 'data', 'speaker-voices.json');

// Default / fallback narrator voice. Per-speaker voices live in speaker-voices.json
// and are resolved at build time only (the hash stays text-only, so this never
// reaches the runtime — see resolveVoice + lessons/_conventions.md §5.2).
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

// The single definition of "a blockquote paragraph's leading <strong> is the
// speaker label" — stripped from speakable text, and (P5) used to route the
// per-speaker voice. Mirrored conceptually in speech.ts getSpeakableText.
function leadingStrong(paragraph) {
  const first = paragraph.children?.[0];
  return first?.type === 'strong' ? first : null;
}

function paragraphSpeakableText(paragraph) {
  const children = paragraph.children ?? [];
  const skipFirst = !!leadingStrong(paragraph);
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
  const skipFirst = !!leadingStrong(paragraph);
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

// ---- speaker → voice routing (build-only; the hash stays text-only) ----
//
// A blockquote may open with a bold label that is NOT a speaker: a grammar
// pull-quote ("**Would it be possible to**"), a section header ("**Part 1**",
// "**練法建議**"), or a quoted phrase. We need no explicit deny-list — such
// labels simply match no cast slug below and fall through to the default
// narrator voice, exactly how they sound today. Correctness rests on matching
// the KNOWN cast (speaker-voices.json), so a parser miss is never worse than
// Aria.

// Split a raw bold label into candidate name segments, stripping per-segment
// trailing markers. Handles "Ethan (04:18)", "Cat (75)", composites like
// "Scene A — Sabrina (04:08)" / "Scene 1 — Lenny (line 67)" /
// "Cat (1281) — Mission > Product Line", and keeps identity parens ("Guest
// (Cian)") that distinguish two different people.
export function speakerSegments(raw) {
  return String(raw ?? '')
    .split(/\s*[—–]\s*|\s+--+\s+/) // em/en dash, or " -- " composite separators
    .map((seg) =>
      // Strip a TRAILING (MM:SS) / (digits) / (line N) marker; KEEP alpha parens
      // like "(Cian)" that carry identity.
      seg
        .replace(/\s*\((?:\d{1,2}:\d{2}|\d+|line\s+\d+)\)\s*$/i, '')
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
}

// Resolve the TTS voice for a paragraph from its raw leading-<strong> label.
// Tries each dash-separated segment, matching the cast map by full slug first
// (so "front desk" and "guest (cian)" win as whole keys), then by first word
// for short "Name + descriptor" segments ("sabrina interview preview" →
// "sabrina"). Any miss → default narrator voice.
export function resolveVoice(speakerRaw, perLessonMap, voiceTable) {
  const speakers = voiceTable.speakers || {};
  const lookup = (slug) => (perLessonMap && perLessonMap[slug]) || speakers[slug];
  for (const seg of speakerSegments(speakerRaw)) {
    const direct = lookup(seg);
    if (direct) return direct;
    // first-word fallback only for short "Name + descriptor" labels — never for
    // sentence-like pull-quotes (avoid a bold quote that starts with a cast name).
    const words = seg.split(/\s+/);
    if (words.length > 1 && words.length <= 3 && !/[?.!,]/.test(seg)) {
      const byFirst = lookup(words[0]);
      if (byFirst) return byFirst;
    }
  }
  return voiceTable.default || VOICE;
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
            const sl = leadingStrong(child);
            const speakerRaw = sl ? extractText(sl) : null;
            units.push({ kind: 'paragraph', text, tokens: paragraphAlignTokens(child), speakerRaw });
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

// Memoized clients keyed by `${voice}|${plain|words}`. The "words" variant
// enables WordBoundary metadata, needed for the timing sidecars. It's a
// per-client flag and, once on, EVERY toStream() returns a live metadataStream
// that must be drained — so we keep plain and words clients separate, now also
// per voice (P5 per-speaker voices; msedge-tts voice is a client-level setting).
const ttsClients = new Map();
async function getTtsClient(voice, withWords) {
  const key = `${voice}|${withWords ? 'words' : 'plain'}`;
  let c = ttsClients.get(key);
  if (!c) {
    c = new MsEdgeTTS();
    await c.setMetadata(voice, FORMAT, withWords ? { wordBoundaryEnabled: true } : undefined);
    ttsClients.set(key, c);
  }
  return c;
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
async function synthesizeToFile(text, outPath, { wantWords = false, voice = VOICE } = {}) {
  const tts = await getTtsClient(voice, wantWords);
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

// ---- live corpus enumeration (shared SSOT) ----

// Enumerate every LIVE speakable source — lessons/*.md + vocab/*.md, skipping
// _*.md — parsed into { dir, name, frontmatter, units }. `units` is collectSpeakable
// over the body plus, for vocab files, the headword itself. This is the single
// source of truth for "what the corpus contains", shared by main() (what to
// synthesize) and scripts/prune-audio.mjs (what to keep), so the two can never
// disagree about which clips are live.
export async function readSpeakableSources() {
  const lessonFiles = (await readdir(LESSONS_DIR))
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => ({ dir: LESSONS_DIR, name: f }));
  const vocabFiles = (await readdir(VOCAB_DIR))
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .map((f) => ({ dir: VOCAB_DIR, name: f }));

  const processor = unified().use(remarkParse).use(remarkGfm);
  const sources = [];
  for (const { dir, name } of [...lessonFiles, ...vocabFiles]) {
    const raw = await readFile(join(dir, name), 'utf-8');
    const { data: frontmatter, content } = matter(raw);
    const units = collectSpeakable(processor.parse(content));
    // For vocab files, also speak the headword itself so the vocab detail page's
    // <h1> and every vocab-list row can speak it.
    if (dir === VOCAB_DIR && typeof frontmatter.word === 'string' && frontmatter.word.trim()) {
      units.push({ kind: 'word', text: frontmatter.word.trim() });
    }
    sources.push({ dir, name, frontmatter, units });
  }
  return sources;
}

// Rebuild src/data/audio-manifest.json to reflect whatever non-empty .mp3 are on
// disk. The manifest is purely a disk reflection — it never prunes (that's what
// scripts/prune-audio.mjs is for). Exported so prune can refresh it after deleting
// orphans without duplicating the format. Returns the number of hashes written.
export async function writeManifest() {
  const manifest = {};
  for (const f of await readdir(AUDIO_DIR)) {
    if (!f.endsWith('.mp3')) continue;
    const s = await stat(join(AUDIO_DIR, f));
    if (s.size > 0) manifest[f.replace(/\.mp3$/, '')] = true;
  }
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  return Object.keys(manifest).length;
}

// ---- main ----

async function main() {
  await mkdir(AUDIO_DIR, { recursive: true });
  await mkdir(dirname(MANIFEST_PATH), { recursive: true });

  const sources = await readSpeakableSources();
  const lessonCount = sources.filter((s) => s.dir === LESSONS_DIR).length;
  const vocabCount = sources.length - lessonCount;

  // Optional: emit per-word timing sidecars (<hash>.words.json) for any source
  // file (lesson or vocab) whose filename contains the --words=<substr> value.
  // Only paragraph units get them (vocab "## Examples" blockquotes count; word
  // units do not — see the gate below). Without the flag, behaviour is unchanged
  // (no sidecars, plain client only).
  //   node scripts/generate-audio.mjs --words=2026-06-01-learning-styles-connected-speech
  const wordsArg = process.argv.find((a) => a.startsWith('--words='))?.slice('--words='.length);
  // --words-all: emit sidecars for EVERY speakable paragraph (current + future),
  // across lessons AND vocab "## Examples" blockquotes, so karaoke never silently
  // regresses on new content. Preferred over a brittle date/filename substring like
  // --words=2026-. The `u.kind === 'paragraph'` half of the wantWords gate below
  // still excludes only WORD units (vocab table rows + headwords), not example
  // blockquotes.
  const wordsAll = process.argv.includes('--words-all');
  const wantsWordsFor = (name) => wordsAll || (!!wordsArg && name.includes(wordsArg));
  if (wordsAll) console.log('[generate-audio] word-timing sidecars for ALL speakable paragraphs');
  else if (wordsArg) console.log(`[generate-audio] word-timing sidecars for files matching "${wordsArg}"`);

  // --revoice: force-delete the mp3 (+ sidecar) of every clip whose resolved
  // speaker voice differs from the default, so the synth loop below re-renders
  // it in the new voice. Needed because synthesizeToFile SKIPS existing non-empty
  // files — without this, a speaker-voices.json change never re-renders the audio.
  const revoice = process.argv.includes('--revoice');

  // Per-speaker voice table (build-only). Missing/broken → narrator-only fallback.
  let voiceTable = { default: VOICE, speakers: {} };
  try {
    voiceTable = JSON.parse(await readFile(SPEAKER_VOICES_PATH, 'utf-8'));
  } catch {
    console.warn(`[generate-audio] no speaker-voices.json — using ${VOICE} for everyone`);
  }
  const lowerKeys = (obj) =>
    obj && typeof obj === 'object'
      ? Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]))
      : undefined;

  const allUnits = new Map(); // hash -> { text, kind, sources, wantWords, voice }

  for (const { name, frontmatter, units } of sources) {
    const perLessonMap = lowerKeys(frontmatter.speaker_voices);
    for (const u of units) {
      const h = hash(u.text);
      const wantWords = u.kind === 'paragraph' && wantsWordsFor(name);
      const voice = resolveVoice(u.speakerRaw, perLessonMap, voiceTable);
      if (!allUnits.has(h)) {
        allUnits.set(h, { ...u, sources: [name], wantWords, voice });
      } else {
        const existing = allUnits.get(h);
        existing.sources.push(name);
        if (wantWords) existing.wantWords = true;
        // Accepted text-only-hash collision: identical normalized text resolving
        // to two different voices shares one mp3. First wins; surface it (silent
        // otherwise — the key carries no speaker). See _conventions.md §5.2.
        if (existing.voice !== voice) {
          console.warn(
            `[generate-audio] voice collision on ${h}: "${existing.voice}" kept, "${voice}" (${name}) ignored for identical text — "${u.text.slice(0, 40).replace(/\s+/g, ' ')}"`,
          );
        }
      }
    }
  }

  if (revoice) {
    const def = voiceTable.default || VOICE;
    let removed = 0;
    for (const [h, unit] of allUnits) {
      if (unit.voice === def) continue;
      for (const p of [
        join(AUDIO_DIR, `${h}.mp3`),
        join(AUDIO_DIR, `${h}.words.json`),
        join(AUDIO_DIR, `${h}.words.skip`), // stale degrade marker — clear it so a re-voiced clip can re-align
      ]) {
        if (existsSync(p)) {
          await unlink(p);
          removed++;
        }
      }
    }
    console.log(`[generate-audio] --revoice: deleted ${removed} file(s) for non-default-voice clips`);
  }

  console.log(`[generate-audio] ${allUnits.size} unique speakable units across ${lessonCount} lessons + ${vocabCount} vocab files`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let wordsWritten = 0;
  let degraded = 0;

  const entries = Array.from(allUnits.entries());
  for (const [h, unit] of entries) {
    const outPath = join(AUDIO_DIR, `${h}.mp3`);
    const sidecarPath = join(AUDIO_DIR, `${h}.words.json`);
    const skipPath = join(AUDIO_DIR, `${h}.words.skip`);

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
        await synthesizeToFile(unit.text, outPath, { voice: unit.voice });
        generated++;
        process.stdout.write(`  [${generated}] ${h} ${unit.kind} ${unit.text.slice(0, 50).replace(/\s+/g, ' ')}\n`);
      } catch (err) {
        failed++;
        console.warn(`[generate-audio] FAILED ${h} (${unit.kind}): ${err.message}`);
      }
      continue;
    }

    // Words path: a clip is "done" with a valid MP3 plus EITHER a real sidecar
    // OR a degrade marker (<hash>.words.skip), written when alignment fails. The
    // marker persists the degrade decision so a known-unalignable clip is skipped
    // like a completed one — otherwise every build re-runs a doomed TTS call that
    // only degrades again. --revoice / a text edit (→ orphan prune) clear it.
    if (mp3Ok && (existsSync(sidecarPath) || existsSync(skipPath))) {
      skipped++;
      continue;
    }
    try {
      const boundaries = await synthesizeToFile(unit.text, outPath, { wantWords: true, voice: unit.voice });
      if (!mp3Ok) generated++;
      const sidecar = buildSidecar(unit.tokens ?? [], boundaries);
      if (sidecar) {
        await writeFile(sidecarPath, JSON.stringify(sidecar) + '\n');
        if (existsSync(skipPath)) await unlink(skipPath); // re-aligned → drop stale degrade marker
        wordsWritten++;
        process.stdout.write(`  [words] ${h} ${sidecar.t.filter(Boolean).length}/${sidecar.n} aligned · ${unit.text.slice(0, 40).replace(/\s+/g, ' ')}\n`);
      } else {
        // Record the degrade (the skip predicate above explains why this persists).
        // The runtime never fetches .words.skip → 404 → whole-paragraph highlight,
        // exactly as when no sidecar existed.
        await writeFile(skipPath, '{"degraded":true}\n');
        if (existsSync(sidecarPath)) await unlink(sidecarPath); // drop a stale sidecar (only possible if the mp3 was zeroed since)
        degraded++;
        console.warn(`[words] DEGRADE ${h}: alignment failed -> wrote skip marker (${unit.text.slice(0, 44).replace(/\s+/g, ' ')})`);
      }
    } catch (err) {
      failed++;
      console.warn(`[generate-audio] FAILED ${h} (${unit.kind}): ${err.message}`);
    }
  }

  console.log(`[generate-audio] generated=${generated} skipped=${skipped} failed=${failed} words=${wordsWritten} degraded=${degraded}`);

  // Manifest: just the set of hashes that have a file on disk.
  const manifestCount = await writeManifest();
  console.log(`[generate-audio] manifest: ${manifestCount} hashes -> ${MANIFEST_PATH}`);
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
