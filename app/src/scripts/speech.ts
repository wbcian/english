// Click-to-speak. Dispatches to one of two backends:
//   1) Pre-generated MP3 (Edge TTS, en-US-AriaNeural) if the text hash is in
//      the build-time manifest — high-quality neural voice, consistent across
//      devices.
//   2) Browser Web Speech API (Samantha / Google US English / etc.) as
//      fallback when the hash is missing — covers brand-new lessons before
//      regeneration, offline, or Edge TTS service failures.
//
// Wired up to:
//   - Play buttons injected at the start of <p> elements inside <blockquote>
//     whose text is mostly English (≤10% CJK). Only button clicks play;
//     clicking the paragraph body does nothing (avoids accidental playback).
//   - <td> cells in the column whose <th> header is exactly "word" (lowercase)
//     — unchanged: clicking the whole cell plays/stops.
// Guards: skips clicks on links, skips when user has a text selection.

import audioManifest from '../data/audio-manifest.json';

// ---- singletons ----

const synth = window.speechSynthesis;
let currentEl: HTMLElement | null = null;
let currentAudio: HTMLAudioElement | null = null;
// Word-by-word (karaoke) highlight state — only used on the MP3 path.
// Progressive read-trail: spoken words stay lit (.is-played-word), the current
// word gets the strongest tier (.is-current-word), unspoken words stay plain.
let currentRaf: number | null = null;
// The full ordered .w span list of the clip currently highlighting (DOM order).
// Lets stopWordHighlight clear the WHOLE trail and lets the tick paint played
// spans by DOM-index range (so untimed punctuation spans fill in too).
let trailSpans: HTMLElement[] = [];
// DOM index (into trailSpans) of the word currently lit as .is-current-word.
// -1 = nothing lit yet (fresh start / after teardown / after resume re-init).
let litIndex = -1;
// Bumped on every startWordHighlight call. A pending sidecar fetch or a running
// tick captures its generation and bails once superseded — so a resume (which
// re-runs startWordHighlight) or rapid replay can't leave a second tick loop
// running against the shared trail state when an earlier fetch resolves late.
let highlightGen = 0;
// Audios we deliberately tore down (clearCurrent sets src='' which fires a
// spurious 'error'); used to suppress the Web Speech fallback for those.
const teardownAudios = new WeakSet<HTMLAudioElement>();

// Playback states for the per-paragraph play button.
// 'idle'   → showing ▶, nothing playing for this element
// 'playing'→ showing ⏸, audio/speech in progress
// 'paused' → showing ▶ + ↻ replay button, audio/speech paused
type PlayState = 'idle' | 'playing' | 'paused';

// Per-paragraph state keyed by the wired <p>: speakable text (also used for
// pause/resume + replay), pre-computed hash, and the injected buttons.
interface ParagraphPlayCtx {
  text: string;
  // The pre-computed hash — null until first play (hash is async).
  hash: string | null;
  play: HTMLButtonElement;
  replay: HTMLButtonElement;
}
const pCtx = new WeakMap<HTMLElement, ParagraphPlayCtx>();

// ---- playback speed (single source of truth for BOTH backends; persisted) ----
// MP3 path applies it via audio.playbackRate; Web Speech via utterance.rate.
// The karaoke sidecars are speed-agnostic: their onsets and audio.currentTime
// share the media timeline, so playbackRate scales both together.

const RATE_KEY = 'englishApp:playbackRate';
const RATE_OPTIONS = [0.8, 1.0, 1.1, 1.25];
const DEFAULT_RATE = 1.0;

function readStoredRate(): number {
  try {
    const v = parseFloat(localStorage.getItem(RATE_KEY) ?? '');
    return RATE_OPTIONS.includes(v) ? v : DEFAULT_RATE;
  } catch {
    return DEFAULT_RATE;
  }
}

let playbackRate = readStoredRate();

