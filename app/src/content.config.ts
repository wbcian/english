import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lessons = defineCollection({
  loader: glob({ pattern: '[!_]*.md', base: '../lessons' }),
  schema: z.object({
    date: z.date(),
    topic: z.string(),
    source: z.string(),
    type: z.literal('lesson'),
    series: z.string().optional(),
    part: z.number().optional(),
  }),
});

const vocab = defineCollection({
  loader: glob({ pattern: '[!_]*.md', base: '../vocab' }),
  schema: z.object({
    word: z.string(),
    phonetic: z.string().optional(),
    pos: z.string().optional(),
    zh: z.string(),
    proficiency: z.number().optional(),
    first_seen: z.coerce.date().optional(),
    last_reviewed: z.coerce.date().optional(),
    review_count: z.number().optional(),
    tags: z.array(z.string()).optional(),
    source: z.string().optional(),
  }),
});

export const collections = { lessons, vocab };
