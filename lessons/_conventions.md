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
title_zh: <中文主標>           # 建議填；對應內文 H1（可微調得更像卡片標題，去掉冗詞）；系列檔保留 Part 資訊
title_en: <英文副標一行>       # 建議填；從 Topic & Summary 的英文 blockquote 提煉，資訊量高，≤110 字元（卡片最多顯示兩行，超出截斷）
---
```

> `title_zh` / `title_en` 為 optional（schema 允許省略以免未來新檔忘了加就 build 爆）；但**強烈建議填寫**。顯示邏輯：Lesson 卡片以 `title_zh`（若有）取代 slug 當主標；`title_zh` 與 `title_en` 同時存在時，卡片 h2 下方另起一行英文小字副標。搜尋引擎也會對這兩欄加較高權重。

> ⚠️ `audio` 是**純元資料**：app 的朗讀由 markdown DOM 結構決定（見 §5），**與 `audio` / `track` 任何 frontmatter 無關**。`audio: false` **不會**關掉朗讀。

---

## 1. 版面順序（共用骨架）

學習主體優先；Source 降為一行小字 subtitle；Key Vocab 緊接正文之後。

1. `# Title`
2. **Source subtitle**（H1 正下方一行小字，見 §3）
3. `## Topic & Summary`（中英雙語摘要，建語境）
4. **正文 / 學習主體**（雙語 EN/zhTW，blockquote 順流，見 §4）
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
| 正文（Close Reading / 逐字稿，順流） | MUST | MUST | MUST |
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

## 4. 正文：雙語 blockquote 順流

正文（逐字稿 / Close Reading）直接用一連串雙語 blockquote 呈現，順著頁面捲動（**P6 起移除固定高度滾動框**——避免滾動中滾動、且卡拉 OK 已讀蔓延的亮字不會被切到框外）。

```markdown
## 正文（跟讀用）

> **Cat (75)**
> I feel very lucky to work with Boris. He's been an amazing thought partner.

> Cat (75)：我覺得跟 Boris 共事很幸運。他是超棒的思考夥伴。

> **Cat (101)**
> We're like 80% mind meld.

> Cat (101)：我們大概有 80% 的心智同步。
```

**硬規則**（否則 CommonMark 會把整塊當 raw HTML、`>` 字面輸出、無法朗讀）：
- 英中**分開兩個 blockquote**（見 §5.1）；英文 blockquote 才會朗讀，中文不會。**每兩個 blockquote 之間留一個 markdown 空行**（避免 parser 合併）。
- dialogue/talk 的講者標籤用開頭 `**...**`（見 §5.2）。

---

## 5. Speakable 規則（app 朗讀靠這個，務必精確）

App 用 Web Speech / 預生成 MP3 朗讀英文。判斷**完全靠 markdown DOM 結構**（全域 `blockquote > p` + `word` 表頭欄），不看 frontmatter。把語言訊號顯式寫進結構，不要靠 runtime 猜。

### 5.1 Blockquote = 一種語言

**英文 blockquote** 整段只放英文（含 `**bold**`、英文錨點 `[link](...)`）。
**中文 blockquote** 整段只放中文。
**禁止**在同一個 blockquote 內混排英中。兩個 blockquote 之間要有 markdown 空行（純 `\n\n`），避免 parser 合併。

> ⚙️ **P6 字型分流的副作用**：app 用「speakable 判準」（`length ≥ 4` 且 `cjkRatio < 0.10`）在 build 時對英文 blockquote 蓋 `lang="en"`，英文才會套 serif 主聲部、中文套較淡 sans 副聲部。所以**極短的純英文 blockquote**（如 `> Go!`、`> OK.`）會落在判準外、被當中譯渲染成淡 sans。一般逐字稿都是完整句子不會踩到；若真要單獨一行短英文，補字成完整句即可。

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

**依講者切換 TTS 聲音（P5，build-only）**：產 MP3 時，`generate-audio.mjs` 會解析開頭粗體標籤取出講者，查 [`app/src/data/speaker-voices.json`](../app/src/data/speaker-voices.json) 指派的聲音來合成（預設 `en-US-AriaNeural` 旁白）。

