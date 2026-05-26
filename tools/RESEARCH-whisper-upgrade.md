# RESEARCH: podcast2lesson.sh Whisper 升級方向

> 研究日期：2026-05-26  
> 方法：派 4 個 agent 第一輪查證 → 派 3 個 agent 第二輪獨立覆查 → 依差異修正本文（修正紀錄見最末節）

## 1. TL;DR

- **最大解 = `gpt-4o-transcribe-diarize` (2025-10 中下旬 GA)**：一次解掉「講者標記」+「同音字」兩個痛點，年費 ~$37，不用碰 HF token / pyannote license / MPS 坑。
- **零成本立刻能做的 quick win**：whisper.cpp 加 `--prompt` + **`--carry-initial-prompt`** 餵專有名詞清單（後者讓 prompt 跨整段音檔生效，不只前 30 秒）；lesson 引用改用既有 `.srt` 時間戳而非行號。
- **本地路線想升級就上 mlx-whisper**（~2× 速度），但 mlx-examples 已半停更、長音檔有 memory leak bug，**不建議當主力**。

## 2. 現況回顧

`podcast2lesson.sh` 用 whisper.cpp + `large-v3-turbo` + Mac M4 Pro Metal，輸出 `.txt` / `.srt` 到 `english/transcripts/`，再人工寫 `english/lessons/`。三個痛點：

1. **無講者標記**：兩人訪談要對著原 podcast 手標 `Lenny:` / `Cat:`
2. **同音字錯誤**：如 `merging` → `emerging`，專有名詞（人名 / Anthropic 產品名）尤甚
3. **行號定位脆弱**：lesson 用 transcript 行號引用（`Cat (669)`），transcript 重跑會錯位

> 痛點 #3 其實 script 已產 `.srt`，純粹是 lesson 工作流沒用到時間戳。

## 3. 方案比較表

