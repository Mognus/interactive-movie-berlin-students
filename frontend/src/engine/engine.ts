// The whole game logic: follow edges through the graph, first match wins.
import rawGraph from "./graph.json";
import { ATTRIBUTE_KEYS, type Graph, type GraphNode, type Selection } from "./types";

export const graph = rawGraph as Graph;

export function nodeOf(id: string): GraphNode {
  const node = graph.nodes[id];
  if (!node) throw new Error(`unknown node "${id}"`);
  return node;
}

// selection object -> ordered 4-slot combo matching the "when" patterns
const comboOf = (sel: Selection) => ATTRIBUTE_KEYS.map((key) => sel[key]);

// Advance to the next node. Boards need a selection, clips just follow their single edge.
export function step(from: string, sel?: Selection): string {
  const combo = sel && comboOf(sel);
  const edge = graph.edges.find(
    (e) =>
      e.from === from &&
      (!e.when || (combo && e.when.every((m, i) => m === "*" || m === combo[i])))
  );
  if (!edge) throw new Error(`no edge from "${from}" for [${combo?.join(", ")}]`);
  return edge.to;
}
