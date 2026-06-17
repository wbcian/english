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

> **🎯 本輪選定施作順序（2026-06-14 定）：P7 → P2 → P6 → P5**
> 經 2 個獨立 agent（依賴／重工 vs 價值／節奏視角）交叉討論後定案。要點：
> - ~~**P7 先**~~ → ✅ **2026-06-14 完成**（語速切換鈕，見 Done）
> - ~~**P2 次**~~ → ✅ **2026-06-14 完成**（卡拉 OK 已讀蔓延 trail；視覺定案 2 階 font-color 無背景，見 Done）
> - ~~**P6**~~ → ✅ **2026-06-15 完成**（編輯風改版：暖紙+rust/amber 拆色、serif 英文閱讀體、拿掉巢狀滾動框、EN/zh 雙聲部分流、reading spine；見 Done）
> - ~~**P5 壓軸**~~ → ✅ **2026-06-15 Step 1（A-minimal）完成**（依講者切換 TTS 聲音，build-only；見 Done）。Step 2（C-hybrid，結構保證不撞聲）視需要再做
> - 未納入本輪：P2.5、P3、P4（仍在 backlog）

| 順序 | Item | Effort | Depends on | 一句話 |
|---|---|---|---|---|
| ~~1~~ ✅ | ~~P2 — 播放時 highlight（含卡拉 OK 升級）~~ | S | P1 ✅ | **2026-06-14 完成**：已讀蔓延 trail（見 Done） |
| 2 | [P2.5 — Transcript inline vocab popup](#p25--transcript-段落-inline-vocab-popup---effort-m) | M | P1 ✅ | 閱讀流不中斷地查單字（最大閱讀體驗升級） |
| 3 | [P3 — Vocab filter（熟悉度 / 類別）](#p3--vocab-卡片支援-filter熟悉度--類別---effort-m) | M | — | 快速鎖定要複習的 vocab subset |
| 4 | [P4 — Flashcard SRS lite](#p4--flash-card-複習模式srs-lite---effort-l) | L | P3 | active recall；填齊 vocab → 複習迴圈 |
| ~~5~~ ✅ | ~~P5 — 依講者切換 TTS 聲音~~ | M | — | **2026-06-15 Step 1 完成**：build-only 多聲音路由（見 Done） |
| ~~6~~ ✅ | ~~P6 — UI 改版研究：整體閱讀體驗~~ | M | — | **2026-06-15 完成**：編輯風改版（見 Done） |

**排序理由**：
- ~~**P1 先做**~~ ✅ 2026-06-10 完成（見 Done）
- ~~**P1.5 緊跟（或並行）**~~ ✅ 2026-06-10 完成（見 Done）
- ~~**P7（本輪暖身速贏）**~~ ✅ 2026-06-14 完成（見 Done）
- ~~**P2（卡拉 OK 已讀蔓延）**~~ ✅ 2026-06-14 完成（見 Done）
- ~~**P6（編輯風 UI 改版）**~~ ✅ 2026-06-15 完成（見 Done）
- ~~**P5（依講者切換 TTS 聲音）**~~ ✅ 2026-06-15 Step 1 完成（見 Done）
- **P2.5**：靠 P1，M 的 popup（閱讀體驗最大躍升，但成本也最高）
- **P3 → P4 放最後**：vocab 子系統獨立於 lesson 閱讀流；先把 lesson 閱讀體驗閉環，再開 flashcard 戰場
- **不建議**：跳過 P1 直接做 P2／P2.5（trigger 不明確 → click 行為混亂 → 還是要回頭重構）

---

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

### P9 — 速度控制捲動後 sticky 顯示 🐢📌　**完成：2026-06-18**

> P7（語速切換鈕）的後續 slice。**不是**完整 sticky 播放 mini-bar（進度條/拖曳/transport）——那仍未做；本項只讓**速度控制**在捲動後跟著使用者。

- **落地行為**：頁面頂端維持原 header 速度控制；當 header 的 `.speed-control` 捲出視窗（`getBoundingClientRect().bottom <= 0`）→ 頂部 slide+fade 進一條 `fixed` 薄條，只含速度控制；捲回頂部 → 薄條收起（reveal-on-scroll，Cian 選定「看不到原控制才出現 sticky」）。薄條與 header 控制**共用同一份狀態**（`speedBtns` 單一陣列）：active 高亮同步、播放中即時變速、`localStorage` 記憶全沿用。手機 ≤640px 沿用既有斷點藏「速度」字樣＋縮鈕、薄條只放速度鈕（無 nav）。
- **實作**：`app/src/scripts/speech.ts`——抽出 `buildSpeedControl()`（建 DOM＋click 接 `setPlaybackRate`＋**push 進共用 `speedBtns`**，取代舊 `speedBtns = map(...)` 的「替換」寫法 → 雙處變單一狀態來源、`updateRateUI` 自動點亮兩處、`setPlaybackRate` 零改動）；`wireSpeedControl` 改用它注入 header；新增 `wireStickySpeedBar()`（建薄條、`buildSpeedControl()` 共用、append body）。**揭露：原 spec 寫 `IntersectionObserver`，但實作改用 rAF-throttled scroll/resize handler**——對齊 lesson page `reading-spine` 既有 wayfinding 模式（同一套「react to scroll」機制），且 IO 在無 compositor 的 headless 預覽根本不 fire、無法 live 驗。`init()` 內 `wireSpeedControl` → `wireStickySpeedBar` 順序保證薄條找得到 header `.speed-control`。`app/src/layouts/Layout.astro`——`.sticky-speed-bar`/`__inner` CSS（fixed `inset:0 0 auto 0`、z-40 在 `.reading-progress`(50) 之下、實心 `--bg`＋細下緣線、760px 置中靠右、slide+fade、`prefers-reduced-motion` 只 fade），薄條內沿用既有 `.speed-control`/`.speed-btn` 樣式。
- **驗證**：`astro check` 0 error、`astro build` 154 頁綠。**live preview 數值法**（headless 0×0 viewport → 先 `preview_resize` 給真 viewport）：① **單一狀態來源**——點 sticky 0.8× → header＋sticky 兩組同步亮 0.8×＋`localStorage`=0.8；點 header 1.25× → 兩組同步 1.25×（各組恰 1 顆 active）；② predicate 幾何——頂端 header bottom 54>0＝藏、捲動後 −1046≤0＝顯；③ 凍結 transition 讀 hidden/visible 終態——hidden（opacity 0、pointer none、slid up −36）／visible（opacity 1、pointer auto、top 0、整寬 1280、z-40）皆正確；④ 手機 390px——整寬、藏「速度」字、4 鈕靠右不溢出（末鈕 right 374 ≤ 390）。`/simplify` 4-agent：核心乾淨（`buildSpeedControl`/`speedBtns` 單一來源屬正確 altitude、rAF handler 與 reading-spine 同模式不值得抽共用、double `updateRateUI` 各點亮新增的一組非冗餘）；修了 3 條小項（CSS 註解殘留「IntersectionObserver」→ scroll handler、reduced-motion 多餘 transition override、speech.ts 註解過度宣稱 reading-spine 對應）。
- **headless 限制（未能 live 驗的部分）**：scroll 事件／`requestAnimationFrame`／CSS transition 在此 headless 預覽皆不 fire（0×0 viewport、無 compositor），故**實際捲動觸發的淡入動畫本身**無法在預覽內跑；但 predicate 邏輯＋hidden/visible 兩終態＋狀態同步＋RWD 皆已數值驗，且 reveal 用的是 reading-spine 同款已上線 rAF+scroll 模式。真機（含 Cian 的 iPhone）捲動體感待確認。
- **未做（留待）**：完整 sticky 播放 mini-bar（transport/進度條/拖曳）、z-index 四層（40/50/60/100，跨檔）收斂成 `--z-*` CSS 變數（simplify altitude 提的 latent fragility，跨三檔、本 slice 外）。

### P8 — 播放整篇（lesson 連播 / play-all）▶️📚　**完成：2026-06-16**

- **落地行為**：lesson 正文頂部一顆 `▶ 播放整篇`（idle 入口；vocab 頁不出現）。按下 → 依 DOM 順序連播所有 `blockquote > p.speakable`，每段自動 `scrollIntoView` 置中、`.speaking` 高亮＋卡拉 OK 自動沿用，多聲音由各段既有 mp3 自帶（dialogue 連播像一齣對白）。**控制 UI**：idle 頂部鈕；**播放中換成底部浮動控制**（`fixed`，沿用 no-voice toast 定位）——主鈕 morph `⏸`/`▶繼續` ＋ `■停止` ＋ `第 N / M 段` 進度，隨捲動恆可見；停止/播完收起回入口鈕（idle/active 互斥、狀態單一來源）。**中斷**：停止鈕 & Esc＝硬停（拆音回 idle）；手動點任一段/vocab 字＝軟離開連播（不碰音訊，交回該控制）；浮動列暫停＝凍結序列、再按從同段續播。
- **實作**：`app/src/scripts/speech.ts`——`speakText/playAudioFile/speakViaWebSpeech` 穿 `onDone?`（只在自然播完觸發：MP3 `ended`、WS 末段 `onend`、WS 無語音 early-return 跳過；error→WS fallback 帶下去；teardown 走 `error`/`teardownAudios` 故不誤觸）。module-level 編排器（`playAll*` 狀態 + `start/step/advance` + 共用 `resetPlayAll`；硬停＝reset+clearCurrent、軟離開＝`exitPlayAll`、Esc＝clearCurrent+exitPlayAll）。`handlePlayBtnClick/handleReplayBtnClick/wireOneSpeakableWord` 開頭軟離開。`/simplify` 抽出共用 `pauseCurrent`/`resumeCurrent`（單段與連播暫停/續播同一份，含 karaoke restart）。`app/src/layouts/Layout.astro`——`.play-all-*` CSS。**per-clip 機制（hash/karaoke/manifest/sidecar）零改動**，純疊一層。
- **驗證**：`astro check` 0 error、`astro build` 154 頁綠。live preview 全狀態機實測（stub Audio 驅動 + 真音檔）：起播→11 段逐段前進→最後一段自然收尾回 idle、停止鈕、Esc、中途點單段＝軟離開且改播該段、浮動列暫停/續播 morph；**真音檔 E2E**：第 1 段播放（currentTime 前進）→ seek 近結尾自然 `ended` → 自動進第 2 段新 clip（換 Izzy en-GB 聲音）。亮色截圖確認入口 amber pill 與底部浮動列。`/simplify` 4-agent（抽 pause/resume 共用 helper、去重複 progress 呼叫；其餘評估後維持）。
- **v1.1 微調（同日）**：入口鈕改 **icon-only**（`▶` 圓鈕）且**常駐不隱藏**——原本播放時隱藏入口鈕會讓正文 reflow 晃動，改成只有 `position:fixed` 浮動列出現/消失、入口維持原位（播放中點它＝no-op，靠 `startPlayAll` guard）。浮動列加「**◎ 回到播放位置**」鈕：使用者來回捲動後一鍵把正在播的段落捲回畫面中央（與 auto-advance 共用 `scrollToCurrent`）。`/simplify` 4-agent 全 no findings。
- **v1.2 微調（同日）**：入口鈕移到 `.lesson-meta`（日期·分級那列）尾端、縮成 23px 小圓鈕（`flex:none` 防壓縮）＝不再佔獨立一行；段落 inline 播放鈕略放大（`--speak-btn-w` 1.15→1.3em、字 0.85→0.95em）；**暫停時 reset（↻）改疊在 play（▶）正下方**（原本並排），用共用 `--speak-stack` 鏡像偏移 + transform transition 帶滑出動畫。`/simplify` 移除 dead `vertical-align`、把疊放偏移收斂成 `--speak-stack` 變數。live preview 數值＋截圖驗（meta 列 23×23、replay 在 play 下方同欄、inline 字 16px）。
- **v1.3 微調（同日）**：段落 inline 控制多一顆 **stop（■）**——idle 只 ▶、playing ⏸＋■、paused ▶＋↻＋■，三鈕改用 `.speak-btns` **flex-column 容器**自動置中可見集（取代舊 magic-offset、順手退掉 `--speak-stack`，1/2/3 顆都不用 per-state CSS）。入口鈕改回**點擊後消失**、狀態交由浮動 bar（在 `.lesson-meta` 列尾端隱藏 → 實測 titleShift 0px、無 reflow）。`/simplify` 把 stop／Esc／bar／resume-reject 四處硬停統一成 `hardStop()`。實測：單段 stop→idle、Esc→idle、連播中點段 stop→離開序列＋停＋入口復原；3 鈕堆疊不重疊、同欄、貼右 gutter。
- **v1.4 微調（同日）**：連播時**藏掉段落 inline 控制**（`body.play-all-active` class + CSS 把 `.speak-btns` `display:none`；container 是 `position:absolute` → 0 reflow）——消滅「正在播段落 inline 鈕跟著閃 ⏸＋■、沿頁面移動」的雜訊與「兩個 ⏸」（inline 離開連播 vs bar 暫停序列）混淆；正在播純靠 amber 邊條＋捲動＋karaoke＋浮動 bar。順手**修掉一個潛藏 bug**：入口鈕 `.hidden=true` 其實沒生效——`.play-all-entry` 的 `display:inline-flex` 蓋掉 UA `[hidden]{display:none}`（跟 `.speak-btn[hidden]`/`.play-all-bar[hidden]` 同坑），補 `.play-all-entry[hidden]{display:none}` → 連播時入口鈕**真的消失**（實測 computed display=none、titleShift 0）。教訓：驗 hide 要看 computed display，不能只看 `.hidden` attr。
- **v1.5 微調（同日）**：**移除段落 replay（↻）鈕**——`stop → play` 本來就等於從頭重播，replay 多餘；拿掉後單段控制全站一致（只剩 play/pause ＋ stop）：idle ▶、playing ⏸＋■、paused ▶＋■。純刪除（replayBtn／`handleReplayBtnClick`／`ctx.replay`／setBtnState replay 分支／listener），flex 容器照舊（現在堆 1/2 顆）。`/simplify` 確認 clean removal、順手清掉一條孤兒註解。實測：容器剩 2 鈕、無 ↻、各狀態正確。
- **未做（留待）**：完整 sticky mini-bar（整篇進度條/拖曳）、跨 lesson 連播。

### P5 — 依講者切換 TTS 聲音 🎙️（Step 1：A-minimal）　**完成：2026-06-15**

- **研究**：11-agent workflow（msedge 聲音 survey／替代引擎比較／架構驗證 × 外部事實雙輪交叉驗證 × 3 方案設計 × 對抗式查證）。揭露 roadmap 原樂觀假設的反例：**音檔 hash 只吃文字、講者被剝掉**，所以「不影響 runtime」只在「沒有兩講者共用逐字相同文字」時成立。Cian 裁決：**兩步走先做 A-minimal**（build-only、runtime 零改動、可逆）、引擎留 **msedge-tts**、**多口音配音表**、clip/非真人來源留 Aria 旁白。
- **落地行為（build-only）**：`generate-audio.mjs` 解析 blockquote 開頭粗體講者標籤 → 查 `app/src/data/speaker-voices.json`（11 角色配音表，全 WordBoundary 安全的標準聲音）指派聲音合成。**hash 仍 text-only → `speech.ts`／manifest／rehype／drift guard 一律不動**，換的只是 `audio/<hash>.mp3` 的聲音 bytes。新增：`speakerSegments`/`resolveVoice`（漸進比對「已知卡司」，非講者粗體自然落到 Aria，毋需 deny-list）、per-voice client cache、`--revoice` flag（force-delete 非預設聲音 clip 再重生）、voice collision `console.warn`。配音：Aria 旁白基準＋ethan/lenny/zane 美男、cat/ksenia/izzy 跨英澳女、front desk/receptionist/guest/guest(cian) 各分配。
- **已知限制（接受，Step 2 再解）**：兩講者逐字相同文字會撞同一 mp3、只能一個聲音（先到者勝，`console.warn`；今天語料 0 例）。一段含多講者的段落整段用第一講者聲音。結構保證不撞需把 voice 折進 key（runtime 也要改）＝ **Step 2 C-hybrid**，視需要再做。
- **驗證**：parser fixture 42 個實際標籤＋override 全綠（`npm run test:speaker`）；`--revoice --words=learning-styles` 一鍵重生 **140 個 dialogue mp3（0 fail／0 degrade）＋ learning-styles 7 個卡拉 OK sidecar**；`check:hash-sync` 11+11 綠；`astro build` 154 頁、generated=0；manifest 915；learning-styles 卡拉 OK 以 live preview 數值法驗 4 個 sidecar（span 數吻合、onset 單調遞增、maxOnset < 新音檔時長＝timing 綁新聲音）；0 collision 警告；`/simplify` 4-agent（抽 `leadingStrong` helper、`resolveVoice` 去死 slug＋單次 lookup）。
- **未做（out of scope）**：Step 2 C-hybrid（voice-aware key）、多講者段落拆段、孤兒 mp3 清理（既有 ~400，與本功能無關）、Azure F0 遷移（留作備援）。

### P6 — UI 改版：編輯風閱讀體驗 🎨　**完成：2026-06-15**

- **研究**：3 designer（編輯排版／資訊架構／低風險打磨）× senior frontend × architecture 交叉討論，產出 3 份可比較的 HTML mock + 可行性審查。Cian 裁決：方向 A（編輯雜誌風／暖紙）、拿掉巢狀滾動框、**系統字型**（不引 web font）、第二色用 **rust**（讓 amber 專屬音訊）。
- **落地行為（分階段提交）**：
  - **Phase 1（design tokens）**：暖紙配色（light `--bg #f7f3ea` / dark `#1b1916`）；**色彩語法**＝amber 音訊（播放鈕/trail/播放中左條）、rust `--accent` 導覽/品牌/連結/focus（light `#9a3b12` / dark terracotta `#e2875a`）、CEFR scale 難度（唯一多色例外）。`--speak-highlight` 拆出 `--pill-bg/--pill-fg`（badge/tab count/pos 品牌膠囊），amber wash 僅留 word-tap 播放。系統 serif 英文閱讀體（`--font-en` Charter/Iowan）、編輯型 type scale（serif H1、`article h2` 小字母 rust section label）、表格去密、`#1a1a1a`→`--on-speak` token。全站（index/vocab/lesson）一次到位。
  - **Phase 2（結構）**：16 篇 lesson 移除 `<div class="lesson-body-scroll">`，正文 blockquote 順流（消滅滾動中滾動、卡拉 OK 亮字不再被切到框外）；新增 `inject-lang.mjs`（build 時對英文 blockquote 蓋 `lang="en"`）驅動 **EN/zh 雙聲部分流**（英文 serif 主聲部、中譯較淡較小 sans 副聲部）；lesson page 加頂部閱讀進度條 + 左側 scroll-spy reading spine（由 `h2[id]` 動態建、≥1200px 顯示、窄螢幕收成進度條）。
- **karaoke 凍結契約零更動**：`blockquote>p`/`.w`/`data-wi`/`.speaking`/`.is-played-word`/`.speak-btn`/內容定址 hash 全未動；改版只動顏色/字型/版面/IA。`inject-lang` 只加 `lang` 屬性、不碰文字 ⇒ 零 hash drift。
- **驗證**：每階段 `astro build` 154 頁綠燈、`check-audio-hash-sync` 11+11 parity OK、`generated=0`；亮/暗/手機 × 簡單與密集（9–11 模組）lesson 實機 preview（spine、EN/zh、trail CSS、卡片標題無 regression）；每筆 commit 前 `/simplify` 4-agent 全綠。
- **明確未做（out of scope）**：web font（Cian 選系統字）、sticky 播放 mini-bar（需在 speech.ts 加 additive event，另開 slice）、整課連播 auto-advance。配色微調空間：rust/amber 在暗色下色相較近，日後可再評估。

### P2 — 播放音訊時逐字 highlight（卡拉 OK 已讀蔓延）🎧🔦　**完成：2026-06-14**

- **落地行為**：MP3 路徑播放時，逐字 highlight 從「只亮當前一個字」升級為**已讀蔓延 trail**，邊界隨 `audio.currentTime` 逐字向前蔓延（落實 2026-06-10 Cian 回饋）。pause 凍結整條 trail、resume 從凍結處續進、ended／Esc／replay／換段全清。無 sidecar 的 clip 優雅降級（不誤亮）。
  - **視覺定案（同日，2 designer 討論後）**：由初版「三段式＋背景色」改為 **2 階・純 font color・無背景**（Cian 回饋「3 階太雜、背景拿掉」）。已讀字＝ amber 文字（`--speak-read` 亮 `#9a5b06`／暗 `#fbbf24`）、未讀字＝一般 `--fg`；當前字併入已讀（用顏色邊界當播放位置，不再有單獨當前字高亮）。段落 `.speaking` 背景 wash 移除，改用**左側 amber 邊條**：可朗讀段落預設 dim（40%）、播放中變亮變粗（4px 實心 `--speak-accent`）——同時是無 sidecar 段落唯一的「正在播」提示。
- **實作**：`app/src/scripts/speech.ts`——以 `trailSpans`（clip 的 `.w` DOM 陣列）+ `litIndex`（current 字 DOM index）取代舊單一 `currentWordSpan`；`tick` 改用 binary-search 求 index 後**依 DOM range delta 上色**（補前進跳格與未對齊標點 span，trail 連續）；新增 `setWordTier` helper（`classList.toggle` 冪等、不重觸 transition）；新增 `highlightGen` generation token，讓 resume／rapid replay 的舊 fetch／tick 被新呼叫取代後自我作廢（修掉「pending fetch 期間 resume 會疊出第二條 RAF tick」的孤兒迴圈，對抗式 review 抓到、屬 P1 早先預留待辦）。`app/src/layouts/Layout.astro`——2 階 font-color：`.is-played-word`／`.is-current-word` 同列 → `color: var(--speak-read)`（新增 `--speak-read` 變數）；`.w` 只 transition `color`；段落 `.speakable` 邊條改 dim 預設 + `.speaking` 變 4px 實心。speech.ts 的 `setWordTier` 仍區分 current/played，但兩 class 渲染同色 → 3 階折成 2 階零 runtime 改動。**sidecar / manifest / 產音腳本未動**，DOM textContent 不變 → 零 hash drift。
- **驗證**：`astro build` 154 頁綠燈（含 `inject-word-spans` hash 斷言 + `check-audio-hash-sync` parity）＋ live preview 真實點擊播放（此環境未擋 `play()`）實測：trail 多輪取樣「恰一個 current／已亮 span 為連續前綴／current 在邊界／進度單調」全綠；pause 凍結、resume 從暫停點 7→39→45 續進不重置、rapid pause/resume churn 後狀態仍有效、ended/Esc/replay 全清、無 sidecar lesson 降級無 console error；視覺截圖確認可辨且不搶戲。經 `/simplify`（抽 `setWordTier`）＋ 對抗式正確性 review（6 面向，修掉 1 條 stacked-tick）。2 階配色改版另以亮/暗截圖驗證（已讀 amber / 未讀一般、無背景、邊條 dim↔亮）。
- **備註**：配色已定為 2 階 font-color（見上）；**P6 UI 研究**再評估是否微調 amber 深淺與播放鈕視覺。**次要待辦未做**：vocab table cell（`<td>`）逐字同步 highlight（cell 多為單字／短語，逐字意義小，留待評估）。⚠️ **P5 之後**重生 dialogue mp3 時，對應 lesson 的 `.words.json` 要連帶刪除重生，否則卡拉 OK timing 會靜默對不上。
- **後續：全面鋪開（2026-06-16 完成）**：把 pilot（只有 learning-styles 11 sidecar）擴展到**全部內容**並設為 build 預設。`generate-audio.mjs` 新增 `--words-all`（為每個可朗讀段落產 sidecar，取代脆弱的 `--words=<日期子字串>`），接進 `predev`/`prebuild`＋新 `audio:gen:all`／`audio:revoice` 也帶 `--words-all` → 未來新 lesson/vocab 自動有 karaoke、不退化；`--revoice --words-all` 一次重生 mp3＋sidecar 保證對齊（消滅上面 ⚠️ footgun）。**回填 +514 sidecar**：16 篇 lessons（237/243 段）＋ 136 vocab 例句頁（294/302 段）；**純加法**（0 mp3 變更、0 manifest 變更，`synthesizeToFile` 不覆蓋既有 mp3）。14 段對齊 <85% 安全退化為整段高亮。**驗證**：`astro build` 154 頁綠、`generated=0`、hash-sync 11+11 綠、prune 0 orphan；live preview 數值法全庫掃 — **0 個 `sidecar.n≠DOM .w span` 不匹配**（speech.ts 接受 sidecar 的硬條件），onset 單調，sidecar 結尾對實際 mp3 時長差恆 **~0.87s（與基準篇 learning-styles 一致）→ 無跨合成 drift**；`/simplify` 4-agent（修掉「vocab 被排除」的錯誤註解）。**已知小尾巴（未做）**：那 14 段 degraded 因為沒寫 sidecar，每次 build 會被 `--words-all` 重 synth 一次（網路、soft-fail、不影響輸出）；可加 degrade marker（哨兵檔）讓它們被 skip，待評估。

### P7 — 播放語速切換 UI（實驗）🐢⚡　**完成：2026-06-14**

- **落地行為**：header nav 右側注入語速切換鈕（0.8× / 1× / 1.1× / 1.25×，4 顆全保留），選擇即時生效並存 localStorage（`englishApp:playbackRate`，預設 1.0×）；MP3 路徑套 `audio.playbackRate`（含播放中即時變速）、Web Speech 套 `u.rate`（取代舊死值 0.95，下一次播放生效）。卡拉 OK sidecar **維持單一份**——onset 與 `audio.currentTime` 同屬媒體時間軸，`playbackRate` 只改 wall-clock，兩者一起縮放，任何速度都對得上。
- **實作**：`app/src/scripts/speech.ts`（rate 單一狀態 + `setPlaybackRate` + `wireSpeedControl` 注入）＋ `app/src/layouts/Layout.astro`（`.speed-control`/`.speed-btn` CSS，沿用 amber 視覺語言）。sidecar / manifest / 產音腳本未動。
- **驗證**：preview 實測（4 鈕渲染桌面/手機 375px/暗色、rate→MP3 plumbing、選值持久化 reload 還原）＋ 真實 sidecar 數值驗證卡拉 OK 速度無關（各位置 onset ≤ currentTime < 次字 onset、逐字遞增）＋ `astro build` 154 頁綠燈 ＋ /simplify（去死 fallback CSS、去 `as const` 雙轉型、`{btn,rate}` pair 免 round-trip）＋ 對抗式正確性 review。
- **備註**：自動化 preview 的 Chrome 擋 `play()`（gesture 在 `await` 後失效＋背景分頁省電），故未在 preview 內實際出聲；真人點擊不受影響（播放本就在用）。最終值維持預設 1.0×（Cian 實聽 OK、4 速度鈕全保留）。

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
