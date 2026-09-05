// Shapes for graph.json - the story graph transcribed from the BeatBoard.

// Order matters twice over: it is the slot order of the "when" patterns in
// graph.json, and it is the board's column order from left to right, which the
// twine and the tab order follow.
export const ATTRIBUTE_KEYS = ["zeit", "motiv", "ort", "mordwaffe"] as const;
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

// one value per attribute, e.g. { ort: "wald", zeit: "abends", ... }
export type Selection = Record<AttributeKey, string>;

export interface GraphNode {
    type: "clip" | "board" | "end";
    src?: string;
    label?: string;
    // pre-made selection played automatically on the first board visit (overview PDF, step 2)
    firstVisitAuto?: string[];
    // Bed the board plays once when it is entered from this clip. Clips without
    // one fall back to the baseline bed, so only the five scripted beats set it.
    voiceOver?: string;
    // Scenery this clip pins onto the board for the rest of the session, e.g.
    // the Gertrudenlinde drawing the detective finds in OS_2_2_1_A.
    revealsProp?: string;
}

export interface GraphEdge {
    from: string;
    to: string;
    // 4-slot pattern following ATTRIBUTE_KEYS, "*" = ALLE; absent on clip->board edges
    when?: string[];
}

export interface Graph {
    start: string;
    attributes: Record<AttributeKey, string[]>;
    nodes: Record<string, GraphNode>;
    edges: GraphEdge[];
}
