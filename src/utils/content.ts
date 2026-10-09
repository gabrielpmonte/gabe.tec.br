import { getCollection, type CollectionEntry } from "astro:content";

export type WritingPost = CollectionEntry<"writing">;
export type NoteEntry = CollectionEntry<"notes">;
export type FieldNoteEntry = CollectionEntry<"field_notes">;

/**
 * Returns all published technical articles sorted chronologically (newest first).
 * Excludes drafts.
 */
export async function getPublishedWritings(): Promise<WritingPost[]> {
  const posts = await getCollection("writing");
  return posts
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
}

/**
 * Returns all atomic notes from the digital garden sorted chronologically.
 */
export async function getSortedNotes(): Promise<NoteEntry[]> {
  const notes = await getCollection("notes");
  return notes.sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );
}

/**
 * Returns all documentary field notes sorted chronologically.
 */
export async function getSortedFieldNotes(): Promise<FieldNoteEntry[]> {
  const fieldNotes = await getCollection("field_notes");
  return fieldNotes.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

/**
 * Extracts unique sorted tags from any content collection array.
 */
export function extractUniqueTags<T extends { data: { tags: string[] } }>(
  entries: T[],
): string[] {
  return Array.from(new Set(entries.flatMap((entry) => entry.data.tags))).sort();
}

/**
 * Computes frequencies and formatted items for tags across a collection in a single O(N) pass.
 */
export function getTagCounts<T extends { data: { tags: string[] } }>(
  entries: T[],
): Array<{ id: string; label: string; count: number }> {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    for (const tag of entry.data.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([id, count]) => ({ id, label: `#${id}`, count }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export interface NoteStageCounts {
  total: number;
  evergreen: number;
  growing: number;
  seed: number;
}

/**
 * Computes counts for digital garden maturation stages.
 */
export function getNoteStageCounts(notes: NoteEntry[]): NoteStageCounts {
  return {
    total: notes.length,
    evergreen: notes.filter((n) => n.data.stage === "evergreen").length,
    growing: notes.filter((n) => n.data.stage === "growing").length,
    seed: notes.filter((n) => n.data.stage === "seed").length,
  };
}
