// Remark plugin: rewrite content-source-relative .md links to Astro routes
// at build time. Two patterns:
//
//   ../vocab/<slug>.md         →  <base>vocab/<slug>/
//   <lesson-slug>.md           →  <base>lessons/<lesson-slug>/
//
// Lets lesson and vocab source markdown keep file-system relative paths
// (editors can follow them) while the rendered HTML points at the static
// site routes.

import { visit } from 'unist-util-visit';

const VOCAB_LINK_RE = /^\.\.\/vocab\/([^/]+)\.md(#.*)?$/;
// A lesson slug is a same-directory .md file (no slash). We assume any
// `.md` link without a `/` is a sibling lesson reference.
const LESSON_LINK_RE = /^([^/]+)\.md(#.*)?$/;

export default function remarkRewriteVocabLinks({ base = '/english/' } = {}) {
  const normalizedBase = base.startsWith('/') ? base : '/' + base;
  const finalBase = normalizedBase.endsWith('/') ? normalizedBase : normalizedBase + '/';

  return (tree) => {
    visit(tree, 'link', (node) => {
      if (!node.url) return;

      const vocabMatch = node.url.match(VOCAB_LINK_RE);
      if (vocabMatch) {
        const slug = vocabMatch[1];
        const hash = vocabMatch[2] ?? '';
        node.url = `${finalBase}vocab/${slug}/${hash}`;
        return;
      }

      const lessonMatch = node.url.match(LESSON_LINK_RE);
      if (lessonMatch) {
        const slug = lessonMatch[1];
        const hash = lessonMatch[2] ?? '';
        node.url = `${finalBase}lessons/${slug}/${hash}`;
        return;
      }
    });
  };
}
