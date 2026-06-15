# 活動時間軸

> 最新在最上面。每次有學習活動就在頂端 prepend 一筆。
> 圖示慣例：✏️ 寫作　📚 新字／單字複習　💬 對話　🎧 Lesson／podcast　🎯 設定目標／更新 Profile

---

## 2026-06-15
- 🎙️ **App P5：依講者切換 TTS 聲音 Step 1（A-minimal）**（roadmap P5 → Done）。先由 11-agent workflow（msedge 聲音 survey／替代引擎比較／架構驗證 × 外部事實雙輪交叉驗證 × 3 方案設計 × 對抗式查證）研究，揭露反例：**音檔 hash 只吃文字、講者標籤被剝掉**，故 roadmap「不影響 runtime」只在無「兩講者逐字相同文字」碰撞時成立。Cian 裁決＝**兩步走先做 A-minimal**（build-only、runtime 零改動、可逆）、引擎留 **msedge-tts**（Azure F0 當備援）、**多口音配音表**、clip/非真人來源留 Aria。落地：`generate-audio.mjs` 解析開頭粗體講者標籤 → 查新 `app/src/data/speaker-voices.json`（11 角色，全 WordBoundary-safe 標準聲音）指派聲音合成；新增 `speakerSegments`/`resolveVoice`（漸進比對「已知卡司」，非講者粗體自然落 Aria、無需 deny-list）、per-voice client cache、`--revoice` flag、voice collision `console.warn`。**hash 維持 text-only → `speech.ts`／manifest／rehype／drift guard 全不動**，只換音檔聲音 bytes。驗證：parser fixture 42 標籤＋override 全綠（`npm run test:speaker`）；`npm run audio:revoice -- --words=learning-styles` 一鍵重生 **140 dialogue mp3（0 fail／0 degrade）＋ learning-styles 7 卡拉 OK sidecar**；hash-sync 11+11 綠、`astro build` 154 頁 generated=0、manifest 915；learning-styles 卡拉 OK 以 live preview 數值法驗 4 sidecar（span 數吻合、onset 單調、maxOnset < 新音檔時長＝timing 綁新聲音）；0 碰撞警告；`/simplify` 4-agent（抽 `leadingStrong`、`resolveVoice` 去死 slug＋單次 lookup）。已知限制（接受，Step 2 C-hybrid 再解）：兩講者逐字同文字撞一聲音（今 0 例、會 warn）、多講者段落整段第一聲音。
- 🎨 **App P6：編輯風 UI 改版**（roadmap P6 → Done）。先由 3 designer（編輯排版／資訊架構／低風險打磨）× senior frontend × architecture 交叉討論，產出 3 份可比較 HTML mock + 可行性審查；Cian 裁決＝方向 A（編輯雜誌風／暖紙）、拿掉巢狀滾動框、系統字型（不引 web font）、第二色 rust（amber 專屬音訊）。落地分階段：**Phase 1** 暖紙配色 + 色彩語法（amber=音訊／rust=導覽／CEFR=難度）+ 系統 serif 英文閱讀體 + 編輯型 type scale + 表格去密 + pill token 去重，全集中 `Layout.astro :root`，全站一致。**Phase 2** 16 篇 lesson 拿掉 `lesson-body-scroll` 正文順流 + 新 rehype `inject-lang.mjs` 驅動 EN/zh 雙聲部分流（英文 serif 主、 中譯淡 sans 副）+ lesson page 加閱讀進度條與左側 scroll-spy reading spine。karaoke 凍結契約零更動（只動顏色/字型/版面/IA，hash 全綠）。每階段 `astro build` 154 頁綠 + hash-sync parity OK + generated=0 + 亮/暗/手機實機 preview + `/simplify` 4-agent 全綠。明確未做：web font、sticky 播放 mini-bar、整課連播。下一棒 P5。

---

