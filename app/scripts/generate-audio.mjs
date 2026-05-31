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
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_DIR = resolve(__dirname, '..');                   // english/app/
const LESSONS_DIR = resolve(APP_DIR, '..', 'lessons');      // english/lessons/
const VOCAB_DIR = resolve(APP_DIR, '..', 'vocab');          // english/vocab/
const AUDIO_DIR = resolve(APP_DIR, 'public', 'audio');
const MANIFEST_PATH = resolve(APP_DIR, 'src', 'data', 'audio-manifest.json');

const VOICE = 'en-US-AriaNeural';
const FORMAT = OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3;
const CJK_RE = /[一-鿿]/g;

// ---- markdown text extraction (mirrors speech.ts) ----

function extractText(node) {
  if (!node) return '';
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

function cjkRatio(text) {
  const m = text.match(CJK_RE);
  const cjk = m ? m.length : 0;
  return text.length ? cjk / text.length : 0;
}

function collectSpeakable(mdAst) {
  const units = [];

  function walk(node) {
    if (!node) return;
    if (node.type === 'blockquote') {
      for (const child of node.children ?? []) {
        if (child.type === 'paragraph') {
          const text = paragraphSpeakableText(child);
          if (text.length >= 4 && cjkRatio(text) < 0.10) {
            units.push({ kind: 'paragraph', text });
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

// Normalize text for hashing so the markdown source and the rendered DOM
// (which goes through Astro's smartypants — curly quotes, em-dash, …) produce
// the same hash. The text fed to TTS keeps its original form.
function normalizeForHash(text) {
  return text
    .replace(/[‘’ʼ]/g, "'")   // ' ' ʼ → '
    .replace(/[“”]/g, '"')          // " " → "
    .replace(/…/g, '...')                 // … → ...
    .replace(/[–—]/g, '-')           // – — → -
    .replace(/\s+/g, ' ')
    .trim();
}

function hash(text) {
  return createHash('sha256').update(normalizeForHash(text)).digest('hex').slice(0, 12);
}

// ---- TTS ----

let ttsClient = null;
async function getTtsClient() {
  if (ttsClient) return ttsClient;
  const c = new MsEdgeTTS();
  await c.setMetadata(VOICE, FORMAT);
  ttsClient = c;
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

async function synthesizeToFile(text, outPath) {
  const tts = await getTtsClient();
  const { audioStream } = tts.toStream(escapeForSsml(text));
  const out = createWriteStream(outPath);
  await new Promise((resolve, reject) => {
    audioStream.on('error', reject);
    out.on('error', reject);
    out.on('finish', resolve);
    audioStream.pipe(out);
  });
  // Guard against silent empty output: an unreachable/rejecting TTS can finish
  // the stream with 0 bytes. Don't cache or count that as success.
  const { size } = await stat(outPath);
  if (size === 0) {
    await unlink(outPath);
    throw new Error('TTS returned an empty (0-byte) audio stream');
  }
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

  const allUnits = new Map(); // hash -> { text, kind, sources }
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
      if (!allUnits.has(h)) {
        allUnits.set(h, { ...u, sources: [name] });
      } else {
        allUnits.get(h).sources.push(name);
      }
    }
  }

  console.log(`[generate-audio] ${allUnits.size} unique speakable units across ${lessonFiles.length} lessons + ${vocabFiles.length} vocab files`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  const entries = Array.from(allUnits.entries());
  for (const [h, unit] of entries) {
    const outPath = join(AUDIO_DIR, `${h}.mp3`);
    if (existsSync(outPath)) {
      const s = await stat(outPath);
      if (s.size > 0) {
        skipped++;
        continue;
      }
    }
    try {
      await synthesizeToFile(unit.text, outPath);
      generated++;
      process.stdout.write(`  [${generated}/${entries.length - skipped}] ${h} ${unit.kind} ${unit.text.slice(0, 50).replace(/\s+/g, ' ')}\n`);
    } catch (err) {
      failed++;
      console.warn(`[generate-audio] FAILED ${h} (${unit.kind}): ${err.message}`);
    }
  }

  console.log(`[generate-audio] generated=${generated} skipped=${skipped} failed=${failed}`);

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

main().catch((err) => {
  // Soft-fail: don't break the build if Edge TTS is unreachable.
  console.warn(`[generate-audio] non-fatal error: ${err.message}`);
  process.exit(0);
});
