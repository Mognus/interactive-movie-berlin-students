// Single source of truth for the board layout.
//
// Coordinates are noted in the reference photo's pixel space
// (resources/cork-board-movie-images/cork-board-close.jpeg, 1600x1200) so they can be
// read straight off the photo. Notes position themselves as a percentage of these
// numbers and the twine SVG uses them as its viewBox units, which is what keeps the
// string glued to the pins at every window size without measuring anything.
import type { AttributeKey } from "../../engine/types";

export const BOARD_W = 1600;
export const BOARD_H = 1200;

// All sticky notes on the reference board are the same physical size; only the text differs.
export const NOTE_W = 180;
export const NOTE_H = 170;

export interface NoteLayout {
  x: number; // center, in board units
  y: number;
  rotation: number; // degrees, the slight tilt of a hand-pinned note
  pin: string; // pin head color, mixed on the photo
  label: string; // text on the note - may differ from the engine slug
}

// Attribute slug -> note. Must cover every value in graph.json.
export const NOTES: Record<string, NoteLayout> = {
  morgens: { x: 355, y: 505, rotation: -4, pin: "#2f6fbf", label: "morgens" },
  abends: { x: 458, y: 714, rotation: -3, pin: "#f2ece0", label: "abends" },

  eifersucht: { x: 755, y: 509, rotation: -3, pin: "#2f6fbf", label: "Eifersucht" },
  geld: { x: 715, y: 714, rotation: -5, pin: "#e8c33a", label: "Geld" },
  rache: { x: 706, y: 908, rotation: -6, pin: "#f2ece0", label: "Rache" },

  // the board says "Haus des Opfers" where the engine says "verlassenes-haus"
  "verlassenes-haus": { x: 1016, y: 499, rotation: -2, pin: "#e8c33a", label: "Haus des Opfers" },
  wald: { x: 966, y: 730, rotation: 2, pin: "#2f8f6f", label: "Wald" },
  gertrudenlinde: { x: 966, y: 929, rotation: -3, pin: "#e06a8a", label: "Gertruden-Linde" },

  schlag: { x: 1240, y: 519, rotation: -8, pin: "#d33a5c", label: "Schlag auf den Kopf" },
  cyanid: { x: 1231, y: 744, rotation: -6, pin: "#7b3fb5", label: "Cyanid" },
  insulin: { x: 1205, y: 975, rotation: -2, pin: "#e8c33a", label: "Insulin" },
};

// Column headings - decoration only, never clickable.
export const HEADERS: NoteLayout[] = [
  { x: 495, y: 300, rotation: -5, pin: "#f2ece0", label: "ZEIT" },
  { x: 768, y: 292, rotation: -4, pin: "#d33a5c", label: "MOTIV" },
  { x: 1018, y: 292, rotation: -2, pin: "#d33a5c", label: "ORT" },
  { x: 1268, y: 278, rotation: -3, pin: "#e8c33a", label: "MORDWAFFE" },
];

// Confirm note, on the free cork at the lower left.
export const SOLVE_NOTE: NoteLayout = {
  x: 320,
  y: 910,
  rotation: -8,
  pin: "#d33a5c",
  label: "Fall lösen",
};

// Order in which the twine connects the chosen notes: spatially left to right.
// Deliberately NOT ATTRIBUTE_KEYS order - that would run column 3 -> 1 -> 4 -> 2
// and scribble across the board.
export const STRING_ORDER: readonly AttributeKey[] = ["zeit", "motiv", "ort", "mordwaffe"];

// The twine hangs from the pin, not from the middle of the note.
export const anchorOf = (n: NoteLayout) => ({ x: n.x, y: n.y - NOTE_H * 0.35 });

// Positioning shared by notes and headers, so both sit in the exact same coordinate space.
export const spotStyle = (n: NoteLayout) => ({
  left: `${(n.x / BOARD_W) * 100}%`,
  top: `${(n.y / BOARD_H) * 100}%`,
  width: `${(NOTE_W / BOARD_W) * 100}%`,
  height: `${(NOTE_H / BOARD_H) * 100}%`,
  transform: `translate(-50%, -50%) rotate(${n.rotation}deg)`,
});
