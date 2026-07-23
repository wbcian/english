// Rehype plugin: group each run of consecutive (English blockquote, Chinese
// blockquote) pairs into a <div class="bilingual"> so CSS can render them as two
// side-by-side lanes on wide screens and interleaved EN-over-ZH when stacked.
//
// RELOCATION-ONLY — the decisive safety property. This plugin NEVER reads,
// rewrites, splits, or reorders a <p>, a leading <strong> speaker label, a
// <span class="w"> karaoke word, or any text node. It only:
//   1. re-parents intact <blockquote> nodes into a wrapper <div>, and
//   2. stamps a matching data-pair id on each EN blockquote and its ZH mate.
// Because every audio/karaoke selector in the codebase uses the direct-child
// combinator `blockquote > p …` and the content-addressed hash is a pure
// function of the <p> subtree (both preserved node-identity-for-node-identity),
// relocating the <blockquote> is invisible to hashing, `.w` spans, play-all, and
// the EN/zh font split. No audio regeneration is needed. See
// lessons/_conventions.md §5 and the impl notes in the design panel.
//
// Runs AFTER inject-lang (needs blockquote[lang="en"]) and inject-word-spans
// (so all hash-sensitive transforms + their build assertion finish on the intact
// subtree first). Registered LAST in astro.config.mjs.

function isElement(n, tag) {
  return !!n && n.type === 'element' && (!tag || n.tagName === tag);
}
function isEnBlockquote(n) {
  return isElement(n, 'blockquote') && n.properties?.lang === 'en';
}
function isZhBlockquote(n) {
  return isElement(n, 'blockquote') && n.properties?.lang !== 'en';
}
// Index of the next element sibling at/after i (skipping whitespace-only text).
function nextElementIndex(children, i) {
  let j = i;
  while (j < children.length && !isElement(children[j])) j++;
  return j;
}

// Rewrite one children array: replace each maximal run of adjacent (EN, ZH)
// blockquote pairs with a single .bilingual wrapper holding the blockquotes in
// source order (EN, ZH, EN, ZH …). nextId() yields document-global pair ids.
function groupChildren(children, nextId) {
  const out = [];
  let i = 0;
  while (i < children.length) {
    if (isEnBlockquote(children[i])) {
      // Greedily consume consecutive (EN, ZH) blockquote pairs into one run.
      const run = [];
      let k = i;
      while (true) {
        const a = nextElementIndex(children, k);
        if (!isEnBlockquote(children[a])) break;
        const b = nextElementIndex(children, a + 1);
        if (!isZhBlockquote(children[b])) break;
        const pid = `bp${nextId()}`;
        children[a].properties = children[a].properties ?? {};
        children[b].properties = children[b].properties ?? {};
        children[a].properties['data-pair'] = pid;
        children[b].properties['data-pair'] = pid;
        run.push(children[a], children[b]); // drop inter-element whitespace inside the grid
        k = b + 1;
      }
      if (run.length) {
        out.push({
          type: 'element',
          tagName: 'div',
          properties: { className: ['bilingual'] },
          children: run,
        });
        i = k;
        continue;
      }
    }
    out.push(children[i]);
    i++;
  }
  return out;
}

export default function rehypeInjectBilingual() {
  return (tree, file) => {
    // Opt-in per lesson: only lessons with `two_lane: true` in frontmatter get the
    // two-lane wrapper. Every other page is left byte-for-byte untouched, so this
    // stays a scoped pilot (see lessons/_conventions.md). Astro exposes the
    // frontmatter on the vfile.
    if (!file?.data?.astro?.frontmatter?.two_lane) return;
    let counter = 0;
    const nextId = () => counter++;
    const walk = (node) => {
      if (!node || !Array.isArray(node.children)) return;
      node.children = groupChildren(node.children, nextId);
      // Recurse only into containers that could themselves hold top-level
      // blockquote pairs — never into a <blockquote> (no nested pairs) or into a
      // .bilingual wrapper we just created (its children are already paired).
      for (const child of node.children) {
        if (
          isElement(child) &&
          child.tagName !== 'blockquote' &&
          !(child.properties?.className ?? []).includes('bilingual')
        ) {
          walk(child);
        }
      }
    };
    walk(tree);
  };
}
