# Lesson Authoring Conventions

> 這份規範是 lesson 格式的**唯一事實來源（single source of truth）**：track 分類、版面順序、模組 MUST/MAY、speakable 規則、frontmatter 欄位定義，**只**寫在這裡。
> `BRAIN.md`（第 4 條）與 `.claude/skills/english-tutor/SKILL.md` 只放「分流決策樹 + 指向本檔的連結」，**不複製本檔的表**——避免三檔 drift。
> 它同時給人讀、給 LLM（含 Coach Max）讀，也讓 `app/`（Astro browser）能可靠判斷哪些段落要朗讀。

---

## 0. 三種 track（學習意圖主軸）

每份 lesson 的 frontmatter 標 `track`，依**語流結構**判斷（不是依題材）：

| track | 是什麼 | 典型來源 |
|---|---|---|
| `reading` | 以**閱讀 / 解題**為學習意圖的文字（不論有無朗讀音） | essay、newsletter、雜誌短文（grasse） |
| `dialogue` | **多人輪流**的對話 | 訪談（含商業 podcast）、影劇/電影對白 |
| `talk` | **單人連續**輸出 | 個人獨白 podcast、旁白、演講、歌曲 |

**語流判準 tie-breakers**（會卡中間時這樣判）：
- 訪談（Lenny 問、Cat 答這種一來一往）→ multi-person → **`dialogue`**。
- 歌曲 / 旁白朗讀 / 一個人講到底 / 演講 → single-voice → **`talk`**。
- 朗讀型雜誌文章（grasse）：雖然有朗讀音，但學習意圖是「讀懂 + 解題」→ **`reading`**（並標 `audio: true`）。
- 純文字的訪談逐字稿（newsletter 形式、沒 audio）→ 以「讀」為動作 → **`reading`**，對話用講者標籤呈現即可。

### Frontmatter

```yaml
---
date: YYYY-MM-DD
topic: <short-slug>
source: <一行短描述>          # subtitle 用；platform · 出處/作者 · 長度
type: lesson
track: reading | dialogue | talk
audio: true | false           # 原始素材有無真人聲音；純元資料，不影響 app 朗讀
level: A1|A2|B1|B2|C1|C2      # optional，CEFR 難度（單一級）；評法見 ../reference/cefr-leveling-process.md
series: <series-slug>         # optional，多 part 系列才填
part: <N>                     # optional，series 有填時才填
url: https://...              # optional（reading 建議填原文 URL）
word_count: 1350              # optional（reading 用）
reading_time_min: 6           # optional（reading 用）
---
```

> ⚠️ `audio` 是**純元資料**：app 的朗讀由 markdown DOM 結構決定（見 §5），**與 `audio` / `track` 任何 frontmatter 無關**。`audio: false` **不會**關掉朗讀。

---

## 1. 版面順序（共用骨架）

學習主體優先；Source 降為一行小字 subtitle；Key Vocab 緊接正文之後。

1. `# Title`
2. **Source subtitle**（H1 正下方一行小字，見 §3）
3. `## Topic & Summary`（中英雙語摘要，建語境）
4. **正文 / 學習主體**（雙語 EN/zhTW、包在可滾動視窗，見 §4）
   - `reading`：`## Close Reading`（精選原文；短文/已授權可全文）
   - `dialogue` / `talk`：`## 正文`（逐字稿／對白／歌詞，全保留可見）
5. `## Key Vocabulary`（**緊接正文之後**；`word` 欄可朗讀）
6. **教學模組 + drills**（依 track，見 §2）
7. Takeaways（標題自由：Study Tips / Steal These N Moves…）

> `reading` 的 `## Article Map`（全文骨架略讀表）放在 Topic & Summary 與 Close Reading 之間（orientation 用）。

---

## 2. 模組 MUST / MAY（依 track）

MUST = 該 track 必有；MAY = 視內容加。**原則：每 track 至少含一個對準 Cian 弱點的句構 drill**（中翻英直譯 → Sentence Anatomy；TOEIC Part 7 → Reading Comprehension）。

| 模組 | reading | dialogue | talk |
|---|:--:|:--:|:--:|
| Topic & Summary | MUST | MUST | MUST |
| Article Map（全文骨架表） | MUST | — | MAY |
| 正文（Close Reading / 逐字稿，可滾動） | MUST | MUST | MUST |
| Key Vocabulary（後置、`word` 欄） | MUST | MUST | MUST |
| Reading Comprehension（TOEIC Part 7） | MUST | — | MAY |
| Sentence Anatomy（長句拆解） | MUST | MAY（商業訪談長句） | MAY（商業長句） |
| Connected Speech / Pronunciation | — | MAY | MAY（歌/發音） |
| Useful Phrases / 套句 | MAY | MUST | MAY |
| Cultural Notes | MAY | MAY | MAY |
| Templates / Steal Moves / Related | MAY | — | — |
| Takeaways | MUST | MUST | MUST |

