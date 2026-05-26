#!/usr/bin/env bash
# youtube2lesson.sh — paste a YouTube link, get a transcript ready for Coach Max.
#
#   tools/youtube2lesson.sh <youtube-url> [study-date YYYY-MM-DD] [slug-override]
#
# Uses yt-dlp to fetch metadata + audio, then delegates to the shared
# whisper.cpp transcription pipeline in _transcribe_common.sh.
# Output naming follows the <date>-<title-slug>-<video_id> scheme (see
# RESEARCH-whisper-upgrade.md, design Q1 / option C).
set -euo pipefail

URL="${1:-}"
[ -n "$URL" ] || { echo "usage: $0 <youtube-url> [study-date] [slug-override]" >&2; exit 64; }
DATE="${2:-$(date +%F)}"
SLUG_OVERRIDE="${3:-}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=tools/_transcribe_common.sh
source "$ROOT/tools/_transcribe_common.sh"
init_paths
check_deps yt-dlp

echo "[1/4] resolving YouTube metadata..." >&2
META="$(yt-dlp --dump-json --no-warnings --skip-download "$URL")"

VIDEO_ID="$(echo "$META" | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')"
TITLE="$(echo "$META"   | python3 -c 'import sys,json;print(json.load(sys.stdin).get("title",""))')"
CHANNEL="$(echo "$META" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("channel",""))')"
echo "  id=$VIDEO_ID  channel=$CHANNEL" >&2
echo "  title=$TITLE" >&2

# Slugify title to ASCII [a-z0-9-], cap 60 chars. CJK / emoji → dropped.
# If nothing survives (e.g. all-Chinese title), fall back to "video".
TITLE_SLUG="$(echo "$TITLE" | python3 - <<'PY'
import sys, re, unicodedata
t = sys.stdin.read().strip().lower()
t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode("ascii")
t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:60]
print(t or "video")
PY
)"

SLUG="${SLUG_OVERRIDE:-${TITLE_SLUG}-${VIDEO_ID}}"
BASE="$OUTDIR/$DATE-$SLUG"

echo "[2/4] downloading audio -> $CACHE/$SLUG.mp3" >&2
# -x extract audio; -f bestaudio prefers audio-only stream when available.
yt-dlp -x --audio-format mp3 -f 'bestaudio/best' \
  --no-warnings --no-playlist \
  -o "$CACHE/$SLUG.%(ext)s" "$URL" >&2

[ -f "$CACHE/$SLUG.mp3" ] || {
  echo "ERROR: yt-dlp ran but $CACHE/$SLUG.mp3 not found." >&2
  exit 22
}

echo "[3/4] converting to 16kHz mono wav..." >&2
mp3_to_wav "$CACHE/$SLUG.mp3" "$CACHE/$SLUG.wav"

echo "[4/4] transcribing with whisper-cli (large-v3-turbo)..." >&2
transcribe "$CACHE/$SLUG.wav" "$BASE"
rm -f "$CACHE/$SLUG.wav"

echo "" >&2
echo "Transcript ready:" >&2
echo "$BASE.txt"
