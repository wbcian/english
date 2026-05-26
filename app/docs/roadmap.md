# App Roadmap

> Astro lessons app 的未來迭代清單。新點子先丟 Backlog，動工挪到 In Progress，做完搬 Done。
> 結構欄位：**動機**（為什麼要做）／**期望行為**（做完長什麼樣）／**實作切點**（從哪下手）／**依賴 / 風險**。

---

## 🚧 In Progress

_（目前沒有正在做的）_

---

## 📋 Backlog

### P1 — 播放音訊時 highlight 當前段落／單字 🎧🔦

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
  - 需確認目前 audio ↔ DOM node 的關聯方式（hash-based manifest？data-attribute？）
  - 同頁多段同時播的競態 — 一次只 highlight 一個

### P2 — Vocab 卡片支援 filter（熟悉度 / 類別） 🔍

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

### P3 — Flash card 複習模式（SRS lite） 🃏

- **動機**：被動讀 vocab page 記不牢；active recall（看到 prompt 自己回想）才是長期記憶的關鍵。
- **期望行為**：
  - 新頁面 `/flashcards/`
  - 從 vocab pool 抽 N 張，**正面**：英文字 + 音訊播放按鈕；**背面**：中文 + 1 個例句
  - 自評三按鈕：**認識** / **模糊** / **忘了**
  - 結果寫回 `last_reviewed` / `review_count` / `proficiency`
    - 初版：純 `localStorage`，不動 markdown
    - v2：產生 patch 檔讓 Coach Max 套用回 markdown（避免前端寫檔的權限麻煩）
  - 跟 P2 整合：可以「只抽 ★1」「只抽 phrasal-verb」「只抽 30 天沒複習的」
- **實作切點**：
  - 新頁 `app/src/pages/flashcards/index.astro`（或同層）
  - 抽卡邏輯：先做隨機，之後換 SM-2 lite（依 `proficiency` + `last_reviewed` 加權）
  - 共用 P2 的 filter 元件
- **依賴 / 風險**：
  - **強烈建議先做 P2**，filter UI 共用
  - SRS 演算法不要過度設計，初版「隨機 + 三按鈕 + localStorage」就有 80% 價值
  - 寫回 markdown 的工程量遠大於前端 — 留到 v2 再決定要不要做

---

## 💡 Ideas（還沒排優先序）

_（隨時補）_

---

## ✅ Done

_（搬過來的歷史，附完成日期）_