- `audio: true` 的素材，正文一律**保留全文可朗讀**，不因 track 規則精簡（這就是 grasse 該保留全文的原因）。
- `reading` 版權長文：正文只精選 3-5 段（Close Reading）；短文 / 已授權 / 自有逐字稿可全文。

---

## 3. Source → 一行小字 subtitle

把舊的 `## Source` 區塊拿掉。改在 `# Title` 正下方寫一行 `<p class="lesson-subtitle">`，app 會渲染成小字斜體。

```markdown
# Cat Wu 訪談 — Part 1：Anthropic 怎麼出貨那麼快

<p class="lesson-subtitle">🎧 Lenny's Podcast · Cat Wu (Anthropic) · 訪談切片 ~30 min</p>

## Topic & Summary
...
```

- 內容＝平台 · 出處/作者 · 長度（reading 可加 `· 1350 words · 6 min`）。
- 詳細 provenance（逐字稿行號、跳過了哪些段）放 frontmatter `source` 字串即可，**不**進版面。
- subtitle 是一般 HTML 段落，**不會被朗讀**（非 blockquote）。

---

## 4. 正文：雙語可滾動視窗

正文（逐字稿 / Close Reading）可能很長，包進固定高度可滾動容器，避免畫面爆長；跟讀時可邊捲邊念。

```markdown
## 正文（跟讀用）

<div class="lesson-body-scroll">

> **Cat (75)**
> I feel very lucky to work with Boris. He's been an amazing thought partner.

> Cat (75)：我覺得跟 Boris 共事很幸運。他是超棒的思考夥伴。

> **Cat (101)**
> We're like 80% mind meld.

> Cat (101)：我們大概有 80% 的心智同步。

</div>
```

**硬規則**（否則 CommonMark 會把整塊當 raw HTML、`>` 字面輸出、無法朗讀）：
- `<div class="lesson-body-scroll">` 開標籤後、每個 blockquote 前後、`</div>` 閉標籤前，**都要留一個 markdown 空行**。
- 英中**分開兩個 blockquote**（見 §5.1）；英文 blockquote 才會朗讀，中文不會。
- dialogue/talk 的講者標籤用開頭 `**...**`（見 §5.2）。

---

## 5. Speakable 規則（app 朗讀靠這個，務必精確）

App 用 Web Speech / 預生成 MP3 朗讀英文。判斷**完全靠 markdown DOM 結構**（全域 `blockquote > p` + `word` 表頭欄），不看 frontmatter。把語言訊號顯式寫進結構，不要靠 runtime 猜。

### 5.1 Blockquote = 一種語言

**英文 blockquote** 整段只放英文（含 `**bold**`、英文錨點 `[link](...)`）。
**中文 blockquote** 整段只放中文。
**禁止**在同一個 blockquote 內混排英中。兩個 blockquote 之間要有 markdown 空行（純 `\n\n`），避免 parser 合併。

```markdown
<!-- ✅ 對 -->
> Tom Holland recalls his legendary *Lip Sync Battle* episode where he secretly went all out.

> Tom Holland 回憶他那一集傳奇的 Lip Sync Battle，私底下卯足全力。

<!-- ❌ 錯：同一個 blockquote 混英中 -->
> Tom Holland recalls his legendary Lip Sync Battle episode.
> Tom Holland 回憶他那一集傳奇的 Lip Sync Battle。
```

### 5.2 講者標籤放英文 blockquote 開頭

App 自動剝除開頭的 `**...**` 粗體標籤再朗讀。

```markdown
> **Ethan (04:18)**
> Wow! Did you notice how many times Sabrina used the word "like"?
```

朗讀時跳過 "Ethan 04:18"，直接念 "Wow! Did you notice..."。

### 5.3 Vocab table：可朗讀欄用 `word` 表頭

任何 `<th>` 文字 lowercase 等於 `word` 的欄，整欄 cell 都可朗讀（不限第一欄）。

```markdown
| word | pos | zh | note |
|---|---|---|---|
| go all out | v.phr. | 卯足全力 | go all out for/on sth |
```

**禁止**用 `字`、`字 / 片語`、`Word`（大寫）、`原句` 等替代。要朗讀的英文欄一律 lowercase `word`。
純發音示範表（含音標 `[iss-suh-bouh]`）**不要**用 `word` 表頭，避免被誤朗讀。

### 5.4 同系列同日期必須有 `part`

App 依日期 desc 排序，同日期內以 `part` asc 為 secondary sort。

### 5.5 Embedded link

英文 blockquote 或 `word` cell 內可放 `[anchor](path)`。App 點 link 自然導向，點 cell 其他空白才朗讀。

### 5.6 `<details>` 折疊區（Reading Comprehension 答案用）

