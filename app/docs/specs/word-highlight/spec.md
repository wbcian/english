# Spec — 播放音檔時「逐字 highlight」

> 狀態：**Design / 待實作**　·　範圍：合成 TTS 音檔為主　·　最後更新：2026-06-03
> 本 spec 由一輪多代理 survey + 對抗驗證產出（驗證軌跡見 §12）。配套解說頁：[explainer.html](explainer.html)。

---

## 1. 目標與範圍

目前 app 播放音檔時只有**段落級**反白：點一段 `<blockquote><p>` 整段染黃（`.speaking` class）。Roadmap 的 P2 也只規劃到段落級。

**本 spec 要回答**：把它升級成 **逐字（word-by-word / 卡拉 OK 式）highlight** 有哪些實踐方式、現有架構好不好做、還是要重構。

- **主軸**：合成 TTS 音檔（現有 click-to-speak，813 個預生成 MP3）。
- **硬約束**：未來語音可能換成 **OpenAI GPT-4o TTS**（更像真人、要分角色）。但 GPT-4o TTS **不吐 word timestamp**（§12 已查證）。所以逐字時間必須跟 TTS 引擎**解耦**。
- **次要 / 未來**：真人 podcast 原音的 forced alignment（`transcripts/` 目前只有 `.srt`/`.txt`，無 in-repo MP3），只列一節未來延伸。

**一句話結論：這是加法（additive），不是重構。** 現有 hash + manifest + `new Audio()` 主幹完全保留，新功能用 bolt-on 的方式掛上去。

---

## 2. 現況架構回顧

| 元件 | 位置 | 重點 |
|---|---|---|
| 發音入口（雙後端） | [speech.ts](../../../src/scripts/speech.ts) | 主路徑＝預生成 MP3（`new Audio(src)`，元素加 `.speaking`）；fallback＝Web Speech API（依句切 chunk） |
| 點擊接線 | [speech.ts:281](../../../src/scripts/speech.ts) / [:294](../../../src/scripts/speech.ts) | `blockquote > p`（≥4 字、CJK <10%）與 `<th>` 為 `word` 的欄位 `<td>` |
| MP3 預生成 | [generate-audio.mjs:156](../../../scripts/generate-audio.mjs) | `tts.toStream(text)` **只接 `audioStream`、丟掉 `metadataStream`** |
| 內容定址 | [generate-audio.mjs:128](../../../scripts/generate-audio.mjs) | text → `normalizeForHash` → SHA-256 前 12 碼 → `public/audio/<hash>.mp3`；client 端 [speech.ts:113](../../../src/scripts/speech.ts) 重算同一個 hash 查表 |
| Manifest | [audio-manifest.json](../../../src/data/audio-manifest.json) | `{ "<hash>": true }`，813 筆，**已進版控** |
| Render | [\[...slug\].astro:23](../../../src/pages/lessons/[...slug].astro) | markdown → `<Content/>`；:28 import speech |
| rehype pipeline | [astro.config.mjs:15](../../../astro.config.mjs) | 目前唯一 rehype plugin＝[inject-table-labels.mjs](../../../src/rehype/inject-table-labels.mjs) |
| highlight CSS 前例 | [Layout.astro:166](../../../src/layouts/Layout.astro) / [:178](../../../src/layouts/Layout.astro) | `.speaking` 用 `--speak-highlight`（:35/暗 :46） |
| Speakable 單一事實來源 | [_conventions.md](../../../../lessons/_conventions.md) §5 | 改 highlight 邏輯必須同步 `speech.ts` 與 `generate-audio.mjs` |

---

## 3. 核心問題

逐字 highlight 需要兩樣東西，現況**兩樣都缺**：

1. **可被 highlight 的目標**：目前段落是「一坨 text node」，沒有逐詞的 DOM 元素可以單獨上色。→ 需要一層 **word-`<span>` tokenization**。
2. **逐詞時間軸**：不透明的 MP3 不知道每個詞何時被念到。→ 需要一個 **per-word timing 來源**。

而第 2 點正是 GPT-4o 換引擎會踩雷的地方：不同引擎給不給時間、給的格式都不同。所以設計重點不是「選哪個時間來源」，而是**用一個穩定介面把時間來源換掉也不會壞 runtime**。

