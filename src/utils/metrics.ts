import { execFileSync } from "node:child_process";
import type { NoteEntry, WritingPost } from "./content";
import { formatISODate } from "./date";
import { SITE } from "../site.config";

export type ContentEntryWithMeta = WritingPost | NoteEntry;

const gitDateCache = new Map<string, Date | null>();

/**
 * Resolves the last commit date for a content file using Git history.
 * Cached per build to avoid repeated subprocess calls.
 */
export function getGitLastModified(filePath?: string): Date | null {
  if (!filePath) return null;
  if (gitDateCache.has(filePath)) {
    return gitDateCache.get(filePath) ?? null;
  }

  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", filePath],
      { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();

    if (!out) {
      gitDateCache.set(filePath, null);
      return null;
    }

    const parsed = new Date(out);
    const result = Number.isNaN(parsed.getTime()) ? null : parsed;
    gitDateCache.set(filePath, result);
    return result;
  } catch {
    gitDateCache.set(filePath, null);
    return null;
  }
}

/**
 * Returns the effective revision date (frontmatter `updatedDate` or Git last commit),
 * only when it is strictly newer in calendar date than `publishDate`.
 */
export function getEffectiveUpdatedDate(
  entry: ContentEntryWithMeta,
): Date | null {
  const candidate =
    entry.data.updatedDate ?? getGitLastModified(entry.filePath);
  if (!candidate) return null;

  const pubDay = formatISODate(entry.data.publishDate);
  const updDay = formatISODate(candidate);
  return updDay > pubDay ? candidate : null;
}

export interface ContentMetrics {
  wordCount: number;
  readingMinutes: number;
}

/**
 * Computes clean prose word count (ignoring inline style/script blocks and HTML tags)
 * and estimated reading time in minutes.
 */
export function getContentMetrics(
  entry: ContentEntryWithMeta,
): ContentMetrics {
  const rawBody = entry.body || "";
  const cleaned = rawBody
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  const wordCount = cleaned.trim().split(/\s+/).filter(Boolean).length;
  const explicitReadingTime =
    "readingTime" in entry.data ? entry.data.readingTime : undefined;
  const readingMinutes =
    explicitReadingTime ?? Math.max(1, Math.ceil(wordCount / 200));

  return { wordCount, readingMinutes };
}

/**
 * Builds the GitHub commit history URL for a writing post or note.
 */
export function getHistoryUrl(entry: ContentEntryWithMeta): string | null {
  if (!entry.filePath) return null;
  const normalized = entry.filePath.replace(/^\/+/, "");
  return `${SITE.github.url}/gabe.tec.br/commits/main/${normalized}`;
}

export interface SeriesContext {
  name: string;
  part: number;
  total?: number;
  items: WritingPost[];
  prev: WritingPost | null;
  next: WritingPost | null;
}

/**
 * Resolves all published posts belonging to the same series as `post`,
 * ordered by `series.part`, along with previous/next navigation links.
 */
export function getSeriesContext(
  post: WritingPost,
  allPosts: WritingPost[],
): SeriesContext | null {
  const series = post.data.series;
  if (!series) return null;

  const items = allPosts
    .filter((p) => p.data.series?.name === series.name)
    .sort((a, b) => (a.data.series?.part ?? 0) - (b.data.series?.part ?? 0));

  const currentIdx = items.findIndex((p) => p.id === post.id);
  const prev = currentIdx > 0 ? items[currentIdx - 1] : null;
  const next =
    currentIdx >= 0 && currentIdx < items.length - 1
      ? items[currentIdx + 1]
      : null;

  return {
    name: series.name,
    part: series.part,
    total: series.total,
    items,
    prev,
    next,
  };
}
