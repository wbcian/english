---
date: 2026-05-26
topic: cat-wu-part-3-cowork-workflow
series: cat-wu-anthropic-product-team
part: 3
source: "🎧 Lenny's Podcast · Cat Wu（Anthropic, Claude Code 產品負責人）· 訪談切片 Part 3"
type: lesson
track: dialogue
audio: true
---

# Cat Wu 訪談 — Part 3：Cowork in Practice — 親自示範做 slide deck

<p class="lesson-subtitle">🎧 Lenny's Podcast · Cat Wu（Anthropic, Claude Code 產品負責人）· 訪談切片 Part 3（lines 1417–1715 + 1881–1989）</p>

## Topic & Summary

承接 [Part 1](2026-05-26-cat-wu-part-1-shipping-speed.md) 的速度哲學跟 [Part 2](2026-05-25-cat-wu-pm-skills-and-taste.md) 的 PM 技能盤點，這集進到**怎麼實際用**。Cat 拆四個產品（CLI / Desktop / Web&Mobile / Cowork）的使用情境、示範一個跨夜跑的 slide deck workflow——連她**實際打的 prompt 都唸出來**。三大可帶走的東西：(1) `kick off / on the go / touching grass` 三個生活感超強的工作詞；(2) 「連接資料源」是 Cowork 第一步的工程化思維；(3) 業務同事手刻內部 app 的 case study，看 AI 怎麼把「重複手動工作」變成「一鍵 tailored 輸出」。

> Picking up from [Part 1](2026-05-26-cat-wu-part-1-shipping-speed.md)'s speed philosophy and [Part 2](2026-05-25-cat-wu-pm-skills-and-taste.md)'s PM skill audit, this part shifts to **how it's actually used**. Cat breaks down when to reach for each of the four products (CLI / Desktop / Web&Mobile / Cowork) and walks through an overnight slide-deck workflow — reading out her actual prompt. Three takeaways: (1) `kick off / on the go / touching grass` — three idioms that make work-talk feel human; (2) "connect data sources first" as the engineering-style mindset for Cowork; (3) a sales-team custom-app case study showing how AI converts repetitive manual work into one-click tailored output.

## 🎬 Series Map

**Cat Wu Anthropic 訪談系列**（共 3 part）：

- **Part 1：Anthropic 怎麼出貨那麼快** → [lesson](2026-05-26-cat-wu-part-1-shipping-speed.md)（lines 51–441）
- **Part 2：PM Skills & Taste** → [lesson](2026-05-25-cat-wu-pm-skills-and-taste.md)（lines 669–1075）
- **Part 3：Cowork in practice — 親自示範做 slide deck** → 你正在這（lines 1417–1715）

---

## 正文 · 跟讀用（訪談精選）

<div class="lesson-body-scroll">

> **Scene 1 — Cat (line 1429) — 什麼時候用 CLI**
> So I tend to use Cloud Code in the terminal when I'm just **kicking off** like a **one-off** coding task, and I want all of the latest features. The CLI is our initial product surface, and it's also the one where our features often **land first**.

> Scene 1 — Cat（line 1429）：我通常會在 terminal 裡用 Cloud Code，特別是當我只是要 kick off（啟動）一個 one-off（一次性）的 coding task、又想用到所有最新功能的時候。CLI 是我們最初的產品介面，新功能往往也都是先在這裡 land（上線）。

> **Cat (1451) — Desktop 適合 front-end**
> I think desktop really **shines** when you're doing something that requires front-end work. And so one thing that I love to do is to use our preview feature. So if I'm building a web app, I'll often use Cloud Code and Desktop. I'll have the **preview pane** open on the right-hand side so that I can actually see the web app that I'm making in real time as I'm chatting with Cloud.

> Cat（1451）：我覺得 Desktop 在你做需要前端的工作時最能發揮優勢。我超愛用的一個功能就是 preview（預覽）。所以如果我在做一個 web app，我常常會同時用 Cloud Code 跟 Desktop，把 preview pane（預覽窗格）開在右邊，這樣我一邊跟 Cloud 對話，就能即時看到我正在做的網頁長什麼樣子。

> **Cat (1487) — Desktop 當 control plane**
> Desktop is also great for getting an **at-a-glance** view of everything that's happening. So you can see your CLI terminal sessions in desktop... It's a **one-stop control plane** where you can see all of your tasks.

> Cat（1487）：Desktop 也很適合用來 at-a-glance（一眼）掌握所有正在進行的事。你可以在 Desktop 裡看到你的 CLI terminal sessions……它就是一個 one-stop control plane（一站式控制台），所有的 task 都看得到。

> **Cat (1503) — Web & Mobile 的 niche**
> I think the benefit of web and mobile is that it's really great for **kicking things off on the go**... You're like **touching grass**, you're going on a walk, and you don't have your laptop open.

