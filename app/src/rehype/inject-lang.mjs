// Rehype plugin: stamp lang="en" on blockquotes whose paragraph is an English
// speakable line, so CSS can render the English transcript/summary as the serif
// reading protagonist and the Chinese translation blockquotes as a quieter sans
// sub-voice (P6 EN/zh split). Build-time, so there is NO font FOUC.
//
// Why a build stamp and not :lang(): the page is <html lang="zh-TW">, so a
// :lang(zh) selector would match everything. The only reliable EN signal is the
// same speakable predicate the karaoke/audio layer uses — reused here verbatim.
//
// Hash-safe: this only adds a `lang` PROPERTY to the <blockquote> element; it
// never touches text nodes or <p> children, so paragraphSpeakableText / the
// content-addressed audio hash are unchanged (the inject-word-spans build
// assertion + check-audio-hash-sync still pass).

import { visit } from 'unist-util-visit';
import { isSpeakableParagraphText } from '../lib/word-tokens.mjs';
import { paragraphSpeakableText } from './hast-speakable.mjs';

export default function rehypeInjectLang() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'blockquote') return;
      const isEnglish = (node.children ?? []).some(
        (c) =>
          c.type === 'element' &&
          c.tagName === 'p' &&
          isSpeakableParagraphText(paragraphSpeakableText(c)),
      );
      if (isEnglish) {
        node.properties = node.properties ?? {};
        node.properties.lang = 'en';
      }
    });
  };
}
