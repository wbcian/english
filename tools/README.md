# tools — podcast / YouTube → 教材 流程

貼一個 podcast 或 YouTube 連結，自動下載並用**本地 Whisper**（M4 Pro / Metal，免費、離線、無 API key）轉錄成逐字稿，再交給 Coach Max 產出 `lessons/` 學習筆記。

## 一次性安裝

```bash
brew install whisper-cpp ffmpeg
brew install yt-dlp   # 只有 YouTube 路徑需要；podcast 路徑不用
# 下載模型（約 1.5GB，gitignored）
mkdir -p tools/models
curl -L -o tools/models/ggml-large-v3-turbo.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin
```

## 用法

### Podcast

```bash
./tools/podcast2lesson.sh "<apple-或-rss-連結>" [study-date YYYY-MM-DD] [slug-override]
```

支援的連結：Apple Podcasts、SoundOn player、直接 RSS feed。

### YouTube

```bash
./tools/youtube2lesson.sh "<youtube-url>" [study-date YYYY-MM-DD] [slug-override]
```

支援 `youtube.com/watch?v=...`、`youtu.be/...`、YouTube shorts。其他 yt-dlp 支援的站台理論上也通，但沒測過。

### 共用輸出

- `transcripts/<date>-<slug>.txt`、`.srt` — 逐字稿原文（committed）
- `transcripts/.cache/<slug>.mp3` — 音檔（gitignored）
- 印出 `.txt` 路徑；之後由 Coach Max 讀稿產出 `lessons/<date>-<slug>.md`

Podcast slug 來自 RSS title；YouTube slug 為 `<title-slug>-<video_id>`（11 字 video_id 確保跨次穩定，標題部分人類可讀）。

## 解析邏輯（`resolve_episode.py`）

| 連結類型 | 取得 feed | 比對該集 |
|---|---|---|
| Apple Podcasts | `id` → iTunes lookup API → `feedUrl` | 用 URL slug 標題對 RSS 標題做模糊比對（門檻 0.55、與次高需差 0.12） |
| SoundOn player | 由 podcast guid 組 `feeds.soundon.fm/.../<guid>.xml` | 用 episode guid 精確比對 |
| 直接 RSS | 直接使用 | 列出最近 10 集供挑選 |

無法唯一比對時回傳 `status=ambiguous` 並列候選，由人挑選後重跑。

## 檔案結構

| 檔 | 用途 |
|---|---|
| `podcast2lesson.sh` | Podcast 入口（resolve RSS → 下載 mp3 → 共用 pipeline） |
| `youtube2lesson.sh` | YouTube 入口（yt-dlp metadata → 下載 mp3 → 共用 pipeline） |
| `_transcribe_common.sh` | 共用函式（`init_paths` / `check_deps` / `mp3_to_wav` / `transcribe`），**sourced not executed** |
| `resolve_episode.py` | RSS / Apple Podcasts URL → mp3 url 的解析器 |
| `models/` | whisper.cpp 模型權重（gitignored） |

要改轉錄參數（model、`--prompt` glossary、output format）改 `_transcribe_common.sh` 的 `transcribe()` 一處即可。

## 已知限制
- 付費 podcast 的 mp3 可能需訂閱（HTTP 401/403）→ 腳本明確報錯，不硬跑。
- Apple 的 `i=` track id 不在 RSS 內、`entity=podcastEpisode` lookup 常回 null，故以 slug 標題比對為主。
- YouTube 私人 / 會員限定 / 地區封鎖影片：yt-dlp 會 fail，需要自己處理 cookies 或 `--cookies-from-browser`。
- 純中文 / emoji 標題經 slugify 後可能變空字串，會 fallback 成 `video-<video_id>`，這時用 `slug-override` 參數自訂比較好。

## TODO — 未來工作

- [ ] **YouTube 字幕對照 (cross-check)**：`youtube2lesson.sh` 多吃一個 flag `--with-yt-subs`，用 `yt-dlp --write-subs --write-auto-subs --sub-lang en --skip-download` 額外抓 YouTube 官方/自動字幕，與 Whisper 結果做 diff，輸出 `<base>.diff.txt` 標示分歧字段——免費且 ASR 來源不同，對痛點 #2「同音字」最便宜的解。估 1–2h。詳見 `RESEARCH-whisper-upgrade.md` Phase 1。
- [ ] **Glossary 自動餵 `--prompt`**：把 `_transcribe_common.sh::transcribe()` 已開好的 prompt 介面接上 `english/tools/glossary.txt`，podcast / youtube 兩條路徑共用。注意 ≤223 token、`--carry-initial-prompt` 已在 transcribe() 預設帶。估 1h。詳見 `RESEARCH-whisper-upgrade.md` Phase 1a。
- [ ] **Lesson 引用改用 `.srt` 時間戳**：改 Coach Max workflow 從 `.srt` 抓 `HH:MM:SS` 而非 `.txt` 行號，解決 transcript 重跑錯位問題。估 0.5–1h。詳見 `RESEARCH-whisper-upgrade.md` Phase 1。
- [ ] **講者標記**：評估 `gpt-4o-transcribe-diarize` 作為 `--diarize` opt-in mode（需要 OpenAI API key + ffmpeg 切 25MB chunk）。估 5–8h。詳見 `RESEARCH-whisper-upgrade.md` Phase 2。