---

## 4. 方案 Survey 矩陣

| 方案 | 精準度（合成音） | 成本 | 引擎＋瀏覽器支援 | Effort | 裁決 |
|---|---|---|---|---|---|
| **A. Edge `WordBoundary` → build-time `<hash>.words.json` sidecar** | 同一次合成算出，**sub-100ms**；唯一誤差源是 token 對齊 | build：每 clip 一個小 JSON，**無額外 TTS round-trip**；runtime：1 次可快取 fetch + rAF | producer 僅 Node（`msedge-tts` 已裝）；runtime＝`currentTime`+rAF，**全平台含 iOS**。producer 綁引擎、consumer 不綁 | **M** | **主 producer ✅** |
| **B. Whisper / WhisperX forced alignment → 同一份 sidecar** | 真 forced align 20–80ms；raw `whisper-1` 100–300ms＋詞漂移 | offline batch（非 predev）；`whisper-1` ≈ $0.006/min（語料幾分鐘→幾分錢）；WhisperX＝$0＋GPU 工具鏈 | **100% 引擎無關**——從音檔反推時間，Edge / GPT-4o / 真人都行 | L（工具鏈）/ M（whisper-1） | **fallback / 未來 producer**（換 GPT-4o 時上） |
| **C. Web Speech `onboundary`** | 「有觸發時」不錯 | build：0；runtime：tokenize＋跨 chunk index | **只能蓋 fallback 路徑**，碰不到 813 個 MP3、也碰不到 GPT-4o；iOS 缺 `charLength`、**MDN 標 Chrome 為 partial** | M | **僅薄薄的漸進增強** |
| **D. 均分估算（duration ÷ 詞數，可按字長加權）** | 差，隨句長漂移：8 詞 ~370ms、25 詞 ~715ms、130 詞 1–2.8s。單字 vocab clip 夠用 | build：0（只要 span）；runtime：trivial rAF | 全平台含 iOS；只靠 `duration`，**換 GPT-4o 也活** | **S** | **保底地板**（沒 sidecar 時的退路） |
| **E. WebAudio 能量/靜音偵測** | 差——連音沒有逐詞靜音，會漏算/多算、句中漂移 | build：span；runtime：AudioContext＋逐幀 RMS | iOS `MediaElementAudioSourceNode` 行為怪；逐 voice 調參無底洞 | L | **避免 ❌** |

**橫向共識**：每個逐字方案都要同一層 **word-`<span>` tokenization**（現在 `src/rehype/` 沒有 tokenizer，只有 `inject-table-labels.mjs`）。這層是共享基礎建設，不專屬任何方案——所以先把它做對，後面換時間來源都受惠。

---

## 5. 推薦架構 — sidecar timing manifest 當「解耦介面」

解耦的縫，是一份**穩定、內容定址的 per-clip 時間檔**：runtime 只認它，多個 producer 都能寫它。

```
                 ┌──────────────── PRODUCERS（可抽換）────────────────┐
  Producer A:    Edge WordBoundary metadata   ── 現在；免費；同一次合成就有
  Producer B:    Whisper/WhisperX forced align ── 換 GPT-4o TTS / 真人原音時
                 └───────────────────────┬───────────────────────────┘
                                         ▼  寫出
        app/public/audio/<hash>.words.json  =  [{ text, start, end }]（秒）
              ← key 用「跟 <hash>.mp3 一模一樣」的 sha256 前 12 碼
                                         │  被消費
                                         ▼
  RUNTIME（speech.ts）：manifest 命中、播 MP3 後 → fetch sidecar；
                        rAF 迴圈讀 audio.currentTime → 對 word <span>
                        toggle .is-current-word。沒 sidecar → 維持今天的整段 .speaking。
```

**為什麼 sidecar 是對的介面**

- **白搭現有設計、零額外設計成本**：hash 本來就把 text→MP3（[generate-audio.mjs:128](../../../scripts/generate-audio.mjs)，client 端 [speech.ts:113](../../../src/scripts/speech.ts) 重算）。sidecar 用同一個 hash → 直接繼承內容定址快取與 idempotency。
- **runtime 只依賴 baseline web API**：`HTMLAudioElement.currentTime` + `requestAnimationFrame` + `classList`——全平台（含 iOS Safari）都穩，而且直接搭現有的 `new Audio(src)` 路徑（[speech.ts:150](../../../src/scripts/speech.ts)）。**完全不碰** Web Speech 的 boundary 事件（手機上不可靠）。
- **sidecar 進版控**：跟 813 個 MP3、manifest 一樣 commit 進 git。好處：哪天 Edge 這個逆向 API 壞了，壞的是 **build**，不是線上已 ship 的網站。

