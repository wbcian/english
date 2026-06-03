---
title: 英文分級制度對照表（CEFR ↔ TOEIC / IELTS / TOEFL / Cambridge / GEPT）
type: reference
last_verified: 2026-06-03
---

# 英文分級制度對照表

> 業界以 **CEFR**（Common European Framework of Reference，歐洲共同語言參考標準，6 級 A1→C2）為共同骨架，其他測驗再對照進去。
> **所有跨測驗對照都是「近似」**——各官方機構都明文說自家對照只是 guideline，不是精確換算。下面數字僅供方向感參考。

## 主對照表

| CEFR | 白話程度 | **TOEIC L&R**（總分 /990，推算值）| IELTS（Academic）| TOEFL iBT（舊 0–120）| Cambridge Scale / 主考 | GEPT 全民英檢 |
|---|---|---|---|---|---|---|
| A1 | 入門 | 120–224 | ~3.0–3.5 | （量不準）| 100–119 | 預備級 |
| A2 | 基礎生活 | 225–549 | 4.0–4.5 | （量不準）| 120–139 · A2 Key (KET) | 初級 |
| **B1** | 進階生活 / 職場基本 | **550–784** | 5.0–5.5 | 42–71 | 140–159 · B1 Preliminary (PET) | 中級 |
| B2 | 流利職場 | 785–944 | 6.0–6.5 | 72–94 | 160–179 · B2 First (FCE) | 中高級 |
| C1 | 高階學術 / 專業 | 945–990 | 7.0–8.0 | 95–113 | 180–199 · C1 Advanced (CAE) | 高級 |
| C2 | 近母語 | （L&R 量不到）| 8.5–9.0 | 114–120 | 200–230 · C2 Proficiency (CPE) | 優級 † |

## 重點與陷阱

- **TOEIC L&R 的「總分對照」其實是民間推算。** ETS 官方只發布 **分項（Listening / Reading）cut score**，不發布合併總分對照。本表總分＝兩分項下限相加：
  | CEFR | Listening 下限（5–495）| Reading 下限（5–495）| 推算總分 |
  |---|---|---|---|
  | A1 | 60 | 60 | 120 |
  | A2 | 110 | 115 | 225 |
  | B1 | 275 | 275 | 550 |
  | B2 | 400 | 385 | 785 |
  | C1 | 490 | 455 | 945 |
  ⚠️ 真要算 B2，得 **L≥400 且 R≥385 兩項都達標**；總分 785 但分項不均（如 L500/R285）並不算 B2。
- **TOEIC L&R 量不到 C2**，最高只到 C1（ETS 官方確認）。其中 **C1 Reading cut（455）證據最弱**（ETS 註明僅 45% 評審支持）。
- **TOEIC 還有另一張卷**：TOEIC Speaking & Writing（口說 0–200 + 寫作 0–200），與 L&R 是兩套分數；企業常只看 L&R。
- **IELTS 官方強調「沒有一對一對應」**：6.5（B2/C1）與 8.0（C1/C2）都是 borderline，本表區間僅近似。
- **TOEFL iBT 2026 改制**：自 **2026-01-21** 起，TOEFL iBT 改用全新 **1–6 分級**（半分為階）直接對齊 CEFR（約：6=C2、5/5.5=C1、4/4.5=B2、3/3.5=B1、2/2.5=A2、1/1.5=A1）。上表 0–120 為**舊制**，2026-01-21 後的考試以新制為準。TOEFL 設計上在 **B2/C1 精度最高**，A1/A2 量不準。
- **Cambridge 是最接近精確的對照**——Cambridge English Scale（約 80–230）本來就繞著 CEFR 設計，每級 20 分一段；考試區間刻意重疊（如 B2 First 拿 Grade A 達 180→發 C1 證書）。
- **GEPT †**：中級→B1、中高級→B2、高級→C1 為 LTTC 正式對齊。**初級→A2** 多見於 LTTC 說明但不在主要對齊表內；**優級→C2** 最弱——優級僅辦過一次後停辦，無正式 C2 對齊，實務上 GEPT 對齊到 C1（高級）封頂。

## 一句話用法

- Cian 主目標 **TOEIC 750+** 落在 **B1 上緣、剛踏進 B2**（B1/B2 分水嶺 ≈ 785）。
- Lesson 難度標 `level` 用單一 CEFR 級（取「重心」級）；顯示的 TOEIC 區間直接由 `app/src/data/cefr.ts` 推算，本檔為人類可讀的單一事實來源。

---

## 驗證流程備忘 / 修正紀錄

> 依 CLAUDE.md：外部事實型資訊持久化前須多輪交叉驗證。本表 2026-06-03 由兩個獨立 agent 各自查官方來源（ETS / IELTS.org / Cambridge English / LTTC）後交叉比對，兩輪結論一致。

第一版草稿（Coach Max 口頭回答）被驗證**修正了 3 處**：

1. **IELTS A2 錯置**：草稿寫 A2 ≈ 3.0–3.5 → 修正為 **A2 ≈ 4.0–4.5**（3.0–3.5 其實是 A1 區）。
2. **TOEFL C1 上限錯 + 漏 C2**：草稿寫 C1 = 95–120 → 修正為 **C1 = 95–113、C2 = 114–120**。
3. **TOEIC 總分定位**：草稿把 120/225/550/785/945 當「ETS 官方總分對照」→ 更正為**官方只有分項 cut score，總分是推算便利值**（數字本身＝分項下限相加，巧合成立）。

兩輪一致確認：TOEIC L&R 封頂 C1（無 C2）；Cambridge 五考對 A2–C2；GEPT 中級/中高級/高級＝B1/B2/C1。
兩輪有分歧、已保守處理：**GEPT 優級→C2**（一輪說「無正式對齊、已停辦」，一輪說「concordance PDF 有但停辦」）→ 本表以 † 註明其脆弱。

### 來源
- TOEIC ↔ CEFR：ETS《Mapping the TOEIC tests on the CEFR》 https://www.ets.org/pdfs/toeic/toeic-mapping-cefr-reference.pdf ；L&R 僅 A1–C1：ETS Global help center
- IELTS ↔ CEFR：https://ielts.org/organisations/ielts-for-organisations/compare-ielts/ielts-and-the-cefr
- TOEFL ↔ CEFR：ETS《Compare TOEFL iBT Scores》 https://www.ets.org/toefl/institutions/ibt/compare-scores.html （2026-01-21 起改 1–6 制）
- Cambridge Scale：https://www.cambridgeenglish.org/exams-and-tests/cambridge-english-scale/
- GEPT ↔ CEFR：https://www.gept.org.tw/Eng/alignment.html
