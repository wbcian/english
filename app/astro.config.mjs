// @ts-check
import { defineConfig } from 'astro/config';
import rehypeInjectTableLabels from './src/rehype/inject-table-labels.mjs';
import rehypeInjectWordSpans from './src/rehype/inject-word-spans.mjs';
import remarkRewriteVocabLinks from './src/remark/rewrite-vocab-links.mjs';

const BASE = '/english/';

// https://astro.build/config
export default defineConfig({
  site: 'https://wbcian.github.io',
  base: BASE,
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [[remarkRewriteVocabLinks, { base: BASE }]],
    rehypePlugins: [rehypeInjectTableLabels, rehypeInjectWordSpans],
  },
});