**Producer A（現在）— Edge `WordBoundary`**
庫本來就把時間從頭接到尾，是 build script 把它丟了。[generate-audio.mjs:138](../../../scripts/generate-audio.mjs) 的 `setMetadata(VOICE, FORMAT)` **沒帶 metadata options** → `wordBoundaryEnabled` 預設 `false` → `toStream` 回 `metadataStream: null`。只要：

```js
// generate-audio.mjs:138
await c.setMetadata(VOICE, FORMAT, { wordBoundaryEnabled: true });
// generate-audio.mjs:156 — 別再只解構 audioStream
const { audioStream, metadataStream } = tts.toStream(escapeForSsml(text));
// 一邊 pipe audio 到磁碟，一邊累積 metadataStream 的 WordBoundary 項
// 兩條 stream 都 close 後，寫 <hash>.words.json
```

每個 WordBoundary 項長 `{ Type:'WordBoundary', Data:{ Offset, Duration, text:{ Text } } }`，單位是 100ns tick。換算：`start = Offset / 1e7`、`end = (Offset + Duration) / 1e7`。

**Producer B（未來）— forced alignment**
GPT-4o TTS 不吐 word timestamp（§12 CONFIRMED），`gpt-4o-transcribe` 也給不了 word 級——只有舊的 `whisper-1 verbose_json` 能，而那是純 ASR。因為我們**本來就知道餵進去的文字**，最穩的 producer 是真 forced alignment（WhisperX `align()` / MFA / aeneas 跑在 GPT-4o 的 MP3 上），吐出**一模一樣的 `[{text,start,end}]`**。**`speech.ts` 的 runtime 一行都不用改**，只換 producer。

**為什麼能撐過 GPT-4o / 分角色未來**：runtime 消費的是引擎中立的 sidecar，從不直接碰引擎。換 TTS 引擎＝換掉 offline producer、對新 MP3 重跑一次。沒 sidecar 的 clip（換引擎後還沒批次跑、或新 clip）**優雅退化**成今天的整段 `.speaking`——不會崩、不會空白。

---

## 6. 可行性裁決 — additive，不是重構

hash + manifest + `new Audio()` 主幹原封不動，全部 bolt-on。精確觸點：

| 檔案 | 改動 | 規模 |
|---|---|---|
| [generate-audio.mjs](../../../scripts/generate-audio.mjs) | `:138` 加 `{ wordBoundaryEnabled: true }`；`:154-171` 同時接 `metadataStream`、累積 WordBoundary、**等兩條 stream 都 close** 再寫 `<hash>.words.json`；`:218-226` 加「sidecar 不存在就重生」讓 813 個既有 clip 回填 | XS–S |
| **新** `src/rehype/inject-word-spans.mjs` | 把每個 speakable 詞包成 `<span class="w" data-wi="N">`；註冊在 [astro.config.mjs:15](../../../astro.config.mjs) 接在 `rehypeInjectTableLabels` 後。**必須逐 byte 保留串接後的 textContent**（否則 `sha256Short` 對不上、每個 MP3 都查不到），且開頭 `<strong>` 講者標籤不包 span | **M（真正的重量）** |
| [speech.ts](../../../src/scripts/speech.ts) | `:148-171` `playAudioFile` 加「選配 sidecar fetch + rAF highlighter（toggle `.is-current-word`）」；`clearCurrent`/`cleanup` 要一起取消 rAF、清 class；fallback 路徑不動 | S–M |
| [Layout.astro](../../../src/layouts/Layout.astro) | 在 `:166-179` 附近加 `.w.is-current-word`，複用 `--speak-highlight`/`--speak-accent` | XS |
| [_conventions.md](../../../../lessons/_conventions.md) §5 | 把 sidecar + span tokenizer 記成**第三個**要同步的面（與 `speech.ts`、`generate-audio.mjs` 並列） | XS |