`<details>` 開標籤後、內容前後、`</details>` 前**都要留 markdown 空行**，否則內容會被當 raw HTML 字面輸出。
答案用一般段落（**不要** blockquote），自然不被朗讀。

```markdown
<details><summary>答案 + 解析</summary>

**B**。原文直接說了……

</details>
```

### 邊界速查

| 狀況 | 處理 |
|---|---|
| Coach Max 個性化評論（混中英，"💡 Coach Max 提醒："） | 一般段落，不用 blockquote；不朗讀 |
| Inline 英文詞夾在中文段裡 | 一般段落，不朗讀 |
| 純發音範例表（含音標） | 用非 `word` 表頭（`原句`/`唸出來`/`規則`）；不朗讀 |
| 講者連續對話 | 每位一個 blockquote，講者標籤放開頭粗體 |
| Source subtitle | `<p class="lesson-subtitle">`；不朗讀 |

### App 行為摘要

- 桌機 + 手機點英文段落／單字 → 朗讀；中文 blockquote 不掛 handler、無 cursor pointer。
- 朗讀時段落底色變淺黃；同段再點停止、按 Esc 停止。
- 長段（> ~150 字）Web Speech path 自動切句；預生成 MP3 整段一次。
- 正文 `.lesson-body-scroll` 內的 blockquote 朗讀照常（全域 selector 不受容器影響）。

---

## 6. 各 track 範例骨架

**reading**（audio 可有可無）
```
# Title
<p class="lesson-subtitle">…</p>
## Topic & Summary（雙語）
## Article Map（全文骨架表）
## Close Reading（<div class="lesson-body-scroll"> 精選原文，可朗讀）
## Key Vocabulary（word 欄）
## Reading Comprehension（TOEIC Part 7，details 折疊答案）
## Sentence Anatomy（長句拆解）
## Steal These N Moves（+ Related，MAY）
```

**dialogue**（多人對話；audio 通常 true）
```
# Title
<p class="lesson-subtitle">…</p>
## Topic & Summary（雙語）
（系列才有 ## Series Map）
## 正文（<div class="lesson-body-scroll"> 逐字稿/對白，雙語，可朗讀）
## Key Vocabulary（word 欄）
## Useful Phrases & Patterns
（MAY：Connected Speech / Sentence Anatomy / Cultural Notes）
## Study Tips / Takeaways
```

**talk**（單人連續；audio 通常 true）
```
# Title
<p class="lesson-subtitle">…</p>
## Topic & Summary（雙語）
## 正文（<div class="lesson-body-scroll"> 逐字稿/歌詞，雙語，可朗讀）
## Key Vocabulary（word 欄）
（MAY：Connected Speech（歌/發音）/ Sentence Anatomy（商業長句）/ Useful Phrases / Reading Comprehension）
## Study Tips / Takeaways
```

---

## 修改本檔的人

- 改規範前先想清楚：對**三份鏡像朗讀邏輯**的影響、對既有 lesson 是否要 retrofit：
  1. `app/scripts/generate-audio.mjs`（build：產 MP3 + 逐字 `<hash>.words.json` 時間 sidecar）
  2. `app/src/rehype/inject-word-spans.mjs`（build：把可朗讀段落的每個詞包成 `<span class="w" data-wi>`，逐字 highlight 用）
  3. `app/src/scripts/speech.ts`（runtime：朗讀 + 逐字 highlight）
  - speakable 判定（`blockquote > p`、`word` 欄、開頭 `<strong>` 講者標籤剝除）、`normalizeForHash`、`tokenizeWords` 集中在 `app/src/lib/word-tokens.mjs`，前兩份 build 鏡像都 import 它。`speech.ts` 是瀏覽器 TS、無法 import 該 .mjs，所以 `normalizeForHash`/`getSpeakableText` 在它裡面是**手動受控重複**。
  - ⚠️ `inject-word-spans.mjs` 的 build-time hash 斷言只保證「**rehype 包 span 後 textContent / hash 不變**」（守住「包 span 把字弄壞」這個雷）。它**不會**幫你檢查「`speech.ts` 的 `normalizeForHash` 有沒有跟 lib 同步」——若改了 lib 的正規化卻忘了同步 `speech.ts`，build 仍會綠燈，但 runtime 全站 hash 對不上 → 靜默退機器人語音。**改 `word-tokens.mjs` 的 `normalizeForHash`/`getSpeakableText` 時，務必手動同步 `speech.ts`。**
  - 逐字 highlight 詳見 [`app/docs/specs/word-highlight/spec.md`](../app/docs/specs/word-highlight/spec.md)。目前只為有 sidecar 的 clip 開卡拉 OK，其餘 clip 自動退回整段 highlight。
- 本檔是唯一事實來源。改動後同步檢查 `BRAIN.md` 第 4 條與 `SKILL.md` 的**決策樹與連結**是否仍正確（這兩處不複製表，所以通常只需確認連結）。
