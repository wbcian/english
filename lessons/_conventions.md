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

## 修改本檔的人

- 改規範前先想清楚：對 `app/src/scripts/speech.ts` 的影響、對 7 份既有 lesson 是否要 retrofit
- 任何規範變動同步 update：本檔、`BRAIN.md`、`.claude/skills/english-tutor/SKILL.md`
