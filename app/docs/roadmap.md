# App Roadmap

> Astro lessons app 的未來迭代清單。新點子先丟 Backlog，動工挪到 In Progress，做完搬 Done。
> 結構欄位：**動機**（為什麼要做）／**期望行為**（做完長什麼樣）／**實作切點**（從哪下手）／**依賴 / 風險**。

---

## 🚧 In Progress

_（目前沒有正在做的）_

---

## 📋 Backlog

> **Effort 速記**：XS <30 min ／ S 30 min–2 hr ／ M 半天–1 天 ／ L 1–3 天 ／ XL >3 天
> 未讀 source code 前的估算僅供排程，動手前 ±1 級正常。

#### 總覽（建議處理順序）

| 順序 | Item | Effort | Depends on | 一句話 |
|---|---|---|---|---|
| 1 | [P2 — 播放時 highlight 當前段落（含卡拉 OK 升級）](#p2--播放音訊時-highlight-當前段落單字----effort-s) | S | P1 ✅ | shadowing 跟讀時知道讀到哪；可升級為逐字蔓延 |
| 2 | [P2.5 — Transcript inline vocab popup](#p25--transcript-段落-inline-vocab-popup---effort-m) | M | P1 ✅ | 閱讀流不中斷地查單字（最大閱讀體驗升級） |
| 3 | [P3 — Vocab filter（熟悉度 / 類別）](#p3--vocab-卡片支援-filter熟悉度--類別---effort-m) | M | — | 快速鎖定要複習的 vocab subset |
| 4 | [P4 — Flashcard SRS lite](#p4--flash-card-複習模式srs-lite---effort-l) | L | P3 | active recall；填齊 vocab → 複習迴圈 |
| 5 | [P5 — 依講者切換 TTS 聲音](#p5--依講者切換-tts-聲音--effort-m) | M | — | dialogue lesson 不同角色用不同聲音，聽感更真實 |
| 6 | [P6 — UI 改版研究：整體閱讀體驗](#p6--ui-改版研究整體閱讀體驗--effort-m) | M | — | 先研究再動手：typography／版面／密度怎麼調更好讀 |
| 7 | [P7 — 播放語速調整（實驗）](#p7--播放語速調整實驗--effort-xs) | XS | — | 目前 0.95x 偏慢；試試接近自然語速／1x，實測後定 |

**排序理由**：
- ~~**P1 先做**~~ ✅ 2026-06-10 完成（見 Done）
- ~~**P1.5 緊跟（或並行）**~~ ✅ 2026-06-10 完成（見 Done）
- **P2 → P2.5**：都靠 P1，先把 S 的吃掉、再啃 M 的 popup（popup 是閱讀體驗最大躍升，但成本也最高）
- **P3 → P4 放最後**：vocab 子系統獨立於 lesson 閱讀流；先把 lesson 閱讀體驗閉環，再開 flashcard 戰場
- **不建議**：跳過 P1 直接做 P2／P2.5（trigger 不明確 → click 行為混亂 → 還是要回頭重構）

---

### P2 — 播放音訊時 highlight 當前段落／單字 🎧🔦　**Effort: S**

- **動機**：長段落 audio 播到一半，讀者不知道對應到逐字稿哪一句。跟讀（shadowing）時尤其卡。
- **期望行為**：
  - 播 `<blockquote><p>` 整段時，該 `<p>` 加 active 樣式（背景色或左 border 強調），播完／暫停／切換段落自動清掉
  - 播 vocab table 內某 cell 時，該 `<tr>` 或 `<td>` 同步 highlight
  - 視覺要明顯但別搶戲（建議：左側 4px accent border + 淡淡背景）
  - **[2026-06-10 Cian 回饋]** 目標升級為**漸進式已讀蔓延 highlight**（卡拉 OK 式）：已播放的部分與未播放部分有明確視覺區分，highlight 隨播放逐字慢慢向前蔓延，而非整段一次亮起
- **實作切點**：
  - 找音訊播放的入口（推測在 `app/src/scripts/` 或元件級 inline script）
  - 綁 `audio` 元素的 `play` / `pause` / `ended` 事件 → 在對應 DOM node 上 toggle `.is-playing` class
  - CSS 在全域樣式表加 `.is-playing` 規則
- **依賴 / 風險**：
  - **強烈建議 P1 先做**：P1 引入明確的 trigger icon，這裡 highlight 哪段才有明確錨點
  - 需確認目前 audio ↔ DOM node 的關聯方式（hash-based manifest？data-attribute？）
  - 同頁多段同時播的競態 — 一次只 highlight 一個
  - **卡拉 OK 式漸進 highlight**：Web Speech API 的 `boundary` event 可拿到 word-level timing，但瀏覽器支援度（尤其 Safari / Firefox）需查證；預生成 MP3 路徑則需依賴 `*.words.json` sidecar（已有產生流程）再配合 `currentTime` 進度計算

### P2.5 — Transcript 段落 inline vocab popup 📖💬　**Effort: M**

- **動機**：讀 lesson 時看到 transcript 段落出現生字，要回滾到下方 `Key Vocabulary` 表才能查意思——閱讀流被打斷。如果能 hover/click 該字直接彈出定義，閱讀體驗大幅提升；也順便把 `vocab/` 目錄的單字資產**在 lesson 內被動曝光**。
- **期望行為**：
  - lesson page 渲染 transcript 段落時，掃過每段文字，**把出現在該 lesson 的 `Key Vocabulary` table 或 `vocab/` 目錄的字加 underline + hover/click 觸發 popup**
  - Popup 內容：該字 frontmatter 的 `zh` + `phonetic`，+ 第一個 example sentence
  - Popup 右上角附「📖 完整檔」連結 → 跳該字 vocab page
  - 進階：popup 內可「⭐ 加入今天複習」按鈕（v2 接 P4 的 flashcard 系統）
- **實作切點**：
  - 預處理：build time 掃 `vocab/*.md` frontmatter，產出 `word → {zh, phonetic, first_example, link}` 對應表（靜態 JSON，build artifact）
  - 渲染：lesson `<blockquote>` 段落文字 tokenize 後比對對應表，命中就包 `<span class="vocab-link" data-word="...">`
  - 客戶端：純 CSS hover popup（純文字版）或 small Astro island（加圖示與按鈕版）
  - 詞形：v1 先做 exact match（grill ≠ grills ≠ grilled），驗證體驗 OK 再加 stemming
- **依賴 / 風險**：
  - **建議 P1 先做**：P1 把段落點擊行為改成「啥都不做」後，這裡 click vocab span 才不會跟播放 trigger 打架
  - 詞形變化（grill/grills/grilled）會增加複雜度——v1 可只支援 exact match，先驗證使用體驗
  - 一段話可能命中多個字，popup 不要彼此疊到（限制同時最多顯示 1 個）
  - vocab 字數成長後，比對表會變大——build 時生成靜態 JSON 即可，不要 runtime 每次掃 markdown
  - lesson 內若兩處出現同字（transcript + Key Vocab table），cell 內已是連結就不要再包 span（避免巢狀 a 標籤）

### P3 — Vocab 卡片支援 filter（熟悉度 / 類別） 🔍　**Effort: M**

- **動機**：vocab 已 70+，要快速複習特定族群（★1 新字 / phrasal verb / idiom），目前只能整頁滾。
- **期望行為**：
  - vocab index 頁加 filter bar
  - **熟悉度**：★1 / ★2 / ★3 / ★4 / ★5（multi-select，預設全選）
  - **類別**：tags（phrasal-verb, idiom, slang, business, emotion, manner-adverb, …）— 來源是各 `vocab/<word>.md` 的 frontmatter `tags`
  - **文字搜尋**：擴用既有的 `fuse.js` 依賴
  - filter state 用 URL query string 同步，方便書籤／分享（例：`?stars=1,2&tags=phrasal-verb`）
- **實作切點**：
  - 找 vocab index 頁元件（`app/src/pages/vocab/` 或類似）
  - 從 frontmatter 抽 `proficiency` + `tags` 餵 client 狀態
  - 一個小型 filter store（純 vanilla 或 Astro island 都可以，先別引入新框架）
- **依賴 / 風險**：
  - 需要所有 vocab 檔都符合 BRAIN.md 的 schema（`proficiency`、`tags` 必填）— 跑前先掃一遍 lint
  - tags 拼字不一致會產生「同義不同 key」假分類（建議跟 lint 一起做：列出所有 tag、人工 normalize）

### P4 — Flash card 複習模式（SRS lite） 🃏　**Effort: L**

- **動機**：被動讀 vocab page 記不牢；active recall（看到 prompt 自己回想）才是長期記憶的關鍵。
- **期望行為**：
  - 新頁面 `/flashcards/`
  - 從 vocab pool 抽 N 張，**正面**：英文字 + 音訊播放按鈕；**背面**：中文 + 1 個例句
  - 自評三按鈕：**認識** / **模糊** / **忘了**
  - 跟 P3 整合：能「只抽 ★1」「只抽 phrasal-verb」「只抽 30 天沒複習的」

- **資料層決策（重要）**：
  - ❌ **不需要 DB**：單一使用者、source of truth 已經是 `vocab/*.md` frontmatter、靜態 hosting，DB 進來只會跟 markdown 打架
  - ✅ **v1 用 localStorage**：0 infra、0 auth，先觀察 Cian 會不會真的用
  - ✅ **回流機制 — 不做通用 JSON export，改做「session 摘要 → 貼給 Coach Max → 套回 markdown」**
    - 按「結束練習」→ 顯示一個可複製的 markdown panel
    - Cian 貼回對話 → Coach Max 按既有 schema 更新各 `vocab/<word>.md`（`last_reviewed` / `review_count` / `proficiency` + 在 `## Encounters` 補一行）並 commit
    - 好處：v2 之前不用寫任何 sync 工具，借用既有對話流程；markdown 仍是 SoT
  - **摘要格式（建議統一，方便 agent parse）**：
    ```
    # Flashcard session — YYYY-MM-DD
    - <word>: <認識|模糊|忘了> → ★X→★Y   (or "no change")
    - <word>: ...
    ```

- **localStorage 注意事項**：
  - **存活風險**：手動清 cache / Safari 7 天 ITP 政策 / 換瀏覽器或裝置都會清空。v1 不追求永久 — 真正持久的還是 markdown（透過上面的回流機制定期 flush）
  - **Key prefix**：所有 key 都用 `englishApp:flashcard:` 開頭，避免未來在 `wbcian.github.io` 同 host 起別的 Pages app 撞 key

- **實作切點**：
  - 新頁 `app/src/pages/flashcards/index.astro`（或同層）
  - 抽卡邏輯：先做隨機，之後換 SM-2 lite（依 `proficiency` + `last_reviewed` 加權）
  - 共用 P2 的 filter 元件
  - 結束面板：一個 `<details>` + `<pre>` 區塊，按一鍵 copy 帶走

- **依賴 / 風險**：
  - **強烈建議先做 P3**，filter UI 共用
  - SRS 演算法不要過度設計，初版「隨機 + 三按鈕 + localStorage」就有 80% 價值
  - **觀察指標**：v1 上線後 N 週內 Cian 主動點開幾次？沒人用就別投資 v2 的演算法升級

### P5 — 依講者切換 TTS 聲音 🎙️　**Effort: M**

- **動機**：[2026-06-10 Cian 回饋] dialogue lesson 中不同角色（如 Ksenia vs Scene）用同一個聲音播放，聽感單調，角色辨識度低。若能依講者自動切換 TTS 聲音，跟讀體驗更接近真實對話，也更容易追蹤誰在說話。
- **期望行為**：
  - 依 blockquote 開頭的粗體講者標籤（`**Ksenia (00:00)**`、`**Scene (01:10)**` 等）自動選用對應聲音
  - 不同講者對應不同 TTS voice（如一個用女聲 A，另一個用女聲 B 或男聲）
  - 聲音對應表可在 lesson frontmatter 或全域設定中維護
- **實作切點**：
  - Repo 已有 msedge-tts 產音訊的流程（見 git log `chore: generate audio ... msedge-tts`），可在產音訊時依講者標籤切換 voice 參數
  - `generate-audio.mjs` 讀到 blockquote 開頭 `**<speaker>**` 時，查對應表取 voice name，再呼叫 msedge-tts
  - 預生成 MP3 路徑不變，只是不同 clip 用了不同聲音 — 不影響 runtime 播放邏輯
- **依賴 / 風險**：
  - 聲音對應表需人工維護（每個 speaker slug → voice）；新 lesson 若出現新講者需補登
  - msedge-tts 可用 voice 清單需確認哪些支援中英切換，或哪些聲音適合英文教學場景
  - 預生成 MP3 才能享受此功能；Web Speech API path 的 voice 切換可視進度另做

### P6 — UI 改版研究：整體閱讀體驗 🎨　**Effort: M**

- **動機**：[2026-06-10 Cian 回饋] 想研究 UI 改版，看怎麼樣能讓整體**更好閱讀**。app 功能逐步到位（P1 播放鈕、P1.5 雙語標題），但視覺層從初版以來沒有整體檢視過——typography、行距、版面密度、配色對長時間閱讀的友善度都值得一輪系統性研究。
- **期望行為**：
  - **先研究、後動手**：產出一份改版提案（可附 mockup 或 A/B 截圖比較），列出「現狀問題 → 建議 → 預期效果」，由 Cian 裁決後才實作
  - 研究面向（不限於）：中英混排的字體與行高、`lesson-body-scroll` 視窗高度與密度、卡片版面的資訊層級、暗色模式對比度、手機窄版的留白
  - **播放按鈕視覺順帶優化**（次要）：目前 ▶/⏸/↻ 沒跑版、功能 OK，但視覺設計可以更精緻（icon 風格、gutter 內的對齊與大小、hover/playing 狀態的視覺語言）——歸入此次研究一起看，不單獨開工
- **實作切點**：
  - 研究階段零程式風險：截圖現狀（桌面/手機、亮/暗）→ 對照可讀性慣例（長文閱讀的 measure、line-height、對比度）→ 提案
  - 實作階段視提案範圍另估 effort；CSS 集中在 `app/src/layouts/Layout.astro` 全域樣式與各元件 scoped style
- **依賴 / 風險**：
  - 與 P2（卡拉 OK highlight）有視覺語言交集——若 P2 先做，highlight 樣式要納入此次研究的範圍一起定調
  - 「更好閱讀」偏主觀，提案要附截圖比較讓 Cian 能具體選，避免空談原則

### P7 — 播放語速調整（實驗） 🐢⚡　**Effort: XS**

- **動機**：[2026-06-11 Cian 回饋] 目前跟讀播放語速偏慢，覺得**接近自然語速或 1x 就好**；但確切值想實測幾種速度後再決定，先記下來不馬上做。
- **期望行為**：
  - 把播放速度調到更接近自然語速（候選：1.0x，或介於 0.95–1.1x 之間）
  - 進階（非必要）：lesson 頁加一個語速切換 UI（如 0.75x / 1.0x / 1.25x 小按鈕），讓使用者自選；state 存 localStorage
- **實作切點**：
  - Web Speech path：`app/src/scripts/speech.ts` 的 `speakViaWebSpeech` 內 `u.rate = 0.95`（目前值）
  - 預生成 MP3 path：`new Audio()` 的 `playbackRate`（目前未設，等於 1.0）——若要全域一致，兩條路徑都要對齊
  - ⚠️ 兩條路徑語速來源不同：Web Speech 用 utterance.rate，MP3 用 audio.playbackRate；改的時候別只改一邊
- **依賴 / 風險**：
  - 卡拉 OK highlight（P2）若已上線，改 MP3 `playbackRate` 不影響 `*.words.json` 的相對 timing（`currentTime` 會自動隨速度推進），但要實測確認 highlight 不跑掉
  - 純調數值零風險；加 UI 切換才需估額外 effort

---

## 💡 Ideas（還沒排優先序）

_（隨時補）_

---

## ✅ Done

### P1.5 — Lesson list 改顯示中英雙語標題（取代 slug 檔名）📑　**完成：2026-06-10**

- **落地行為**：卡片主標改中文 `title_zh`（fallback `topic` slug 向後相容）、下方英文小字副標 `title_en`（兩者皆有才顯示，CSS 兩行截斷防手機爆版）；搜尋同時吃中英標題（Fuse weight 2），slug 降權 0.5 保留。
- **資料**：16 份 lesson frontmatter 全數 backfill `title_zh`（取自 H1）/ `title_en`（從 summary blockquote 提煉，≤110 字元）；schema 維持 optional（顯示層有 fallback，新檔忘加不會 build 爆）。
- **規範**：[lessons/_conventions.md](../../lessons/_conventions.md) 已加 title_zh/title_en 填寫說明。
- **驗證**：sonnet 實作 → 獨立驗收 PASS（確認 16 份內文零誤碰、音檔 hash 零變動 generated=0）→ preview 實測（16/16 卡片雙語、中/英/slug 搜尋、375px 手機版）。

### P1 — 段落／句子改用專屬播放 icon 觸發（避免誤觸）🎯　**完成：2026-06-10**

- **落地行為**：每個 speakable `<blockquote><p>` 行首 gutter 注入 ▶ button（唯一播放 trigger，段落本體點擊不再播放）；播放中切 ⏸ 可暫停；暫停顯示 ▶（resume 續播）＋ ↻（replay 從頭）；換段自動停舊段；Esc 全停。vocab table word cell 行為不變。
- **實作**：`app/src/scripts/speech.ts`（per-paragraph 狀態機 `pCtx` WeakMap、`setBtnState` 單一狀態出口）＋ `Layout.astro`（`.speak-btn` gutter 定位、`[hidden]` display 修正）。文字在 button 注入前取得，audio hash 與 manifest 完全相容。
- **驗證**：sonnet 實作 → 獨立驗收（抓到 Web Speech paused queue major bug）→ 修正 → live preview 全狀態機實測（play/pause/resume/replay/換段/Esc/卡拉 OK sidecar/vocab cell）→ /simplify 9 條清理。
- **留給 P2 的前置筆記**：播放狀態機可統一成 module-level 變數（目前 DOM `data-state` 為 read source）；sidecar 建議拆 `fetchSidecar(hash)` cache + `startTickLoop()` 讓 resume 不重 fetch、也方便卡拉 OK 升級。
