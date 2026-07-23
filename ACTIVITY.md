# 活動時間軸

> 最新在最上面。每次有學習活動就在頂端 prepend 一筆。
> 圖示慣例：✏️ 寫作　📚 新字／單字複習　💬 對話　🎧 Lesson／podcast　🎯 設定目標／更新 Profile

---

## 2026-07-23
📚 **新增 2 字：turnover / stall**——Cian 貼一段自撰職場英文（"Over the last year, turnover was really high, and the product team ended up with a real gap. Projects started to stall as a result."）問這兩處看不懂的地方。新增 **turnover**（人員流動率／離職率，⚠️多義字：HR 語境 vs 財務語境的營業額）與 **stall**（停滯不前、卡住不動；本義引擎熄火拋錨），順帶講解 **as a result** 連接語（因此、結果就是）串起因果句。全 ★1，雙語 karaoke 例句＋ `_index` 同步。詞庫 269→**271**。
▶️ **App：雙語兩欄閱讀 UI（pilot 只上 Forget Me Not 這篇）**——Cian 要「中英分開、hover 顯示對應、點句子就播（不用瞄 icon）、大螢幕並排、但保留 karaoke 蔓延」，並指定**先討論再預覽確認才動 app**。流程：① **3 人設計 agent team**（UX 互動／大螢幕版面／實作架構）平行討論，收斂出「build 時純搬移 rehype plugin」為最低風險解；② 做**真實音檔＋真 karaoke 的互動 mockup**（`_preview/`，已用完刪）給 Cian 試玩確認；③ Cian 裁決兩點：**只有這一篇先試**（per-lesson opt-in `two_lane:true`）＋**目錄一律保留**（故 Close Reading 只往右側撐開、固定讓開左側 spine 26px）。落地：新 `inject-bilingual.mjs`（gate by frontmatter，把成對 EN/ZH blockquote 併成 `.bilingual` grid，**只搬 `<blockquote>` 節點、不碰 `<p>`/`.w`/文字 → 音檔 hash 與 karaoke byte 不變、零重生**）＋ `speech.ts`（整段點擊播放、點中文播對應英文、hover 雙向對照 `.lit`＋播放鏡射 `.mate-speaking`，mate 用 WeakMap wire 時快取一次 O(1)；按鈕移句首左 rail 並淡化＝保留 ▶ 給鍵盤/a11y）＋ Layout.astro 兩欄 CSS（≥1024px、交錯 grid 讓窄螢幕仍「英-中-英-中」）。**其餘 24 課＋vocab 全部 byte 不變**（gate 確認 Soul/vocab `.bilingual`=0）。`/simplify` 4-agent 收斂（抽 `hasActiveSelection`、EN wiring 移出通用迴圈與 ZH 合併成 `wireBilingualSentence`、mate WeakMap 快取、plugin 去重掃描、去重複註解）。astro build 綠、generated=0、live 數值法全驗（點播真 mp3 206、逐字 289 span 全對、右向撐開左緣 284≥目錄右緣 258）。**Day 2 之後可評估推廣到其他 reading 課**。
🎧 **新 lesson：Forget Me Not — 妥瑞症女孩的漂泊與救贖**（reading · B2 · English Digest 實用空中美語 Unit 15-1 文學單元 · 本地 whisper 轉錄 ~32 min）：Cian 貼 Apple Podcasts 連結。**解析器卡 ambiguous**——同節目同日上架 Unit 15-1／15-2 標題幾乎一樣、模糊比對分不出（best−runner < 0.12），但連結本身標明 15-1 → 直接用候選第一筆 mp3 繞過 resolver、沿用同一套轉錄函式庫（HTTP 206 探測確認非付費牆）。節目結構＝雙師制：Tom & Stephanie 英解＋Patrick 老師中解，把 Ellie Terry 處女作小說《Forget Me Not》（中譯《月亮都是一樣的》）整本劇情**分兩幕摘要朗讀**（Act 1 身世＋病＋第一天霸凌；Act 2 學生會長靜松、友誼、衝突、搬家、和解坦白）。判 **reading track**（雜誌閱讀導讀、audio: true）——課文兩幕全文收錄當 Close Reading。模組：Article Map（兩幕骨架表）、Close Reading（雙語 blockquote 順流）、Key Vocabulary（20 字表）、Reading Comprehension（TOEIC Part 7 五題＋details 折疊答案）、Sentence Anatomy（**分詞構句** `Drawn to Callie, ...` 呼應 Cian 懸垂分詞弱點＋擬人關係子句 `a secret that refuses to stay hidden`，兩句 Patrick 老師節目裡也親自拆過）、Cultural Notes（勿忘我花語雙關／military brat／student body president／physician vs doctor／debut 發音／Las Vegas）、Study Tips。新增 **12 個 keeper**：**rooted**（有歸屬感，反義 uprooted）、**relocation**（搬遷，TOEIC）、**conceal**（隱藏，⚠️與 disclose 成對）、**physician**（醫師，vs doctor，⚠️vs physicist/physique）、**prominent**（顯眼／傑出）、**disclose**（揭露，⚠️與 conceal 成對）、**debut**（處女作，⚠️尾 t 不發音）、**dread**（畏懼，⚠️後接 V-ing）、**mock**（嘲弄／模擬考）、**erupt**（情緒／火山爆發）、**impulsively**（衝動地）、**suspend**（停學／停職／暫停）。**複習 3 舊字**（review_count bump）：**manifest**（顯現義再現，★1 rc2→3）、**reputation**（★1 rc1→2）、**confront**（★1 rc1→2）。全新字 ★1，雙語 karaoke 例句＋ `_index` 同步。raw transcript `transcripts/2026-07-23-forget-me-not-brings-tourette-syndrome-to-light.txt`。詞庫 257→**269**。（系列 series: forget-me-not，Day 2 待出）

