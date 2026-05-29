# 活動時間軸

> 最新在最上面。每次有學習活動就在頂端 prepend 一筆。
> 圖示慣例：✏️ 寫作　📚 新字／單字複習　💬 對話　🎧 Lesson／podcast　🎯 設定目標／更新 Profile

---

## 2026-05-28
- 🛠️ **新增 reading lesson 格式**（reading lesson vs podcast lesson 分流）：派 3 隻 agents 從 content design / system architecture / learner ergonomics 討論後合併；正式規範入 [`lessons/_conventions.md` §6](lessons/_conventions.md)
- 🛠️ app schema 升級：`app/src/content.config.ts` 加 4 個 optional 欄位（`format` / `url` / `word_count` / `reading_time_min`）以容納 reading lesson；既有 7 篇 podcast lesson 完全相容
- 🎧 **首份 reading lesson 落地**：[Charles Cook — How I Actually Get Good Advice](lessons/2026-05-28-charles-cook-getting-good-advice.md)（PostHog newsletter，2026-01-12，1,350 字 / 6 min）
- 📝 reading lesson 結構：Article Map（TOEIC Part 7 略讀訓練）→ Close Reading 3 段（**僅此段可朗讀**）→ Reading Comprehension 5 題（TOEIC 題型，5/30 baseline 暖身）→ Sentence Anatomy 2 句結構拆解 → Vocab（**唯二可朗讀**，加 TOEIC ✓ 欄）→ Templates（cold message + one-pager 範本可填）→ Steal These 3 Moves
- 📚 新增 5 個單字／片語（全 ★1，TOEIC 商業向）：[cast a wide net](vocab/cast-a-wide-net.md) / [pick someone's brain](vocab/pick-someones-brain.md) / [legwork](vocab/legwork.md) / [one pager](vocab/one-pager.md) / [stint](vocab/stint.md)
- 🔍 派 agents 調查 PostHog newsletter 適不適合當英文素材 → 結論：值得放進素材池但純文字無 audio，定位「閱讀補充」而非主菜；建議一週 1 篇 🟢 通用觀念文
- 🎯 product engineer 主題候選清單入庫（7 篇 PostHog 文章）；下一篇建議讀 [What is Product for Engineers?](https://newsletter.posthog.com/p/what-is-product-for-engineers) 或 [Product management is broken. Engineers can fix it](https://newsletter.posthog.com/p/product-management-is-broken-engineers)

---

## 2026-05-26
- 🎧 **Cat Wu 訪談三部曲完成**：[Part 1：Anthropic 怎麼出貨那麼快](lessons/2026-05-26-cat-wu-part-1-shipping-speed.md)（lines 51–441 + 1273–1415）+ [Part 3：Cowork in practice — 親自示範做 slide deck](lessons/2026-05-26-cat-wu-part-3-cowork-workflow.md)（lines 1417–1715 + 1881–1989）；Part 2 已於 2026-05-25 完成
- 📝 Part 1 重點：`mind meld`（Star Trek idiom + 量化默契 `80% mind meld`）、`-pilled` 後綴解剖、`research preview` 是降低期待 branding 招式、`dogfood` 動詞、`rowing the same direction` 划船比喻、`mission > product line` 句式
- 📝 Part 3 重點：4 產品決策樹（CLI / Desktop / Web&Mobile / Cowork 看 output 類型）、Cat 實際打的 slide deck prompt 拆解（含「兩反例技巧」）、`access to context` 是 Cowork 解鎖鑰匙、sales 同事手刻內部 app case study
- 📚 新增 20 個單字／片語（Part 1 × 10、Part 3 × 10，全 ★1）：
  - **Part 1（10）**：[mind meld](vocab/mind-meld.md) / [AGI-pilled](vocab/agi-pilled.md) / [research preview](vocab/research-preview.md) / [dogfood](vocab/dogfood.md) / [lower the friction](vocab/lower-the-friction.md) / [rowing the same direction](vocab/rowing-the-same-direction.md) / [thought partner](vocab/thought-partner.md) / [bought in](vocab/bought-in.md) / [time horizon](vocab/time-horizon.md) / [cut across](vocab/cut-across.md)
  - **Part 3（10）**：[kick off](vocab/kick-off.md) / [one-off](vocab/one-off.md) / [on the go](vocab/on-the-go.md) / [touching grass](vocab/touching-grass.md) / [at-a-glance](vocab/at-a-glance.md) / [synthesize](vocab/synthesize.md) / [tailored](vocab/tailored.md) / [inbox zero](vocab/inbox-zero.md) / [dossier](vocab/dossier.md) / [top of mind](vocab/top-of-mind.md)
- 🎯 lessons 庫商業／科技英文版圖補完：3 part 共 33 個 Cat Wu 訪談相關新字、20 篇詞表覆蓋 PM 工作流全段
- 📚 新增 7 個單字（lesson Cat Wu Part 2 課後追問）：[grill](vocab/grill.md) / [emerging](vocab/emerging.md) / [acknowledge](vocab/acknowledge.md) / [brutally](vocab/brutally.md) / [stroll](vocab/stroll.md) / [tornado](vocab/tornado.md) / [demolish](vocab/demolish.md)
- 🎧 延伸閱讀 lesson [2026-05-25 Cat Wu — PM skills & taste](lessons/2026-05-25-cat-wu-pm-skills-and-taste.md)；加「📚 延伸字詞（2026-05-26 課後追問）」區放上述 7 個新字連結
- 💡 App roadmap 新增 P2.5：transcript 段落 inline vocab popup（讀 lesson 時 hover 生字直接彈出定義）
- 🎯 設定主目標：**考到 TOEIC 750+ 證書** → 寫進 [PROFILE.md](PROFILE.md) 目標區
- 📅 排程本週末（5/30 or 5/31）做一回完整模擬考抓 baseline，工具首選 ETS 官方全真試題指南紙本
- 📝 SOP 訂好：2 小時計時、不暫停、LC 用喇叭、不查字典；回報 LC/RC 各部分對題數後訂衝刺路線圖

---

## 2026-05-25
- 🎧 Lesson: Cat Wu（Anthropic Claude Code 產品負責人）訪談 — PM Skills & Taste（lines 669–1075） → [lesson](lessons/2026-05-25-cat-wu-pm-skills-and-taste.md)
- 📝 lesson 重點：`product taste` 在 code 變便宜的時代為什麼變最值錢、`wear many hats` + `swap them` + `low ego` 三件套、`first-principles thinking` + `which means that...` 邏輯接力、`lean into the chaos` 跟 P0→P000 自嘲、Pirates of the Caribbean 比喻
- 📚 新增 6 個單字／片語（全 ★1）：product taste, first principles, amorphous, wear many hats, low ego, lean into
- 📁 transcripts 入庫：`transcripts/2026-05-25-cat-wu-anthropic-product-team.txt`（Lenny's Podcast 訪談原檔）
- 🎯 lessons 庫補上「商業／科技 PM 英文」缺口（過往全是 pop/film/fragrance）

## 2026-05-23
- 🎧 Lesson Part 2: Sabrina《Espresso》系列 — 訪談前半｜Z 世代口語密度（04:02–07:39）→ [lesson](lessons/2026-05-23-sabrina-espresso-part-2-discourse.md)
- 📝 lesson 重點：`like` 三種用法（filler / comparison / quotative，Z 世代必殺）、`literally` 從字面變 intensifier、`every single` 強調零例外、tap T 規則登場（nothing-duh-do）
- 📚 新增 5 個單字／片語（全 ★1）：like (discourse marker), has nothing to do with, monster (playful), literally, every single
- 🎧 Lesson Part 3: Sabrina《Espresso》系列 — 訪談後半｜咖啡店場景 + 自我反思（08:06–12:40）→ [lesson](lessons/2026-05-23-sabrina-espresso-part-3-cafe.md)
- 📝 lesson 重點：question 起疑用法、barista（義大利借字）、英美 H-drop 差（herbal）、`brilliant` 英式俚語、`that's on you` 推鍋萬用句、tap T 再應用（con-see-did）、三條 T 連音規則總整理
- 📚 新增 5 個單字／片語（全 ★1）：barista, herbal tea, brilliant, running through one's head, that's on you, conceited（共 6 字；question 已於 5/21 Part 1 提及）
- 📚 manifest 第 2 次相遇（系列內），encounter log + 1
- 🏗️ 結構重整：把 5/21 + 5/23 的 Espresso lesson 重組為「Sabrina's《Espresso》系列 Part 1/2/3」，每份聚焦單一主題、25 分鐘內可吸收
- 🎯 連音三大規則齊備：TS→S（Part 1）、glottal T（Part 1）、tap T（Part 2/3）— 完整聽力地基

---

## 2026-05-21
- 🎧 Lesson Part 1: Sabrina《Espresso》系列 — 歌曲 + 連音入門（host: Ethan，00:24–03:48）→ [lesson](lessons/2026-05-21-sabrina-espresso-part-1-song.md)
- 📝 lesson 重點：`I guess so`（冷淡語氣）、`switch it up`（雙關 Nintendo Switch）、connected speech TS→S（that's that → [thass-tha']、glottal T 像 "uh-oh"）
- 📚 新增 6 個單字（Cian 全不熟，★1）：hankering, cup of Joe, I guess so, switch something up, play on words, manifest（connected speech / glottal T 為發音術語，未建卡）
- 🎧 Lesson: English Digest 實用空中美語 — Unit 15 Grasse: The Fragrance Heart of France → [lesson](lessons/2026-05-21-grasse-the-fragrance-heart-of-france.md)
- 🛠️ 建立 podcast pipeline：貼連結 → `tools/podcast2lesson.sh` → 本地 Whisper 轉錄 → lesson（逐字稿存 `transcripts/`）
- 📝 lesson 重點：Grasse 從臭皮革城變香水之都；scent vs odor、hide/skin/pelt 同義字、stink→stank→stunk、Anna 的篇章結構（五選四）解題技巧（看時態/連接詞反推段落）
- 📚 候選新字（待 Cian 挑選入 SRS）：nestled, charming, scent, odor, hide, pelt, tannery, craftsman, soak, fragrant, fertile, abundant, mild, ingredient, luxurious, antique, perfumer

## 2026-05-04
- 🎧 Lesson: RealLife English × Peaky Blinders: The Immortal Man — Tommy Returns to The Garrison → [lesson](lessons/2026-05-04-peaky-blinders-immortal-man.md)
- 📚 新增 10 個單字／片語：patron, flabbergasted, pub, home turf, escape one's notice, -shy (suffix), sweetheart, number (music), brought the house down, faze
- 📝 lesson 重點：Brummie dialect（me = my）、`-shy` 字尾家族（war-shy / camera-shy / work-shy / commitment-shy）、sweetheart 雙面刃用法（真誠 vs 諷刺）、faze ≠ phase 拼字陷阱
- 📝 文化背景：The Garrison = Shelby 家 home turf；Fred Astaire & Ginger Rogers = 30s/40s 影史經典舞蹈雙人組

---

## 2026-05-02
- 📚 抽考 5 字（1/5 ✅）：excruciating ✅；brought up ❌（誤答 pitch to）、go all out ❌（誤答 go all in）、humorous twist ❌（忘）、in a pinch ❌（忘）
- 📚 升級 ★2→★3：excruciating（連續從 miss 翻盤，crucify 字根記憶法奏效）
- 📚 降級 ★3→★2：go all out（連續第二次 miss，與 go all in / pour into 持續混淆）
- 🎯 觀察弱點：phrasal verb 的「動詞語意+介系詞」組合容易混（pitch to vs bring up；go all in vs go all out）— 待整理一份對比表

---

## 2026-04-30
- 📚 抽考 5 字（2/5 ✅）：incorrigible ✅、theatrical ✅（用字對、文法待修）；brought up ❌（誤答 set up）、excruciating ❌（忘記）、go all out ❌（誤選 pour into）
- 📚 升級 ★2→★3：incorrigible、theatrical
- ✏️ Cian 造句修正（theatrical）：踩到 PROFILE 既有弱點（動詞 -s、be 動詞遺漏、介系詞 for/about）
- 🎧 Lesson: RealLife English × Monsters, Inc. — business English & connected speech → [lesson](lessons/2026-04-30-monsters-inc-business-english.md)
- 📚 新增 6 個單字／片語：in a pinch, count on, go through a rough patch, get through, going under, stink
- 📚 後續補充 3 個單字／片語：humorous twist, terrified, pinch（含三態）
- 📝 lesson 補上電力公司宣導短片完整 transcript（Intro Clip A/B/C）+ 關鍵句拆解
- 🛠️ 規則更新：BRAIN.md / SKILL.md — LLM 寫入後直接幫 Cian 跑 git commit（不再只建議）
- 📝 學到 connected speech 的核心規則：T 夾在母音中變軟 D（What a day → wuh-duh-day）

---

## 2026-04-29
- 📚 新增 4 個單字（第二批）：incorrigible, headed to, excruciating, cram
- 📚 新增 11 個單字／idiom（第一批）：keen, eager, put heart and soul, haunt, framed, pour into, sketches, gallery, brought up, pause, habitually
- 🤔 解答 idiom 翻譯：`pour blood/sweat/tears into` 中的 `poured` = 傾注、灌注
- ✏️ 修正 Cian 例句：movie→move、City→city、make→made

---

## 2026-04-28
- ✏️ 完成寫作 worksheet：vocab translation drill 6/6 → [drill](writing/2026-04-28-vocab-translation-drill.md)
- 📚 複習 + 升級：go all out (★2→3)、easy breezy (★2→3)、lit up (★2→3)、pitch (★2→4)、set up (★2→4)
- 🎯 觀察到弱點 pattern → 更新 [PROFILE.md](PROFILE.md)：(1) 動詞時態變化、(2) 名詞單複數 / 冠詞、(3) 中翻英直譯結構

## 2026-04-27
- ✏️ 準備明日寫作 worksheet：vocab translation drill（6 字）→ [worksheet](writing/2026-04-28-vocab-translation-drill.md)
- 📚 新增單字：lit up（含 slang "lit"）
- 📚 複習 + 擴充：with a bang（come out / go out / kick off / end / go off）
- 📚 新增單字：stockings（含絲襪整個 family：tights / pantyhose / fishnets…）
- 📚 新增單字：combat
- 📚 複習 + 擴充：set up（深入「set someone up」五種型式）
- 📚 新增單字：take it easy
- 🎧 Lesson: Tom Holland × Gordon Ramsay — Lip Sync Battle 故事 ([lesson](lessons/2026-04-27-tom-holland-lip-sync-battle.md))
- 📚 新增 14 個單字／片語：viral, go all out, choreography, come out with a bang, easy breezy, pitch, set up, wig, contestant, intensive, quick change, costume, theatrical, unconventional
- 🎯 英文學習記憶大腦資料夾建立完成
