import { visit } from 'unist-util-visit';

/**
 * Remark plugin to transform Obsidian/GitHub style callouts:
 * > [!note] Optional Title
 * > Body content
 */
export function remarkCallouts() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      if (!node.children || node.children.length === 0) return;

      const firstChild = node.children[0];
      if (firstChild.type !== 'paragraph' || !firstChild.children || firstChild.children.length === 0) {
        return;
      }

      const firstTextNode = firstChild.children[0];
      if (firstTextNode.type !== 'text') return;

      const calloutMatch = firstTextNode.value.match(/^\[!([a-zA-Z0-9_-]+)\](?:\s*(.*))?(?:\n([\s\S]*))?$/);
      if (!calloutMatch) return;

      const type = calloutMatch[1].toLowerCase();
      const customTitle = (calloutMatch[2] || '').trim();
      const remainingText = calloutMatch[3] || '';

      const titleText = customTitle || type.toUpperCase();

      // Set HTML properties on blockquote element
      node.data = node.data || {};
      node.data.hProperties = {
        className: ['callout', `callout-${type}`],
        'data-callout': type
      };

      // Create callout header node
      const headerNode = {
        type: 'paragraph',
        data: {
          hProperties: {
            className: ['callout-header']
          }
        },
        children: [
          {
            type: 'html',
            value: `<span class="callout-tag">[${type.toUpperCase()}]</span>`
          },
          {
            type: 'html',
            value: `<span class="callout-title">${escapeHtml(titleText)}</span>`
          }
        ]
      };

      // Adjust the first paragraph's text: remove the [!tag] line
      if (remainingText.length > 0) {
        firstTextNode.value = remainingText;
      } else {
        // Remove the first text node or empty paragraph
        firstChild.children.shift();
      }

      if (firstChild.children.length === 0) {
        // Paragraph was only the [!tag] line, replace it with the header node
        node.children[0] = headerNode;
      } else {
        // Prepend header node
        node.children.unshift(headerNode);
      }
    });
  };
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
