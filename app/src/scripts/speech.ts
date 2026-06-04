// Click-to-speak. Dispatches to one of two backends:
//   1) Pre-generated MP3 (Edge TTS, en-US-AriaNeural) if the text hash is in
//      the build-time manifest — high-quality neural voice, consistent across
//      devices.
//   2) Browser Web Speech API (Samantha / Google US English / etc.) as
//      fallback when the hash is missing — covers brand-new lessons before
//      regeneration, offline, or Edge TTS service failures.
//
// Wired up to:
//   - <p> elements inside <blockquote> whose text is mostly English (≤10% CJK)
//   - <td> cells in the column whose <th> header is exactly "word" (lowercase)
// Guards: skips clicks on links, skips when user has a text selection.

import audioManifest from '../data/audio-manifest.json';

// ---- singletons ----

const synth = window.speechSynthesis;
let currentEl: HTMLElement | null = null;
let currentAudio: HTMLAudioElement | null = null;
// Word-by-word (karaoke) highlight state — only used on the MP3 path.
let currentRaf: number | null = null;
let currentWordSpan: HTMLElement | null = null;
// Audios we deliberately tore down (clearCurrent sets src='' which fires a
// spurious 'error'); used to suppress the Web Speech fallback for those.
const teardownAudios = new WeakSet<HTMLAudioElement>();

// ---- Web Speech setup (unchanged from v1) ----

const voicesReady: Promise<void> = new Promise(resolve => {
  if (synth.getVoices().length > 0) { resolve(); return; }
  const onChange = () => { synth.removeEventListener('voiceschanged', onChange); resolve(); };
  synth.addEventListener('voiceschanged', onChange);
  setTimeout(resolve, 1000);
});

const NOVELTY_VOICES = new Set([
  'Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos',
  'Deranged', 'Good News', 'Hysterical', 'Jester', 'Junior', 'Kathy',
  'Organ', 'Princess', 'Ralph', 'Superstar', 'Trinoids', 'Whisper',
  'Wobble', 'Zarvox',
]);

const PREFERRED_VOICES = [
  'Samantha',
  'Alex',
  'Ava (Premium)', 'Ava (Enhanced)', 'Ava',
  'Allison (Premium)', 'Allison (Enhanced)', 'Allison',
  'Google US English',
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Aria',
  'Karen',
  'Daniel',
];

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  const vs = synth.getVoices();
  for (const name of PREFERRED_VOICES) {
    const v = vs.find(vv => vv.name === name && vv.lang.startsWith('en'));
    if (v) return v;
  }
  const def = vs.find(v => v.default && v.lang.startsWith('en'));
  if (def) return def;
  return vs.find(v => v.lang.startsWith('en-US') && !NOVELTY_VOICES.has(v.name))
      ?? vs.find(v => v.lang.startsWith('en') && !NOVELTY_VOICES.has(v.name))
      ?? null;
}

// ---- text utilities ----

function cjkRatio(text: string): number {
  const match = text.match(/[一-鿿]/g);
  const cjk = match ? match.length : 0;
  return text.length ? cjk / text.length : 0;
}

function getSpeakableText(p: HTMLElement): string {
  const first = p.firstChild;
  const parts: string[] = [];
  const skipFirstStrong =
    first && first.nodeType === Node.ELEMENT_NODE && (first as Element).tagName === 'STRONG';
  for (const node of Array.from(p.childNodes)) {
    if (skipFirstStrong && node === first) continue;
    parts.push(node.textContent ?? '');
  }
  return parts.join('').replace(/\s+/g, ' ').trim();
}

function chunkBySentence(text: string, max = 150): string[] {
  const matches = text.match(/[^.!?]+[.!?]+\s*|\S[^.!?]*$/g);
  const sentences = matches && matches.length > 0 ? matches : [text];
  const out: string[] = [];
  let buf = '';
  for (const s of sentences) {
    if (buf.length + s.length > max && buf) {
      out.push(buf.trim());
      buf = s;
    } else {
      buf += s;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

// ---- hashing (mirror generate-audio.mjs: SHA-256 hex, first 12 chars) ----
// Astro's smartypants converts ' → ', " → ", -- → —, ... → …, so the rendered
// DOM text differs from the markdown source. Normalize both sides before hashing.
function normalizeForHash(text: string): string {
  return text
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[–—]/g, '-')
    .replace(/-{2,}/g, '-') // raw -- / --- → - (mirror src/lib/word-tokens.mjs)
    .replace(/\s+/g, ' ')
    .trim();
}

async function sha256Short(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizeForHash(text));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 12);
}

