// Sanity-checks graph.json: every attribute combination must resolve to a clip,
// every edge must reference existing nodes, every clip node must be reachable.
import { readFileSync } from "node:fs";

const graph = JSON.parse(readFileSync(new URL("../graph.json", import.meta.url)));
const { attributes, nodes, edges } = graph;

let errors = 0;
const fail = (msg) => { console.error("FAIL:", msg); errors++; };

// edges must point at real nodes
for (const e of edges) {
  if (!nodes[e.from]) fail(`edge from unknown node "${e.from}"`);
  if (!nodes[e.to]) fail(`edge to unknown node "${e.to}"`);
}

// same first-match logic the frontend engine will use
const resolve = (combo) =>
  edges.find(
    (e) =>
      e.from === "board" &&
      e.when.every((m, i) => m === "*" || m === combo[i])
  );

// exhaustively try all combinations (3*2*3*3 = 54)
const hits = new Map();
for (const ort of attributes.ort)
  for (const zeit of attributes.zeit)
    for (const mordwaffe of attributes.mordwaffe)
      for (const motiv of attributes.motiv) {
        const combo = [ort, zeit, mordwaffe, motiv];
        const edge = resolve(combo);
        if (!edge) fail(`no edge matches [${combo.join(", ")}]`);
        else hits.set(edge.to, (hits.get(edge.to) ?? 0) + 1);
      }

// every clip should be reachable from the board
for (const [id, node] of Object.entries(nodes)) {
  if (node.type === "clip" && id !== "intro" && !hits.has(id))
    fail(`clip "${id}" is never reached by any combination`);
}

console.log("combinations per clip:");
for (const [id, n] of [...hits].sort((a, b) => b[1] - a[1]))
  console.log(`  ${String(n).padStart(2)}x  ${id}  (${nodes[id].label ?? ""})`);

console.log(errors ? `\n${errors} error(s)` : "\nOK: all 54 combinations covered");
process.exit(errors ? 1 : 0);
