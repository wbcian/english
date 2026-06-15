// Shared HAST helpers for the rehype plugins that reason about speakable
// paragraphs (inject-word-spans = karaoke word wrapping; inject-lang = EN/zh
// font split). Kept in one place so the "what counts as a paragraph's speakable
// text" rule has a single definition across both plugins.
//
// Mirrors getSpeakableText (speech.ts) / paragraphSpeakableText
// (generate-audio.mjs): concat all paragraph children EXCEPT a leading <strong>
// speaker label, then collapse whitespace. See lessons/_conventions.md §5.

export function hastText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  if (Array.isArray(node.children)) return node.children.map(hastText).join('');
  return '';
}

export function paragraphSpeakableText(p) {
  const kids = p.children ?? [];
  const skip = kids[0]?.type === 'element' && kids[0].tagName === 'strong';
  let s = '';
  kids.forEach((c, i) => {
    if (!(skip && i === 0)) s += hastText(c);
  });
  return s.replace(/\s+/g, ' ').trim();
}
