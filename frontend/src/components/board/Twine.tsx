import { BOARD_H, BOARD_W } from "./positions";

export interface TwinePoint {
    key: string; // identifies the point across renders, used to key the segments
    x: number;
    y: number;
}

// How far a segment dips relative to its own length.
const SAG = 0.09;

// Real string sags towards the floor, so the control point is pushed down rather
// than perpendicular to the segment - a perpendicular offset would flip the bulge
// depending on which way the segment runs.
const segPath = (a: TwinePoint, b: TwinePoint) => {
    const sag = Math.hypot(b.x - a.x, b.y - a.y) * SAG;
    return `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + sag} ${b.x} ${b.y}`;
};

// Draws string through the given points. Knows nothing about notes or attributes -
// it shares only the board's coordinate space, which is what keeps the ends on the
// pins at any window size without measuring the DOM.
export function Twine({ points }: { points: TwinePoint[] }) {
    return (
        <svg
            className="board-twine"
            viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
            aria-hidden="true"
        >
            {points.slice(1).map((point, i) => {
                const d = segPath(points[i], point);
                return (
                    // keyed by the pair it connects, so re-picking one attribute leaves the
                    // untouched segments standing still instead of redrawing everything
                    <g key={`${points[i].key}-${point.key}`}>
                        {/* pathLength normalises the path to 1 unit, which is what lets the
                dash animation draw it on without measuring it in JS */}
                        <path className="twine-base" d={d} pathLength={1} />
                        <path className="twine-stripe" d={d} />
                    </g>
                );
            })}
        </svg>
    );
}