function setPlaybackRate(r: number): void {
  playbackRate = r;
  try { localStorage.setItem(RATE_KEY, String(r)); } catch { /* private mode / quota */ }
  // Live-apply to the MP3 that's playing now. Web Speech rate is fixed once an
  // utterance is created, so it only takes effect on the next play (MP3 is the
  // primary path, so this is acceptable).
  if (currentAudio) currentAudio.playbackRate = r;
  updateRateUI();
}

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
  // firstChild may now be the injected play <button> — we must skip it.
  // We also skip the original leading <STRONG> speaker label.
  // Strategy: collect text from childNodes, skipping:
  //   (a) any <button> (our injected controls), and
  //   (b) the first non-button element if it's a <STRONG> (speaker label).
  const parts: string[] = [];
  let foundFirstMeaningfulEl = false;

  for (const node of Array.from(p.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      // Always skip injected speak-btn / replay-btn buttons.
      if (el.tagName === 'BUTTON') continue;
      // The first non-button element: if it's STRONG, it's the speaker label.
      if (!foundFirstMeaningfulEl) {
        foundFirstMeaningfulEl = true;
        if (el.tagName === 'STRONG') continue;
      }
    } else if (node.nodeType === Node.TEXT_NODE && !foundFirstMeaningfulEl) {
      // A non-whitespace text node before any element means the paragraph
      // doesn't start with a speaker label — stop looking for one.
      if ((node.textContent ?? '').trim()) foundFirstMeaningfulEl = true;
    }
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

// ---- play button UI state ----

function setBtnState(p: HTMLElement, state: PlayState): void {
  const ctx = pCtx.get(p);
  if (!ctx) return;
  const { play, replay } = ctx;

  if (state === 'idle') {
    play.textContent = '▶';
    play.setAttribute('aria-label', 'Play');
    play.dataset.state = 'idle';
    replay.hidden = true;
  } else if (state === 'playing') {
    play.textContent = '⏸';
    play.setAttribute('aria-label', 'Pause');
    play.dataset.state = 'playing';
    replay.hidden = true;
  } else {
    // paused
    play.textContent = '▶';
    play.setAttribute('aria-label', 'Resume');
    play.dataset.state = 'paused';
    replay.hidden = false;
  }
}

// ---- playback speed control UI ----

let speedBtns: { btn: HTMLButtonElement; rate: number }[] = [];

function updateRateUI(): void {
  for (const { btn, rate } of speedBtns) {
    const active = rate === playbackRate;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  }
}

// Inject a small speed selector into the header nav. Idempotent — safe to call
// once per page load.
function wireSpeedControl(): void {
  if (document.querySelector('.speed-control')) return;

  const wrap = document.createElement('div');
  wrap.className = 'speed-control';

  const label = document.createElement('span');
  label.className = 'speed-control__label';
  label.textContent = '速度';
  wrap.appendChild(label);

  speedBtns = RATE_OPTIONS.map(r => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'speed-btn';
    b.dataset.rate = String(r);
    b.textContent = `${r}×`;
    b.setAttribute('aria-label', `Playback speed ${r}×`);
    b.addEventListener('click', () => setPlaybackRate(r));
    wrap.appendChild(b);
    return { btn: b, rate: r };
  });

  // Every page that loads this script renders Layout's <header><nav.top-nav>;
  // the optional chain just no-ops if a future page omits it (playback still
  // works, only the control is absent).
  document.querySelector('header .top-nav')?.appendChild(wrap);

  updateRateUI();
}

// ---- audio file playback path (preferred) ----

// Cancel the karaoke RAF loop WITHOUT touching the trail classes — pause freezes
// the read-trail where it is; stopWordHighlight clears the whole trail too.
function cancelKaraokeTick(): void {
  if (currentRaf !== null) {
    cancelAnimationFrame(currentRaf);
    currentRaf = null;
  }
}

// Set a word span to one tier of the read-trail (or null = plain). Idempotent —
// classList.toggle with an explicit force flag is a no-op when already in the
// target state, so re-setting the same tier never restarts the CSS transition
// (this is what keeps the resume repaint flicker-free).
function setWordTier(span: HTMLElement, tier: 'current' | 'played' | null): void {
  span.classList.toggle('is-current-word', tier === 'current');
  span.classList.toggle('is-played-word', tier === 'played');
}

function stopWordHighlight(): void {
  cancelKaraokeTick();
  // Clear the entire trail, not just the current word. Cheap: ≤~130 spans, and
  // only on stop/teardown (not per-frame). Empty trailSpans → no-op, so a
  // paragraph that never had a sidecar is untouched.
  for (const span of trailSpans) setWordTier(span, null);
  trailSpans = [];
  litIndex = -1;
}

