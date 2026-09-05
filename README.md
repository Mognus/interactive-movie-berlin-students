# A Crime No One Saw Coming

An interactive movie in which the audience investigates a murder by combining
clues about the location, time, weapon, and motive. Each selection follows a
branch in the story graph and plays the corresponding video clip.

The project was created as a student project in Berlin and is currently built
with React, TypeScript, and Vite.

## Quick start

No film material is in the repository. Either build the real clips and voice
overs from the film team's delivery, or generate stand-ins (both need FFmpeg):

```bash
unzip resources/handoff-magnus.zip -d resources/handoff   # once
./scripts/prepare-media.sh                                # the real thing
./scripts/generate-clips.sh                               # colour-coded stand-ins
```

Then start one of the stacks:

```bash
docker compose -f compose.dev.yml up          # dev, hot reload -> http://localhost:5173
docker compose up -d --build                  # production      -> http://localhost
docker compose -f compose.dev.yml down        # stop (or: docker compose down)
```

Without Docker:

```bash
cd frontend && corepack enable && pnpm install && pnpm dev
```

The production stack serves through Caddy on ports 80 and 443. Locally that is
plain HTTP; setting `SITE_ADDRESS` to a domain makes Caddy provision and renew
the certificate on its own. The domain, the dev port, and the container name
prefix are configured through a `.env` file, see [`.env.example`](.env.example).

## Testing aids

A button to skip the running clip appears automatically during `pnpm dev`. The
clips run up to five minutes, so walking a path without it is slow going. It
routes through the same code path as a clip that ended on its own, so a skipped
playthrough reveals props and arms voice overs exactly like the real one.

To keep it in a deployed build — handy while the team is reviewing — set
`DEV_TOOLS=1` in `.env` and rebuild:

```bash
docker compose up -d --build
```

Vite inlines the flag at build time, so a restart alone changes nothing; and
with it off, the button is not merely hidden but absent from the bundle. Turn it
off again for anything the audience sees.

## Test paths

The board opens with a scripted selection that plays by itself. Afterwards, these
three combinations cover the outcomes worth checking. Columns follow the board
from left to right, and the labels are the ones printed on the notes:

| Zeit    | Motiv | Ort             | Mordwaffe           | Outcome                                           |
| ------- | ----- | --------------- | ------------------- | ------------------------------------------------- |
| morgens | Rache | Haus des Opfers | Insulin             | Solution: `Finales Ende`, then the end screen     |
| morgens | any   | Wald            | any                 | Dead end: `DEAD END Wald Tag`, back to the board  |
| abends  | Rache | Gertruden-Linde | Schlag auf den Kopf | Clue: `Info Richtung Standort`, back to the board |

The third one also proves that edge order is respected: the rule directly below it
matches the same three values with any motive and leads to a dead end instead.

## Features

- Full-screen video playback
- Interactive investigation board
- A voice over bed under the board, chosen by the scene that led there
- Scenery the story pins on mid-session, e.g. the Gertrudenlinde drawing
- Branching story defined in a JSON graph
- Automatic first selection to introduce the interaction
- Exhaustive validation of all 54 clue combinations
- Docker-based development and production environments

## Story graph

The branching logic lives in
[`frontend/src/engine/graph.json`](frontend/src/engine/graph.json). A selection
contains one value for each clue:

```text
location + time + murder weapon + motive -> next video clip
```

Edges are evaluated from top to bottom. The `*` value acts as a wildcard, so
more specific rules must appear before broader fallback rules.

Validate that every combination resolves to an existing and reachable clip:

```bash
node scripts/validate-graph.mjs
```

## Film material

The delivery ships as `resources/handoff-magnus.zip`: 1080p masters and the
voice over stems. [`scripts/media-manifest.txt`](scripts/media-manifest.txt)
maps the delivered filenames onto the ids the graph expects, and
`scripts/prepare-media.sh` builds the web-ready files from it into
`frontend/public/{clips,audio}/`. Neither folder is under version control.

That step re-encodes rather than copies for one reason: **the masters carry two
mono audio tracks**, a binaural L/R pair out of Premiere. Browsers only play the
first track, so an unprocessed master loses its right channel. The script merges
the pair into one stereo track, and while it is at it drops 6.4 Mbit/s to about
3 and moves the `moov` atom to the front for instant playback.

Voice overs are named after the clip they follow. Entering the board from
`OS_3_2_1_3` plays `audio/vo-after-OS_3_2_1_3.mp3`; everything else gets
`audio/vo-baseline.mp3`. Each plays once and then runs out — they are narration,
not a loop. The mapping lives in `graph.json` as `voiceOver` on the clip node.

### Deployment

The material is bind-mounted into the Caddy container instead of baked into the
image, so a re-cut clip needs no rebuild:

```bash
./scripts/push-media.sh --dry-run   # inspect first
./scripts/push-media.sh
```

Point `MEDIA_DIR` in the server's `.env` at the folder it rsyncs into, then
`docker compose up -d` once to pick up the mount. The host defaults come from
the ansible fleet's inventory and can be overridden with `REMOTE_HOST`,
`REMOTE_DIR` and `SSH_KEY`.

`/clips/*` and `/audio/*` are served `immutable` for a year and the filenames
are stable, so a browser that has already loaded a clip will never ask for it
again. Replacing the file on the server does nothing for that browser, and no
reload gets past an immutable entry — only a different URL does.

That is what `MEDIA_VERSION` in
[`frontend/src/engine/engine.ts`](frontend/src/engine/engine.ts) is for: it
appends `?v=N` to every clip and voice over URL. **Bump it whenever you replace
material**, otherwise anyone who saw the old cut keeps seeing it.

## Placeholder clips

For work without the film material, `scripts/generate-clips.sh` writes
colour-coded stand-ins from
[`scripts/clips-manifest.txt`](scripts/clips-manifest.txt), with the clip ID
burned into the picture, into the same `frontend/public/clips/`.

## Project structure

```text
.
├── frontend/
│   ├── public/clips/       # Video clips        } bind-mounted in production,
│   ├── public/audio/       # Voice over beds    } never in the image
│   ├── src/
│   │   ├── components/     # Player, ambience, and investigation board
│   │   │   └── board/      # Board layout, notes, and connecting string
│   │   └── engine/         # Story graph, types, and traversal logic
│   ├── Caddyfile           # Static file serving, SPA fallback, cache headers
│   ├── Dockerfile          # Production image, Caddy serving the static build
│   └── Dockerfile.dev      # Development image, Vite with hot reload
├── resources/              # Storyboard, screenplay, and board reference photos
│   └── handoff/            # Unpacked delivery, gitignored
├── scripts/                # Graph validation, media pipeline, deployment
├── compose.yml             # Production stack
└── compose.dev.yml         # Development stack
```
