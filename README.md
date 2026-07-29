# A Crime No One Saw Coming

An interactive movie in which the audience investigates a murder by combining
clues about the location, time, weapon, and motive. Each selection follows a
branch in the story graph and plays the corresponding video clip.

The project was created as a student project in Berlin and is currently built
with React, TypeScript, and Vite.

## Features

- Full-screen video playback
- Interactive investigation board
- Branching story defined in a JSON graph
- Automatic first selection to introduce the interaction
- Exhaustive validation of all 54 clue combinations
- Docker-based development and production environments

## Run with Docker

Start the development server with hot module replacement:

```bash
docker compose up dev
```

Open <http://localhost:5173>.

Build and serve the production version:

```bash
docker compose up --build prod
```

Open <http://localhost:8080>.

## Run locally

```bash
cd frontend
corepack enable
pnpm install
pnpm dev
```

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

The repository contains generated placeholder videos for testing the complete
interaction without the final film material. Their definitions live in
[`scripts/clips-manifest.txt`](scripts/clips-manifest.txt).

To regenerate them, install FFmpeg and run:

```bash
./scripts/generate-clips.sh
```

The generated files are written to `frontend/public/clips/`.

## Project structure

```text
.
├── frontend/
│   ├── public/clips/       # Video clips
│   └── src/
│       ├── components/     # Player and investigation board
│       └── engine/         # Story graph, types, and traversal logic
├── resources/              # Storyboard and project documents
├── scripts/                # Graph validation and clip generation
└── compose.yaml
```
