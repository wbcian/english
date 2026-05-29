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
    // 學習意圖主軸（語流判準）：reading=純閱讀/解題 · dialogue=多人對話 · talk=單人連續輸出
    track: z.enum(['reading', 'dialogue', 'talk']).optional(),
    // 原始素材是否有真人聲音（純元資料，不影響 app 朗讀——朗讀由 DOM 決定）
    audio: z.boolean().optional(),
    url: z.string().url().optional(),
    word_count: z.number().optional(),
    reading_time_min: z.number().optional(),
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
