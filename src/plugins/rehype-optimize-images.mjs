import { visit } from 'unist-util-visit';

/**
 * Rehype plugin to optimize images rendered from markdown:
 * - Adds loading="lazy" to all markdown body images (Performance / CWV)
 * - Adds decoding="async" for off-thread image decode (Performance)
 * - Ensures alt attribute is present and descriptive (Accessibility)
 */
export function rehypeOptimizeImages() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        node.properties = node.properties || {};

        // Performance: below-the-fold content images should be lazy and async
        if (!node.properties.loading) {
          node.properties.loading = 'lazy';
        }
        if (!node.properties.decoding) {
          node.properties.decoding = 'async';
        }

        // Accessibility: ensure alt attribute is always populated
        if (!node.properties.alt || typeof node.properties.alt !== 'string' || node.properties.alt.trim() === '') {
          const src = String(node.properties.src || '');
          const filename = src.split('/').pop()?.split('.')[0] || 'Registro visual';
          node.properties.alt = filename.replace(/[-_]/g, ' ');
        }
      }
    });
  };
}
