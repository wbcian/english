// Click-to-speak using the browser's Web Speech API.
// Wired up to:
//   - <p> elements inside <blockquote> whose text is mostly English (≤10% CJK)
//   - <td> cells in the column whose <th> header is exactly "word" (lowercase)
// Guards: skips clicks on links, skips when user has a text selection.

const synth = window.speechSynthesis;
let currentEl: HTMLElement | null = null;

// Voice loading is async on iOS Safari (and sometimes Chrome).
// Wait for voiceschanged event or 1s fallback before first speak.
const voicesReady: Promise<void> = new Promise(resolve => {
  if (synth.getVoices().length > 0) { resolve(); return; }
  const onChange = () => { synth.removeEventListener('voiceschanged', onChange); resolve(); };
  synth.addEventListener('voiceschanged', onChange);
  setTimeout(resolve, 1000);
});

// macOS ships ~25 "novelty" voices (Albert, Bad News, Bells…) that show up first
// in getVoices() and sound terrible for learning. Skip them.
const NOVELTY_VOICES = new Set([
  'Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos',
  'Deranged', 'Good News', 'Hysterical', 'Jester', 'Junior', 'Kathy',
  'Organ', 'Princess', 'Ralph', 'Superstar', 'Trinoids', 'Whisper',
  'Wobble', 'Zarvox',
]);

// High-quality English voices, ordered by preference.
const PREFERRED_VOICES = [
  'Samantha',        // macOS default, US female
  'Alex',            // macOS, US male, high quality
  'Ava (Premium)', 'Ava (Enhanced)', 'Ava',
  'Allison (Premium)', 'Allison (Enhanced)', 'Allison',
  'Google US English',
  'Microsoft Aria Online (Natural) - English (United States)',
  'Microsoft Aria',
  'Karen',           // macOS, Australian
  'Daniel',          // macOS, British
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

function cjkRatio(text: string): number {
  const match = text.match(/[一-鿿]/g);
  const cjk = match ? match.length : 0;
  return text.length ? cjk / text.length : 0;
}

/**
 * Get speakable text from a <p>. If the <p> starts with a <strong> (speaker label
 * like "**Ethan (04:18)**" or "**Scene A — Sabrina (04:08)**"), skip that <strong>.
 */
function getSpeakableText(p: HTMLElement): string {
  const first = p.firstChild;
  let parts: string[] = [];
  let skipFirstStrong = first && first.nodeType === Node.ELEMENT_NODE && (first as Element).tagName === 'STRONG';
  for (const node of Array.from(p.childNodes)) {
    if (skipFirstStrong && node === first) continue;
    parts.push(node.textContent ?? '');
  }
  return parts.join('').replace(/\s+/g, ' ').trim();
}

/**
 * Split long text into <=150-char chunks at sentence boundaries.
 * Chrome silently truncates utterances over ~200 chars.
 */
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

async function speak(text: string, el: HTMLElement): Promise<void> {
  await voicesReady;

  // Toggle off if clicking the same element again
  if (currentEl === el) {
    synth.cancel();
    el.classList.remove('speaking');
    currentEl = null;
    return;
  }

  synth.cancel();
  currentEl?.classList.remove('speaking');
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

  // iOS Safari has a known race between cancel() and immediate speak() — small delay avoids it.
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

function shouldIgnoreClick(e: MouseEvent): boolean {
  if ((e.target as HTMLElement | null)?.closest('a')) return true;
  const sel = window.getSelection();
  if (sel && !sel.isCollapsed) return true;
  return false;
}

function wireSpeakable(): void {
  // 1. Blockquote paragraphs — only mostly-English ones
  document.querySelectorAll<HTMLElement>('blockquote > p').forEach(p => {
    const text = getSpeakableText(p);
    if (text.length < 4) return;
    if (cjkRatio(text) >= 0.10) return;
    p.classList.add('speakable');
    p.addEventListener('click', (e) => {
      if (shouldIgnoreClick(e)) return;
      void speak(text, p);
    });
  });

  // 2. Vocab tables — any column whose <th> is exactly "word" (lowercase)
  document.querySelectorAll<HTMLTableElement>('table').forEach(table => {
    const headers = Array.from(table.querySelectorAll<HTMLTableCellElement>('thead th'));
    const wordIdx = headers.findIndex(h => h.textContent?.trim().toLowerCase() === 'word');
    if (wordIdx === -1) return;
    table.querySelectorAll<HTMLTableRowElement>('tbody tr').forEach(tr => {
      const cell = tr.cells[wordIdx];
      if (!cell) return;
      const text = cell.textContent?.trim() ?? '';
      if (!text) return;
      cell.classList.add('speakable-word');
      cell.addEventListener('click', (e) => {
        if (shouldIgnoreClick(e as MouseEvent)) return;
        void speak(text, cell);
      });
    });
  });
}

// Global Esc to stop playback
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && (synth.speaking || synth.pending)) {
    synth.cancel();
    currentEl?.classList.remove('speaking');
    currentEl = null;
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireSpeakable);
} else {
  wireSpeakable();
}