## 2026-07-21
🎧 **新 lesson：面試自我介紹拆解**（talk · B2 · **🔒 私人 lesson，未列出且不進 repo，僅存在本機**）：第一次拿 Cian 自撰的英文口說稿當 lesson 正文逐字檢查（內容含個人求職資訊，故本檔只留學習重點、不記稿子細節）。**總評結構 A、時態 A−、用字 B+**——稿子命中英文面試的三段式（Now → Path → Why you），四種時態（現在簡單／現在完成／過去簡單／現在完成進行）**全部切對**，這對中文母語者不簡單。真正要修的四類：① ⚠️ **懸垂分詞（dangling participle）**——句尾 `, V-ing ...` 的隱藏主詞跟主句主詞對不上，這是全篇唯一真文法錯，給了三種修法＋「把主句主詞補回去唸一次」的自檢法；② **重複用字**（同一個副詞／介系詞兩句內出現兩次）；③ 現在完成式後面硬接現在簡單式導致**平行結構鬆掉**；④ **中式搭配三連**：technical practice → keeping my technical skills sharp／matched…well → lined up really well with／deliver features → **ship** features。教學模組：Sentence Anatomy 六段（時態四層地圖、分詞構句降級、同位語一句話解釋公司、`where` 關係副詞＋spend on/at/V-ing、懸垂分詞、`make + O + adj` 呼應 6/25 的 `sliced her hand open`）、Polish Pass（八處對照表＋可直接背的潤稿全文）、Useful Phrases 十句自介骨架模板、Connected Speech（**AC**-cess vs ac**CESS** 重音、three-**anna**-half）、Cultural Notes（空窗期怎麼講不用道歉、"I'm a user myself" 是王牌、結尾別太謙卑）。新增 6 個 keeper：**come to a close**（告一段落，⚠️主詞是事不是人＋close 唸 /s/）、**growth phase**（成長期，產品生命週期四段）、**line up with**（吻合，取代 match…well）、**have a personal connection to**（面試講「我本身就是使用者」的王牌句）、**ship**（科技業比 deliver 道地）、**access point**（AP；router/switch/AP 分工）。全 ★1，雙語 karaoke 例句＋ `_index` 同步。詞庫 248→**254**。
📚 **自介修訂 V2/V3 ＋ 用法問答收尾（詞庫 254→257）**——Cian 看完拆解後自己改出 **V2**：八條問題**自主修掉五條**（平行結構 `over the past nine years`、同位語壓成 `which does`、`deliver`→**ship**、`through` ×2 修掉、`technical practice`→`my technical skills`），另自己加分兩處（拿掉 `I found that`、改用 `I wrapped up at...`）。**未修**：⚠️ 懸垂分詞一字未動；**新長出**重複 `also` ×3／`really` ×3（改稿典型副作用）。Coach Max 給 **V3＝在 V2 上動四刀**（`mostly...plus` 一刀解三重複／`genuinely` 一刀解兩重複／`the way it uses` 修懸垂分詞／`to it too` 收尾），lesson 內新增 `V2 修訂對照` 一節（八條逐項判定＋新問題統計＋四刀表＋V3 全文可跟讀）。用法問答兩題：**`for about six years` 的 about/around 能否互換**（可以；帶出「大約」整排梯度 or so<around<about<roughly<approximately，⚠️位置貼數字、複數 -s、`a six-year contract` 連字號變單數、`during` 不接時間長度）與 **`I was there through`**（`be there` 比 `work there` 多了在場/見證的重量；`through` 堵死 `during` 的「可能只待一部分」漏洞；美式 `Monday through Friday` 含尾日）。新增 3 keeper：**wrap up**、**be there through**、**around（大約）**。⭐ **wrap up 學會當天就被主動調用**——Cian 直接用 "wrapped up" 宣告練習結束，主詞／語氣／時態全對，`review_count` 1→2（不是照樣造句，是真的在對話裡取用）。
🔒 **App：`unlisted` frontmatter 欄位上線**——lesson 標 `unlisted: true` 即從首頁列表、Fuse 搜尋索引、tab 計數一併消失，但 `[...slug]` 的 `getStaticPaths` 照樣 build 該頁，**網址仍可直接開**。單一過濾點（`index.astro` 取 collection 時就濾掉）→ 列表/搜尋/計數自動一致；lesson 頁另加虛線 `🔒 未列出` badge，否則打開分不出來。⚠️ **unlisted ≠ private**：repo 與 GitHub Pages 都是公開的，所以真正私密的內容另外走 `.gitignore`（本次該篇 lesson 與其專屬音檔皆已排除、只留本機）。

## 2026-07-14
📚 **中翻英辨析＋新增單字：「素材」怎麼講**——Cian 問「素材」的英文，拆成四個依情境分工的字：**material**（泛用，寫作/研究/創作皆可，抓不準先選這個）、**footage**（限影像素材，不可數，如 raw footage/security footage）、**content**（行銷/社群語境，⚠️重音陷阱 CONtent 名詞 vs conTENT 形容詞）、**source material**（改編作品的原著，如小說→電影）。另 📚 **新增單字：merchant** /ˈmɜːrtʃənt/（n.，商人、貿易商）——Cian 傳單字想學，語感偏傳統/大宗貿易商，現代日常「做生意的人」用 businessman/trader；現代延伸見於電商 online merchant、merchant account。全 ★1，雙語 karaoke 例句＋ `_index` 同步。詞庫 243→**248**。

