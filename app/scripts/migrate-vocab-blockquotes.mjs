#!/usr/bin/env node
// One-off migration: split bilingual blockquotes in vocab/*.md so the
// English line and the Chinese translation become separate blockquotes,
// matching the speakable convention used in lessons/.
//
// Before:
//   > "Some English sentence."
//   > 中文翻譯。
//
// After:
//   > "Some English sentence."
//
//   > 中文翻譯。
//
// Heuristic: inside a contiguous run of `>` lines, find the first line that
// is mostly CJK (>50%) and insert a blank line before it. This handles
// multi-line English followed by multi-line Chinese.

import process from 'node:process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VOCAB_DIR = resolve(__dirname, '..', '..', 'vocab');

const CJK_RE = /[一-鿿]/g;
function isMostlyChinese(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const cjk = (trimmed.match(CJK_RE) || []).length;
  return cjk / trimmed.length > 0.5;
}

function transform(source) {
  const lines = source.split('\n');
  const out = [];
  let inBq = false;
  let splitDone = false;

  for (const line of lines) {
    const isQuote = line.startsWith('>');
    if (!isQuote) {
      out.push(line);
      inBq = false;
      splitDone = false;
      continue;
    }
    if (!inBq) {
      inBq = true;
      splitDone = false;
    }
    const content = line.replace(/^>\s?/, '');
    if (!splitDone && isMostlyChinese(content)) {
      out.push('');
      out.push(line);
      splitDone = true;
    } else {
      out.push(line);
    }
  }
  return out.join('\n');
}

async function main() {
  const files = (await readdir(VOCAB_DIR))
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  let changed = 0;
  for (const f of files) {
    const path = join(VOCAB_DIR, f);
    const src = await readFile(path, 'utf-8');
    const out = transform(src);
    if (out !== src) {
      await writeFile(path, out);
      changed++;
      console.log(`  fixed: ${f}`);
    }
  }
  console.log(`[migrate-vocab-blockquotes] changed ${changed} / ${files.length} files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
