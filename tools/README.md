# tools — podcast → 教材 流程

貼一個 podcast 連結，自動下載並用**本地 Whisper**（M4 Pro / Metal，免費、離線、無 API key）轉錄成逐字稿，再交給 Coach Max 產出 `lessons/` 學習筆記。

## 一次性安裝

```bash
brew install whisper-cpp ffmpeg
# 下載模型（約 1.5GB，gitignored）
mkdir -p tools/models
curl -L -o tools/models/ggml-large-v3-turbo.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin
```

## 用法

```bash
./tools/podcast2lesson.sh "<apple-或-rss-連結>" [study-date YYYY-MM-DD] [slug-override]
```

支援的連結：Apple Podcasts、SoundOn player、直接 RSS feed。

輸出：
- `transcripts/<date>-<slug>.txt`、`.srt` — 逐字稿原文（committed）
- `transcripts/.cache/<slug>.mp3` — 音檔（gitignored）
- 印出 `.txt` 路徑；之後由 Coach Max 讀稿產出 `lessons/<date>-<slug>.md`

## 解析邏輯（`resolve_episode.py`）

| 連結類型 | 取得 feed | 比對該集 |
|---|---|---|
| Apple Podcasts | `id` → iTunes lookup API → `feedUrl` | 用 URL slug 標題對 RSS 標題做模糊比對（門檻 0.55、與次高需差 0.12） |
| SoundOn player | 由 podcast guid 組 `feeds.soundon.fm/.../<guid>.xml` | 用 episode guid 精確比對 |
| 直接 RSS | 直接使用 | 列出最近 10 集供挑選 |

無法唯一比對時回傳 `status=ambiguous` 並列候選，由人挑選後重跑。

## 已知限制
- 付費 podcast 的 mp3 可能需訂閱（HTTP 401/403）→ 腳本明確報錯，不硬跑。
- Apple 的 `i=` track id 不在 RSS 內、`entity=podcastEpisode` lookup 常回 null，故以 slug 標題比對為主。
