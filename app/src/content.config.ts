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
    // CEFR 難度分級（顯示用；對照表見 reference/cefr-toeic-levels.md）
    level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
    // 未列出：首頁列表、搜尋索引、計數都跳過，但頁面照樣 build、網址仍可直接開。
    // 給含個人資訊、不想被隨手瀏覽到的 lesson 用。⚠️ unlisted ≠ private——真的不想
    // 公開的內容要另外 gitignore（見 .gitignore 的 private lesson 區塊）。
    unlisted: z.boolean().optional(),
    // 雙語兩欄閱讀（opt-in pilot）：true 時 rehype inject-bilingual 才把成對的
    // 英/中 blockquote 併成兩欄 .bilingual；未設時維持上下堆疊（現行版面）。
    two_lane: z.boolean().optional(),
    // 寬螢幕書卷版面（opt-in pilot）：'marginalia' 時 rehype inject-marginalia 才把
    // 每個 ## section 重構成 rail+well 書框、輔助教材搬進右側 margin rail；未設時維持
    // 單欄。CSS 只在該篇 inline 輸出，其餘頁面 byte 不變。
    wide_layout: z.enum(['marginalia']).optional(),
    url: z.string().url().optional(),
    word_count: z.number().optional(),
    reading_time_min: z.number().optional(),
    // 雙語卡片標題：title_zh = 中文主標（對應 H1），title_en = 英文副標一行（~80 字元）
    title_zh: z.string().optional(),
    title_en: z.string().optional(),
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
