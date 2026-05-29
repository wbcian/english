# Cian's English Brain

> 給讀到此資料夾的 LLM：這是索引，不是資料本體。先看完此份再決定要展開哪些檔案。
> **不要** Read 整個 `vocab/` 目錄；只在使用者問特定字、需要更新、或要做整體統計時才開單檔。

## 學習者
- 名稱：Cian（暱稱 Benson / Mr. Wu）
- 教練：Coach Max（persona 定義在 `.claude/skills/english-tutor/SKILL.md`）
- 詳細 Profile → [PROFILE.md](PROFILE.md)

## 快照（隨更新同步）
- 已收錄單字：110
- 5★ 精熟：0　 3–4★ 學習中：12　 1–2★ 新／脆弱：98
- 最近活動日期：2026-05-29（🎧 第 2 篇 reading lesson：PostHog 3-article pack；📚 新增 4 字 TOEIC 商業向）
- 主目標：**TOEIC 750+ 證書**（詳見 [PROFILE.md](PROFILE.md#目標)）
- 最近 lesson：**[PostHog — Product for Engineers Pack](lessons/2026-05-29-posthog-product-for-engineers-pack.md)**（3-article pack: 主文 framing + hiring 11 min + sell-features 6 min；總 19 min；含 SuperDay 面試模型、`stack up against` 句型、引號嘲諷 vague language）
- 上一份 lesson：[Charles Cook — How I Actually Get Good Advice](lessons/2026-05-28-charles-cook-getting-good-advice.md)（首份 reading lesson + reading 格式分流上路）
- 上一份 lesson：**Cat Wu 訪談三部曲** — [Part 1](lessons/2026-05-26-cat-wu-part-1-shipping-speed.md) + [Part 2](lessons/2026-05-25-cat-wu-pm-skills-and-taste.md) + [Part 3](lessons/2026-05-26-cat-wu-part-3-cowork-workflow.md)
- 最近寫作：[2026-04-28 vocab-translation-drill](writing/2026-04-28-vocab-translation-drill.md)（6/6 完成，set up 與 pitch 滿分）
- 待加強清單：brought up（vs pitch to / set up）、go all out（vs go all in / pour into）、humorous twist（兩天就忘）、in a pinch（idiom 連結未建立）、faze ≠ phase 拼字

## 資料夾導覽
- [`vocab/_index.md`](vocab/_index.md) — 單字快表（80% 問題從這裡找答案）
- `vocab/<word>.md` — 單字深度檔（需要例句／encounter log 才開）
- `writing/` — 寫作練習與 Coach Max 修改
- `conversations/` — 對話練習摘要
- `lessons/` — podcast / 影片轉換的學習筆記
- `transcripts/` — podcast 逐字稿原文（`.txt`/`.srt`，可搜尋；`.cache/` 內 mp3 為 gitignored）
- `tools/` — 自動化腳本（`podcast2lesson.sh`：貼連結→下載→本地 Whisper 轉錄；setup 見 `tools/README.md`）
- [`ACTIVITY.md`](ACTIVITY.md) — 時間軸（最新在上）
- [`PROFILE.md`](PROFILE.md) — 目標 / 弱點 / 偏好

## 給 LLM 的維護規則

1. **新單字** → 建立 `vocab/<word>.md`、在 `vocab/_index.md` 加一列、`ACTIVITY.md` 頂端加一行
2. **舊單字再現** → 在該檔 `## Encounters` 補日期、更新 frontmatter 的 `last_reviewed` 與 `review_count`，視情況調 `proficiency`，並同步 `_index.md`
3. **寫作 / 對話** → 對應資料夾；檔名 `YYYY-MM-DD-<topic>.md`；`ACTIVITY.md` 加一行
4. **長文／字幕／文章** → 整理到 `lessons/YYYY-MM-DD-<topic>.md`，兩種來源並列：
   - **Podcast / 字幕** → 套既有 podcast lesson 結構（含 transcript 切片、Series Map）
   - **純文字 essay / newsletter**（無 audio）→ 套 reading lesson 結構（見 [`lessons/_conventions.md` §6](lessons/_conventions.md)），frontmatter 加 `format: article` + `url:` + `word_count` + `reading_time_min`
   - 只有當使用者明確說「轉成 magazine」、「雜誌風格」、「HTML 版」等才產 HTML
5. **Lesson speakable 規範** → 寫 lesson 時遵守 [`lessons/_conventions.md`](lessons/_conventions.md)：英文 blockquote 不混中文、vocab table 可朗讀欄表頭一律 lowercase `word`、同系列同日期補 `part:` frontmatter。**Reading lesson 只在 `## Close Reading` 與 `## Key Vocabulary` 兩段觸發朗讀**——其他段落英文用 italic／bold 段落，不用 blockquote。`app/`（Astro lessons browser）依這份規範判斷朗讀範圍
6. **發現新弱點 / 偏好** → 更新 `PROFILE.md`
7. **更新此份快照** → 完成上述任一動作後同步本檔的「快照」段
8. **永遠**：繁體中文翻譯；保留 Coach Max 風格（幽默、直白、像哥兒們）

## 單字檔 Schema 範例

```markdown
---
word: mockingly
phonetic: /ˈmɑːkɪŋli/
pos: adv
zh: 嘲弄地
proficiency: 2          # 1–5 ★
first_seen: 2026-04-15
last_reviewed: 2026-04-27
review_count: 3
tags: [emotion, manner-adverb]
source: "podcast: ELI5 lead-uranium"
---

## Examples
> "She looked at my burnt toast mockingly."
> 她嘲弄地看著我燒焦的吐司。

## Usage tip
Often paired with verbs like "laugh", "smile", "look".

## Synonyms
scornfully, derisively, tauntingly

## Encounters
- 2026-04-15 — first learned (podcast ELI5)
- 2026-04-22 — used in writing practice
- 2026-04-27 — reviewed by Coach Max
```

## 可搜尋性升級觸發點

- vocab 數 > 1000 → 把 `_index.md` 分成 `_index_active.md`（90 天內複習）+ `_index_archive.md`
- vocab 數 > 2000 → 評估按字首分子目錄（`vocab/m/mockingly.md`）或匯出 `vocab.json` 給程式查

## Git commit 慣例

格式：`<scope>: <短句>`（短句 ≤ 60 字，現在式祈使語氣）

| scope | 用途 | 範例 |
|---|---|---|
| `vocab` | 新增 / 更新單字 | `vocab: add mockingly` ／ `vocab: review mockingly (★1→2)` |
| `writing` | 新增寫作練習 | `writing: 2026-04-27 childhood-room` |
| `conv` | 新增對話 log | `conv: 2026-04-27 ordering-coffee` |
| `lesson` | 新增 podcast / 影片整理 | `lesson: ELI5 lead-uranium` |
| `profile` | 更新 Profile | `profile: add weakness — past tense` |
| `brain` | 改 BRAIN / CLAUDE / 索引／結構 | `brain: split _index by ★` |
| `skill` | 改 english-tutor skill | `skill: switch HTML magazine to opt-in` |
| `app` | `app/` 內 Astro lessons browser | `app: add speech.ts chunking` |
| `chore` | 雜項（gitignore、整理檔案等） | `chore: ignore .DS_Store` |

LLM（含 Coach Max）寫入後 **直接幫 Cian 跑 `git commit`**（依本檔的 scope 慣例）。
若一次回應同時動到多個 scope，**分多筆 commit**，一筆一個 scope。
不要 push、不要 amend、不要 force——只是把已經寫好的內容 commit 起來而已。