## 2026-07-12
📚 **新增單字：capstone** /ˈkæpstoʊn/（n.，壓頂石；比喻巔峰之作、集大成的收尾）——Cian 傳單字想學。字面＝金字塔/牆最頂端那塊石頭（cap+stone），放上去才算完工；比喻義重點在**「完成、收尾」而非只是「最高」**（vs pinnacle/peak 只講高度）。招牌搭配 **capstone project/course**（美國大學畢業專題高頻用語），句型 `the capstone of + 一段歷程`；配對記憶 **cornerstone**（基石，底部起頭）vs capstone（頂端收尾）。履歷/面試講 side project 可用 "the capstone of my learning journey"。★1，雙語 karaoke 例句兩句（生涯巔峰義＋畢業專題義各一）＋ `_index` 同步。詞庫 242→**243**。

## 2026-07-06
📚 **新增片語：preach to the choir**——Cian 打成「**peach** to the choir」🍑，抓到拼字陷阱：是 **preach** /priːtʃ/（傳教）不是 peach /piːtʃ/（桃子）。意思＝對唱詩班傳教→**向本來就同意你的人費口舌**；招牌回應句 "You're preaching to the choir."；英式變體 preach to the converted；`choir` 發音雷點 /ˈkwaɪər/。★1，雙語 karaoke 例句＋ `_index` 同步。詞庫 241→**242**。
📚 **新增單字：repping (rep)** /ˈrɛpɪŋ/（v.，代表、替⋯站台撐場面）——Cian 傳單字想學。`rep`＝**represent** 口語砍半版，源自嘻哈「Represent!」文化；穿隊服、掛品牌、介紹家鄉都能用。拼字重點：短母音疊字尾 rep→re**pp**ing/re**pp**ed。⚠️ 名詞 rep 另有三義靠語境分：gym reps（健身次數）、sales rep（業務代表）、street rep（名聲 reputation）。★1，雙語 karaoke 例句＋ `_index` 同步。詞庫 240→**241**。
📚 **片語查證＋新增 2 片語：goo-goo eyes vs gaga**——Cian 問「be goo goo over someone 常見嗎？」答案：**那個組合不是標準說法**，是把兩個真片語混在一起了。新增 **make goo-goo eyes at someone**（對某人拋媚眼，`goo-goo`＝嬰兒牙牙學語聲 goo goo ga ga，固定搭配 make…at，俏皮略復古、常用來調侃朋友）與 **go/be gaga over someone**（為某人/某物瘋狂神魂顛倒，`gaga`＝痴傻，法文借字；Lady Gaga 藝名源自 Queen〈Radio Ga Ga〉當記憶鉤）。順帶跟 7/3 曖昧系做溫度對照：`interested in`（含蓄）< `into`（上頭）< `gaga over`（誇張戲劇化）。全 ★1，雙語 karaoke 例句＋ `_index` 同步。詞庫 238→**240**。

## 2026-07-03
📚 **單字批次練習：一次 6 字/片語（跨界大雜燴：抽象名詞 + 飲料辨析 + 水果 idiom）**——Cian 連續丟字。新增 **canonical**（公認標準的，涵蓋宗教正典/學術範例/科技 canonical URL 三層次）、**adjacency**（相鄰關係，商業「鄰近市場」黑話 + 圖論 adjacency list 雙用法）、**sparkling water**（氣泡水，辨析 still water/soda water/seltzer/tonic water 全家族）、**carbonated drink**（碳酸飲料，英美加地域用字大不同：fizzy drink/soda/pop/soft drink）、**lemon**（檸檬，重點在 idiom `a lemon`＝瑕疵車/貨 + lemon law + When life gives you lemons 諺語）、**consolidation**（鞏固/整合，商業併購 + memory consolidation 記憶鞏固，呼應 [[english-learning-efficiency-research]] 的 spacing 原理）。全 ★1，雙語 karaoke 例句＋ `_index` 同步。詞庫 232→**238**。
🎧 **新 lesson：Soul — 追夢、脆弱，與「你到底跑哪去了？」**（dialogue · B1 · RealLife English · 講師 Ethan 用 Pixar《Soul》Joe Gardner 試音場景 · ~4 min）：先完整播一次 Dorothea↔Joe 對白場景（split TTS 聲音，兩人分開聲線），再進 Ethan 的教學拆解。**間隔複習亮點**：今天稍早才學會的 `zone out`／`in the zone`／`kill it`（皆 ★1）第一次在真實電影場景複習（review_count 1→2），不是孤立例句。**外部事實查證修正**：獨立查證原片字幕／腳本來源後，發現原設計稿把「I zoned out」誤歸給 Dorothea——實際是 **Joe 自己承認恍神**，「Joe Gardner, where have you been?」才是 Dorothea 的提問；已在 lesson 內修正並註記查證過程。新增 5 個 keeper：**soundcheck**（試音）、**full-time position**（全職職位，對比 Joe 放棄的教職安全感）、**Teach**（稱呼老師的俚語，像叫 Doc）、**where have you been**（對埋沒才華表驚訝的慣用句，非字面問地點）、**take the wheel**（接手掌控）。模組含 Connected Speech（美式 T-flap：get a suit→[geh-duh-suit]）、Sentence Anatomy（"Where have you been?" 慣用現在完成式）。全新字 ★1，雙語 karaoke 例句＋ `_index` 同步。詞庫 227→**232**。
📚 **單字批次練習（第二輪）：flow state + in the zone**——Cian 問「心流狀態怎麼說」。新增 **flow state**（心理學正式用語，源自 Csikszentmihalyi，動詞搭 enter/achieve/hit/reach a flow state）與口語版 **be in the zone**（運動/電玩/日常閒聊常用）。**教學亮點**：`in the zone` 跟同日稍早學的 `zone out` 用同一個字 zone、意思卻完全相反（out＝恍神脫離專注 vs. in＝深陷專注），靠介系詞分——順勢做了跨字對照複習。全 ★1，雙語 karaoke 例句＋ `_index` 同步。詞庫 225→**227**。
📚 **單字批次練習：一次 7 字/片語（曖昧系 + 潮流黑話 + 職場表達）**——Cian 連續丟字，採批次存檔模式（卡片即時給、持久化延到「練習結束」才一次做，見 memory [[vocab-batch-save-workflow]]）。新增：**be interested in someone**（曖昧初期含蓄有好感，例句含「偷瞄」情境 steal glances at）、**be into someone**（比 interested 更熱烈上頭，口語）、**pick up**（一字四義：接人/自然學會/搭訕/接電話，⚠️可拆 pick you up ✅／pick up you ❌）、**swag**（自信氣場 vs 展會贈品雙義，⚠️稍過氣俚語）、**conversational in**（語言能力階梯 basic<conversational<fluent<native，履歷用語）、**zone out**（放空恍神，不及物不可拆）、**kill it**（誇獎「表現超好」，⚠️另義「關掉它」靠語境分，近義 nail it）。全 ★1，雙語 karaoke 例句＋ `_index` 同步。詞庫 218→**225**。