> Cat（1503）：我覺得 web 跟 mobile 的好處是，它真的很適合讓你 on the go（在路上、移動中）就把事情 kick off（啟動）起來……就是你正在 touching grass（出去走走、離開電腦）、在散步，手邊沒開筆電的那種時候。

> **Cat (1545) — Cowork 的定位**
> The role that this fills is there's a lot of work that everyone does **where the output isn't code**. So whether that's like getting to Slack zero or **inbox zero**, or whether that's creating a slide deck for some customer meeting... So the way that I split the products in my mind is **if the output is code, I'll use Cloud Code... if the output is anything that's not code, I'll use Cowork for it**.

> Cat（1545）：它要補的這個角色是——大家其實有很多工作，輸出的東西並不是 code。不管是把 Slack 清空、達到 inbox zero（收件夾清空），還是替某個客戶會議做一份 slide deck（投影片）……所以我腦中區分這幾個產品的方式就是：如果輸出是 code，我就用 Cloud Code……如果輸出是任何不是 code 的東西，我就用 Cowork 來做。

> **Cat (1597) — Cowork 第一步：連接資料源**
> If you're getting started on Cowork, the first thing that you really need to do is **connect all the data sources** that are relevant to your role. Because Cowork can only do a great job if it has **access to all the context** that it needs to be able to **curate** the output for you... I connected to my Google Calendar, I connected to my Slack, to my Gmail, to my Google Drive.

> Cat（1597）：如果你剛開始用 Cowork，你真正要做的第一件事，就是把所有跟你角色相關的 data source（資料源）都連接起來。因為 Cowork 只有在能 access to all the context（讀到它需要的所有脈絡）時，才有辦法替你 curate（精選整理）出好的輸出……我連了我的 Google Calendar、連了我的 Slack、Gmail，還有 Google Drive。

> **Cat (1625) — Slide deck workflow 開場**
> Last night, I was working where we have this Code with Cloud conference coming up and there's a few talks that I'm giving there... I have my Google Drive connected, I have Slack connected. Alex, who's our product marketer, put together like a **draft** of what the points that he thinks we should cover are. And so I just like **fed this all into Cowork**.

> Cat（1625）：昨天晚上我在忙，因為我們有一場 Code with Cloud 研討會快到了，我要在上面講幾場 talk……我的 Google Drive 連好了、Slack 也連好了。Alex，我們的產品行銷，他整理了一份 draft（草稿），列出他覺得我們應該涵蓋的重點。所以我就直接把這一整包 fed into Cowork（餵給 Cowork）。

> **Cat (1665) — Cowork 跑了一整夜**
> And it actually just **worked for an hour**. It walked through Twitter to see what we launched. It looked through our Evergreen Launch Room... And it **synthesized** all this together to this 20 page deck that I woke up to this morning. And I read through it and it was like pretty good. There were a few tweaks.

> Cat（1665）：然後它就真的整整跑了一個小時。它去翻了 Twitter 看我們發布了什麼，也看過我們的 Evergreen Launch Room……再把這些全部 synthesize（統整）成一份 20 頁的 deck，我今天早上一醒來就看到了。我從頭讀過一遍，覺得還滿不錯的，只需要改幾個小地方。

> **Cat (1747) — Cat 實際打的 prompt（直接拿來用）**
> So I just wrote: "**Make me a slide deck** for the Code with Cloud conference. **This is what our PMM suggested it should cover.** **This is the current draft that I made that I don't like.** **This is one that I made manually that I don't like and I linked it. Can you start by creating a proposed outline with details? Also make sure it doesn't overlap too much with a keynote talk, which is more important.**"

> Cat（1747）：所以我就打了：「幫我做一份 Code with Cloud 研討會用的 slide deck。這是我們 PMM 建議應該涵蓋的內容。這是我自己做的、我不喜歡的現有草稿。這是另一份我手動做的、我也不喜歡的，我把連結附上了。你可以先幫我做一份附細節的提案大綱嗎？另外要確保它不要跟一場 keynote talk 重疊太多，那場比較重要。」

> **Cat (1921) — 銷售團隊自製 app**
> One of the sales folks on Cloud Code... he realized he was making these like **repetitive decks** over and over. And so he actually has this web app that he built with the examples of the core Cloud Code decks that we know work well... And then he has a way to **input specific customer context** that pulls from Salesforce, that pulls from Gong, that pulls from other notes so that we can customize the decks for specific customers.

> Cat（1921）：Cloud Code 團隊裡有一位做業務的同事……他發現自己一直在重複做這些 repetitive decks（一再重複的投影片）。所以他乾脆做了一個 web app，裡面放了那些我們知道效果很好的核心 Cloud Code deck 範例……然後他還做了一個地方可以 input specific customer context（輸入特定客戶的脈絡），會去拉 Salesforce、拉 Gong、拉其他筆記的資料，這樣我們就能針對特定客戶客製化這些 deck。

