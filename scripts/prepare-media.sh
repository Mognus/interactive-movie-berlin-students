#!/usr/bin/env bash
# Turns the film team's delivery into the web-ready files the app serves.
#
# The masters are 1080p at ~6.4 Mbit/s and carry TWO MONO audio tracks (a
# binaural L/R pair out of Premiere). Browsers only ever play the first track,
# so playing a master unchanged loses the right channel - merging the pair into
# one stereo track is the whole reason this script re-encodes instead of copies.
#
# Usage:
#   scripts/prepare-media.sh            # skip outputs that are newer than their source
#   scripts/prepare-media.sh --force    # re-encode everything
set -euo pipefail

cd "$(dirname "$0")/.."

# Override when a later delivery unpacks under a different top-level folder.
MEDIA_SRC="${MEDIA_SRC:-resources/handoff/01_Handoff_Magnus}"
DEST=frontend/public
MANIFEST=scripts/media-manifest.txt

# CRF 21 at preset medium lands around 3 Mbit/s: visually indistinguishable from
# the 6.4 Mbit/s master at 1080p, roughly half the bytes over the wire.
CRF=21
PRESET=medium
AUDIO_BITRATE=160k

force=0
[ "${1:-}" = "--force" ] && force=1

command -v ffmpeg >/dev/null || { echo "ffmpeg not found" >&2; exit 1; }

if [ ! -d "$MEDIA_SRC" ]; then
  echo "source not found: $MEDIA_SRC" >&2
  echo "unpack the delivery first:  unzip resources/handoff-magnus.zip -d resources/handoff" >&2
  exit 1
fi

mkdir -p "$DEST/clips" "$DEST/audio"

missing=0
converted=0
skipped=0

# The delivered filenames contain spaces, so the manifest is pipe-separated and
# read field by field rather than split on whitespace.
while IFS='|' read -r src out; do
  case "$src" in ''|\#*) continue ;; esac

  in="$MEDIA_SRC/$src"
  target="$DEST/$out"

  if [ ! -f "$in" ]; then
    echo "  MISSING  $src" >&2
    missing=$((missing + 1))
    continue
  fi

  if [ "$force" -eq 0 ] && [ -f "$target" ] && [ "$target" -nt "$in" ]; then
    skipped=$((skipped + 1))
    continue
  fi

  case "$out" in
    audio/*)
      # The stems are already 192 kbit/s stereo MP3 - re-encoding would only
      # cost a generation of quality.
      cp "$in" "$target"
      echo "  copied   $out"
      ;;
    *)
      # -nostdin keeps ffmpeg from eating the manifest this loop reads from.
      # amerge builds one stereo track from the two mono inputs, pan then pins
      # them to L and R explicitly so the layout cannot come out as "2.0 (dual)".
      # +faststart moves the moov atom to the front so playback starts before
      # the whole file has arrived.
      ffmpeg -nostdin -y -loglevel error -stats \
        -i "$in" \
        -filter_complex "[0:a:0][0:a:1]amerge=inputs=2[a];[a]pan=stereo|c0=c0|c1=c1[aout]" \
        -map 0:v:0 -map "[aout]" \
        -c:v libx264 -crf "$CRF" -preset "$PRESET" -pix_fmt yuv420p \
        -profile:v high -level 4.0 \
        -c:a aac -b:a "$AUDIO_BITRATE" -ar 48000 \
        -movflags +faststart \
        "$target"
      echo "  encoded  $out"
      ;;
  esac
  converted=$((converted + 1))
done < "$MANIFEST"

echo
echo "converted $converted, skipped $skipped (up to date), missing $missing"
du -sh "$DEST/clips" "$DEST/audio"
[ "$missing" -eq 0 ] || exit 1