## 2026-07-02
📚 **新增單字：harvest** /ˈhɑːrvɪst/（n./v.，收穫、收成；收割、採收）——Cian 傳單字想學（一開始被 Coach Max 誤當成「單字 harvest＝去收割一波單字」的指令 😅，其實只是要查字）。重點是**名詞動詞同形**（the harvest 收成／to harvest X 採收），以及比喻用法 **harvest data／harvest energy**（大量蒐集），搭配詞 a bumper harvest、reap the harvest。★1，雙語 karaoke 例句兩句（名詞收成義＋動詞收割義）＋ `_index` 同步。詞庫 217→218。
📚 **碎片複習：15 分鐘 retrieval quiz（中→英快問快答）**——Cian 早上已練新字、午後有 15 分鐘 → Coach Max 依學習科學（碎片時段 CP 值最高＝主動提取＋間隔複習，見 [[english-learning-efficiency-research]]）不塞新字、改複習今早那批 ★1。Round 1 七題複習 7 字（**baby / fuse(have a short fuse) / scarf(down) / mileage(get mileage out of) / effect(affect vs effect) / colleague / be seeing somebody**），全數 review_count 1→2（同日複習、★維持 1）。表現：核心單字 retrieval 成功率高；**affect vs effect 滿分** ⭐；短板集中在**兩個系統性習慣——過去式 -ed 漏字（scarf→scarfed）、冠詞 a/the 誤用（a lunch、whole chicken）**，另 fired→fried 混淆、be seeing 漏受詞 each other。Round 2（go all out / bring up / in a pinch）未做，Cian 收在此。
📚 **單字批次練習（一次 19 字/片語 + 1 複習）**——Cian 連續丟字、採**批次存檔**模式（卡片即時給、持久化延到「練習結束」才一次做，見 memory [[vocab-batch-save-workflow]]）。新增：**baby**（口語貶義「玻璃心／媽寶」，vs childish）、**mileage**（里程數＋引申 get mileage out of＝榨效益/吃老本）、**fuse**（保險絲/引信/融合＋have a short fuse 脾氣暴）、**cuisine**（菜系，法文借詞重音在後 /kwɪˈziːn/，vs dish）、**fiber**（膳食/材質纖維，美 fiber 英 fibre＋every fiber of one's being）、**alpaca**（羊駝，vs llama）、**metallic**（金屬的，含金屬味/鏗鏘聲）、**effect**（效果，⚠️ affect(v.) vs effect(n.)，A=Action/E=End result）、**scarf**（圍巾＋動詞 scarf down 狼吞虎嚥，複數 scarves）、**ingenuity**（巧思/機智，形容詞 ingenious ⚠️ vs ingenuous 天真）、**gadget**（科技小玩意，vs device）、**pardon**（原諒/赦免/你說什麼三義）、**I beg your pardon**（片語，語氣定調：重說/挑釁/道歉）、**be seeing somebody**（片語，see 進行式＝交往中）、**seem**（連綴動詞＋adj.，禮貌軟化神器）、**classmate**（同班同學，⚠️ 不當面稱呼、老師喊 class/everyone）、**coworker**（同事口語）、**colleague**（同事較正式，⚠️ colleague /ɡ/ vs college /dʒ/ 辨音）、**college**（大學，美/英 college vs university 差異＋校園字）。**複習**：prank（同場再現，review_count 1→2）。全 ★1，雙語 karaoke 例句＋ `_index` 同步。詞庫 198→**217**。
📚 **新增單字：childish** /ˈtʃaɪldɪʃ/（adj.，幼稚的、孩子氣的，貶義）——Cian 傳單字想學。重點是跟 **childlike**（天真純真、中性偏正面）要分清楚，childish 幾乎永遠是貶義；常見句型 **It's childish of + 人 + to V**；反義詞 mature。★1，雙語 karaoke 例句兩句＋ `_index` 同步。詞庫 197→198。
📚 **新增單字：crook** /krʊk/（n.，騙子、罪犯；彎曲處、彎鉤）——Cian 傳單字想學。一字多義：「騙子/罪犯」義口語偏老派，類似 swindler／con artist；「彎曲處」義最常見片語 **the crook of one's arm/elbow**（手肘內側彎曲處）。形容詞 crooked＝彎曲的，也引申「不正直、狡詐的」。★1，雙語 karaoke 例句兩句（罪犯義＋身體部位義各一）＋ `_index` 同步。詞庫 196→197。
📚 **新增單字：jerk** /dʒɜːrk/（n./v.，混蛋、討厭鬼；猛拉、抽動）——Cian 傳單字想學。重點是名詞義罵人「混蛋」最常見，語氣比 asshole 溫和一點、比 idiot 更帶惡意（強調對人差勁不體貼）；動詞義較中性，延伸片語 **knee-jerk reaction**（膝反射式直覺反應）。★1，雙語 karaoke 例句兩句（名詞＋動詞各一）＋ `_index` 同步。詞庫 195→196。
📚 **新增單字：prank** /præŋk/（n./v.，惡作劇）——Cian 傳單字想學。重點是招牌搭配 **pull a prank (on someone)**，動詞固定用 "pull" 不是 "do"／"make"；及物動詞用法可直接 "prank someone"。延伸 April Fools' Day、prankster、practical joke（正式說法）。★1，雙語 karaoke 例句兩句＋ `_index` 同步。詞庫 194→195。