**無新 runtime 相依**（Producer A）。**不必改 manifest schema**——runtime 用「probe sidecar 是否存在」即可，不碰 `{hash:true}` 形狀（[speech.ts:14](../../../src/scripts/speech.ts) / [:228](../../../src/scripts/speech.ts)）。

---

## 7. 分階段實作計畫

| Phase | 內容 | Effort | 驗收 |
|---|---|---|---|
| **0 — 共享 span 層** | 寫 `inject-word-spans.mjs`，鏡像 §5 speakable 判定（`blockquote>p`、CJK<10%、len≥4，[speech.ts:281](../../../src/scripts/speech.ts)；`word` 欄 `<td>`，[:294](../../../src/scripts/speech.ts)）與開頭 `<strong>` 剝除（[speech.ts:74](../../../src/scripts/speech.ts)）。加 `.is-current-word` CSS。先用 no-op highlighter，讓 span 先無害上線 | **S** | 頁面 textContent 不變 → 813 個 MP3 查表全命中 |
| **1 — MP3-only 逐字（Producer A）** | 開 `wordBoundaryEnabled`、drain metadata、寫 `<hash>.words.json`、回填 813 clip。runtime：命中後 fetch sidecar；rAF highlighter 用**序列 index 對齊**（Edge token ↔ DOM span，不是 char offset） | **M** | 預生成 clip 出現卡拉 OK highlight；無 sidecar 的 clip 退整段 |
| **2 — fallback 增強（選配）** | Web Speech `onboundary` 當**桌面限定**漸進增強，給還沒合成的 lesson。**永遠不當主路徑、不靠它撐 iOS/Android**。可跳過 | **S** | — |
| **3 — 引擎可攜（延到換 GPT-4o 再做）** | 立 Producer B（forced alignment）offline batch，吐同款 sidecar；runtime 不動。對「有音但無 sidecar」的 clip 加均分地板（方案 D），讓長段至少粗略跟上 | **L** | 換引擎後 runtime 零改動仍有逐字 |

---

## 8. 風險與未決問題

> 依嚴重度排序。§8.1 的前兩項是會「靜默壞掉」的（不報錯、只是悄悄變爛或亮錯字），務必在 Phase 0/1 守住。

### 8.1 兩個會「靜默壞掉」的雷 — 背景、成因與避免

**先懂背景**：app 不是「一段文字配寫死的檔名」，而是**內容定址**——
`段落文字 → normalizeForHash → SHA-256 前 12 碼 → 那個 hash 就是 MP3 檔名`。
**build 時**算一次 hash 命名 MP3（[generate-audio.mjs:128](../../../scripts/generate-audio.mjs)）；**runtime** 再從畫面那段文字**重算一次**去查表（[speech.ts:113](../../../src/scripts/speech.ts)）。兩次必須算出**完全相同**的 hash，才找得到音檔。懂這個，兩個雷就清楚了。

**🔴 雷 1 — Hash drift（hash 對不上，最高嚴重度）**
- **是什麼**：逐字 highlight 要把每個詞包成 `<span>`。若這個動作**改到了那段的文字內容**，runtime 重算的 hash 就跟 MP3 檔名對不上 → 查表 miss → **每一段都靜默退回瀏覽器機器人語音**（Web Speech）。不報錯，整站發音悄悄變爛。
- **為什麼會中**：`<span>foo</span>` 的 `textContent` 本來等於 `foo`，包 span 不該改字——雷藏在細節：切詞時**多塞/吃掉空白**（`fresh  coffee` 兩格被收一格）、不小心把要剝除的**講者 `<strong>` 標籤**也算進文字、或彎引號 `'`↔直引號 `'` 沒對齊。
- **怎麼避免（便宜、可完全消除）**：
  1. 切詞器只做「把現有文字切段、各自包 span」，**逐字元含空白原封不動**。
  2. **build 時加斷言**：每個 speakable 段落「包 span 前 textContent」必須 `===`「包後串回」；甚至「包完重算 hash、確認仍在 manifest」——一旦漂移就**讓 build 失敗**。
  3. 講者 `<strong>` 剝除跟 `speech.ts` 用**同一份程式碼**（[speech.ts:74](../../../src/scripts/speech.ts)），不另寫；標籤不包 span、不計入 `data-wi`。
  - 精髓：**把「runtime 才會發現的靜默失敗」提前變成「build 時的大聲報錯」**，漂移上不了線。