</div>

---

## Key Vocabulary

| word | pos | zh | note |
|---|---|---|---|
| kick off | phr. v. | 啟動（任務 / 專案）；開球 | 工作 / 運動雙用；可接 a task / a meeting / a project |
| one-off | adj. / n. | 一次性的（非循環） | 形容詞用法多；對比 recurring / repetitive |
| on the go | idiom | 移動中；在路上 | "I'll handle it on the go"；超實用 |
| touching grass | slang | 出去走走；接觸現實（離開電腦） | 2022+ 網路語；揶揄宅人 |
| at-a-glance | adj. (compound) | 一眼可看；瀏覽式 | `at-a-glance view`、`at-a-glance dashboard` |
| synthesize | v. | 綜合；統整成單一輸出 | 商務／學術／AI 場合常見 |
| tailored | adj. | 量身打造的 | 從 tailor（裁縫）來；`tailored deck / proposal` 是 sales 標配詞 |
| inbox zero / Slack zero | n. phr. | 收件夾／Slack 清空狀態 | 生產力圈黑話；可造 `notifications zero` |

---

## 📚 延伸字詞（key terms — Cat 用過、值得釘牢）

| word | pos | zh | 出現位置 |
|---|---|---|---|
| land first | v. phr. | （功能）先在這裡上線 | Cat (1437) "features often land first" |
| shine | v. | 表現出彩；發揮優勢 | Cat (1451) "Desktop really shines" |
| preview pane | n. phr. | 預覽窗格 | Cat (1457) "have the preview pane open" |
| one-stop control plane | n. phr. | 一站式控制台 | Cat (1499) "one-stop control plane" |
| feed (data) into ~ | v. | 把資料餵給～ | Cat (1659) "fed this all into Cowork" |
| draft | n. | 草稿；初稿 | Cat (1655) "put together like a draft" |
| tweak | n. / v. | 微調 | Cat (1683) "There were a few tweaks" |
| outline | n. / v. | 大綱；列大綱 | Cat (1765) "creating a proposed outline" |
| dual goal | n. phr. | 雙重目標 | （見 Applied AI 段）"dual goal of needing to manage..." |
| ETA | n. (acronym) | 預計時間（Estimated Time of Arrival） | Cat (2203) "get the latest ETA" |
| hackable | adj. | 可客製化的；可改造的 | Cat (2031) "easy they've made to customize it" 衍生 |
| dossier | n. | 情報檔；簡報資料夾 | Cat (2189) "put together this like dossier" |
| top of mind | idiom | 心中最在意的；最 priority 的 | Cat (2185) "What's top of mind for them?" |

---

## 核心主題 ①：四個產品什麼時候用哪個（Cat 的腦中決策樹）

把 Cat 整段話翻譯成決策表：

| 情境 | 用哪個 | 為什麼 |
|---|---|---|
| 在筆電前、kick off 一次性的 coding task、要最新功能 | **CLI** | 最早 land 功能、最 powerful |
| 做前端、要 live preview、要看 dashboard 總覽 | **Desktop** | preview pane、at-a-glance 全部 sessions |
| 在外面、touching grass、想啟動 task 但筆電不在 | **Web / Mobile** | on the go 啟動 |
| 輸出**不是 code**（投影片、文件、Slack 回信） | **Cowork** | 跨 Slack / Gmail / Drive 整合 |

Cat 的金句：

> If the output is code, I'll use Cloud Code or Desktop or Cloud Code on mobile. **If the output is anything that's not code, I'll use Cowork.**

> 💡 **Coach Max 提醒**：這個「**以 output 類型決定工具**」的腦袋是 Cian 你可以直接借用的工作流模板——下次同事問你「我這個任務該用哪個 AI 工具」，第一句反問就是「你最後要產出什麼？code、deck、還是 email？」對方答完，工具就出來了。

---

## 核心主題 ②：Cat 的 Slide Deck Prompt — 拆給你看每個 chunk 在做什麼

Cat 唸出來的 prompt（line 1747），重新排版：

```
Make me a slide deck for the Code with Cloud conference.        ← 目標宣告
This is what our PMM suggested it should cover.                  ← 給目標來源
This is the current draft that I made that I don't like.         ← 反例（避雷）
This is one that I made manually that I don't like and I linked it.  ← 第二個反例
Can you start by creating a proposed outline with details?       ← 第一步要求
Also make sure it doesn't overlap too much with a keynote talk,   ← 邊界條件
which is more important.
```

5 個 chunk 的功能：

