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

### P1 — 段落／句子改用專屬播放 icon 觸發（避免誤觸）🎯　**Effort: S**

- **動機**：目前點長段落任一位置都會觸發播放，常常我只是想點某個單字看意思就誤播了。
- **期望行為**：
  - 每段 `<blockquote><p>` 左側（或行首 inline）放一個 ▶ icon，**只有點 icon 才播放**
  - 段落本體點擊行為改回「啥都不做」（或留給未來的「點字查 vocab」）
  - vocab table 內 word cell 維持原本點擊播放（單字短，沒誤觸問題）
  - 播放中 icon 切成 ⏸，可暫停
- **實作切點**：
  - 找音訊觸發的 event handler（推測掛在 `<p>` 或 `<blockquote>`）
  - 改成「掛在 icon 元素上」；icon 用純 CSS / SVG 即可，不引新 lib
  - 段落 hover 時 icon 可以微微顯眼（讓你知道哪段可播）
- **依賴 / 風險**：
  - 這項是 P2 highlight 的天然 prereq — 有了明確 trigger 元素，P2 要 highlight 哪段就一清二楚
  - 視覺位置會影響 layout（icon 在行首 vs 段落上方），需要看排版適應

### P2 — 播放音訊時 highlight 當前段落／單字 🎧🔦　**Effort: S**

- **動機**：長段落 audio 播到一半，讀者不知道對應到逐字稿哪一句。跟讀（shadowing）時尤其卡。
- **期望行為**：
  - 播 `<blockquote><p>` 整段時，該 `<p>` 加 active 樣式（背景色或左 border 強調），播完／暫停／切換段落自動清掉
  - 播 vocab table 內某 cell 時，該 `<tr>` 或 `<td>` 同步 highlight
  - 視覺要明顯但別搶戲（建議：左側 4px accent border + 淡淡背景）
- **實作切點**：
  - 找音訊播放的入口（推測在 `app/src/scripts/` 或元件級 inline script）
  - 綁 `audio` 元素的 `play` / `pause` / `ended` 事件 → 在對應 DOM node 上 toggle `.is-playing` class
  - CSS 在全域樣式表加 `.is-playing` 規則
- **依賴 / 風險**：
  - **強烈建議 P1 先做**：P1 引入明確的 trigger icon，這裡 highlight 哪段才有明確錨點
  - 需確認目前 audio ↔ DOM node 的關聯方式（hash-based manifest？data-attribute？）
  - 同頁多段同時播的競態 — 一次只 highlight 一個

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

---

## 💡 Ideas（還沒排優先序）

_（隨時補）_

---

## ✅ Done

_（搬過來的歷史，附完成日期）_