- **完全是 build 端的事**：音檔 hash 仍只吃文字、不含講者，所以 `speech.ts`／runtime／manifest 一律不變；換的只是 `audio/<hash>.mp3` 的聲音 bytes。
- **解析規則**：去掉結尾 `(MM:SS)`／`(數字)`／`(line N)` 標記；複合 `Scene X — Name (…)` 取人名段；`Guest (Cian)` 的 `(Cian)` 保留（與 `Guest` 是**不同人**）。比對的是 `speaker-voices.json` 的**已知卡司**——非講者粗體（句型 pull-quote、`Part 1`、中文小標、clip/lyric/無名 Scene）一律落到旁白聲，毋需 deny-list。fixture：`app/scripts/test-speaker-parser.mjs`（`npm run test:speaker`）。
- **新增/改名講者**：編 `speaker-voices.json`（slug 一律 lowercase；`front desk` 含空格照寫）。改完要 **force-delete 受影響音檔再重生**——`synthesizeToFile` 會跳過已存在的非空 mp3，所以用 `npm run audio:revoice`（刪掉所有非預設聲音 clip 的 mp3+sidecar 再重生）；要卡拉 OK 的篇另加 `-- --words=<檔名片段>` 連同重生 `.words.json`（onset 綁特定聲音，換聲音必須一起重生，否則逐字 timing 靜默對不上）。可用聲音請先 `getVoices()` 確認服務中，且**避開 Multilingual 四聲**（Ava/Andrew/Emma/Brian——變速下 WordBoundary 失準、破壞卡拉 OK）。
- **per-lesson 覆寫＋語氣（prosody）**：除了全域 `speaker-voices.json`，lesson frontmatter 也能放 `speaker_voices:` 局部覆寫（scope 限該篇、不污染全域卡司；`test-speaker-parser.mjs` 有測 override）。每個講者值可寫**字串**（純聲音）或**物件** `{ voice, rate?, pitch?, volume? }`——`rate`/`pitch`/`volume` 會烤進 SSML `<prosody>`（如 `rate: "+10%"` 連珠炮、`pitch: "+4%"` 拉高張力），同樣 **build-only、hash 仍 text-only、runtime/karaoke 零改動**（timing 從加了 prosody 的同一個 mp3 重抓）。⚠️ 免費 Edge 端點**只支援 prosody**（語速/音高/音量）；真情緒 style（cheerful/angry…）要付費 Azure（評估見 [`app/docs/roadmap.md`](../app/docs/roadmap.md)）。改 prosody 後一樣要重生——`--revoice` 已會重生「非預設聲音**或**帶 prosody」的 clip。範例：`lessons/2026-06-23-the-devil-wears-prada-first-day.md`（Emily＝Sonia＋prosody、Andy＝Jenny）。
- ⚠️ **已知限制（接受）**：hash 不含講者 → 兩個講者講出**逐字相同**的話會撞同一個 mp3、只能一個聲音（先到者勝）。**prosody 同理**：同文字不同 rate/pitch 也撞同一檔，且 `voice collision` 警告只比對 voice 軸、不含 prosody。目前語料 0 例；真撞到時 `generate-audio.mjs` 會印 `voice collision` 警告，但不會 fail build。要結構上保證不撞，需把 voice（／prosody）折進 key（runtime 也要改，另案）。

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
- 正文 blockquote 順流朗讀照常（全域 `blockquote > p` selector 不受版面影響）。

---

## 6. 各 track 範例骨架

**reading**（audio 可有可無）
```
# Title
<p class="lesson-subtitle">…</p>
## Topic & Summary（雙語）
## Article Map（全文骨架表）
## Close Reading（精選原文，可朗讀）
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
## 正文（逐字稿/對白，雙語，可朗讀）
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
## 正文（逐字稿/歌詞，雙語，可朗讀）
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
  - ⚠️ build hash 對齊靠**兩道**斷言，缺一不可：
    1. `inject-word-spans.mjs` 的 build-time hash 斷言：只保證「rehype 包 span 後 textContent / hash 不變」，且只巡 `blockquote > p`（不含 `word` 表格欄 / vocab 詞頭）。
    2. `app/scripts/check-audio-hash-sync.mjs`（`prebuild` 會跑，drift 直接 fail build）：A 段把一批含 `--`／硬換行／`word` 欄的 fixture 同時跑「build 端（generate-audio 讀 raw markdown）」與「runtime 端（用 Astro 自家 markdown processor 渲出真 DOM）」，斷言兩邊 hash 一致；B 段抽出 `speech.ts` 的 `normalizeForHash` 跑 fixture，斷言與 lib 逐字一致——**這就是擋「改了 lib 卻忘了同步 `speech.ts`」靜默退機器人語音的那道網**。
  - 改 `word-tokens.mjs` 的 `normalizeForHash`／`getSpeakableText` 時，仍要**手動同步 `speech.ts`**；忘了同步 → `check-audio-hash-sync.mjs` 會 fail build，並要記得 `npm run audio:gen` 重生受影響音檔。
  - 既知陷阱（都已被上面 check 涵蓋）：build 讀 raw markdown，runtime 讀 smartypants 後的 DOM——`--`→em dash、硬換行 `\` / 行尾兩空格 → `<br>`。`normalizeForHash` 折疊多 hyphen（`-{2,}`→`-`）、`generate-audio.mjs` 的 `extractText` 對 `break` 吐一個空格，兩邊才對得上。
  - 逐字 highlight 詳見 [`app/docs/specs/word-highlight/spec.md`](../app/docs/specs/word-highlight/spec.md)。目前只為有 sidecar 的 clip 開卡拉 OK，其餘 clip 自動退回整段 highlight。
  - 講者→聲音解析（§5.2）是 `generate-audio.mjs` **build 獨有**，**不是第四份鏡像**：hash 不含講者，runtime 不需要也不知道它，所以改它不必動 `speech.ts`。
- 本檔是唯一事實來源。改動後同步檢查 `BRAIN.md` 第 4 條與 `SKILL.md` 的**決策樹與連結**是否仍正確（這兩處不複製表，所以通常只需確認連結）。