function clearCurrent(): void {
  // Only the active element's button can be non-idle; the rest already are.
  if (currentEl) setBtnState(currentEl, 'idle');
  stopWordHighlight();
  if (currentAudio) {
    teardownAudios.add(currentAudio); // mark as intentional before src='' fires 'error'
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  // Include synth.paused: a paused utterance keeps the queue alive without
  // speaking/pending being reliably true. Without it, pausing Web Speech A
  // then playing B leaves A stuck in the paused queue and B never starts.
  if (synth.speaking || synth.pending || synth.paused) synth.cancel();
  currentEl?.classList.remove('speaking');
  currentEl = null;
}

function playAudioFile(src: string, el: HTMLElement, hash: string): void {
  clearCurrent();
  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.playbackRate = playbackRate;
  el.classList.add('speaking');
  setBtnState(el, 'playing');
  currentEl = el;
  currentAudio = audio;

  const cleanup = () => {
    // Only the live clip may touch UI state. A stale teardown 'error' (firing
    // after a replay or another paragraph already started a new clip) must not
    // clobber the new clip's button state — nor its .speaking class: on replay
    // of the SAME paragraph, currentEl === el for the stale clip too, so a
    // currentEl-only guard would strip the class while the new clip plays.
    if (currentAudio !== audio) return;
    stopWordHighlight();
    setBtnState(el, 'idle');
    if (currentEl === el) el.classList.remove('speaking');
    currentAudio = null;
    if (currentEl === el) currentEl = null;
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
  // Capture this invocation's generation; a later startWordHighlight (resume,
  // replay, paragraph switch) bumps it so this fetch/tick supersedes itself.
  const gen = ++highlightGen;
  const url = `${import.meta.env.BASE_URL}audio/${hash}.words.json`;
  fetch(url)
    .then(r => (r.ok ? (r.json() as Promise<WordSidecar>) : null))
    .then(sc => {
      // Bail if missing/superseded (newer call / stopped while fetching).
      if (!sc || gen !== highlightGen || currentAudio !== audio) return;
      const spans = Array.from(el.querySelectorAll<HTMLElement>('.w'));
      // Guard against a tokenizer/sidecar version mismatch — degrade rather than
      // mis-highlight if the span count doesn't match what the sidecar expects.
      if (spans.length !== sc.n) return;

      // Timed words only, in ascending start order, each carrying its DOM index
      // k among `spans`. Punctuation-only spans carry null timing and stay out
      // of `timed` (keeps onsets monotonic for binary search) — but they still
      // get painted "played" by DOM-index range below, for a contiguous trail.
      const timed: { start: number; k: number }[] = [];
      sc.t.forEach((p, k) => {
        if (p) timed.push({ start: p[0], k });
      });
      if (timed.length === 0) return;
      const onsets = timed.map(x => x.start);

      // Adopt this clip's spans as the active trail and reset the lit cursor.
      // litIndex=-1 forces the first tick (incl. after a resume) to paint the
      // whole [0..k) prefix as played and k as current.
      trailSpans = spans;
      litIndex = -1;

      const tick = () => {
        if (gen !== highlightGen || currentAudio !== audio) return; // superseded/stopped → self-cancel
        const now = audio.currentTime;
        // Last timed index whose onset <= now (O(log n) binary search).
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
        // Target DOM index of the current word (-1 before the first onset).
        const k = idx >= 0 ? timed[idx].k : -1;

        if (k !== litIndex) {
          // Demote the previously-current word (if any) to played.
          if (litIndex >= 0) setWordTier(trailSpans[litIndex], 'played');
          if (k >= 0) {
            // Paint every span between the old lit index and k as played: this
            // covers forward skips (>1 word/frame) AND untimed punctuation spans
            // interleaved with words, giving a contiguous trail. setWordTier is
            // idempotent → already-played spans don't restart the CSS transition
            // (so a resume repaint doesn't flicker).
            for (let i = litIndex >= 0 ? litIndex + 1 : 0; i < k; i++) {
              setWordTier(trailSpans[i], 'played');
            }
            // Promote the new current word (strongest tier).
            setWordTier(trailSpans[k], 'current');
          }
          litIndex = k;
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
  // the stripped text (no speaker label / injected buttons) is already stored
  // in pCtx at wire time — prefer it over re-walking child nodes.
  if (el.tagName === 'P') return pCtx.get(el)?.text ?? getSpeakableText(el);
  return el.textContent?.trim() ?? '';
}

// ---- Web Speech fallback ----

async function speakViaWebSpeech(text: string, el: HTMLElement): Promise<void> {
  await voicesReady;

  clearCurrent();
  el.classList.add('speaking');
  setBtnState(el, 'playing');
  currentEl = el;

  const voice = pickEnglishVoice();
  if (!voice) {
    showNoVoiceBanner();
    el.classList.remove('speaking');
    setBtnState(el, 'idle');
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
      u.rate = playbackRate;
      if (i === chunks.length - 1) {
        const cleanup = () => {
          if (currentEl === el) {
            el.classList.remove('speaking');
            setBtnState(el, 'idle');
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

// ---- entry point: speak from scratch ----

const manifest = audioManifest as Record<string, true>;

async function speakText(text: string, el: HTMLElement): Promise<void> {
  const hash = await sha256Short(text);
  if (manifest[hash]) {
    const src = `${import.meta.env.BASE_URL}audio/${hash}.mp3`;
    playAudioFile(src, el, hash);
    return;
  }
  return speakViaWebSpeech(text, el);
}

// ---- play button click handler (paragraph path) ----

async function handlePlayBtnClick(p: HTMLElement): Promise<void> {
  const ctx = pCtx.get(p);
  if (!ctx) return;

  const btnState = ctx.play.dataset.state ?? 'idle';

  if (btnState === 'playing') {
    // Pause in-progress playback — do NOT tear down; just suspend.
    if (currentAudio) {
      currentAudio.pause();
      // Stop karaoke tick loop; highlight stays frozen at current word.
      cancelKaraokeTick();
    } else if (synth.speaking) {
      synth.pause();
    }
    setBtnState(p, 'paused');
    return;
  }

  if (btnState === 'paused') {
    // Resume from pause position.
    if (currentAudio) {
      // A rejected resume (e.g. media element invalidated while paused) would
      // otherwise leave the button stuck on ⏸ with nothing playing.
      currentAudio.play().catch(() => clearCurrent());
      if (ctx.hash) {
        // Restart the karaoke tick from the live audio.currentTime — it picks
        // its position from binary search, so resuming mid-clip just works.
        // Re-running startWordHighlight re-fetches the sidecar, which is fine:
        // it's browser-cached and bails gracefully if missing.
        cancelKaraokeTick();
        startWordHighlight(currentAudio, p, ctx.hash);
      }
    } else if (synth.paused) {
      synth.resume();
    }
    setBtnState(p, 'playing');
    return;
  }

  // idle → tear down whatever was active (no-op when nothing is playing).
  clearCurrent();
  void speakText(ctx.text, p);
}

async function handleReplayBtnClick(p: HTMLElement): Promise<void> {
  const ctx = pCtx.get(p);
  if (!ctx) return;

  // Full teardown of current state (even if it's this same paragraph paused).
  clearCurrent();
  void speakText(ctx.text, p);
}

// ---- click wiring ----

function wireOneSpeakableWord(el: HTMLElement): void {
  if (el.dataset.speakWired === '1') return;
  el.dataset.speakWired = '1';
  const text = el.textContent?.trim() ?? '';
  if (!text) return;
  const insideLink = !!el.closest('a');
  el.addEventListener('click', (e) => {
    // NB: clicks inside <a> are deliberately NOT ignored here — vocab list
    // rows wrap their .speakable-word in an <a>, and a tap on the word should
    // speak rather than navigate. Only skip on user text selection.
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) return;
    if (insideLink) {
      // Cancel link navigation so a tap on the word means "speak", not
      // "open detail page".
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    // Toggle-off: re-click the currently speaking element → stop
    if (currentEl === el) {
      clearCurrent();
      return;
    }
    void speakText(text, el);
  });
}

function wireSpeakable(): void {
  // Blockquote paragraphs — only mostly-English ones.
  // Instead of attaching click to the whole paragraph, inject a play button and
  // wire only the button (and a replay button for the paused state).
  document.querySelectorAll<HTMLElement>('blockquote > p').forEach(p => {
    // Buttons aren't inserted yet, and getSpeakableText skips <button>
    // elements anyway, so this read is safe either way.
    const text = getSpeakableText(p);
    if (text.length < 4) return;
    if (cjkRatio(text) >= 0.10) return;

    p.classList.add('speakable');

    // Play/pause button (▶ / ⏸) — state-dependent attributes (icon,
    // aria-label, data-state, replay visibility) come from setBtnState below.
    const playBtn = document.createElement('button');
    playBtn.className = 'speak-btn';
    playBtn.setAttribute('type', 'button');

    // Replay button (↻) — only visible in 'paused' state.
    const replayBtn = document.createElement('button');
    replayBtn.className = 'speak-btn speak-btn--replay';
    replayBtn.setAttribute('aria-label', 'Replay from start');
    replayBtn.setAttribute('type', 'button');
    replayBtn.textContent = '↻';

    const ctx: ParagraphPlayCtx = { text, hash: null, play: playBtn, replay: replayBtn };
    pCtx.set(p, ctx);
    setBtnState(p, 'idle');

    // Pre-compute hash in the background so first play is instant.
    void sha256Short(text).then(h => { ctx.hash = h; });

    // Insert buttons at the very start of the paragraph, before any children
    // (including the leading <strong> speaker label if present).
    p.insertBefore(replayBtn, p.firstChild);
    p.insertBefore(playBtn, p.firstChild);

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // don't bubble to paragraph
      void handlePlayBtnClick(p);
    });

    replayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      void handleReplayBtnClick(p);
    });

    // Paragraph body click: do nothing (explicit no-op to satisfy spec §2).
    // Text selection and link clicks are unaffected because we don't prevent
    // any defaults on them — only stopPropagation would matter if there were
    // outer handlers, and there aren't.
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

// Esc cancels both audio file playback and Web Speech, and resets all button UIs
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && (currentAudio || synth.speaking || synth.pending || synth.paused)) {
    clearCurrent();
  }
});

function init(): void {
  wireSpeakable();
  wireSpeedControl();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
