# Lesson Authoring Conventions

> 這份規範同時給人讀、給 LLM（含 Coach Max）讀。它的存在是為了讓 `app/`（Astro browser）能可靠地判斷哪些段落要朗讀、哪些是中文翻譯不該念。

## Speakable 原則

App 用 Web Speech API 朗讀英文段落／單字。要讓判斷穩定，**把語言訊號顯式寫進 markdown 結構**，不要靠 runtime 猜中文比例。

### 1. Blockquote = 一種語言

**英文 blockquote** 整段只放英文（含 `**bold**`、英文錨點 `[link](...)`）。

**中文 blockquote** 整段只放中文（含 inline 英文片語 *italic*、雙語對照詞用半形括號）。

**禁止** 在同一個 blockquote 內混排英中段落。

```markdown
<!-- ✅ 對 -->
> Tom Holland recalls his legendary *Lip Sync Battle* episode where he secretly went all out.

> Tom Holland 回憶他那一集傳奇的 Lip Sync Battle，私底下卯足全力。

<!-- ❌ 錯：同一個 blockquote -->
> Tom Holland recalls his legendary Lip Sync Battle episode.
> Tom Holland 回憶他那一集傳奇的 Lip Sync Battle。

<!-- ❌ 錯：用空 `>` 串成同一個 blockquote -->
> Tom Holland recalls his legendary Lip Sync Battle episode.
>
> 中文 → Tom Holland 回憶他那一集傳奇的 Lip Sync Battle。
```

兩個 blockquote 之間要有 markdown 真空行（純 `\n\n`），避免 markdown parser 合併。

### 2. 講者標籤可放英文 blockquote 開頭

App 會自動剝除開頭的 `**...**` 粗體標籤再朗讀。

```markdown
<!-- ✅ 對 -->
> **Ethan (04:18)**
> Wow! Did you notice how many times Sabrina used the word "like"?
```

朗讀時會跳過 "Ethan 04:18"，直接念 "Wow! Did you notice..."。

### 3. Vocab table：可朗讀的單字／片語放在 `word` 欄

任何 `<th>` 文字 lowercase 等於 `word` 的欄位，**該欄整欄 cell 都可朗讀**（不限於第一欄）。

```markdown
<!-- ✅ 對 -->
| word | pos | zh | note |
|---|---|---|---|
| viral | adj. | 爆紅 | go viral |
| go all out | v.phr. | 卯足全力 | |

<!-- ✅ 對：word 不在第一欄也行 -->
| 場景元素 | word | 重點 |
|---|---|---|
| 點餐人員 | barista | 義大利文借字 |
```

**禁止** 用 `字`、`字 / 片語`、`句型 / 片語`、`Word`（大寫）、`原句` 等替代 `word`。要朗讀的英文欄一律 lowercase `word`。

不需要朗讀的英文（例如純發音示範表 `it's about → [iss-suh-bouh]`）就**不要**用 `word` 表頭，避免被 app 誤判朗讀帶有音標符號的字串。

### 4. 同系列同日期 lesson 必須有 `part`

App 依日期 desc 排序，同日期內以 `part` asc 為 secondary sort。

```yaml
---
date: 2026-05-23
topic: sabrina-espresso-part-2-discourse
series: sabrina-espresso
part: 2
type: lesson
---
```

### 5. Embedded link

英文 blockquote 或 `word` cell 內可以放 `[anchor](path)` markdown link。App 在 click handler 內會檢查 `e.target.closest('a')`：點到 link 自然導向，點到 cell 其他空白才朗讀。

```markdown
| word | pos | zh | note |
|---|---|---|---|
| [-shy](../vocab/shy-suffix.md) | suffix | 避開／怕…的 | war-shy, camera-shy |
```

## 邊界

| 狀況 | 處理 |
|---|---|
| Coach Max 個性化評論段落（"💡 Coach Max 提醒："）混中英 | 不用 blockquote 包，用一般段落寫；不會被朗讀 |
| Inline 英文詞夾在中文段裡 | 一般段落，無 blockquote；不朗讀 |
| 純發音範例表（`[thass-tha']` 含音標） | 用其他表頭（如 `原句`、`唸出來`、`規則`）；**不要**用 `word` |
| 講者連續對話 | 每位講者一個 blockquote，講者標籤放開頭粗體 |