**🟠 雷 2 — Tokenization drift（兩邊的「詞」對不齊，CONFIRMED §12）**
- **是什麼**：手上有兩份「詞清單」——畫面 DOM span（按空白切）與 Edge WordBoundary（每詞帶時間）。兩份**有時對不起來**。
- **為什麼會中**：Edge **念之前會改寫 token**——`100`→`one hundred`（一變二）、`USD`→`United States Dollars`（一變三）、`Dr.`→`Doctor`；且 msedge-tts **只給「念的詞＋時間」、不給輸入 char offset**（`Data` 僅 `{Offset, Duration, text:{Text}}`）。若天真假設「畫面第 i 詞 = 時間第 i 詞」，一碰到 `100` 就**從此每個詞往後錯一格、錯到段尾**，同樣靜默、只是亮錯字。
- **怎麼避免（可行，但要花工）**：
  1. **不要假設 1:1**，改用**序列對齊**（greedy 雙指標 / Needleman-Wunsch）；一個 DOM 詞對到多個時間詞（數字/縮寫）就**合併時間**（start 取第一、end 取最後）指回該 span。
  2. 對齊前兩邊都先過既有 `normalizeForHash`（[speech.ts:103](../../../src/scripts/speech.ts)），讓彎引號/破折號/空白等無關差異不算數。
  3. **保命網**：對齊不起來、信心不足的 clip → **退回整段 highlight**（今天的行為），**絕不錯標**；build 時順手標記這些 clip 供檢查。
  4. **v1 務實**：只對「兩邊詞數乾淨對上」的 clip 開逐字（一般散文佔絕大多數），含數字/縮寫的少數先退整段，對齊器之後再加強。

**雷 → 怎麼避免 → 成本（一眼版）**

| 雷 | 後果 | 怎麼避免 | 殘餘風險時退路 | 成本 |
|---|---|---|---|---|
| **Hash drift** | 全站靜默退機器人語音 | build 斷言「textContent 不變 / hash 仍命中」→ 失敗就擋下 | （根本不該發生；發生＝build 紅燈） | **低**，可完全消除 |
| **Tokenization drift** | 段落內逐詞錯標到結尾 | 序列對齊＋合併多對一；兩邊先正規化 | 對不齊的 clip **退整段**，不錯標 | **中**，要寫對齊器 |

> 共同原則：**build 時抓、大聲報錯；runtime 退整段、永不錯標。** 這也是 Phase 0 驗收寫「textContent 不變 → 813 個 MP3 全命中」的理由——那關專守雷 1。

### 8.2 其餘風險

3. **`& < >` desync**：`escapeForSsml`（[generate-audio.mjs:147](../../../scripts/generate-audio.mjs)）把這些轉成 entity；有記錄在案的 Azure neural-voice bug 會讓 WordBoundary 在其後失準。受影響 clip 應**退整段**，不是壞掉。
4. **Safari / iOS boundary（PARTIAL，§12）**：**不要**把 Web Speech boundary 當時間來源——MDN 把 Chrome/Android boundary 標 partial，Android 常常不觸發，iOS 缺 `charLength`、多空白時 `charIndex` 會偏，且 iOS 背景暫停會中斷 utterance。Web Speech 維持「只發音、不逐字」（它本來就只有 `onend`/`onerror`，[speech.ts:218](../../../src/scripts/speech.ts)）。
5. **Scroll-into-view**：highlight 段落中間的詞不該把畫面猛拉。若加 `scrollIntoView`，限 block 級且用 `block:'nearest'` 防抖。
6. **長段效能**：`loadedmetadata` 時把 onset 陣列建好一次，每 rAF 幀做 O(log N) 二分查找；lesson 有 ~130 詞段落，迴圈內避免 allocation。
7. **分角色多音軌（GPT-4o 未來）**：多角色語音連音更多，更殺方案 E、更糟任何 heuristic。那裡只有 forced alignment（Producer B）能給穩定逐詞。
8. **三重鏡像漂移**：span tokenizer 變成**第三個**（與 `speech.ts`、`generate-audio.mjs`）要對齊 speakable 規則與標籤剝除的地方。緩解：把 normalizer/tokenizer **集中成一個共享模組**，三邊都 import。

