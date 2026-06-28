# Cian's English Brain

> 給讀到此資料夾的 LLM：這是索引，不是資料本體。先看完此份再決定要展開哪些檔案。
> **不要** Read 整個 `vocab/` 目錄；只在使用者問特定字、需要更新、或要做整體統計時才開單檔。

## 學習者
- 名稱：Cian（暱稱 Benson / Mr. Wu）
- 教練：Coach Max（persona 定義在 `.claude/skills/english-tutor/SKILL.md`）
- 詳細 Profile → [PROFILE.md](PROFILE.md)

## 快照（隨更新同步）
- 已收錄單字：160
- 5★ 精熟：0　 3–4★ 學習中：8　 1–2★ 新／脆弱：152
- 最近活動日期：2026-06-28（📚 **新增單字：triage**：Cian 傳單字 `triage` 想學 → /ˈtriːɑːʒ/、n./v.、檢傷分類／按輕重緩急排序處理。源自法文（`-age` 念 /ɑːʒ/）、原為戰場與急診室用語，現大量借入 tech／business（`triage bugs`／`tickets`／`inbox`）；辨析 vs prioritize／sort（多一層「資源不夠、必須取捨」的緊迫感）。小插曲：Coach Max 一開始把 `triage` 當指令、真的對 repo 做了一輪分流，才發現是要學這字。★1，雙語例句＋ `_index` 同步。詞庫 159→160）
- 上一活動日期：2026-06-25（📚 **Lesson 複習 Q&A：《The Devil Wears Prada》第一天**：Cian 在自學頁面後問 8 個不熟點 → 拆解 chopping block（vs on the line）、roll to voicemail（`roll (over) to`＝自動轉接／續轉）、yet（轉折＝however，≠ not yet）、get to（有幸／得以，對比 have to）、couture、divine、skim，並釐清 `sliced her hand open` 的 `open` 是**形容詞**（結果補語 `動詞+受詞+形容詞`）、整句沒省略連接詞（`because` 即是）。**新增 6 字**：get to／roll over to／yet／skim／divine／couture（全 ★1，雙語例句＋ `_index` 同步）；**複習** on the chopping block（★1，review_count 1→2）。Lesson 補 3 Key Vocab（get to／roll to voicemail／yet）＋ Sentence Anatomy #3（結果補語 slice…open）＋ Cultural Notes（skim 略讀義／get to vs have to／yet 轉折）。詞庫 153→**159**）
- 上二活動日期：2026-06-23（🔧 **review＋修《The Devil Wears Prada》lesson**：對照原片字幕 + final-film transcript 雙來源查證 → 拆開被合併的 `Oh, Emily? What do I do—`（Andy）／`Deal with it.`（Emily）對白、查證第 5 句 `Got it.`（確認是 Emily）、補 `figure it out`（詞庫 152→**153**）＋「順帶認得」被動字 appointments/expenses/divine/fall。🎙️ **App：per-speaker prosody 上線**——`speaker_voices` 值可寫 `{voice,rate,pitch}` 物件把語速/音高烤進合成（build-only、hash text-only、karaoke 零改動）；本篇 Emily＝en-GB Sonia +10%語速/+4%音高（連珠炮主管）、Andy＝en-US Jenny → dialogue 變兩個人。astro check 0 error、build 172 頁綠、karaoke 11/11 數值驗、byte-exact 證明烤進真檔。免費 Edge 只有 prosody，真情緒 style 需付費 Azure → 評估進 roadmap P10）
- 上三活動日期：2026-06-23（🎧 **新 lesson：《The Devil Wears Prada》— Miranda 的地獄級第一天**（dialogue · B2）＋ 📚 **新增 11 個單字／片語**：skimmed milk、drip coffee、run errands、deal with it、fling、foam、man（動詞）、searing、chained to、on the line、on the chopping block。依 RealLife English / Ksenia 字幕截圖整理咖啡訂單、辦公室值守、跑腿分工與工作風險；全 ★1，建檔＋雙語例句＋ `_index.md` 同步，並做 `on the line` vs `on the chopping block` 辨析。詞庫 141→152）
- 上四活動日期：2026-06-18（🐢 **App roadmap P9：速度控制捲動後 sticky 顯示上線**＋順手修 iPhone 播放鈕變 emoji。**P9**：P7 語速鈕只在頂部 header、往下捲就用不到 → 需求「任何時候都能調速度」。落地 reveal-on-scroll：頂端維持原 header 控制，當它捲出視窗（`getBoundingClientRect().bottom<=0`）→ 頂部 slide+fade 進一條 `fixed` 薄條只含速度控制、捲回收起。**單一狀態來源**＝抽 `buildSpeedControl()` 讓 header＋sticky 兩組速度鈕 push 進同一 `speedBtns` 陣列 → `updateRateUI` 自動同步、`setPlaybackRate` 零改動（點任一組都同步另一組＋localStorage，數值法實測）。reveal 用 rAF-throttled scroll handler（對齊 lesson `reading-spine` 既有模式；原 spec 寫 IntersectionObserver，因 headless 不 fire＋與既有模式一致而改）。`Layout.astro` 加 `.sticky-speed-bar` CSS（z-40 在進度線之下、760px 置中靠右、reduced-motion 只 fade、≤640px 藏「速度」字）。brainstorm 定方案 → spec 進 roadmap → 實作 → live preview 數值驗（**headless 0×0 viewport 需先 `preview_resize` 給真 viewport**；scroll/rAF/transition 在 headless 不 fire → 實際捲動淡入動畫待真機 iPhone 確認，但 predicate＋hidden/visible 兩終態＋狀態同步＋RWD 390px 皆已數值驗）→ `/simplify` 4-agent（核心乾淨、修 3 條小註解/CSS）。`astro check` 0 error、build 154 頁綠。**iPhone emoji 修正**：`▶ ⏸ ■` 原 Unicode glyph 用 `textContent` → iOS emoji presentation 變彩色 emoji；改 inline SVG（`fill=currentColor` 繼承主題色、`.ctl-icon` 自帶尺寸）根治。未做：完整 sticky 播放 mini-bar（transport/進度條/拖曳）、z-index 四層收斂成 `--z-*` 變數）
- 上五活動日期：2026-06-16（▶️ **App P8 播放整篇（lesson 連播 / play-all）上線**：lesson 正文頂部 `▶ 播放整篇` → 依 DOM 順序連播所有英文正文段落，每段自動置中捲動＋`.speaking` 高亮＋卡拉 OK 沿用、多聲音由各段既有 mp3 自帶（dialogue 像一齣對白）。控制：idle 頂部鈕、**播放中換底部浮動控制**（`fixed` 沿用 no-voice toast 定位；主鈕 morph `⏸`/`▶繼續` ＋ `■停止` ＋ `第 N/M 段`，隨捲動恆可見），idle/active 互斥。中斷：停止鈕/Esc＝硬停拆音、手動點單段/vocab 字＝**軟離開連播**（不碰音訊交回該控制）、浮動列暫停＝凍結從同段續播。實作純疊一層編排器在現有 per-clip 播放上：`speech.ts` 三個 playback fn 穿 `onDone?`（**只在自然播完觸發**，teardown 走 error/teardownAudios 不誤觸）+ module 編排器（`start/step/advance` + 共用 `resetPlayAll`）+ 三手動入口開頭軟離開；**hash/karaoke/manifest/sidecar 零改動**。`Layout.astro` 加 `.play-all-*` CSS。先 brainstorm（按鈕擺法/scroll 可見性/中斷策略逐一定案）→ 實作 → live preview 全狀態機＋**真音檔 E2E**（第1段播放→自然 ended→自動進第2段換 Izzy en-GB 聲音）→ `/simplify`（抽共用 `pauseCurrent`/`resumeCurrent`、去重複 progress）。astro check 0 error、build 154 頁綠。未做：完整 sticky mini-bar、跨 lesson 連播）
- 上六活動日期：2026-06-16（🛠️ **卡拉 OK 蔓延全面鋪開＋設為 build 預設**（接 roadmap P2 pilot→全站）：逐字「已讀蔓延」trail 從只有 `learning-styles`（11 sidecar）擴到**全部可朗讀內容**。`generate-audio.mjs` 加 `--words-all`（每段都產 `.words.json` timing sidecar，取代脆弱的 `--words=<日期子字串>`），接進 `predev`/`prebuild` ＋ `audio:gen:all`／`audio:revoice` 也帶 `--words-all` → 未來新 lesson/vocab 自動有 karaoke 不退化、`--revoice --words-all` 一次重生 mp3＋sidecar 保證對齊。**回填 +514 sidecar**：16 篇 lessons（237/243 段）＋ 136 vocab 例句頁（294/302 段）；**純加法**（0 mp3 變更、0 manifest 變更——`synthesizeToFile` 不覆蓋既有 mp3、只重抓 WordBoundary）。14 段對齊 <85% 安全退化整段高亮。驗證：`astro build` 154 頁綠 generated=0、hash-sync 11+11、prune 0 orphan；live preview 數值法全庫掃 **0 個 `sidecar.n≠DOM span` 不匹配**、onset 單調、sidecar 結尾對實際 mp3 時長差恆 **~0.87s（與基準篇 learning-styles 一致）＝無跨合成 drift**；`/simplify` 4-agent（修掉「vocab 被排除」錯誤註解）。Cian 裁決保留 vocab 例句 karaoke（全站一致）。已知小尾巴：14 degraded 段每次 build 被 `--words-all` 重 synth 一次（網路 soft-fail、不影響輸出），可加 degrade marker 哨兵省掉、待評估）
- 上七活動日期：2026-06-15（🎙️ App roadmap **P5 依講者切換 TTS 聲音 Step 1（A-minimal）上線**：11-agent workflow（msedge 聲音 survey／替代引擎／架構驗證 × 外部事實雙輪交叉驗證 × 3 方案 × 對抗式查證）揭露反例——**音檔 hash 只吃文字、講者被剝掉**，故「不影響 runtime」只在無逐字同文字碰撞時成立。Cian 裁決：**兩步走先 A-minimal**（build-only、runtime 零改動、可逆）、引擎留 **msedge-tts**、**多口音配音表**。`generate-audio.mjs` 解析開頭粗體講者 → 查新 `app/src/data/speaker-voices.json`（11 角色、全 WordBoundary-safe 標準聲音）指派聲音；新增 `speakerSegments`/`resolveVoice`（漸進比對「已知卡司」，非講者自然落 Aria，無 deny-list）、per-voice client cache、`--revoice` flag、collision `console.warn`。**hash 仍 text-only → `speech.ts`／manifest／rehype／drift guard 一律不動**。驗證：parser fixture 42 標籤全綠、`--revoice --words=learning-styles` 重生 **140 mp3（0 fail）＋ 7 卡拉 OK sidecar**、hash-sync 11+11 綠、`astro build` 154 頁 generated=0、learning-styles 卡拉 OK live preview 數值法驗（onset 綁新聲音時長）、0 碰撞、`/simplify` 全綠。**已知限制（Step 2 再解）**：兩講者逐字同文字撞一個聲音（今天 0 例、會 warn）、多講者段落整段第一聲音。**下一棒可選 P5 Step 2（C-hybrid 結構保證不撞）或 P2.5/P3/P4**）
- 主目標：**TOEIC 750+ 證書**（詳見 [PROFILE.md](PROFILE.md#目標)）
- **Lesson 格式（2026-05-29 換軸）**：`track`(reading/dialogue/talk) + `audio` 取代舊 `format`；Source→標題下 subtitle、正文雙語 blockquote 順流（P6 移除滾動框）、Key Vocab 緊接正文後 — 規範見 [`lessons/_conventions.md`](lessons/_conventions.md)
- 最近 lesson：**[The Devil Wears Prada — Miranda 的地獄級第一天](lessons/2026-06-23-the-devil-wears-prada-first-day.md)**（dialogue · B2 · RealLife English / Ksenia 字幕截圖）— 咖啡訂單、辦公室值守、跑腿分工與工作風險；11 個新表達 skimmed milk / drip coffee / run errands / deal with it / fling / foam / man / searing / chained to / on the line / on the chopping block；Sentence Anatomy 對準 `be chained to` 被動結構與 `if + 現在式` 後果句
- 上一份 lesson：**[Anne With An E — 直言不諱、對質 Billy](lessons/2026-06-09-anne-with-an-e-speak-your-mind.md)**（dialogue · B2 · 影片英文教學 Ksenia 用 Netflix 影集派對場景教 7 字）— 主題「為人挺身而出／吵架理直氣壯」＋現代高價值字 consent；Sentence Anatomy 對準 `shouldn't have + p.p.` 與 `How dare you + V`
- 上二份 lesson：**[Learning Styles 是迷思 — 順便偷學連音](lessons/2026-06-01-learning-styles-connected-speech.md)**（dialogue · Izzy's English 用 Veritasium 影片做的 ~2.5 min 微課）— 首份**以發音／連音為主菜**的 lesson：縮音表（nt→n 脫 T／au=/ɔː/／s→/ʒ/）＋連音表（look it over→"loo-ki-tover"）；vocab 交叉連結 hands-on/debunk，新加 look something over · engage with
- 上一份 lesson：**日本住宿 Hotel Check-in 對話三部曲**（dialogue · 旅遊實戰）：[Part 1 報到・證件・房型](lessons/2026-05-31-japan-hotel-checkin-part-1-arrival.md) + [Part 2 付款・宿泊税・設施](lessons/2026-05-31-japan-hotel-checkin-part-2-amenities.md) + [Part 3 客訴・退房・宅配](lessons/2026-05-31-japan-hotel-checkin-part-3-checkout.md)（Coach Max 原創情境；Cultural Notes 含護照影印法規／宿泊税／takkyubin；Series Map 用一般清單避免中文被誤朗讀）
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
- [`reference/cefr-toeic-levels.md`](reference/cefr-toeic-levels.md) — 英文分級制度對照表（CEFR ↔ TOEIC / IELTS / TOEFL / Cambridge / GEPT）；lesson `level` 欄與 app badge 的依據
- [`reference/cefr-leveling-process.md`](reference/cefr-leveling-process.md) — **lesson 分級評估 SOP**（怎麼給 `level`：錨點、判準、B2/C1 決策、assessor prompt 範本）；新 lesson 標 level 一律照這套

## 給 LLM 的維護規則

1. **新單字** → 建立 `vocab/<word>.md`、在 `vocab/_index.md` 加一列、`ACTIVITY.md` 頂端加一行
2. **舊單字再現** → 在該檔 `## Encounters` 補日期、更新 frontmatter 的 `last_reviewed` 與 `review_count`，視情況調 `proficiency`，並同步 `_index.md`
3. **寫作 / 對話** → 對應資料夾；檔名 `YYYY-MM-DD-<topic>.md`；`ACTIVITY.md` 加一行
4. **長文／字幕／文章／podcast** → 整理到 `lessons/YYYY-MM-DD-<topic>.md`，依**語流結構**標 `track`（規範與模組 MUST/MAY 表見 [`lessons/_conventions.md`](lessons/_conventions.md)，那是唯一事實來源）：
   - 多人輪流對話（訪談、影劇/電影對白）→ `track: dialogue`
   - 單人連續輸出（個人 podcast、旁白、演講、歌曲）→ `track: talk`
   - 以閱讀／解題為意圖的文字（essay、newsletter、雜誌短文，含朗讀型如 grasse）→ `track: reading`
   - 另標 `audio: true/false`（原始素材有無真人聲音；**純元資料、不影響朗讀**）
   - 版面：Source 降為標題下一行 `<p class="lesson-subtitle">` 小字、正文雙語 blockquote 順流（P6 移除固定高度滾動框）、Key Vocab 緊接正文後（細節見規範）
   - 只有當使用者明確說「轉成 magazine」、「雜誌風格」、「HTML 版」等才產 HTML
5. **Lesson speakable 規範** → 寫 lesson 時遵守 [`lessons/_conventions.md`](lessons/_conventions.md)：英文 blockquote 不混中文、vocab 可朗讀欄表頭一律 lowercase `word`、講者標籤放 blockquote 開頭粗體、`<details>` 內 blockquote 前後留 markdown 空行、同系列同日期補 `part:`。`app/` 依 markdown DOM 結構（blockquote + `word` 欄）判斷朗讀，**與 frontmatter 無關**
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