## 2026-07-01
- 🎧 **新 lesson：時事英文 ssyingwen「好熱啊」P04 → 三部曲 Part 1：到底有多熱 + 冷氣救命**（talk · B1 · 主持人 Han · 中文講解＋英文歌 · 本地 whisper 轉錄 40 min，slug `2026-07-01-ssyingwen-summer-heat-part-1-how-hot`）：這集用 **15 首夏日金曲**教夏天英文。Part 1 主攻「怎麼喊熱」與「怎麼降溫」——hot 以外的道地說法（baking hot／insanely hot／the heat is brutal／feels like a sauna）、三個「很熱」形容詞細分（**scorching**＝很熱／**sweltering**＝悶到不舒服／**sizzling**＝快烤焦）、熱浪 heatwave＋海市蜃樓 mirage＋高溫警報 heat advisory/warning/alert、以及一整組冷氣句（aircon/AC、turn up、**blast the AC on high**、turn down the temperature、make it cooler、adjust）。模組：Topic & Summary、**正文＝連貫英文旁白**（Coach Max 依原集重點改寫的原創串接、非逐字稿，讓「播放整篇」順暢有連接性；歌詞英文版權區、原集示範例句融進旁白）、Key Vocab（17 條）、Playlist（6 首）、Sentence Anatomy（blast on high＋turn up/down 陷阱）、Cultural Notes、Takeaways。歌單 Selena Gomez《Summer's Not Hot》/ Chappell Roan《HOT TO GO!》/ Glass Animals《Heat Waves》/ Pussycat Dolls《Don't Cha》/ Bananarama & Taylor Swift《Cruel Summer》。live preview 驗（旁白版）：play-all 依序 narration→歌詞→narration 順流、16 段英文 blockquote 可朗讀＋卡拉 OK（narration 65 詞逐字 timing）、歌手標籤已從朗讀剝除、`word` 欄可唸、Playlist 不唸、0 raw `>`；`astro build` 綠、hash-sync 11+11、generated 音檔 failed=0 degraded=0。**此連貫旁白即 P2/P3 的正文模板。**
- 🔎 **外部事實雙輪交叉驗證（+直查）修正**：主持人所引 Pussycat Dolls《Don't Cha》「sizzle like a summertime cookout」雙源查無此句（**不採用**）；「The Guardian 報道」日本酷暑日查無原文，改標 **AFP／外媒**（核心事實無誤：JMA 2026/4 定「酷暑日」40°C+，英譯 cruelly hot）；Chappell Roan《HOT TO GO!》年份 **2023**。raw transcript 存 `transcripts/2026-07-01-15-summer-vibes.txt`（含 `.srt`）。
- 🎧 **Part 2／3 完成（同格式連貫旁白，Cian 裁定照 P1 模板走）**：**Part 2「濕、黏、汗，還有冰」**（hot and humid／humidity／feels-like temperature／muggy／sticky、sweat→sweaty→sweating buckets→drenched in sweat、冰品 ice cream/popsicle/froyo/shaved ice/brain freeze、**melt 一字三用**、summer fling；歌 Señorita／Summer Sweat／deja vu／Melting／Calvin Harris〈Summer〉）＋**Part 3「太陽、海邊與夏天的浪漫」**（sun protection/sunscreen/parasol/shades/sunnies、the sun is beating down／get sunburned、beach/surf/Malibu、meteorological vs astronomical seasons／summer solstice／equinox／winter solstice、midnight sun/Arctic/golden hour；歌 Far Rider／Malibu／Midnight Sun／Put Your Records On）。兩篇皆連貫旁白＋歌詞英文版權區、Series Map 三 part 互連。live preview 驗：P2 13 段、P3 11 段英文 blockquote 皆可朗讀＋卡拉 OK、歌手標籤剝除、`word` 欄可唸、Playlist 不唸、0 raw `>`；`astro build` 全綠、hash-sync 11+11、generated 音檔 failed=0 degraded=0。
- 📚 **新增 18 個 keeper 單字**（三部曲一起建，跳過 trivial 如 ice cream／sunscreen／surf）：P1 scorching／sweltering／sizzling／heatwave／mirage／cruelly hot；P2 muggy／sweating buckets／drenched in sweat／brain freeze／melt／summer fling；P3 parasol／beat down／sunburned／summer solstice／equinox／midnight sun。全 ★1，建檔＋雙語 karaoke 例句＋ `_index` 同步。詞庫 **176→194**。全 15 首歌／年份／歌手＋數值事實（華氏換算、heat index、夏至 6/21 秋分 9/23、Malibu/Iron Man）皆雙輪交叉驗證＋直查通過。

