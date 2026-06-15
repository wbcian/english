#!/usr/bin/env node
// Fixture matrix for the P5 build-only speaker→voice parser (resolveVoice).
// Every distinct bold blockquote label observed across lessons/*.md, asserted to
// resolve to the expected voice. Non-speaker labels (pull-quotes, headers, clips,
// unnamed scenes) must fall through to the default narrator. Run:
//   node scripts/test-speaker-parser.mjs
import process from 'node:process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveVoice } from './generate-audio.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const voiceTable = JSON.parse(
  await readFile(resolve(__dirname, '..', 'src', 'data', 'speaker-voices.json'), 'utf-8'),
);

const ARIA = 'en-US-AriaNeural';
const GUY = 'en-US-GuyNeural';
const CHRIS = 'en-US-ChristopherNeural';
const ERIC = 'en-US-EricNeural';
const SONIA = 'en-GB-SoniaNeural';
const NATASHA = 'en-AU-NatashaNeural';
const LIBBY = 'en-GB-LibbyNeural';
const JENNY = 'en-US-JennyNeural';
const RYAN = 'en-GB-RyanNeural';
const MICHELLE = 'en-US-MichelleNeural';
const ROGER = 'en-US-RogerNeural';

// [rawLabel, expectedVoice]
const cases = [
  // --- real speakers: simple ---
  ['Ethan (04:18)', GUY],
  ['Ethan (12:02)', GUY],
  ['Ksenia (00:48)', NATASHA],
  ['Ksenia (01:59)', NATASHA],
  ['Izzy (00:00)', LIBBY],
  ['Izzy (02:12)', LIBBY],
  ['Cat (75)', SONIA],
  ['Cat (1281)', SONIA],
  ['Front desk', RYAN],
  ['Receptionist', MICHELLE],
  ['Guest', ROGER],
  // --- identity paren must NOT be stripped (different person from "Guest") ---
  ['Guest (Cian)', GUY],
  // --- composite "Scene X — Name (...)" → person after the dash ---
  ['Scene A — Sabrina (04:08)', JENNY],
  ['Scene B — Sabrina (10:41)', JENNY],
  ['Scene A — Sabrina interview preview (00:50)', JENNY], // descriptor dropped
  ['Scene A — Zane (06:33)', ERIC],
  ['Scene 2 — Lenny (937)', CHRIS],
  ['Scene 1 — Lenny (line 67)', CHRIS],
  ['Scene 1 — Lenny (line 657)', CHRIS],
  // --- composite "Name (marker) — annotation" → person before the dash ---
  ['Cat (1281) — Mission > Product Line', SONIA],
  ['Cat (431) — 反流程哲學', SONIA],
  ['Scene 1 — Cat (line 1429) — 什麼時候用 CLI', SONIA],
  ['Scene 2 — Cat (161) — AI 怎麼壓縮時間軸', SONIA],
  ['Lenny (1035) — the Pirates of the Caribbean image', CHRIS],
  // --- non-real-person source/clip labels → narrator ---
  ['Veritasium clip (02:09)', ARIA],
  ['Example — Bieber clip (04:45)', ARIA],
  ['Example (02:14)', ARIA],
  ['Lyric (01:53)', ARIA],
  ['Scene (01:10)', ARIA],
  ['Scene A (08:54)', ARIA], // unnamed scene, no person
  // --- non-speakers (grammar pull-quotes / headers / quotes) → narrator ---
  ['Would it be possible to', ARIA],
  ['Could I get', ARIA],
  ["I'd prefer", ARIA],
  ['Can I have my suitcase forwarded to', ARIA],
  ['By the way, is this', ARIA],
  ['Can you start by [V-ing] ... ? Also make sure [constraint].', ARIA],
  ['練法建議', ARIA],
  ['Part 1', ARIA],
  ['Part 2', ARIA],
  ['Herbal tea', ARIA],
  ['"That\'s on you"', ARIA],
  [
    'As code becomes much cheaper to write, the thing that becomes more valuable is deciding what to write.',
    ARIA,
  ],
];

let pass = 0;
const failures = [];
for (const [label, expected] of cases) {
  const voice = resolveVoice(label, undefined, voiceTable);
  if (voice === expected) pass++;
  else failures.push({ label, expected, got: voice });
}

// Sanity: a per-lesson frontmatter override wins over the global map.
{
  const voice = resolveVoice('Guest', { guest: 'en-US-RogerNeural' }, voiceTable);
  if (voice !== 'en-US-RogerNeural') failures.push({ label: 'override:Guest', expected: 'en-US-RogerNeural', got: voice });
  else pass++;
}

if (failures.length) {
  console.error(`[test-speaker-parser] FAIL — ${failures.length} of ${cases.length + 1}`);
  for (const f of failures) console.error(`  "${f.label}" → expected ${f.expected}, got ${f.got}`);
  process.exit(1);
}
console.log(`[test-speaker-parser] OK — ${pass} cases (incl. ${cases.length} observed labels + 1 override)`);
