// Rehype plugin: for every <td> in a table with a <thead>, inject
// data-label="<th-text>" so mobile CSS can show "<column>: <value>"
// when the table collapses to stacked cards at <640px.
//
// Skips tables without a <thead>.

import { visit } from 'unist-util-visit';

function getTextContent(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  if (Array.isArray(node.children)) {
    return node.children.map(getTextContent).join('');
  }
  return '';
}

export default function rehypeInjectTableLabels() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'table') return;

      const thead = node.children?.find(
        (c) => c.type === 'element' && c.tagName === 'thead',
      );
      if (!thead) return;

      const headerRow = thead.children?.find(
        (c) => c.type === 'element' && c.tagName === 'tr',
      );
      if (!headerRow) return;

      const headers = headerRow.children
        .filter((c) => c.type === 'element' && c.tagName === 'th')
        .map((th) => getTextContent(th).trim());

      const tbody = node.children?.find(
        (c) => c.type === 'element' && c.tagName === 'tbody',
      );
      if (!tbody) return;

      for (const tr of tbody.children) {
        if (tr.type !== 'element' || tr.tagName !== 'tr') continue;
        let cellIdx = 0;
        for (const td of tr.children) {
          if (td.type !== 'element' || td.tagName !== 'td') continue;
          const label = headers[cellIdx];
          if (label) {
            td.properties = td.properties ?? {};
            td.properties['data-label'] = label;
          }
          cellIdx++;
        }
      }
    });
  };
}