## 2026-07-01
📚 **新增單字：Socratic** /səˈkrætɪk/（adj.，蘇格拉底式的）——Cian 傳單字想學。重點放在招牌搭配 **the Socratic method**＝用一連串提問逼出對方自己的推理，而不是直接給答案（法學院／教學／面試常用），以及它是**專有形容詞、字首 S 常大寫**。延伸 `Socratic questioning / dialogue / irony`。★1，雙語 karaoke 例句（mentor 追問＋教練問答各一句）＋ `_index` 同步。詞庫 175→176。

## 2026-07-01
- 🎧 **新 lesson：RealLife English — 用「80/20」攻片語動詞**（talk · B1 · 講師 Ethan · 字幕截圖 ~4 min 3 段）：Ethan 針對「卡關（been stuck at the same level）」的中級學習者，主張別念更兇、要念更聰明——把火力集中在**單字學習的 80/20**＝phrasal verbs／idioms／word formation。本課聚焦片語動詞，用 "John was going to **push back** the meeting but **ended up** **calling it off** instead." 示範母語密度，再給 4 個訣竅（從最常見學起／按情境分類／查 splittable 可拆性／每個配一個同義替身）。模組：Topic & Summary、正文（Ethan 三段＋引述 Thiago）、Key Vocab、Phrasal Verbs Decoder（片語動詞→替身字）、Sentence Anatomy（三連發片語動詞＋可拆/不可拆受詞位置）、Cultural Notes（80/20 帕雷托、rock a look、without further ado、get by 吞 by）、Takeaways。
- 📚 **新增 12 字／片語**：push back、end up、call off、get by、hang out、put up with、stand out、stack up（8 個片語動詞）＋ without further ado、get straight to the point、in one sitting（3 個 idiom）＋ rock（動詞口語義「自信頂著某造型」）。重點辨析：**splittable**（可拆 call it off ✅／call off it ❌）vs 不可拆（put up with it）；片語動詞 vs 替身字（口說優先片語動詞、別退回 postpone/cancel 書面字）。全 ★1，建檔＋雙語 karaoke 例句＋ `_index` 同步。詞庫 163→**175**。

## 2026-06-30
- 📚 **新增單字：mastery**（Cian 傳了單一個字 `mastery` 想學）：/ˈmæstəri/，n.，精通、嫻熟；掌控、駕馭。兩義同一條根 `master`（v.）→ `mastery`（n.）。重點放在**介系詞分工**——`mastery of X`＝精通某技能（最高頻，配 achieve／gain／demonstrate），`mastery over X`＝凌駕／控制某對象（mastery over your emotions／the market）；記憶鉤 of＝精通技能、over＝壓制對象。詞家族 master→mastery→masterful/masterly→masterpiece。TOEIC 角度：`mastery of` 比 `being good at` 正式有力。近義 command／proficiency／expertise／prowess／virtuosity。★1，雙語 karaoke 例句（精通＋掌控各一句）＋ `_index` 同步。詞庫 162→163。

## 2026-06-29
- 📚 **新增單字：primer**（Cian 傳了單一個字 `primer` 想學）：/ˈprɪmər/，n.，入門書／入門指南；底漆；底火／雷管。重點放在**一字多義＋發音分岔陷阱**——「入門書」義美式念 /ˈprɪmər/（短 i），但「底漆／底火／妝前乳」永遠念 /ˈpraɪmər/（長 i），同一個字撞到兩種音、靠上下文判斷（`a primer on AI` vs `spray primer`）。最高頻用法 `a primer on X` = X 的入門教材（科技／商業文章常見）。近義 introduction／crash course／the ABCs；底漆 undercoat／base coat。★1，雙語 karaoke 例句（三義各一句）＋ `_index` 同步。詞庫 161→162。

## 2026-06-28
- 📚 **新增單字：Einstellung effect**（Cian 傳單字 `Einstellung` 想學，緊接 triage 之後、又一個外語借詞）：/ˈaɪnʃtɛlʊŋ/，n.，定勢效應／思維定勢。德文原意超日常（setting／attitude／聘用），但借進英文後語意窄化成心理學的 **the Einstellung effect**——因過去成功經驗卡在熟悉舊方法、看不見更好/更簡單的新解。經典 Luchins 水罐實驗。辨析 vs functional fixedness／mental set／cognitive rigidity。與前一字 `triage` 對照：triage 是主動取捨的好習慣、Einstellung 是被舊經驗綁架的壞陷阱。★1，雙語 karaoke 例句＋ `_index` 同步。詞庫 160→161。
- 📚 **新增單字：triage**（Cian 傳了單一個字 `triage` 想學）：/ˈtriːɑːʒ/，n./v.，檢傷分類／按輕重緩急排序處理。源自法文（`-age` 念 /ɑːʒ/，像 garage 尾音）、原為戰場與急診室用語（資源有限時決定誰先救），現大量借入 tech／business：`triage bugs`、`triage tickets`、`triage your inbox`。辨析 vs `prioritize`／`sort`——triage 多一層「資源不夠、必須取捨」的緊迫感。小插曲：Coach Max 一開始把 `triage` 讀成指令、真的對 repo 做了一輪 triage，才發現 Cian 是要學這個字本身。★1，雙語 karaoke 例句＋ `_index` 同步。詞庫 159→160。

