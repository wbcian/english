// Remark plugin: translate Markdown links like ../vocab/<slug>.md  →
// the Astro-routed URL /english/vocab/<slug>/ at build time.
//
// Lets lesson source markdown keep file-system relative paths (so opening the
// .md in an editor works) while the rendered HTML points at the rendered
// vocab page.
//
// Pass through anything not matching the ../vocab/<slug>.md pattern.

import { visit } from 'unist-util-visit';

const VOCAB_LINK_RE = /^\.\.\/vocab\/([^/]+)\.md(#.*)?$/;

export default function remarkRewriteVocabLinks({ base = '/english/' } = {}) {
  // Normalize base: must start and end with '/'
  const normalizedBase = base.startsWith('/') ? base : '/' + base;
  const finalBase = normalizedBase.endsWith('/') ? normalizedBase : normalizedBase + '/';

  return (tree) => {
    visit(tree, 'link', (node) => {
      if (!node.url) return;
      const m = node.url.match(VOCAB_LINK_RE);
      if (!m) return;
      const slug = m[1];
      const hash = m[2] ?? '';
      node.url = `${finalBase}vocab/${slug}/${hash}`;
    });
  };
}