| Chunk | 功能 | 為什麼重要 |
|---|---|---|
| 目標宣告 | 告訴 model 你要什麼輸出 | 沒有目標就是亂猜 |
| 給目標來源 | model 知道哪邊找對的角度 | 有 context 才能 curate |
| **兩個反例（!!）** | 告訴 model 你**不要**什麼 | 比正例更有壓縮資訊量 |
| 第一步要求 | 把任務拆成「先 outline」 | 防止它直接生 20 頁 deck |
| 邊界條件 | 提醒它避開其他演講重疊 | 跟整體 context 對齊 |

> 💡 **Coach Max 提醒**：注意 Cat **用了兩個反例**——這是矽谷頂級 prompt engineer 的標配技巧。Cian 你寫 prompt 卡在「為什麼 Claude 沒做出我要的」時，可以加一句 `Here's what I DON'T want: ...`，立刻 +20% 命中率。

### 套用句式

> **Can you start by [V-ing] ... ? Also make sure [constraint].**

把 `start by` 換成你要的第一步，`make sure` 接邊界條件——這個結構直接生產化你的 prompt 工作流。

---

## 核心主題 ③：「Cowork only works if it has access to all the context」

Cat 在 line 1597 講的這句話是整集**最容易被忽略但最重要的工程化思維**：

> Cowork can **only do a great job if it has access to all the context** that it needs.

意思是：**AI 工具的好壞 80% 不在 prompt，在於它能不能讀到該讀的東西**。

Cat 連接了什麼：

- ✅ Google Calendar
- ✅ Slack
- ✅ Gmail
- ✅ Google Drive

> 💡 **Coach Max 提醒**：這跟 Cian 你工作脈絡直接對應——你建 `cian-co/` 這個 brain repo 把 vocab / lessons / profile 全都 markdown 化，本質就是同一件事：**讓 AI 工具讀得到你的所有 context**。`product taste` 是「選對寫什麼」，**`access to context` 是「讓工具有機會幫你選對」**。兩個是配對技能。

---

## Useful Phrases & Patterns

### 1. `kick off ~ on the go`（移動中啟動任務）
> What mobile lets you do is **kick off these tasks on the go**.

兩個工作詞同時出現的金句模板。可套：
- I can **kick off the deploy on the go** from my phone.
- We **kicked off the migration on the go** while traveling.

### 2. `as long as it's not [V-ing] [N], it's OK`（容忍非關鍵問題）
> There's products that we ship that aren't as polished as I wish they were. But **as long as it's not blocking the core use case, it's OK**.

軟性接受瑕疵的句式。Cian 你做 review、討論 PR 時可以拿來表達「這不完美但可接受」。

### 3. `pull from X, pull from Y, pull from Z`（多源整合 listing）
> A way to input specific customer context that **pulls from Salesforce, pulls from Gong, pulls from other notes**.

`pull from ~` 是 data 工程超高頻動詞。三個並列用 listing 更有節奏感。

### 4. `[I woke up to this] morning`（描述跨夜 async work）
> A 20-page deck that **I woke up to this morning**.

`wake up to ~` = 「醒來發現有 ~」的固定句式。AI 跨夜工作的時代必備句。

---

## Study Tips / Takeaways

- **Touching grass 是 2024+ 必學 slang**：寫得正式不太行，但 Slack / Twitter / DM 用很適合自嘲「我太宅了該出去走走」。
- **`kick off` 是萬用工作動詞**：把以前你會說 `start a task` 全換成 `kick off a task`，整體職場英文升一級。
- **Cat 的兩反例 prompt 技巧**：下次你寫複雜 prompt 加兩句「Here's what I tried and don't like」——Cowork / Claude 命中率瞬間拉高。
- **Cowork 真正的解鎖鑰匙是 data source connection**：很多人以為是 prompt 寫得多好，其實是「有沒有讓 AI 讀到該讀的東西」。
- **`I woke up to a 20-page deck` 是時代金句**：未來你 async 跑長 task 時，這句直接套用——一句話傳達「AI 跨夜做完事我醒來收成」的工作模式。

---

## 系列總結（Cat Wu 訪談三部曲）

| Part | 焦點 | 核心詞（pick 1） |
|---|---|---|
| [Part 1](2026-05-26-cat-wu-part-1-shipping-speed.md) | 速度 + 流程 + Mission | **mind meld**（人之間） |
| [Part 2](2026-05-25-cat-wu-pm-skills-and-taste.md) | PM 心法 + 心態 | **lean into the chaos**（對工作） |
| Part 3 | 工具使用 + Workflow | **kick off on the go**（對任務） |

> 💡 **Coach Max 最終提醒**：Cian 你這整個 series 學完，等於把「跟工程／PM 同事用英文聊 AI 工具」的詞彙全套裝起來了。下次跟外國 dev 朋友聊天時，可以試試用一句話塞兩個——`I'm super low ego about which tool — I just kick off tasks on the go and lean into whatever works.`——本系列詞彙密度展示，瞬間像在 Anthropic 工作的人講話。
