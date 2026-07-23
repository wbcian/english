// @ts-check
import { defineConfig } from 'astro/config';
import rehypeInjectTableLabels from './src/rehype/inject-table-labels.mjs';
import rehypeInjectLang from './src/rehype/inject-lang.mjs';
import rehypeInjectWordSpans from './src/rehype/inject-word-spans.mjs';
import rehypeInjectBilingual from './src/rehype/inject-bilingual.mjs';
import rehypeInjectMarginalia from './src/rehype/inject-marginalia.mjs';
import remarkRewriteVocabLinks from './src/remark/rewrite-vocab-links.mjs';

const BASE = '/english/';

// https://astro.build/config
export default defineConfig({
  site: 'https://wbcian.github.io',
  base: BASE,
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [[remarkRewriteVocabLinks, { base: BASE }]],
    // inject-marginalia runs LAST: it relocates whole nodes (incl. the .bilingual
    // div built by inject-bilingual) after every hash-sensitive transform has run
    // on the intact subtree. Gated on frontmatter `wide_layout: marginalia`.
    rehypePlugins: [rehypeInjectTableLabels, rehypeInjectLang, rehypeInjectWordSpans, rehypeInjectBilingual, rehypeInjectMarginalia],
  },
});
