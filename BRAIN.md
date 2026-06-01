# Cian's English Brain

> 給讀到此資料夾的 LLM：這是索引，不是資料本體。先看完此份再決定要展開哪些檔案。
> **不要** Read 整個 `vocab/` 目錄；只在使用者問特定字、需要更新、或要做整體統計時才開單檔。

## 學習者
- 名稱：Cian（暱稱 Benson / Mr. Wu）
- 教練：Coach Max（persona 定義在 `.claude/skills/english-tutor/SKILL.md`）
- 詳細 Profile → [PROFILE.md](PROFILE.md)

## 快照（隨更新同步）
- 已收錄單字：108
- 5★ 精熟：0　 3–4★ 學習中：8　 1–2★ 新／脆弱：100
- 最近活動日期：2026-06-01（📚 新增 fusion · sarcastic · smart aleck · assemble · on point · test the waters · quirk · prosthetic · track down；複習 cram）
- 主目標：**TOEIC 750+ 證書**（詳見 [PROFILE.md](PROFILE.md#目標)）
- **Lesson 格式（2026-05-29 換軸）**：`track`(reading/dialogue/talk) + `audio` 取代舊 `format`；Source→標題下 subtitle、正文雙語滾動框、Key Vocab 緊接正文後 — 規範見 [`lessons/_conventions.md`](lessons/_conventions.md)
- 最近 lesson：**日本住宿 Hotel Check-in 對話三部曲**（dialogue · 旅遊實戰）：[Part 1 報到・證件・房型](lessons/2026-05-31-japan-hotel-checkin-part-1-arrival.md) + [Part 2 付款・宿泊税・設施](lessons/2026-05-31-japan-hotel-checkin-part-2-amenities.md) + [Part 3 客訴・退房・宅配](lessons/2026-05-31-japan-hotel-checkin-part-3-checkout.md)（Coach Max 原創情境；Cultural Notes 含護照影印法規／宿泊税／takkyubin；Series Map 用一般清單避免中文被誤朗讀）
- 同日 lesson：**[Hotel Check-In：國外旅館櫃檯入住實戰](lessons/2026-05-31-hotel-check-in.md)**（codex 平行產出，通用國際飯店單篇 dialogue；含 Role-Play Drill ＋ Connected Speech；`incidentals` / `temporary hold`）
- 上一份 lesson：**[PostHog — Product for Engineers Pack](lessons/2026-05-29-posthog-product-for-engineers-pack.md)**（3-article pack；總 19 min；含 SuperDay 面試模型、`stack up against` 句型）
- 上一份 lesson：[Charles Cook — How I Actually Get Good Advice](lessons/2026-05-28-charles-cook-getting-good-advice.md)（首份 reading lesson + reading 格式分流上路）
- 最近寫作：[2026-04-28 vocab-translation-drill](writing/2026-04-28-vocab-translation-drill.md)（6/6 完成，set up 與 pitch 滿分）
- 待加強清單：brought up（vs pitch to / set up）、go all out（vs go all in / pour into）、humorous twist（兩天就忘）、in a pinch（idiom 連結未建立）

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
4. **長文／字幕／文章／podcast** → 整理到 `lessons/YYYY-MM-DD-<topic>.md`，依**語流結構**標 `track`（規範與模組 MUST/MAY 表見 [`lessons/_conventions.md`](lessons/_conventions.md)，那是唯一事實來源）：
   - 多人輪流對話（訪談、影劇/電影對白）→ `track: dialogue`
   - 單人連續輸出（個人 podcast、旁白、演講、歌曲）→ `track: talk`
   - 以閱讀／解題為意圖的文字（essay、newsletter、雜誌短文，含朗讀型如 grasse）→ `track: reading`
   - 另標 `audio: true/false`（原始素材有無真人聲音；**純元資料、不影響朗讀**）
   - 版面：Source 降為標題下一行 `<p class="lesson-subtitle">` 小字、正文雙語包 `<div class="lesson-body-scroll">` 可滾動視窗、Key Vocab 緊接正文後（細節見規範）
   - 只有當使用者明確說「轉成 magazine」、「雜誌風格」、「HTML 版」等才產 HTML
5. **Lesson speakable 規範** → 寫 lesson 時遵守 [`lessons/_conventions.md`](lessons/_conventions.md)：英文 blockquote 不混中文、vocab 可朗讀欄表頭一律 lowercase `word`、講者標籤放 blockquote 開頭粗體、`<div class="lesson-body-scroll">`／`<details>` 內 blockquote 前後留 markdown 空行、同系列同日期補 `part:`。`app/` 依 markdown DOM 結構（blockquote + `word` 欄）判斷朗讀，**與 frontmatter 無關**
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
| `brain` | 改 BRAIN / CLAUDE / 索引／結構 / `lessons/_conventions.md` | `brain: split _index by ★` |
| `skill` | 改 english-tutor skill | `skill: switch HTML magazine to opt-in` |
| `app` | `app/` 內 Astro lessons browser | `app: add speech.ts chunking` |
| `chore` | 雜項（gitignore、整理檔案等） | `chore: ignore .DS_Store` |

LLM（含 Coach Max）寫入後 **直接幫 Cian 跑 `git commit`**（依本檔的 scope 慣例）。
若一次回應同時動到多個 scope，**分多筆 commit**，一筆一個 scope。
commit 後**直接 push**；不要 amend、不要 force。
