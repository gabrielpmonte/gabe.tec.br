import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

export const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    canonicalUrl: z.url().optional(),
    readingTime: z.number().optional()
  })
});

export const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    stage: z.enum(['seed', 'growing', 'evergreen']).default('seed'),
    tags: z.array(z.string()).default([]),
    aliases: z.array(z.string()).optional()
  })
});

export const field_notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/field_notes' }),
  schema: z.object({
    title: z.string(),
    location: z.string(),
    coordinates: z.string(),
    date: z.coerce.date(),
    elevation: z.string().optional(),
    gear: z.object({
      camera: z.string(),
      lens: z.string(),
      simulation: z.string().optional()
    }),
    summary: z.string(),
    coverImage: z.string().optional(),
    tags: z.array(z.string()).default([])
  })
});

export const collections = {
  writing,
  notes,
  field_notes
};
