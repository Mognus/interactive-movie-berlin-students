#!/usr/bin/env bash
# Ships the prepared clips and voice overs to the server.
#
# The material is bind-mounted into the Caddy container rather than baked into
# the image (see compose.yml), so pushing new cuts needs no rebuild and no
# downtime - rsync writes into the folder the running container already serves.
#
# Usage:
#   scripts/push-media.sh --dry-run    # show what would change, transfer nothing
#   scripts/push-media.sh
set -euo pipefail

cd "$(dirname "$0")/.."

# Defaults taken from the ansible fleet's inventory (~/infrastructure/inventory
# /hosts.yml, host "berlin"). That repo stays the source of truth - this only
# reads it. Override any of these per invocation:
#   REMOTE_HOST=magnus@example.de scripts/push-media.sh
REMOTE_HOST="${REMOTE_HOST:-root@31.70.81.40}"
REMOTE_DIR="${REMOTE_DIR:-/srv/interactive-movie/media}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_berlin}"

LOCAL_CLIPS=frontend/public/clips
LOCAL_AUDIO=frontend/public/audio

dry_run=()
[ "${1:-}" = "--dry-run" ] && dry_run=(--dry-run)

command -v rsync >/dev/null || { echo "rsync not found" >&2; exit 1; }

# --delete below removes anything on the server that is not here. Pushing from
# an empty or half-built folder would therefore wipe the running site, so refuse
# outright rather than trust that prepare-media.sh has been run.
for dir in "$LOCAL_CLIPS" "$LOCAL_AUDIO"; do
  if [ ! -d "$dir" ] || [ -z "$(ls -A "$dir" 2>/dev/null)" ]; then
    echo "$dir is missing or empty - run scripts/prepare-media.sh first" >&2
    exit 1
  fi
done

# Guard against shipping the colour-coded placeholders by accident: they are a
# few hundred KB, the real clips are hundreds of megabytes.
clips_size=$(du -sm "$LOCAL_CLIPS" | cut -f1)
if [ "$clips_size" -lt 50 ]; then
  echo "$LOCAL_CLIPS is only ${clips_size} MB - that looks like the placeholders" >&2
  echo "from generate-clips.sh, not the film. Run scripts/prepare-media.sh." >&2
  exit 1
fi

echo "pushing ${clips_size} MB to $REMOTE_HOST:$REMOTE_DIR"
[ ${#dry_run[@]} -gt 0 ] && echo "(dry run - nothing will be written)"

ssh -i "$SSH_KEY" "$REMOTE_HOST" "mkdir -p '$REMOTE_DIR'"

# --delete keeps the server free of clips dropped from the manifest; --partial
# lets an interrupted push over a slow line resume instead of restarting.
rsync -rlth "${dry_run[@]}" \
  --delete --partial --info=progress2 \
  -e "ssh -i $SSH_KEY" \
  "$LOCAL_CLIPS" "$LOCAL_AUDIO" \
  "$REMOTE_HOST:$REMOTE_DIR/"

echo
echo "done. On the server, MEDIA_DIR in .env must point at $REMOTE_DIR"
echo "and the stack needs one 'docker compose up -d' to pick up the mount."
