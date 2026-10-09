import { visit } from 'unist-util-visit';

/**
 * Remark plugin to transform [[wikilinks]] into HTML anchors.
 * Supports [[target-slug]] and [[target-slug|Custom Label]].
 */
export function remarkWikilinks() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!node.value || typeof node.value !== 'string') return;
      const regex = /\[\[([a-zA-Z0-9_\-\/]+)(?:\|([^\]]+))?\]\]/g;
      if (!regex.test(node.value)) return;

      regex.lastIndex = 0;
      const children = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(node.value)) !== null) {
        const [fullMatch, slug, customLabel] = match;
        const matchStart = match.index;

        if (matchStart > lastIndex) {
          children.push({
            type: 'text',
            value: node.value.slice(lastIndex, matchStart)
          });
        }

        const normalizedSlug = slug.trim().toLowerCase().replace(/^\/+/, '');
        const label = (customLabel || slug).trim();

        children.push({
          type: 'link',
          url: `/notes/${normalizedSlug}`,
          data: {
            hProperties: {
              className: ['wikilink'],
              'data-slug': normalizedSlug
            }
          },
          children: [
            {
              type: 'text',
              value: label
            }
          ]
        });

        lastIndex = matchStart + fullMatch.length;
      }

      if (lastIndex < node.value.length) {
        children.push({
          type: 'text',
          value: node.value.slice(lastIndex)
        });
      }

      if (parent && typeof index === 'number') {
        parent.children.splice(index, 1, ...children);
        return index + children.length;
      }
    });
  };
}
