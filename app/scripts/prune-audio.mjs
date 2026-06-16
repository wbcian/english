#!/usr/bin/env node
// Delete ORPHAN audio: public/audio/<hash>.mp3 (+ its siblings <hash>.words.json
// and <hash>.words.skip) whose hash is no longer produced by any current
// lesson/vocab source.
//
// The generate-audio pipeline is content-addressed, but its manifest is rebuilt
// from whatever .mp3 are on disk, so it NEVER removes a clip whose source text was
// edited or deleted — orphans accumulate forever. This computes the LIVE hash set
// exactly as generate-audio does (same readSpeakableSources + hash, the single
// source of truth) and removes everything else.
//
// Safe: the runtime only ever fetches a hash derived from CURRENT content, so an
// orphan mp3 is never requested. Deleting one cannot change any page's behaviour.
//
// Dry-run by default — prints what WOULD be deleted. Pass --confirm (alias --yes)
// to actually delete; the manifest is refreshed afterwards so the repo stays
// consistent without a separate generate-audio run.
//
//   node scripts/prune-audio.mjs            # dry run (default)
//   node scripts/prune-audio.mjs --confirm  # delete orphans + rewrite manifest

import process from 'node:process';
import { readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';

import { hash } from '../src/lib/word-tokens.mjs';
import { AUDIO_DIR, readSpeakableSources, writeManifest } from './generate-audio.mjs';

// <hash>.mp3, <hash>.words.json (karaoke timings), or <hash>.words.skip (degrade
// marker), where <hash> is the 12-hex content address.
const AUDIO_FILE_RE = /^([0-9a-f]{12})\.(?:mp3|words\.json|words\.skip)$/;

async function main() {
  const confirm = process.argv.includes('--confirm') || process.argv.includes('--yes');

  // LIVE set: hash every speakable unit across current lessons + vocab, the same
  // way generate-audio names its clips.
  const live = new Set();
  for (const { units } of await readSpeakableSources()) {
    for (const u of units) live.add(hash(u.text));
  }

  // Orphans = audio files on disk whose hash isn't in the live set.
  const files = await readdir(AUDIO_DIR);
  const orphans = files.filter((f) => {
    const m = f.match(AUDIO_FILE_RE);
    return m && !live.has(m[1]);
  });

  console.log(
    `[prune-audio] live=${live.size} hashes · ${files.length} files on disk · ${orphans.length} orphan file(s)`,
  );

  if (orphans.length === 0) {
    console.log('[prune-audio] nothing to prune.');
    return;
  }

  for (const f of orphans) {
    if (confirm) await unlink(join(AUDIO_DIR, f));
    console.log(`  ${confirm ? 'deleted' : 'would delete'} ${f}`);
  }

  if (confirm) {
    const manifestCount = await writeManifest();
    console.log(`[prune-audio] deleted ${orphans.length} file(s); manifest now ${manifestCount} hashes.`);
  } else {
    console.log(`[prune-audio] DRY RUN — re-run with --confirm to delete ${orphans.length} file(s).`);
  }
}

main().catch((err) => {
  console.error(`[prune-audio] error: ${err.message}`);
  process.exit(1);
});