## 2026-06-14
- 🛠️ **App P2：卡拉 OK「已讀蔓延」逐字 highlight**（roadmap P2 → Done）。MP3 播放時逐字 highlight 從「只亮當前一個字」升級為**進度 trail**，邊界隨 `audio.currentTime` 逐字向前蔓延（落實 06-10 回饋）；pause 凍結、resume 從凍結處續進、ended/Esc/replay/換段全清、無 sidecar 降級。實作：`app/src/scripts/speech.ts`（`trailSpans`+`litIndex` 依 DOM-range delta 上色、`setWordTier` helper、`highlightGen` token 修掉 resume 疊 RAF tick）。sidecar/manifest/產音腳本未動、零 hash drift。經 /simplify + 對抗式正確性 review（修 1 條 stacked-tick）+ live preview 真播實測（trail 不變式全綠）+ `astro build` 154 頁綠燈。範例篇＝`2026-06-01-learning-styles-connected-speech`（唯一全 sidecar 覆蓋）。
- 🎨 **App P2 視覺定案（同日，2 designer 討論）**：Cian 回饋「3 階太雜、整段背景拿掉、改用 font color」→ 由初版「三段式＋背景」改為 **2 階・純 font color・無背景**。已讀字＝amber 文字（新增 `--speak-read`：亮 `#9a5b06` AA 可讀／暗 `#fbbf24`）、未讀＝一般 `--fg`，當前字併入已讀（顏色邊界＝播放位置）。段落 `.speaking` 背景 wash 移除，改左側 amber 邊條：可朗讀預設 dim(40%)、播放中變亮變粗(4px 實心)——兼作無 sidecar 段落的「正在播」提示。`Layout.astro` 把 `.is-played-word`/`.is-current-word` 同列上色 → 零 runtime 改動。亮/暗截圖驗證。P6 再評估 amber 深淺。下一棒 P6。
- 🛠️ **App P7：播放語速切換 UI**（roadmap P7 → Done）。header nav 注入 0.8×/1×/1.1×/1.25× 切換鈕，即時生效＋存 localStorage（`englishApp:playbackRate`，預設 1.0×）；MP3 套 `audio.playbackRate`、Web Speech 套 `u.rate`；卡拉 OK sidecar 維持單一份不受速度影響。

---

## 2026-06-11

📚 Japan Hotel Check-in Part 2 延伸 Q&A：10 新字 deposit / scam / lodging / rapid-fire / nail it / rinse off / just so you know / steam room / sauna / lotion；文法解析 "just so you know" 中 so 的目的子句用法＋"place" 作為交易動詞；文化：刺青禁令由來、浴巾使用禮儀、飯店不提供備品趨勢；amenities 複習。整段 Q&A 已 backfill 進 lesson（9 子段）。app: 播放按鈕移至右側、上下置中、font-size 0.72→0.85em，--speak-btn-w CSS 變數化；roadmap 收 P7（播放語速調整，實驗，不馬上做）

---

## 2026-06-10
- 📚 **Anne With An E 延伸 Q&A**：5 新字 [reputation](vocab/reputation.md)（名聲·搭配 damage/ruin·vs rumor）／[practically](vocab/practically.md)（幾乎；實際上·兩義）／[confront](vocab/confront.md)（當面對質·confront sb about sth）／[back in the day](vocab/back-in-the-day.md)（以前那個年代·常搭 and still today）／[moral](vocab/moral.md)（道德的；複數道德觀·the moral of the story）；lesson 補「Were.」single-word tense correction 解析（Sentence Anatomy §3）＋延伸 Q&A 段（back in the day / reputation / I have eyes… / moral / practically 五點）；app roadmap 收 4 點播放體驗回饋（resume/replay、卡拉 OK 漸進 highlight、P5 依講者切 TTS 聲音）

