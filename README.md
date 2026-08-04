# A Crime No One Saw Coming

An interactive movie in which the audience investigates a murder by combining
clues about the location, time, weapon, and motive. Each selection follows a
branch in the story graph and plays the corresponding video clip.

The project was created as a student project in Berlin and is currently built
with React, TypeScript, and Vite.

## Quick start

The placeholder clips are not in the repository, so generate them once (requires
FFmpeg):

```bash
./scripts/generate-clips.sh
```

Then start one of the stacks:

```bash
docker compose -f compose.dev.yml up          # dev, hot reload -> http://localhost:5173
docker compose up -d --build                  # production      -> http://localhost:8080
docker compose -f compose.dev.yml down        # stop (or: docker compose down)
```

Without Docker:

```bash
cd frontend && corepack enable && pnpm install && pnpm dev
```

Ports and the container name prefix can be overridden through a `.env` file, see
[`.env.example`](.env.example).

## Test paths

The board opens with a scripted selection that plays by itself. Afterwards, these
three combinations cover the outcomes worth checking. Columns follow the board
from left to right, and the labels are the ones printed on the notes:

| Zeit | Motiv | Ort | Mordwaffe | Outcome |
| --- | --- | --- | --- | --- |
| morgens | Rache | Haus des Opfers | Insulin | Solution: `Finales Ende`, then the end screen |
| morgens | any | Wald | any | Dead end: `DEAD END Wald Tag`, back to the board |
| abends | Rache | Gertruden-Linde | Schlag auf den Kopf | Clue: `Info Richtung Standort`, back to the board |

The third one also proves that edge order is respected: the rule directly below it
matches the same three values with any motive and leads to a dead end instead.

## Features

- Full-screen video playback
- Interactive investigation board
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

## Placeholder clips

The generated placeholder videos stand in for the final film material and are
color-coded by outcome, with the clip ID burned into the picture. Their
definitions live in
[`scripts/clips-manifest.txt`](scripts/clips-manifest.txt); the generated files
are written to `frontend/public/clips/` and are excluded from version control.

## Project structure

```text
.
├── frontend/
│   ├── public/clips/       # Video clips
│   ├── src/
│   │   ├── components/     # Player and investigation board
│   │   │   └── board/      # Board layout, notes, and connecting string
│   │   └── engine/         # Story graph, types, and traversal logic
│   ├── Dockerfile          # Production image, nginx serving the static build
│   └── Dockerfile.dev      # Development image, Vite with hot reload
├── resources/              # Storyboard, screenplay, and board reference photos
├── scripts/                # Graph validation and clip generation
├── compose.yml             # Production stack
└── compose.dev.yml         # Development stack
```