---

## 9. 未來延伸

- **真人 podcast 逐字**：`transcripts/` 已有 `.srt`（句級 ~3s）+ `.txt`，但無 in-repo MP3。要逐字需 Producer B forced alignment 跑在真音檔上（句級 SRT 可當對齊的粗錨）。
- **分角色語音**：換 GPT-4o TTS 多 voice 後，`<strong>` 講者標籤可餵給 producer 做 per-speaker voice 指派；逐字時間仍走同一份 sidecar。

---

## 10. 範圍外（本次不做）

- 不實作逐字 highlight 功能本身（本回合只產 spec + 解說）。
- 不改 `generate-audio.mjs` / `speech.ts` / `astro.config.mjs`。
- 不展開真人 podcast forced-alignment 的完整工程。

---

## 11. 技術名詞解釋（Glossary）

> 每條：**白話 + 一句類比 + 在本案的角色**。

- **TTS（Text-to-Speech）/ STT（Speech-to-Text）**：TTS 是「文字→語音」（我們現在做的）；STT/轉錄是反方向「語音→文字」。類比：TTS 是播音員念稿，STT 是聽寫員記稿。**本案**：發音用 TTS；只有在反推時間（Producer B）才用到 STT/對齊。
- **WordBoundary / SentenceBoundary metadata**：TTS 引擎一邊念、一邊回報「現在念到哪個詞、從第幾毫秒到第幾毫秒」。類比：播音員旁邊有人即時標出每個字的起訖碼錶。**本案**：Edge TTS 的 WordBoundary 就是 Producer A 的免費時間來源。
- **timestamp / timing manifest（`<hash>.words.json`）**：一份「逐詞 start/end 秒數」的小清單。類比：卡拉 OK 的字幕時間軌。**本案**：解耦的穩定介面，runtime 只認它。
- **forced alignment（強制對齊）**：已經有「正確文字」＋「音檔」，把每個字對齊到音檔時間軸（不是去猜字，是去對時間）。類比：拿著劇本去標出演員每句台詞落在影片第幾秒。**本案**：Producer B，換 GPT-4o / 真人原音時用，工具如 WhisperX / MFA / aeneas。
- **Whisper / WhisperX**：Whisper 是 OpenAI 的語音辨識模型（`whisper-1` 能吐 word 級時間）；WhisperX 是在它之上做更準 forced alignment 的開源工具。**本案**：Producer B 的候選。
- **content-addressable hash（內容定址）**：用「內容本身的 SHA-256」當檔名/key，相同內容必得相同 hash。類比：用指紋當門牌。**本案**：text→`<hash>.mp3`，sidecar 也共用這個 hash，所以快取/idempotency 全免費。
- **Web Speech API / `SpeechSynthesisUtterance` / `boundary`(`onboundary`) 事件 / `charIndex`**：瀏覽器內建 TTS；念到詞邊界時可發 `boundary` 事件，附上「念到原文第幾個字元（charIndex）」。**本案**：fallback 後端；boundary 在手機上不可靠（§12），故只當桌面漸進增強。
- **remark / rehype plugin / AST**：Astro 在 build 時把 Markdown 解析成樹（AST），remark 改 Markdown 樹、rehype 改 HTML 樹。類比：在文章送印前，自動在每個字外面套一層標記。**本案**：新 `inject-word-spans.mjs` 是 rehype plugin，build 時把詞包成 `<span>`。
- **tokenization / 斷詞漂移**：把字串切成「詞」。漂移＝TTS 引擎切的詞 vs DOM 裡空白切的詞對不齊（數字、縮寫、連字號、彎引號）。**本案**：§8 第 2 項的主風險，要序列對齊。
- **100-nanosecond units**：Edge metadata 的 Offset/Duration 單位是 100 奈秒 tick（1 秒 = 1e7 tick）。**本案**：換算 `秒 = Offset / 1e7`。
- **SSML**：給 TTS 的標記語言（XML）。`&<>` 等字元要 escape，否則 SSML 壞掉。**本案**：`escapeForSsml` 已處理，但 escape 後有 WordBoundary desync bug（§8 第 3 項）。
- **`timeupdate` / `requestAnimationFrame`（rAF）**：兩種「播放中定時回呼」機制。`timeupdate` 約每 250ms 一次（太疏）；rAF 每幀（~16ms，順）。**本案**：runtime 用 rAF 讀 `currentTime` 來決定 highlight 哪個詞。
- **穩定介面 / 解耦（decoupling）**：把「會變的東西」藏在固定的介面後面，換實作不影響使用方。類比：插座規格不變，電器隨便換。**本案**：sidecar 是插座；Edge / Whisper / GPT-future 是隨便換的電器；`speech.ts` runtime 不用動。