## 2026-06-09
- 🎧 **新 lesson：Anne With An E — 直言不諱、對質 Billy**（dialogue track · B2）：[lesson](lessons/2026-06-09-anne-with-an-e-speak-your-mind.md)。素材＝影片英文教學（講師 Ksenia）用 Netflix《Anne With An E》學校派對場景拆 7 個單字（字幕截圖來源）。劇情：Billy 對 Josie 強行其事後散播謠言毀其名聲，八卦傳開大家評斷女生不質疑男生；Anne 拒絕沉默、當面對質。主題對準「為人挺身而出／吵架理直氣壯」的英文＋現代高價值字 consent
- 📚 一次新增 7 個單字（全 ★1）：[speak one's mind](vocab/speak-ones-mind.md)（直言不諱·Anne 人設）／[gossip](vocab/gossip.md)（八卦·不可數·vs rumor）／[rumor](vocab/rumor.md)（謠言·英式 rumour·spread/start a rumor）／[nasty](vocab/nasty.md)（一字多義，語氣由名詞決定：comment/weather/person）／[devastated](vocab/devastated.md)（≠ 只是 sad，份量很重）／[ill-bred](vocab/ill-bred.md)（沒家教·⚠️register-trap 聽得懂即可慎用·拆字 ill+bred）／[consent](vocab/consent.md)（同意·informed/age of consent·Ksenia 標核心字）
- 🔬 Sentence Anatomy 對準弱點：① `shouldn't have + p.p.`（批評過去行為，口語 "shouldn't-a"，⚠️別寫 should**of**）② `How dare you + 原形 V!`（dare 不加 to）
- 🌏 Cultural Notes：1890s 加拿大設定刻意談現代 consent；double standard（女生被罵 ill-bred／loose morals，男生沒人質疑）；`back in the day` 慣用語；register 分流「聽得懂 vs 會用」

## 2026-06-03
- 🎧 **擴充：日本住宿 Check-in 系列**（由 Cian 跟讀 Part 1 時的提問驅動）。維持 3-part 階段式骨架不動正文，改用「補充區塊」收納變化題：
  - [Part 1](lessons/2026-05-31-japan-hotel-checkin-part-1-arrival.md) 新增 `🔀 變化題 · 你問我答`（報到階段 6 題）：OTA 平台訂房怎麼報（`through` 不是 `at`）／雙人房加床 extra bed／double vs twin 白話講法（with two bed**s**）／入住人數變更要先講（按人頭計價＋《旅館業法》逐人登記）／registration card 填本國資料即可（無需日本地址）／提早入住 `Could I check in early?`＋寄放行李
  - [Part 2](lessons/2026-05-31-japan-hotel-checkin-part-2-amenities.md) Useful Phrases 新增第 5 招「開口要備品（主動索取）」四句型（`Do you provide`／`Could I get an extra`／`We're out of`+`bring up`／`Where can I find`）＋ amenity bar 在地 tip ＋「毛巾用 get 不用 borrow」雷區；Key Vocab 補 [toiletries] · be out of (sth)
- 📝 備品語感澄清：`amenities`（總稱·備品/設施）vs `toiletries`（專指盥洗）；`borrow` 只用於會歸還的東西（吹風機/轉接頭）

## 2026-06-01
- 🎧 **微課：Learning Styles 是迷思 — 順便偷學連音**（dialogue track）：[lesson](lessons/2026-06-01-learning-styles-connected-speech.md)。素材＝Izzy's English 用 Veritasium《learning styles》影片做的 ~2.5 min 微課（刻意剪短，疑似從長課切出），Izzy + Ksenia 拆解。**主菜是發音／連音**：縮音表（interacting 的 nt→n 脫 T／auditory 的 au=/ɔː/ 無 U／visual 的 s→/ʒ/）＋連音表（look it over→"loo-ki-tover"、kind of→kinda、I'd like to）。Key Vocab 交叉連結今天已收的 [hands-on](vocab/hands-on.md) / [debunk](vocab/debunk.md)，新加 keeper 片語 [look something over](vocab/look-over.md)（separable·連音雷）+ [engage with](vocab/engage-with.md)。Study Tips 收錄 Izzy 的「用影片學英文」SOP（選愛看的內容→配 transcript→找失蹤字母→shadowing）
- 📚 單字片語練習：一次新增 3 字 [hands-on](vocab/hands-on.md) / [debunk](vocab/debunk.md) / [conspiracy](vocab/conspiracy.md)：hands-on＝親自動手／實作（名詞前加連字號，反義 hands-off；top-tier）；debunk＝用證據戳破迷思/謠言（搭配 myth/claim/rumor；strong keeper）；conspiracy＝陰謀，多用 conspiracy theory，⚠️重音 con-SPIR-uh-see、動詞 conspire（strong keeper）。三字皆 keeper
- 📚 單字片語練習：新增 [exhibit](vocab/exhibit.md)（★1 v./n. · 展示／展現／展品）— ⚠️ silent h（eg-ZIB-it，但 exhibition 反而發 h）；三義 display art／show a quality（formal）／exhibit 展品·Exhibit A 證物；TOEIC trade exhibition。實用性判定＝strong keeper esp. TOEIC
- 📚 單字片語練習：新增 [fusion](vocab/fusion.md)（★1 n. · 融合）— fusion cuisine／music／a fusion of X and Y；科學 nuclear fusion 對比 fission；動詞 fuse。實用性判定＝solid keeper（mildly topic-bound）
- 📚 單字片語練習：新增 [sarcastic](vocab/sarcastic.md)（★1 adj. · 諷刺／酸）— 講反話、tone-dependent；名詞 sarcasm、副詞 sarcastically；搭配 dripping with sarcasm。實用性判定＝top-tier keeper
- 📚 單字片語練習：新增 [smart aleck](vocab/smart-aleck.md)（★1 n. · 自作聰明的人）— adj. smart-alecky；實用性判定＝**略過時 / passive keeper**（聽得懂但偏父母輩用語），現代口語改用 wise guy／smart-ass⚠vulgar／know-it-all
- 📚 單字片語練習：新增 [assemble](vocab/assemble.md)（★1 v. · 組裝／集合）— 兩義：build parts ＋ gather people（後者偏正式，口語用 get together）；名詞 assembly／TOEIC 高頻 assembly line · assembly instructions。實用性判定＝strong keeper（especially TOEIC）
- 📚 單字片語練習：新增 [on point](vocab/on-point.md)（★1 idiom/slang · 完美無瑕／精準到位）— 現代口語=excellent/flawless；register 偏 casual（正式場合改用 spot-on／precise）；辨析 vs "to the point"（簡潔切題）。實用性判定＝keeper but mind register
- 📚 單字片語練習：新增 [test the waters](vocab/test-the-waters.md)（★1 idiom · 試水溫）— 全力投入前的小規模試探；idiom 用複數 waters；商業/職涯高頻，搭配 "by V-ing"／"before committing"。實用性判定＝excellent keeper
- 📚 單字片語練習：新增 [quirk](vocab/quirk.md)（★1 n. · 怪癖／古怪小特點）— 重點在 adj. **quirky**（古怪又有趣，帶褒義）＋ 固定搭配 quirk of fate；辨析 quirk vs flaw vs weird。實用性判定＝strong keeper（especially quirky）
- 📚 單字複習：[cram](vocab/cram.md)（★2 · review_count 1→2）— refresher 兩義（塞滿／臨時抱佛腳）＋ cram school／crammed 形容詞；實用性判定＝top-tier keeper；出了一題中翻英 mini-check 待 Cian 作答
- 📚 單字片語練習：新增 [prosthetic](vocab/prosthetic.md)（★1 adj./n. · 義肢的）— 兩大語境：醫療（prosthetic leg）＋影視特效化妝（prosthetic makeup）；裝置本身＝prosthesis；發音重音 pros-THE-tic。實用性判定＝Keeper but situational（topic-bound）
- 📚 單字片語練習：新增 [track down](vocab/track-down.md)（★1 phrasal verb · 可分離 · 追查到／找出）— 重點在 separable 規則（代名詞必須拆：track it down）與「刻意費力尋找」相對於 plain find 的語感差異；TOEIC 常見搭配 "track down the cause"

---

## 2026-05-31
- 🎧 **主題課程：日本住宿 Hotel Check-in 對話三部曲**（dialogue track）：[Part 1 報到・證件・房型](lessons/2026-05-31-japan-hotel-checkin-part-1-arrival.md) + [Part 2 付款・宿泊税・設施服務](lessons/2026-05-31-japan-hotel-checkin-part-2-amenities.md) + [Part 3 客訴・退房・行李宅配](lessons/2026-05-31-japan-hotel-checkin-part-3-checkout.md)
- 📝 取向：Coach Max 原創多場景情境對話（住客＝Cian 視角 ↔ 日本飯店櫃檯），涵蓋報到→護照影印→房型→付款 pre-auth→宿泊税→大浴場/早餐→客訴換房→退房→行李宅配 takkyubin 全動線；句型 grounded in 驗證過的真實飯店常用語
- 🌏 在地加值（Cultural Notes，已交叉查證）：外國旅客護照影印是日本《旅館業法》規定、宿泊税（東京/大阪/京都，約 ¥100–500/人/晚，2026 起外加結算）、温泉大浴場禮儀、takkyubin 行李宅配、和室/玄關脫鞋
- 🔬 每 part 一段 Sentence Anatomy 對準弱點 ③（動作名詞化／不定詞，禮貌請求句 `Would it be possible to + V`）＋ ②（冠詞／介系詞）
- 📚 新增 10 個單字／片語（全 ★1，旅遊／TOEIC 向）：[complimentary](vocab/complimentary.md) / [amenities](vocab/amenities.md) / [accommodation tax](vocab/accommodation-tax.md) / [pre-authorization](vocab/pre-authorization.md) / [security deposit](vocab/security-deposit.md) / [itemized bill](vocab/itemized-bill.md) / [settle the bill](vocab/settle-the-bill.md) / [late check-out](vocab/late-check-out.md) / [luggage forwarding](vocab/luggage-forwarding.md) / [wake-up call](vocab/wake-up-call.md)（⚠️ morning call 是和製英語）
- 🛠️ 流程：Workflow 編排（3 author agent 並行 ＋ 對抗式 speakable lint）；app build + preview 驗證瀏覽／格式／朗讀 wiring 全通過（Series Map 改一般清單，避免中文標題被誤朗讀）
- 🎧 **通用版 dialogue lesson — 旅館 check-in 櫃檯入住實戰**（codex 平行產出，與三部曲並存）：[Hotel Check-In：國外旅館櫃檯入住實戰](lessons/2026-05-31-hotel-check-in.md)
- 📝 通用版重點：`I have a reservation under Wu`、`Would it be possible to...?`、`incidentals` / `temporary hold` / `security deposit`、早餐 / Wi-Fi / 退房 / 行李寄放全流程；含 Role-Play Drill 與 Connected Speech
- 🎯 旅行英語主題入庫：以原創對話作主教材，外部來源（ELLLO / EnglishClub / Randall's ESL）只做聽力補充與情境驗證，避免重製受版權限制的 transcript

---

## 2026-05-29
- 🎧 **第 2 篇 reading lesson — 3-article pack**：[PostHog — What is Product for Engineers? + Hiring + Sell features not benefits](lessons/2026-05-29-posthog-product-for-engineers-pack.md)（總 3,590 字 / 19 min，< 30 min 故包成單篇）
- 📝 lesson 重點：3 篇互補論述（**Main**：product engineer mindset 定義 + 三段並列動詞句型；**Article A**：hiring 10 條原則含 SuperDay 真實任務面試法、`soft yes is no`；**Article B**：賣 features 不賣 benefits、`stack up against` 比較句型、引號嘲諷 vague language）
- 📚 新增 4 個單字／片語（全 ★1，多 TOEIC ✓）：[opinionated](vocab/opinionated.md)（⚠️ connotation trap）/ [autonomy](vocab/autonomy.md) / [in demand](vocab/in-demand.md) / [filter out](vocab/filter-out.md)
- 🎯 串聯主題：與 5/28 Charles Cook lesson 形成「PostHog 商業英文宇宙」初步素材庫——`single most important` 強調句型在 PostHog 多位作者文章重複出現

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
- 🎧 Lesson: RealLife English × Peaky Blinders: The Immortal Man — Tommy Returns to The Garrison（2026-05-29 移除）
- 📚 當日新增 10 字（patron, flabbergasted, pub, home turf, escape one's notice, -shy (suffix), sweetheart, number (music), brought the house down, faze），後續全數隨 lesson 移除
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
- 🎧 Lesson: Tom Holland × Gordon Ramsay — Lip Sync Battle 故事（2026-05-29 移除：無原始逐字稿、缺正文可跟讀）
- 📚 當日新增 14 字；其中 11 字（viral, choreography, come out with a bang, wig, contestant, intensive, quick change, costume, unconventional, stockings, take it easy）隨 lesson 移除，僅保留有後續寫作/quiz 練習史的 5 字：go all out, easy breezy, pitch, set up, theatrical
- 🎯 英文學習記憶大腦資料夾建立完成
