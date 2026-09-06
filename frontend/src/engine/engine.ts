// The whole game logic: follow edges through the graph, first match wins.
import rawGraph from "./graph.json";
import {
    ATTRIBUTE_KEYS,
    type Graph,
    type GraphNode,
    type Selection,
} from "./types";

export const graph = rawGraph as Graph;

export function nodeOf(id: string): GraphNode {
    const node = graph.nodes[id];
    if (!node) throw new Error(`unknown node "${id}"`);
    return node;
}

// Clips and voice overs are served immutable for a year (see the Caddyfile) and
// keep stable file names, so re-cut material would never reach a browser that
// already holds the old version - no reload gets past an immutable entry, only
// a different URL does. Bump this whenever the material is replaced.
export const MEDIA_VERSION = 2;

export const mediaUrl = (src: string) => `${src}?v=${MEDIA_VERSION}`;

// What the progress counter measures against: every clip except the opening.
// There are no true dead ends in this story - everything leads back to the
// board apart from the solution - so "how far have I got" is best answered by
// how much of the material has been seen. Derived rather than hardcoded, so
// adding a scene to the graph moves the total on its own.
export const COUNTABLE_CLIPS = Object.entries(graph.nodes).filter(
    ([id, node]) => node.type === "clip" && id !== graph.start,
).length;

// selection object -> ordered 4-slot combo matching the "when" patterns
const comboOf = (sel: Selection) => ATTRIBUTE_KEYS.map((key) => sel[key]);

// Advance to the next node. Boards need a selection, clips just follow their single edge.
export function step(from: string, sel?: Selection): string {
    const combo = sel && comboOf(sel);
    const edge = graph.edges.find(
        (e) =>
            e.from === from &&
            (!e.when ||
                (combo && e.when.every((m, i) => m === "*" || m === combo[i]))),
    );
    if (!edge)
        throw new Error(`no edge from "${from}" for [${combo?.join(", ")}]`);
    return edge.to;
}