---

## 12. 驗證流程備忘（對抗驗證軌跡）

> 依 CLAUDE.md「外部事實型多輪交叉驗證」，本 spec 的承重宣稱都過了第二輪獨立 skeptic。以下記錄**確認 / 部分修正 / 推翻**了什麼——其中兩項修正了第一輪的直覺。

**CONFIRMED**
- **GPT-4o TTS 不吐 word timestamp；只有 `whisper-1` 能給 word 級**。`gpt-4o-mini-tts` 只回音檔、無 `timestamp_granularities`；`gpt-4o-transcribe` 只支援 `json`/`text`。→ 直接支撐「解耦」這個核心約束。
  來源：`developers.openai.com/api/docs/guides/speech-to-text`、`.../models/gpt-4o-mini-tts`、`scribewave.com/blog/openai-launches-gpt-4o-transcribe-a-powerful-yet-limited-transcription-model`。
- **Tokenization drift 真實且需序列對齊**。Edge 會改寫數字/縮寫；msedge-tts 不給輸入 char offset；app 的 `normalizeForHash` 已證明 smartypants 漂移；`&<>` escape 命中 desync bug。
  來源：`github.com/Azure-Samples/cognitive-services-speech-sdk/issues/2359`、`learn.microsoft.com/.../speechsynthesizer.wordboundary`、`github.com/rany2/edge-tts/issues/335`。

**PARTIAL / 修正了第一輪直覺**
- 「Web Speech boundary 在 Safari/iOS 不可靠、Chrome 穩」——**方向部分相反**。MDN BCD 把 **Chrome / Chrome-Android** boundary 標 `partial_implementation`（"does not fire as expected", crbug 40715888）；Safari/iOS **會**觸發但缺 `charLength`、多空白時 `charIndex` 偏。真正全壞的是 **Android**。淨結論不變：**別把功能蓋在 boundary 上**，反而更強化 manifest 設計。
  來源：`raw.githubusercontent.com/mdn/browser-compat-data/main/api/SpeechSynthesisUtterance.json`、`codersblock.com/blog/javascript-text-to-speech-and-its-many-quirks/`、`developer.apple.com/forums/thread/712667`。
- 「msedge-tts 可靠地吐 WordBoundary（100ns）」——**機制與單位 CONFIRMED，但「可靠」被高估**。stream 只有在開 boundary flag 時才非 null；README 自己的範例**一個 WordBoundary 都沒有**（只示範 SentenceBoundary）；Edge 端是逆向 API、有版本相依的 offset bug。→ **build 時擷取並 commit sidecar**，讓未來 Edge 壞掉只壞 build、不壞線上。
  來源：`MsEdgeTTS.d.ts:14-28,111-114`、`learn.microsoft.com/.../speechsynthesiswordboundaryeventargs`。

**REFUTED（被追下去推翻的反例）**
- 「`gpt-4o-transcribe` 用 `json` 就能拿 word timestamp」——把 `logprobs` 的 json-only 限制跟 timestamp 混為一談；`timestamp_granularities` 只限 `whisper-1`。
- 「Chrome 桌面是 Web Speech boundary 的安全基準」——被 MDN BCD 自己的 partial flag 推翻。

**Repo 直讀確認**：813 個 MP3 在檔（且已進版控）；`toStream` metadata 被丟在 [generate-audio.mjs:156](../../../scripts/generate-audio.mjs)；`setMetadata` 無 flag 在 [:138](../../../scripts/generate-audio.mjs)；manifest 形狀 `{hash:true}`；`.srt` 為句級、無 in-repo podcast MP3 → 真人路徑確屬未來/次要。