## 2026-06-25
- 📚 **Lesson 複習 Q&A：《The Devil Wears Prada》第一天**（Cian 在自學頁面後問了 8 個不熟點）：拆解 `chopping block`（砧板畫面、vs on the line）、`roll to voicemail`（`roll (over) to` ＝自動轉接／續轉）、`yet`（轉折＝however，≠ not yet）、`get to`（有幸／得以，對比 have to）、`couture`（高級訂製服）、`divine`（口語＝美妙極了）、`skim`（略讀＋撇去）；並釐清 `sliced her hand open` 的 `open` 是**形容詞**（結果補語 `動詞+受詞+形容詞`），整句沒有省略連接詞（`because` 即是）。**新增 6 個單字**：get to、roll over to、yet、skim、divine、couture（全 ★1，雙語 karaoke 例句＋ `_index` 同步）；**複習** on the chopping block（★1，review_count 1→2）。Lesson 補 3 個 Key Vocab（get to / roll to voicemail / yet）＋ Sentence Anatomy #3（結果補語 slice…open）＋ Cultural Notes（skim 略讀義、get to vs have to、yet 轉折）。詞庫 153→159。

## 2026-06-23
- 🔧 **Lesson review＋修正：《The Devil Wears Prada》第一天**（對照 RealLife English 原片字幕 + final-film transcript 雙來源、兩輪交叉查證）：① **拆開被合併的對白**——`Oh, Emily? What do I do—`（**Andy**，被打斷）／`Deal with it.`（**Emily**）原本整段掛在 Emily，改成兩個 speaker block（dialogue track 本該如此）；② **查證第 5 句講者**：`Man the desk at all times. Got it.`——早先劇本 draft 誤標 Andy，**final film 確認是 Emily 的乾脆收尾**（標點 `?`→`.`，原 lesson 標 Emily 其實正確）；③ **補回原片有教、lesson 漏掉的字**：新增 **figure it out**（deal with it 同義替換）建單字檔＋ `_index`＋雙語 karaoke 例句，並在 lesson 加「順帶認得」被動字（appointments／expenses／divine／fall）。詞庫 152→153。
- 🎙️ **App：per-speaker prosody（語氣聲調）＋本篇接上雙講者聲音**。`generate-audio.mjs` 的講者→聲音表進化：每個講者值可寫 `{ voice, rate, pitch, volume }` 物件，把 prosody（語速/音高/音量）烤進合成（**build-only、hash 仍 text-only → runtime/karaoke 零改動**，timing 從加了 prosody 的同一個 mp3 重抓）。抽 `resolveVoiceEntry`（回 `{voice,prosody}`）、`resolveVoice` 變字串 wrapper（fixture 相容）、`synthesizeToFile` 穿 `prosody → toStream`、`--revoice` 也重生帶 prosody 的 clip。本篇 frontmatter `speaker_voices`：**Emily＝en-GB Sonia ＋ `rate +10% / pitch +4%`**（高張力、連珠炮的英國主管）、**Andy＝en-US Jenny** → dialogue 終於是兩個人而非全程 Aria 旁白。**驗證**：`astro check` 0 error、build 172 頁綠、hash-sync 11+11、prune 0 orphan；live preview 數值法 11/11 段 `sidecar.n==DOM span`、onset 單調、maxOnset<時長；**byte-exact 證明**烤進真檔（`Deal with it.` 7488B=Sonia+prosody≠Aria 11088B；Andy 23328B=Jenny）；prosody 量測 0.912×（≈快 9%）。`/simplify` 4-agent 全判 clean。**研究確認**：免費 Edge 端點只有 prosody，真情緒 style（cheerful/angry…）需付費 Azure → 評估寫進 `app/docs/roadmap.md` P10。
- 🎧 **新 lesson：《The Devil Wears Prada》— Miranda 的地獄級第一天**（dialogue · B2）：依 RealLife English / Ksenia 字幕截圖整理 Andy 第一天上班場景。主題＝咖啡訂單、辦公室值守、跑腿分工與工作風險；收錄完整可見台詞、職場套句、`be chained to` 被動結構與 `if + 現在式` 後果句。
- 📚 **新增 11 個單字／片語**：**skimmed milk**（脫脂牛奶；美式常說 skim milk）、**drip coffee**（滴濾咖啡）、**run errands**（跑腿辦雜事）、**deal with it**（接受並處理；語氣陷阱）、**fling**（猛丟；fling–flung–flung）、**foam**（泡沫／奶泡）、**man**（動詞：顧守／操作）、**searing**（灼熱／劇烈）、**chained to**（因責任走不開）、**on the line**（處於風險）、**on the chopping block**（面臨被砍）。全 ★1，並做 `on the line` vs `on the chopping block` 辨析。詞庫 141→152。
- 📚 **新增 5 個單字**（影集學單字 app 複習清單 Progressed vocabulary）：**swell up**（腫起來／膨脹）、**know-it-all**（萬事通、自以為什麼都懂，貶義）、**get even**（報復、扯平、以牙還牙）、**drill**（電鑽／反覆操練／演習／鑽孔，一字多義）、**speedometer**（時速表）。全 ★1，建單字檔＋雙語例句（karaoke 格式）＋同步 `_index.md`。交叉連結：know-it-all → smart aleck / conceited / opinionated（自負性格家族）；drill 操練義 → grill（反覆、密集）；speedometer 標重音陷阱 spi-DOM-i-ter 並與 odometer 區分。

