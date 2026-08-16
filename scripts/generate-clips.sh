#!/usr/bin/env bash
# Generates placeholder videos from clips-manifest.txt into frontend/public/clips/.
# Color-coded by outcome type, with the clip ID + a running timer burned in,
# so you can instantly see which clip the engine picked while testing.
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p frontend/public/clips

# Wipe first: the directory is generated and gitignored, so nothing of value
# lives here. Without this, clips from an older manifest - or from the run that
# truncated the ids - stay behind and get baked into the image.
rm -f frontend/public/clips/*.mp4

DURATION=5

# background color per outcome type (red=deadend, yellow=info, green=finale, blue=intro)
color_for() {
  case "$1" in
    intro)   echo 0x2b4a7a ;;
    info)    echo 0x8a7a1e ;;
    deadend) echo 0x7a2b2b ;;
    finale)  echo 0x2b7a3a ;;
    *)       echo 0x444444 ;;
  esac
}

grep -v '^#' scripts/clips-manifest.txt | while IFS='|' read -r id type label; do
  [ -z "$id" ] && continue
  out="frontend/public/clips/${id}.mp4"
  # -nostdin is load-bearing: ffmpeg otherwise reads stdin for keypresses and
  # steals bytes from the manifest this loop is reading, which truncates the
  # ids of later lines. Some ffmpeg builds do it, some don't.
  #
  # silent audio track included so the <video> element behaves like the real clips
  ffmpeg -nostdin -y -loglevel error \
    -f lavfi -i "color=c=$(color_for "$type"):s=1280x720:d=${DURATION}" \
    -f lavfi -i "anullsrc=r=44100:cl=stereo" \
    -vf "drawtext=text='${id}':fontsize=84:fontcolor=white:x=(w-tw)/2:y=(h-th)/2-40, \
         drawtext=text='${label}':fontsize=40:fontcolor=white@0.8:x=(w-tw)/2:y=(h-th)/2+70, \
         drawtext=text='%{pts\:hms}':fontsize=32:fontcolor=yellow:x=24:y=24" \
    -shortest -t "$DURATION" \
    -movflags +faststart "$out"
  echo "  $out ($type)"
done

echo "Done: $(ls frontend/public/clips/*.mp4 | wc -l) clips in frontend/public/clips/"
