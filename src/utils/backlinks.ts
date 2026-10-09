import type { CollectionEntry } from 'astro:content';

export interface BacklinkItem {
  id: string;
  title: string;
  stage?: 'seed' | 'growing' | 'evergreen';
  url: string;
  excerpt?: string;
}

/**
 * Builds an inverted index of all bidirectional backlinks in a single O(N) pass.
 * Prevents O(N^2) full-text scans during static route generation.
 */
export function buildBacklinksIndex(
  allNotes: CollectionEntry<'notes'>[]
): Map<string, BacklinkItem[]> {
  const index = new Map<string, BacklinkItem[]>();

  for (const note of allNotes) {
    const body = note.body || '';
    const noteIdNormalized = note.id.toLowerCase().replace(/\.md$/, '');

    // Single-pass regex matching both [[target]] wikilinks and /notes/target hrefs
    const matches = body.matchAll(
      /\[\[([a-zA-Z0-9_\-\/.]+)(?:\|[^\]]+)?\]\]|\/notes\/([a-zA-Z0-9_\-\/.]+)\b/gi
    );

    const linkedTargets = new Set<string>();

    for (const match of matches) {
      const rawTarget = match[1] || match[2];
      if (!rawTarget) continue;

      const targetId = rawTarget.toLowerCase().replace(/\.md$/, '');
      if (targetId === noteIdNormalized) continue;

      linkedTargets.add(targetId);
    }

    const backlinkItem: BacklinkItem = {
      id: note.id,
      title: note.data.title,
      stage: note.data.stage,
      url: `/notes/${note.id}`,
      excerpt: note.data.description,
    };

    for (const targetId of linkedTargets) {
      const currentList = index.get(targetId) || [];
      currentList.push(backlinkItem);
      index.set(targetId, currentList);
    }
  }

  return index;
}

/**
 * Backward-compatible helper that retrieves backlinks using the pre-computed index
 * or falls back to escaped regex on demand.
 */
export function getBacklinksForNote(
  targetId: string,
  allNotes: CollectionEntry<'notes'>[],
  precomputedIndex?: Map<string, BacklinkItem[]>
): BacklinkItem[] {
  const normalizedTarget = targetId.toLowerCase().replace(/\.md$/, '');

  if (precomputedIndex) {
    return precomputedIndex.get(normalizedTarget) || [];
  }

  // Fallback single-target scan with strict regex character escaping
  const escapedTarget = normalizedTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wikilinkPattern = new RegExp(`\\[\\[${escapedTarget}(?:\\|[^\\]]+)?\\]\\]`, 'i');
  const hrefPattern = new RegExp(`/notes/${escapedTarget}\\b`, 'i');

  const backlinks: BacklinkItem[] = [];

  for (const note of allNotes) {
    if (note.id === targetId) continue;

    const body = note.body || '';
    if (wikilinkPattern.test(body) || hrefPattern.test(body)) {
      backlinks.push({
        id: note.id,
        title: note.data.title,
        stage: note.data.stage,
        url: `/notes/${note.id}`,
        excerpt: note.data.description,
      });
    }
  }

  return backlinks;
}