## 2026-06-18
- 🐢 **App P9：速度控制捲動後 sticky 顯示**（roadmap P9 → Done）。P7 語速鈕只在頂部 header、往下捲就用不到；需求是「任何時候都能調速度」。落地：頂端維持原 header 控制，當它捲出視窗（`getBoundingClientRect().bottom <= 0`）→ 頂部 slide+fade 進一條 `fixed` 薄條，只含速度控制，捲回收起（reveal-on-scroll）。**單一狀態來源**：抽 `buildSpeedControl()` 讓 header＋sticky 兩組速度鈕 push 進同一個 `speedBtns` 陣列 → `updateRateUI` 自動同步、`setPlaybackRate` 零改動（點任一組都同步另一組＋持久化，數值法實測過）。reveal 用 rAF-throttled scroll handler（對齊 lesson `reading-spine` 既有模式；原 spec 寫 IntersectionObserver，因 headless 不 fire＋與既有模式一致而改）。`Layout.astro` 加 `.sticky-speed-bar` CSS（z-40 在進度線之下、760px 置中靠右、`prefers-reduced-motion` 只 fade、≤640px 藏「速度」字）。先 brainstorm 定方案（reveal-on-scroll vs always-on vs 浮動膠囊）→ 寫 spec 進 roadmap → 實作 → live preview 數值驗 → `/simplify`（修 3 條小註解/CSS）。`astro check` 0 error、build 154 頁綠。**headless 限制**：scroll/rAF/transition 在 0×0 headless 預覽不 fire，實際捲動淡入動畫待真機（iPhone）確認；predicate＋兩終態＋狀態同步＋RWD 皆已數值驗。
- 同時：**🐛 修 iPhone 播放控制圖示變 emoji**——`▶ ⏸ ■` 原是 Unicode glyph 用 `textContent` 塞按鈕，iOS 套 emoji presentation 變彩色 emoji；改成 inline SVG（`fill="currentColor"` 繼承主題色、`.ctl-icon` 自帶尺寸），全平台一致、根治。

## 2026-06-16
- ▶️ **App P8：播放整篇（lesson 連播 / play-all）**（roadmap P8 → Done）。新功能：lesson 正文頂部 `▶ 播放整篇` → 依 DOM 順序連播所有英文正文段落，每段自動置中捲動＋`.speaking` 高亮＋卡拉 OK 自動沿用、多聲音由各段既有 mp3 自帶（dialogue 像一齣對白）。控制 UI：idle 頂部鈕、**播放中換底部浮動控制**（`fixed` 沿用 no-voice toast 定位；主鈕 morph `⏸`/`▶繼續` ＋ `■停止` ＋ `第 N/M 段`，隨捲動恆可見），idle/active 互斥。中斷：停止鈕 & Esc＝硬停拆音、手動點任一段/vocab 字＝軟離開連播（不碰音訊交回該控制）、浮動列暫停＝凍結序列從同段續播。實作純疊一層編排器在現有 per-clip 播放上：`speech.ts` 三個 playback fn 穿 `onDone?`（只在自然播完觸發，teardown 不誤觸）+ module 編排器（`start/step/advance` + 共用 `resetPlayAll`）+ 三個手動入口開頭軟離開；hash/karaoke/manifest/sidecar 零改動。`Layout.astro` 加 `.play-all-*` CSS。先 brainstorm（按鈕擺法、scroll 可見性、中斷策略逐一定案）→ 實作 → live preview 全狀態機實測（stub + 真音檔 E2E：第1段播放→自然 ended→自動進第2段換聲音）→ `/simplify`（抽共用 `pauseCurrent`/`resumeCurrent`、去重複 progress）。`astro check` 0 error、build 154 頁綠。**同日多輪微調（v1.1–1.3）**：入口鈕→ icon-only 小圓鈕放進 `.lesson-meta` 列尾端、點擊後消失由浮動 bar 接管狀態（在列尾隱藏 → 0 reflow）；浮動列加「◎ 回到播放位置」鈕（捲開後一鍵回正在播段落）；段落 inline 控制加 **stop（■）**、三鈕（▶/↻/■）改 `.speak-btns` flex-column 容器自動置中（退掉 magic-offset）；四處硬停統一成 `hardStop()`；連播時**藏掉段落 inline 控制**（`body.play-all-active`，避免狀態跟著閃／兩個 ⏸），順手修掉入口鈕 `[hidden]` 被 `display:inline-flex` 蓋掉、其實沒消失的潛藏 bug；**移除段落 replay（↻）鈕**（`stop→play` 即從頭重播、多餘），單段控制統一成 play/pause ＋ stop。未做：完整 sticky mini-bar、跨 lesson 連播。
- 🛠️ **App：卡拉 OK 蔓延全面鋪開＋設為 build 預設**（接 P2，pilot→全站）。把逐字「已讀蔓延」trail 從只有 `learning-styles`（11 sidecar）擴展到**全部可朗讀內容**。`generate-audio.mjs` 新增 `--words-all`（每個段落都產 `.words.json` timing sidecar，取代脆弱的 `--words=<日期子字串>`），接進 `predev`/`prebuild` ＋ `audio:gen:all`／`audio:revoice` 也帶 `--words-all` → 未來新 lesson/vocab 自動有 karaoke 不退化、`--revoice --words-all` 一次重生 mp3＋sidecar 保證對齊。**回填 +514 sidecar**：16 篇 lessons（237/243 段）＋ 136 vocab 例句頁（294/302 段）；**純加法**（0 mp3 變更、0 manifest 變更——`synthesizeToFile` 不覆蓋既有 mp3，只重抓 WordBoundary）。14 段對齊 <85% 安全退化整段高亮。驗證：`astro build` 154 頁綠、generated=0、hash-sync 11+11、prune 0 orphan；live preview 數值法全庫掃 **0 個 `sidecar.n≠DOM span` 不匹配**、onset 單調、sidecar 結尾對 mp3 時長差恆 **~0.87s（與基準篇一致）→ 無跨合成 drift**；`/simplify` 4-agent（修掉「vocab 被排除」錯誤註解）。Cian 裁決保留 vocab 例句 karaoke（全站一致）。已知小尾巴：14 degraded 段每次 build 重 synth 一次（網路 soft-fail、不影響輸出），可加 degrade marker 省掉、待評估。

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
