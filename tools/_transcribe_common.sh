#!/usr/bin/env bash
# _transcribe_common.sh — shared mp3→wav→whisper-cli pipeline.
#
# Source this file; do NOT execute it directly. The two callers
# (podcast2lesson.sh, youtube2lesson.sh) handle URL resolution and
# mp3 acquisition, then delegate the rest here.
#
# Caller is expected to set $ROOT (repo root). Other paths default
# from $ROOT but can be overridden before calling init_paths().

# Guard against direct execution.
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  echo "ERROR: _transcribe_common.sh is a library; source it instead." >&2
  exit 1
fi

# Set MODEL / CACHE / OUTDIR defaults and ensure dirs exist.
init_paths() {
  : "${ROOT:?ROOT must be set before sourcing init_paths}"
  MODEL="${MODEL:-$ROOT/tools/models/ggml-large-v3-turbo.bin}"
  CACHE="${CACHE:-$ROOT/transcripts/.cache}"
  OUTDIR="${OUTDIR:-$ROOT/transcripts}"
  mkdir -p "$CACHE" "$OUTDIR"
}

# Verify required binaries + model exist. Pass any extra bins as args.
# Usage: check_deps [extra-bin ...]
check_deps() {
  for bin in whisper-cli ffmpeg python3 curl "$@"; do
    command -v "$bin" >/dev/null 2>&1 || {
      echo "ERROR: missing '$bin'. See tools/README.md setup." >&2
      exit 69
    }
  done
  [ -f "$MODEL" ] || {
    echo "ERROR: model not found: $MODEL (download per tools/README.md)" >&2
    exit 69
  }
}

# Convert mp3 → 16kHz mono pcm_s16le wav (whisper.cpp's preferred format).
# Usage: mp3_to_wav <mp3_path> <wav_path>
mp3_to_wav() {
  ffmpeg -y -loglevel error -i "$1" -ar 16000 -ac 1 -c:a pcm_s16le "$2"
}

# Run whisper-cli, writing <base>.txt and <base>.srt.
# Usage: transcribe <wav_path> <base_out> [initial_prompt]
# If $3 is non-empty, passes --prompt and --carry-initial-prompt so the
# glossary stays in scope past the first 30s window
# (see RESEARCH-whisper-upgrade.md Phase 1a).
transcribe() {
  local wav="$1" base="$2" prompt="${3:-}"
  local args=(-m "$MODEL" -f "$wav" -otxt -osrt -of "$base")
  if [ -n "$prompt" ]; then
    args+=(--prompt "$prompt" --carry-initial-prompt)
  fi
  whisper-cli "${args[@]}" >&2
}