## App 行為摘要（給 lesson 作者參考）

- 桌機 + 手機讀者點英文段落／單字 → Web Speech API 朗讀
- 中文 blockquote 不掛 handler、視覺上沒有 cursor pointer
- 朗讀時段落底色變淺黃；同段再點停止、按 Esc 停止
- 長段（> ~150 字）會自動切句朗讀，避免 Chrome silent truncate

## §6 Reading lesson（純文字文章型 lesson）

當 source 是純文字 essay / newsletter（無 audio／無 transcript），用這套結構，frontmatter 標 `format: article`。

### Frontmatter（reading lesson 必填欄位）

```yaml
---
date: YYYY-MM-DD
topic: <short-topic>
source: "<出處說明>"
type: lesson
format: article              # reading lesson 必填，讓 LLM / 規範引擎知道套這套
url: https://...             # 原文 URL（必填）
word_count: 1350             # 原文字數
reading_time_min: 6          # 預估閱讀分鐘
---
```

### Section 結構（順序固定）

1. `## Topic & Summary` — 中英雙語摘要（**不用 blockquote**，見下面朗讀規則）
2. `## Source` — 作者 / 日期 / 字數 / URL
3. `## Article Map` — 6-step 表格，全文骨架一眼看完（TOEIC Part 7 略讀訓練）
4. `## Close Reading` — 精選 3-5 段原文 + 「Why this paragraph」一行點評
5. `## Reading Comprehension` — 3-5 題 TOEIC 題型，答案用 `<details>` 折疊
6. `## Sentence Anatomy` — 拆 2-3 個漂亮長句的結構
7. `## Key Vocabulary` — 表格（含 `TOEIC` 欄打勾）
8. `## Templates & Artifacts` — 原文嵌入的範本（如 cold message）+ placeholder 替換練習
9. `## Steal These 3 Moves` — 取代 podcast 版的「Coach Max Takeaways」，導向產出
10. `## Related Articles` — 同主題延伸閱讀

### 朗讀規則（reading lesson 專屬）

**只有兩個地方可朗讀**：

| 段落 | 朗讀觸發 |
|---|---|
| `## Close Reading` | 英文 blockquote → app 自動 TTS（speech.ts 既有規則） |
| `## Key Vocabulary` | `word` 欄 cell → app 自動 TTS（speech.ts 既有規則） |

**其他段落英文一律不用 blockquote**——避免 `speech.ts` 誤判朗讀。具體規則：

- **Topic & Summary** 英文版：用 *italic* 段落或 `**bold**` 段落，**不要** blockquote
- **Sentence Anatomy** 的例句：用 `**bold**` 段落 + bold 標粗體強調點，**不要** blockquote
- **Reading Comprehension** 題目／選項：平常段落或 list，**不要** blockquote
- **Article Map** 表格：表頭不要用 `word`（避免被當朗讀欄）
- **Templates** 範本：用 ```` ``` ```` code block

### 與 podcast lesson 的差異速查

| 處理 | podcast lesson | reading lesson |
|---|---|---|
| Transcript 段 | 大量 blockquote 精選 + 時間戳 / 講者標籤 | 砍掉，改 `Close Reading` 精選 3-5 段 |
| Series Map | 多 part 系列導覽 | 砍掉（essay 單篇） |
| 全段可朗讀範圍 | 所有英文 blockquote + 所有 `word` 欄 | **僅 Close Reading blockquote + Vocab `word` 欄** |
| Coach Max Takeaways | 5 點混風格 + 收藏 | 改名 `Steal These 3 Moves`，3 點導向產出 |
| Reading Comprehension | — | 必有（TOEIC 暖身） |
| Sentence Anatomy | — | 必有（補「中翻英直譯」弱點） |

---

## 修改本檔的人

- 改規範前先想清楚：對 `app/src/scripts/speech.ts` 的影響、對既有 lesson 是否要 retrofit
- 任何規範變動同步 update：本檔、`BRAIN.md`、`.claude/skills/english-tutor/SKILL.md`
