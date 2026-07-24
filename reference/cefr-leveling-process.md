---
title: CEFR 分級評估 SOP（標準流程）
type: reference
version: 2
created: 2026-06-03
updated: 2026-07-24
---

# CEFR 分級評估 SOP

> 目的：給每篇 lesson 標一個一致、可重複、可辯護的 `level`（§1–§7），並給每個單字標 `cefr` + `frequency`（§8）。
> 這是**判斷型**流程（assessment），不是外部事實查詢——一致性靠**鎖定錨點 + 固定判準**達成，不是靠官方分數。
> 等級 ↔ TOEIC/IELTS… 的對照數字在 [`cefr-toeic-levels.md`](cefr-toeic-levels.md)；本檔只管「怎麼評」。
>
> **§1–§7 = lesson（整篇文本）。單字分級直接跳 [§8](#8-單字分級vocab)。**

---

## 0. 三條鐵則（最重要）

1. **只評英文素材本身**：學習者要吸收的英文（dialogue 台詞 / talk 正文 / reading 文章）。**忽略**所有中文解說、雙語對照的中文半、vocab 中文欄、Cultural Notes、Study Tips。
2. **評「重心」，不評「最難一句」**：看整篇英文的密度落在哪，不被個別難句綁架。
3. **永遠對齊錨點**（§3）：新篇一律和已鎖定的錨點 lesson 比較，不憑空給級。**錨點是跨時間一致的唯一保證。**

---

## 1. 評什麼（依 track）

| track | 評估對象（英文部分）|
|---|---|
| dialogue | 英文對話台詞（blockquote 內，去掉粗體講者標籤）|
| talk | 英文獨白 / 歌詞 / 旁白正文 |
| reading | 英文文章 / essay 正文（含 Close Reading 段）|

## 2. 四個判準維度

評文本**內在難度**，看四項：

1. **句構複雜度** — 簡單句？並列？多層子句？
2. **字彙廣度與抽象度** — 高頻具體 vs 低頻抽象 / 專業 domain 詞。
3. **慣用語 / 俚語 / 連音密度** — idiom、slang、Gen-Z 口語、reduced speech。
4. **語篇複雜度** — 交易性 vs 論述/論證、明說 vs 隱含。

**idiom 加成規則**：文法簡單但 idiom/slang/連音極重（歌詞、母語快速口語）可**往上推一級**——但最多一級，不可超過字彙/語篇本身能撐到的級。

---

## 3. 鎖定錨點（calibration anchors）

> 評新篇時，把它和下面的錨點並排比較。**錨點等級不隨意改**；要改需在 §7 留紀錄。

### 已鎖定（取自真實 lesson）

**B1 錨點** — `lessons/2026-05-31-japan-hotel-checkin-part-1-arrival.md`
> *"I'd like to check in, please. I have a reservation under Benson Wu."* / *"Could I get a non-smoking room?"*
> 特徵：固定禮貌句型、具體名詞、現在式、少量子句、交易性語篇。

**B2 錨點（書面）** — `lessons/2026-05-29-posthog-product-for-engineers-pack.md`
> *"Product engineers do all the things software engineers do, but they talk directly to users, work autonomously, and are opinionated about what to work on."*
> 特徵：乾淨但抽象的商業寫作、並列結構、domain 詞、意思明說。

**B2 錨點（口語）** — `lessons/2026-05-25-cat-wu-pm-skills-and-taste.md`
> *"all of the roles are emerging… a great PM is able to understand what all the gaps are, to figure out what the highest priority ones are."*
> 特徵：自發口語、抽象概念 + startup idiom（lean into the chaos / wear a lot of hats）、巢狀不定詞，但每句讀得懂。

### 暫定（尚無真實 lesson，待出現後鎖定）

- **A2** — 比 B1 錨點更基礎：短固定片語、最高頻具體詞。例：*"Where is the station?" "I want a coffee, please."*
- **C1** — 比 B2 錨點更難：**持續的密集論證 + 隱含意義 + 高階慣用/連義**。例：*"The irony, of course, is that the very autonomy we prize quietly erodes the cohesion it depends on."*
- **C2** — 近母語：細膩 register 操控、文學/修辭手法。標 C2 前先質疑是不是 C1。

---

## 4. 判級決策規則（tie-break）

### B1 vs B2
- 交易性 / 旅遊 / 基本工作對話、具體詞、句子短 → **B1**。
- 一旦出現**抽象/專業論述、idiom 堆疊、低頻詞、表達意見/論證** → **B2**。

### B2 vs C1（最常踩的邊界）
標 **C1 必須同時**滿足：
1. **持續**的密集論證 / 抽象（不是偶一為之的一句難句），**且**
2. 意思常需**讀between the lines**（反諷、連義、言外之意），**且**
3. 用到**超出 domain jargon 的高階慣用/低頻詞**。

→ 若「難」主要來自**專業術語**、但句子文法好讀、意思是**明說**的 → **封頂 B2**。
（這就是 Cat Wu / PostHog / Charles Cook 是 B2 不是 C1 的原因。）

### 其他固定規則
- **單一級，不用區間**：frontmatter 只放一個 CEFR 級。真的兩級之間拿不定 → **取低的**（保守），並在 PR/commit 訊息註記。
- **聽 vs 讀**：`level` 反映**文本內在難度（當作「讀」）**。`audio: true` 的母語語速素材「用聽的」會更難一級，但**不為此調高 `level`**——這是已知限制，不是 bug。
- **系列一致性**：同 series 的各 part 若 register 相同，給同級；除非某 part 明顯更難/更簡單。

---

## 5. 執行流程（pipeline）

**A. 少量（1–2 篇）** → 自己讀英文，直接對齊 §3 錨點判級。

**B. 批次（3 篇以上 / migration）** → 用**單一** assessor agent 在**同一 context** 一次讀完全部（確保互相校準），回傳：`檔名 | 等級 | 一句證據（引代表句）| 是否邊界`。然後**人工覆核所有「邊界」與所有「C1 以上」**（親自讀原文用 §4 判定）。

> 為何單一 agent 讀全部：同一把尺才一致。多個 agent 各評各的會飄。

### 可重用的 assessor prompt 範本

```
你是 CEFR 分級專家。對下列 lesson 的「英文內容」各給一個 CEFR 重心級（A1–C2）。
規則：只評英文（忽略中文解說/對照/vocab 中文/Cultural Notes）；評重心非最難句；
四維度＝句構/字彙抽象度/idiom密度/語篇複雜度；idiom 重可+1 級。
錨點（照這個校準，別改）：
  B1 = "I'd like to check in, please. I have a reservation under [name]."（固定禮貌句、具體詞）
  B2 = "Product engineers do all the things software engineers do, but they talk directly to users,
        work autonomously, and are opinionated about what to work on."（抽象商業寫作、明說）
B2 vs C1：難在 domain jargon 但句子好讀、意思明說 → 封頂 B2；
  C1 需「持續密集論證 + 隱含意義 + 高階慣用」三者皆備。
檔案：<貼絕對路徑清單>
輸出：表格 檔名|等級|次選(僅真邊界)|一句證據；最後列出邊界篇與你偏向哪邊。
```

### 寫入與驗證
1. 把級寫進每篇 frontmatter `level:`（單一 CEFR 值）。
2. TOEIC 對應由 app 的 `app/src/data/cefr.ts` 自動推算，**不要**手寫進 lesson。
3. 開 dev server（`english-app-dev`）→ content sync 會驗 enum；list 卡片應出現對應 badge；無 console error。
4. commit：scope `lesson`（級標記）；若動到 app/SOP 另開 `app`/`brain`。

---

## 6. 信心等級（這東西有多硬）

| | 數字對照表 | 各篇 `level` |
|---|---|---|
| 性質 | 外部事實 | **主觀判斷** |
| 驗證 | 兩輪獨立查官方來源 | 單一 assessor + 人工覆核 |
| 可信度 | 高 | 中（邊界主觀，故可被質疑、可改）|

**本 SOP 未做**：詞彙頻率剖析（English Vocabulary Profile / CEFR-J 詞表）、可讀性公式（Flesch-Kincaid）。
**升級路徑**（若要更硬）：詞彙 CEFR 剖析工具 + 2 位以上獨立評分者 → reconcile。目前用途（list 掃一眼知難度）用本 SOP 即可。

---

## 7. 維護紀錄 / 變更原則

- **何時重評**：lesson 英文內容大改、或錨點被重新定義時。
- **新增錨點**：當收到第一篇真實 A2 / C1 / C2 lesson，把 §3 暫定項換成真實引句並標「已鎖定」。
- **改錨點等級**：屬重大變更——需在此留「改了什麼 / 為何 / 是否要回頭重評既有 lesson」。

### v1（2026-06-03）建立
- 首次把流程固定成 SOP。鎖定 B1（japan check-in P1）、B2 書面（PostHog）、B2 口語（Cat Wu P2）三錨點。
- 首批 15 篇據此分級：4×B1（旅遊實戰對話）、11×B2（真實母語素材）。
- 評估時 assessor 初判 4 篇 C1（Cat Wu×2 / Charles Cook / PostHog），人工覆核依 §4 全數下修 B2（難在 jargon 非隱含意義）。

### v2（2026-07-24）加入 §8 單字分級
- 觸發：Cian 要求「單字問答與紀錄同時標常見度 + 級別」，選定 CEFR 作為級別標準（與 lesson `level` 同一把尺）。
- 新增 §8：單字的 `cefr` + `frequency` 雙欄制、錨點、判準、`?` 不確定標記。
- 既有 276 字批次 backfill 見 §8.6。

---

## 8. 單字分級（vocab）

> 適用對象：`vocab/<word>.md` 的 `cefr` 與 `frequency` 兩個 frontmatter 欄位，以及 `vocab/_index.md` 的「級別」欄、app 的單字卡／清單 badge。

### 8.1 兩個欄位是兩件事，別混

| 欄位 | 問題 | 值 |
|---|---|---|
| `cefr` | 「**要多好的程度**才會認得／會用這個字？」 | `A1`–`C2` |
| `frequency` | 「**實際上多常遇到**這個字？」 | `high` / `mid` / `low` |

兩者**不相關**，四種組合都存在：

| | 高頻 | 低頻 |
|---|---|---|
| **低階（A/B1）** | `role`、`pace` — 必須主動會用 | `alpaca` — 簡單但用不到 |
| **高階（B2+）** | `acknowledge`、`utterly` — 值得投資 | `incorrigible` — 看懂就好 |

**這張表就是這兩欄的用途**：決定一個字要練到「能主動說出來」還是「聽到看到能懂」。

### 8.2 `cefr` 判準（四問，取最高者）

1. **這個字的概念抽象嗎？** 具體物／動作 → A；抽象概念／情緒細微差別 → B2+。
2. **register 有多正式／書面？** 日常口語 → A–B1；正式書面、新聞、學術 → B2+；文學／修辭 → C1–C2。
3. **語感精度要求多高？** 用錯只是不自然 → 較低；用錯會鬧笑話／需要懂搭配限制（如 `utterly` 只配極端詞）→ C1+。
4. **是不是多義／慣用語？** 字面義簡單但慣用義隱晦（phrasal verb、idiom）→ 至少 B2，依隱晦程度上推。

### 8.3 `cefr` 錨點（照這個校準，別改）

- **A1** — `baby`、`busy`：最高頻具體詞，入門教材第一課。
- **A2** — `borrow`、`weather`：日常必備，具體，無語感陷阱。
- **B1** — `role`、`pace`、`solid`：日常／職場常見，抽象但直白，母語者不會覺得「用字講究」。
- **B2** — `acknowledge`、`autonomy`、`turnover`：抽象或正式，職場／新聞主力字，需要懂搭配。
- **C1** — `utterly`、`dismayed`、`amorphous`：低頻書面／情緒精確，用得對會讓人覺得英文好。
- **C2** — `incorrigible`：文學、罕用、母語者也不是天天講。

### 8.4 `frequency` 判準

| 值 | 顯示 | 標準 |
|---|---|---|
| `high` | 高頻 | 日常對話／新聞裡幾乎天天遇到。**目標＝主動會用**。 |
| `mid` | 中頻 | podcast／職場／新聞常見，一週遇到幾次。**目標＝看到聽到秒懂，能用更好**。 |
| `low` | 低頻 | 書面、文學、專業 domain 或情緒強烈的字。**目標＝被動認得即可**，不強求主動使用。 |

⚠️ 判 `frequency` 時看的是**這個字在一般英文裡**的出現率，不是「Cian 的素材裡」的出現率——別因為某篇 lesson 出現三次就標高頻。

### 8.5 固定規則

- **單一級，不用區間**；兩級之間拿不定 → **取低的**（保守）。與 §4 lesson 規則一致。
- **不確定就標 `?`**：`cefr: "C1?"` 表示這是估計、未經對照官方詞表（Cambridge English Vocabulary Profile 等）。**寧可標 `?` 也不要假裝確定**——這是判斷型欄位，不是查表事實。
- **多義字看主要學習義**：`solid` 的物理義是 A2、口語「沒問題」義是 B1 → 依該檔 `zh` 欄的主要義判。
- **片語／phrasal verb 照整體判**，不看組成單字（`work on it` 的字都是 A1，但慣用義是 B1）。

### 8.6 批次 backfill（2026-07-24，276 字）

沿用 §5B 規則：**單一 assessor agent 在同一 context 讀完全部**（同一把尺才不會飄），來源＝`vocab/_index.md` 全表。
- 人工覆核範圍：所有標 `C2` 者、以及與直覺不符者。
- 因未對照官方詞表，backfill 一律屬**估計**——邊界字標 `?`。
