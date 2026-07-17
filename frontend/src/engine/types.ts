// Shapes for graph.json - the story graph transcribed from the BeatBoard.

export const ATTRIBUTE_KEYS = ["ort", "zeit", "mordwaffe", "motiv"] as const;
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

// one value per attribute, e.g. { ort: "wald", zeit: "abends", ... }
export type Selection = Record<AttributeKey, string>;

export interface GraphNode {
  type: "clip" | "board" | "end";
  src?: string;
  label?: string;
  // pre-made selection played automatically on the first board visit (overview PDF, step 2)
  firstVisitAuto?: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
  // 4-slot pattern [ort, zeit, mordwaffe, motiv], "*" = ALLE; absent on clip->board edges
  when?: string[];
}

export interface Graph {
  start: string;
  attributes: Record<AttributeKey, string[]>;
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
}
