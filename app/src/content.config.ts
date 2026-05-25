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

export const collections = { lessons };