| 維度 | A. WhisperX | B. mlx-whisper | C. OpenAI API | D. Prompt / LLM 校對 |
|---|---|---|---|---|
| **解講者標記** | ✅ pyannote diarization | ❌ | ✅（限 `-diarize` 變體） | ❌ |
| **解同音字** | ❌ | ❌ | 🟡 WER 較低但仍會錯 | ✅（D-b LLM 校對） |
| **解時間戳** | ✅ word-level | ✅ word-level | 🟡 whisper-1 ✅；gpt-4o-* 只給 segment（diarize 有 segment timestamps） | n/a |
| **安裝難度** | 高（HF token + accept model license + Mac 官方建議 CPU+int8） | 低（`pip install mlx-whisper`） | 低（API key） | 極低（whisper.cpp 已支援 `--prompt` + `--carry-initial-prompt`） |
| **Apple Silicon 效能** | 慢（MPS 在 [issue #109](https://github.com/m-bain/whisperX/issues/109) 開了 3 年仍未支援，README 指示 Mac 用 `--device cpu --compute_type int8`） | M4 24GB 跑 large-v3-turbo 比 whisper.cpp 快 **2.03×** [(llimllib)](https://notes.billmill.org/dev_blog/2026/01/updated_my_mlx_whisper_vs._whisper.cpp_benchmark.html) (blog)；另一測試只快 ~20% [(anvanvan)](https://github.com/anvanvan/mac-whisper-speedtest) (blog) | 雲端，本地無負擔 | n/a |
| **成本** | 免費 | 免費 | 6240 min/年：whisper-1 / gpt-4o = **$37.4**；mini = **$18.7**；diarize 走 token 計費（[官方 pricing](https://openai.com/api/pricing/)） | LLM 校對額外 token 費 |
| **準確度** | CALLHOME (BUTSpeechFIT part 2) DER **26.7%**（[community-1 card](https://huggingface.co/pyannote/speaker-diarization-community-1)；非專屬 podcast benchmark） | 與 whisper.cpp 同模型同 WER | gpt-4o-transcribe FLEURS English **WER ~2.46%**（[官方公告](https://openai.com/index/introducing-our-next-generation-audio-models/)；獨立復現有爭議） | arxiv [2602.18966](https://arxiv.org/abs/2602.18966) 報告 LLM context prompting **rel. WER -17%**（NBA 評論 domain） |
| **主要風險** | MPS 不支援、pyannote model license 變動、CPU 跑慢 | mlx-examples 過去 90 天只 1 commit（whisper 子目錄 0）；word_timestamps + 長音檔 memory leak [#1254 (closed but bug present in old versions)](https://github.com/ml-explore/mlx-examples/issues/1254) | 25MB 單檔上限要切片；gpt-4o-* 無 word timestamps（diarize 模型也**不**支援 prompt 與 logprobs）；資料離開本機 | `--initial_prompt` 預設只影響前 30 秒，但 [PR #2343](https://github.com/openai/whisper/pull/2343) 已 merge，加 `--carry-initial-prompt` 可跨整段；LLM 校對易過度改寫 |

## 4. 推薦升級路線

### Phase 1 — 立刻做（總計 2–3h，零外部依賴）

1. **加 `--prompt` + `--carry-initial-prompt` glossary**：podcast2lesson.sh 加一個 flag（或固定 `english/tools/glossary.txt`），把 `Anthropic, Claude, Sonnet, Opus, agent, coding, MCP, Lenny, Cat Wu, ...` ≤223 token 餵進去。`--carry-initial-prompt` 讓 prompt **跨整段音檔生效**（whisper.cpp 已支援，OpenAI 上游 [PR #2343](https://github.com/openai/whisper/pull/2343) 2024-10 merge）。1–2h
2. **lesson 引用改用時間戳**：`.srt` 已存在，改 Coach Max workflow 直接從 `.srt` 抓 `HH:MM:SS` 而非行號。痛點 #3 解決。0.5–1h
3. **改用 `-ojf` (output JSON full)** 輸出 token probability（`cli.cpp` 對每 token 輸出 `"p"` 欄位）：低信心 token 印出來給人工 review。痛點 #2 部分緩解。1h

### Phase 2 — 解講者標記（總計 8–14h，看選哪條）

> **推薦 C 路線而非 A**，理由：A 在 Mac 上必須 CPU+int8 跑、license + token 折騰、DER 在 podcast 場景未證實比 OpenAI diarize 好。

- **C 路線（推薦）**：把 podcast2lesson.sh 加一個 `--diarize` mode，用 `gpt-4o-transcribe-diarize`（[公告](https://community.openai.com/t/introducing-gpt-4o-transcribe-diarize-now-available-in-the-audio-api/1362933)）。25MB 上限需要先 ffmpeg 切 chunk；**>30 秒音訊需指定 `chunking_strategy`**；模型本身不支援 `prompt` 與 `logprobs`（glossary 校對要另寫 LLM 後處理）。年費 ~$40，比一週手標 2 集省的時間值得。**5–8h**
- **A 路線（不推薦）**：要寫 `pip` setup、申請 HF token、accept model license、改 script 解 JSON。Mac 上跑會比現在慢。**3–5.5h（setup）+ 不確定的調參時間**

### Phase 3 — 系統性同音字校對（長期目標，8–16h）

> 註：第一輪研究說「OpenAI Cookbook 主張 GPT-4 post-processing 比 prompt 更 scalable」——**第二輪驗證未在 Cookbook 找到此說法**，已從本筆記移除引用。LLM 後處理仍是合理路線，但動機是 prompt 224-token 上限 + glossary 規模化需求，而非 Cookbook 背書。

寫一個 `english/tools/transcript_correct.py`：

- 讀 `.srt` + glossary
- 切 chunk（避免 LLM context 爆）
- Claude / GPT-4 校對 prompt：**只改拼字 / 同音 / 專有名詞，禁止改寫**（參考 [orcaman repo](https://github.com/orcaman/improving_whisper_transcriptions_with_gpt4o) 的 suggestion+replace 模式，避免全文重寫 hallucination）
- 用 whisper.cpp `-ojf` 的 token probability 當 confidence guide，低分區段優先校對
- 輸出 diff 給人工 review，不要自動覆蓋

### Phase 4 — 純本地速度升級（可選，1–2h）

如果你完全不想上雲，但覺得 whisper.cpp 太慢：切到 mlx-whisper。但要**避開 word_timestamps + 長音檔組合**（[#1254 memory leak](https://github.com/ml-explore/mlx-examples/issues/1254)），且要接受 mlx-examples 半停更的風險（[whisper.cpp 90 天 ~537 commits vs mlx-examples 1 commit](https://github.com/ggml-org/whisper.cpp/releases)）。

## 5. 工程量總表（小時數）

| 項目 | 估計 | 備註 |
|---|---|---|
| Phase 1a：加 `--prompt` glossary | 1–2h | 全在 shell script 改 |
| Phase 1b：lesson 引用改時間戳 | 0.5–1h | 改 Coach Max workflow，不動 script |
| Phase 1c：改 `-ojf` 輸出 + 低信心 highlight | 1h | shell + 簡單 python |
| Phase 2-C：OpenAI diarize 整合 | 5–8h | ffmpeg 切片 + API call + 結果拼回時間軸 |
| Phase 2-A：WhisperX 整合 | 3–5.5h | + 不確定的 MPS / license 調試時間 |
| Phase 3：LLM 校對 pipeline | 8–16h | chunking + prompt iteration + diff UI |
| Phase 4：mlx-whisper 切換 | 1–2h | 模型 weights 換 mlx-community 版 |
| 完整本地+雲 hybrid（C 的 fallback 版） | 8–14h | 解析 avg_logprob → 切片 → API → 拼回 |

## 6. 未決問題 / 需實測才能回答

1. **`gpt-4o-transcribe-diarize` 對「兩人訪談」的實際 DER 多少？** OpenAI 沒公開 diarize benchmark。**做法**：拿 `2026-05-25-cat-wu-anthropic-product-team.txt` 對應的 mp3 切 10 分鐘片段試跑，人工算 DER。
2. **`--initial_prompt` 對 podcast 長檔的實際改善？** 已知只影響前 30 秒，但 podcast intro 通常最多人名密度，可能比想像中有用。**做法**：拿同一集音檔 prompt vs no-prompt 各跑一次，diff 人名 / 專有名詞錯誤數。
3. **whisper.cpp `avg_logprob` 門檻設多少能抓到真錯誤？** 沒有共識門檻。**做法**：人工標 100 個句子的對錯，畫 ROC 找最佳 threshold。
4. **mlx-whisper 在 M4 Pro 跑 1 小時 podcast 的牆鐘時間**：所有 benchmark 都是 10 分鐘以內音檔，外推到 1 小時不一定線性。**做法**：拿同一 mp3 跑 mlx vs whisper.cpp，記秒數。
5. **OpenAI gpt-4o-transcribe 中文 WER 具體數字**：官方只給長條圖、沒給數字。**做法**：如果未來真的要切中文 podcast，找個 zh-TW 短音檔（5 分鐘）三家比一比。
6. **`gpt-4o-transcribe-diarize` 對 25MB 切片邊界的講者一致性**：跨 chunk 後同一人會不會被標成 Speaker A → Speaker C？**做法**：切兩段測一集，看 speaker label 是否需要 post-process 對齊。

## 驗證流程備忘 / 修正紀錄

### 流程
- **第一輪**（2026-05-26）：4 個 agent 平行查證 A / B / C / D 四個方案。
- **第二輪**（2026-05-26）：3 個 agent **獨立覆查**——prompt 不餵第一輪結論，只列「待驗證的說法」，鼓勵獨立查證路徑（gh api 實計 commits、直接讀 source code、原 arxiv ID 對標題）。
- 多數關鍵數字附官方來源 URL；blog 來源標 `(blog)`。
- 未實測任何 pipeline；所有「速度 / 準確度」描述都是文獻整理。

### 第二輪推翻 / 修正第一輪的具體項目

| # | 第一輪原述 | 第二輪查證結果 | 處置 |
|---|---|---|---|
| 1 | 「OpenAI Cookbook 明說 GPT-4 post-processing **notably more scalable** than the prompt parameter」 | Cookbook 沒有這句話。可能是 agent hallucination 或誤引。 | 從 Phase 3 與表格移除此引用，重寫動機段落。 |
| 2 | 「`carry_initial_prompt` PR #2343 **未 merge**」 | PR #2343 已於 **2024-10-26 merge**（by jongwook）。whisper.cpp 也有 `--carry-initial-prompt`。 | 改寫 TL;DR、Phase 1a、比較表「主要風險」欄；改變了 Phase 1a 的工程價值（prompt 不再只影響前 30 秒）。 |
| 3 | 「`gpt-4o-transcribe-diarize` 於 **2025-10-21** GA」 | 模型 snapshot 命名為 `2025-10-15`、Azure 同步約 10/16、OpenAI community 公告貼文 10/21。確切公告日有矛盾。 | 改寫為「2025-10 中下旬 GA」。 |
| 4 | 「CALLHOME part 2 = **兩人電話對話**」 | BUTSpeechFIT/CALLHOME_sublists 只說「subsets per amount of speakers」，未確認 part 2 就是 2-speaker。 | 移除「兩人對話」標籤，改成中性描述「CALLHOME (BUTSpeechFIT part 2)」。 |
| 5 | 「WhisperX 在 Mac **強制** CPU+int8」 | README 是**官方建議用法**，非硬性鎖死；MPS 確實壞但不是 hard block。 | 改成「官方建議」措辭。 |
| 6 | 「mlx-examples issue #1254 開著」 | Issue 狀態實為 **closed**，但 bug 描述本身正確。 | 加註 closed 狀態。 |
| 7 | 「`initial_prompt` 上限 **224 token**」 | 原始碼是 `(n_text_ctx // 2) - 1` = **223 token**；Cookbook 文案寫 224 是簡化值。 | 細節修正為 223。 |
| 8 | 「whisper-1 支援 logprobs」（第一輪 OpenAI agent 內部前後不一） | 官方 API reference 明確：logprobs **只支援 gpt-4o-transcribe / mini**，whisper-1 不支援。 | 表格與 fallback 策略段落明寫此限制。 |
| 9 | arxiv 2602.18966 真實性（自查疑慮：日期較未來） | Paper 真實存在，2026-02-21 提交，WER 數字全部對得上。 | ✅ 保留，無修正。 |
| 10 | mlx-examples 過去 90 天 1 commit / whisper.cpp 537 commits | `gh api` 實計：mlx-examples 1 commit（whisper 子目錄 0），whisper.cpp 537 commits。完全吻合。 | ✅ 保留。 |
| 11 | mlx-whisper 對 whisper.cpp 速度 2.03× | llimllib 原文確認 2.03 ± 0.06×，large-v3-turbo。 | ✅ 保留。 |

### 教訓
- LLM agent 偶爾會 hallucinate「官方文件的具體措辭」（本案是 Cookbook「more scalable」一句）。**引用官方文件的精確句子時，第二輪務必直接 fetch 該頁面驗證**，不要相信第一輪整理的轉述。
- PR / issue 的 merged / closed 狀態會隨時間變動，第一輪結果若提到「未 merge / open」要特別小心；第二輪用 `gh api` 直接看 state。
- 「看起來合理」的範疇標籤（如「CALLHOME part 2 = 兩人對話」）若沒有直接證據就不要寫，否則會變成被當真的二手知識。
- 若後續實測發現與此筆記不符，請回頭修正本文件，**並在此節新增一筆紀錄**。
