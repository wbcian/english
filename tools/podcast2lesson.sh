#!/usr/bin/env bash
# podcast2lesson.sh — paste a podcast link, get a transcript ready for Coach Max.
#
#   tools/podcast2lesson.sh <apple-or-rss-url> [study-date YYYY-MM-DD] [slug-override]
#
# Resolves the episode, downloads the MP3, transcribes it locally with whisper.cpp
# (large-v3-turbo, Metal), and writes:
#   transcripts/<date>-<slug>.txt   (committed)
#   transcripts/<date>-<slug>.srt   (committed)
#   transcripts/.cache/<slug>.mp3   (gitignored)
# Then prints the transcript path. Coach Max takes it from there -> lessons/.
set -euo pipefail

URL="${1:-}"
[ -n "$URL" ] || { echo "usage: $0 <apple-or-rss-url> [study-date] [slug-override]" >&2; exit 64; }
DATE="${2:-$(date +%F)}"
SLUG_OVERRIDE="${3:-}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=tools/_transcribe_common.sh
source "$ROOT/tools/_transcribe_common.sh"
init_paths
check_deps

echo "[1/4] resolving episode..." >&2
set +e
RESOLVE="$(python3 "$ROOT/tools/resolve_episode.py" "$URL")"
RC=$?
set -e
echo "$RESOLVE" | python3 -m json.tool >&2 || echo "$RESOLVE" >&2

STATUS="$(echo "$RESOLVE" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("status",""))')"
if [ "$STATUS" != "matched" ]; then
  echo "" >&2
  echo "Could not uniquely match the episode (status=$STATUS, rc=$RC)." >&2
  echo "Pick the right one from the candidates above and re-run with its mp3 url, or pass a direct feed URL." >&2
  exit "$RC"
fi

MP3_URL="$(echo "$RESOLVE" | python3 -c 'import sys,json;print(json.load(sys.stdin)["mp3"])')"
SLUG="${SLUG_OVERRIDE:-$(echo "$RESOLVE" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("slug") or "episode")')}"
[ -n "$SLUG" ] || SLUG="episode"
BASE="$OUTDIR/$DATE-$SLUG"

echo "[2/4] downloading mp3 -> $CACHE/$SLUG.mp3" >&2
HTTP="$(curl -L -w '%{http_code}' -o "$CACHE/$SLUG.mp3" "$MP3_URL")"
if [ "$HTTP" != "200" ]; then
  echo "ERROR: download failed (HTTP $HTTP). Episode may require a paid subscription." >&2
  rm -f "$CACHE/$SLUG.mp3"
  exit 22
fi

echo "[3/4] converting to 16kHz mono wav..." >&2
mp3_to_wav "$CACHE/$SLUG.mp3" "$CACHE/$SLUG.wav"

echo "[4/4] transcribing with whisper-cli (large-v3-turbo)..." >&2
transcribe "$CACHE/$SLUG.wav" "$BASE"
rm -f "$CACHE/$SLUG.wav"

echo "" >&2
echo "Transcript ready:" >&2
echo "$BASE.txt"