// ---- no-voice banner ----

let noVoiceShown = false;
function showNoVoiceBanner() {
  if (noVoiceShown) return;
  noVoiceShown = true;
  const b = document.createElement('div');
  b.textContent = '你的瀏覽器目前沒有英文語音；請到 OS 設定下載安裝後重新整理。';
  b.className = 'no-voice-banner';
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 8000);
}

// ---- audio file playback path (preferred) ----

function stopWordHighlight(): void {
  if (currentRaf !== null) {
    cancelAnimationFrame(currentRaf);
    currentRaf = null;
  }
  if (currentWordSpan) {
    currentWordSpan.classList.remove('is-current-word');
    currentWordSpan = null;
  }
}

function clearCurrent(): void {
  stopWordHighlight();
  if (currentAudio) {
    teardownAudios.add(currentAudio); // mark as intentional before src='' fires 'error'
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  if (synth.speaking || synth.pending) synth.cancel();
  currentEl?.classList.remove('speaking');
  currentEl = null;
}

function playAudioFile(src: string, el: HTMLElement, hash: string): void {
  clearCurrent();
  const audio = new Audio(src);
  audio.preload = 'auto';
  el.classList.add('speaking');
  currentEl = el;
  currentAudio = audio;

  const cleanup = () => {
    if (currentAudio === audio) stopWordHighlight();
    if (currentEl === el) el.classList.remove('speaking');
    if (currentAudio === audio) {
      currentAudio = null;
      if (currentEl === el) currentEl = null;
    }
  };
  audio.addEventListener('ended', cleanup);
  audio.addEventListener('error', () => {
    // Only fall back to Web Speech on a GENUINE load/decode failure — not when
    // clearCurrent() deliberately tore this clip down (it sets src='', which
    // itself fires 'error'). We mark intentional teardowns in teardownAudios
    // rather than infer from currentAudio identity, because the 'error' event
    // and the play() rejection fire in browser-dependent order (so a guard like
    // `currentAudio === audio` is unreliable across Safari/iOS/Chrome).
    const intentional = teardownAudios.has(audio);
    teardownAudios.delete(audio);
    cleanup();
    if (!intentional) void speakViaWebSpeech(getElText(el), el);
  });

  void audio.play().catch(() => cleanup());

  // Optional karaoke: if a per-word timing sidecar exists for this clip, advance
  // .is-current-word word by word. No sidecar → whole-paragraph .speaking only.
  startWordHighlight(audio, el, hash);
}

interface WordSidecar {
  v: number;
  n: number;
  t: ([number, number] | null)[];
}

function startWordHighlight(audio: HTMLAudioElement, el: HTMLElement, hash: string): void {
  const url = `${import.meta.env.BASE_URL}audio/${hash}.words.json`;
  fetch(url)
    .then(r => (r.ok ? (r.json() as Promise<WordSidecar>) : null))
    .then(sc => {
      // Bail if missing/superseded/stopped while fetching.
      if (!sc || currentAudio !== audio) return;
      const spans = Array.from(el.querySelectorAll<HTMLElement>('.w'));
      // Guard against a tokenizer/sidecar version mismatch — degrade rather than
      // mis-highlight if the span count doesn't match what the sidecar expects.
      if (spans.length !== sc.n) return;

      // Only the words that actually got a timing, in ascending start order.
      // (Punctuation-only spans carry null and never light up; skipping them
      // keeps the onset array monotonic for binary search.)
      const timed: { start: number; span: HTMLElement }[] = [];
      sc.t.forEach((p, k) => {
        if (p) timed.push({ start: p[0], span: spans[k] });
      });
      if (timed.length === 0) return;
      const onsets = timed.map(x => x.start);

      const tick = () => {
        if (currentAudio !== audio) return; // stopped/superseded → self-cancel
        const now = audio.currentTime;
        // Last index whose onset <= now (O(log n) binary search).
        let lo = 0;
        let hi = onsets.length - 1;
        let idx = -1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (onsets[mid] <= now) {
            idx = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
        const span = idx >= 0 ? timed[idx].span : null;
        if (span !== currentWordSpan) {
          currentWordSpan?.classList.remove('is-current-word');
          span?.classList.add('is-current-word');
          currentWordSpan = span;
        }
        currentRaf = requestAnimationFrame(tick);
      };
      currentRaf = requestAnimationFrame(tick);
    })
    .catch(() => {
      /* no sidecar / parse error → whole-paragraph highlight only */
    });
}

function getElText(el: HTMLElement): string {
  // For <td.speakable-word> the textContent is what we want; for <p.speakable>
  // we need to strip a leading speaker label.
  if (el.tagName === 'P') return getSpeakableText(el);
  return el.textContent?.trim() ?? '';
}

// ---- Web Speech fallback ----

async function speakViaWebSpeech(text: string, el: HTMLElement): Promise<void> {
  await voicesReady;

  if (currentEl === el) {
    clearCurrent();
    return;
  }

  clearCurrent();
  el.classList.add('speaking');
  currentEl = el;

  const voice = pickEnglishVoice();
  if (!voice) {
    showNoVoiceBanner();
    el.classList.remove('speaking');
    currentEl = null;
    return;
  }

  const chunks = chunkBySentence(text);

  // iOS Safari has a known race between cancel() and immediate speak()
  setTimeout(() => {
    chunks.forEach((chunk, i) => {
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = 'en-US';
      u.voice = voice;
      u.rate = 0.95;
      if (i === chunks.length - 1) {
        const cleanup = () => {
          if (currentEl === el) {
            el.classList.remove('speaking');
            currentEl = null;
          }
        };
        u.onend = cleanup;
        u.onerror = cleanup;
      }
      synth.speak(u);
    });
  }, 50);
}

// ---- entry point ----

const manifest = audioManifest as Record<string, true>;

async function speakText(text: string, el: HTMLElement): Promise<void> {
  // Toggle-off: re-click the currently speaking element → stop
  if (currentEl === el) {
    clearCurrent();
    return;
  }

  const hash = await sha256Short(text);
  if (manifest[hash]) {
    const src = `${import.meta.env.BASE_URL}audio/${hash}.mp3`;
    playAudioFile(src, el, hash);
    return;
  }
  return speakViaWebSpeech(text, el);
}

// ---- click wiring ----

function shouldIgnoreClick(e: MouseEvent): boolean {
  if ((e.target as HTMLElement | null)?.closest('a')) return true;
  const sel = window.getSelection();
  if (sel && !sel.isCollapsed) return true;
  return false;
}

function wireOneSpeakableWord(el: HTMLElement): void {
  if (el.dataset.speakWired === '1') return;
  el.dataset.speakWired = '1';
  const text = el.textContent?.trim() ?? '';
  if (!text) return;
  const insideLink = !!el.closest('a');
  el.addEventListener('click', (e) => {
    // NB: don't use shouldIgnoreClick here — it short-circuits on any click
    // whose target is inside <a>, which is exactly the case we want to
    // intercept (vocab list rows wrap their .speakable-word in an <a>).
    // Only skip on user text selection.
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) return;
    if (insideLink) {
      // Cancel link navigation so a tap on the word means "speak", not
      // "open detail page".
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    void speakText(text, el);
  });
}

function wireSpeakable(): void {
  // Blockquote paragraphs — only mostly-English ones
  document.querySelectorAll<HTMLElement>('blockquote > p').forEach(p => {
    const text = getSpeakableText(p);
    if (text.length < 4) return;
    if (cjkRatio(text) >= 0.10) return;
    p.classList.add('speakable');
    p.addEventListener('click', (e) => {
      if (shouldIgnoreClick(e)) return;
      void speakText(text, p);
    });
  });

  // Lesson vocab tables — find the column whose <th> is exactly "word",
  // then mark its cells as .speakable-word so the unified wiring picks them up.
  document.querySelectorAll<HTMLTableElement>('table').forEach(table => {
    const headers = Array.from(table.querySelectorAll<HTMLTableCellElement>('thead th'));
    const wordIdx = headers.findIndex(h => h.textContent?.trim().toLowerCase() === 'word');
    if (wordIdx === -1) return;
    table.querySelectorAll<HTMLTableRowElement>('tbody tr').forEach(tr => {
      const cell = tr.cells[wordIdx];
      if (!cell) return;
      cell.classList.add('speakable-word');
    });
  });

  // Wire every .speakable-word element uniformly. This covers:
  //   - vocab table cells (lesson pages, classed above)
  //   - vocab detail <h1 class="word speakable-word">
  //   - vocab list <span class="word speakable-word"> inside an <a> row
  document.querySelectorAll<HTMLElement>('.speakable-word').forEach(wireOneSpeakableWord);
}

// Esc cancels both audio file playback and Web Speech
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && (currentAudio || synth.speaking || synth.pending)) {
    clearCurrent();
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireSpeakable);
} else {
  wireSpeakable();
}
