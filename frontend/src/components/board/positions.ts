// Single source of truth for the board layout.
//
// Coordinates are noted in the reference photo's pixel space
// (resources/cork-board-movie-images/cork-board-close.jpeg, 1600x1200) so they can be
// read straight off the photo. Notes position themselves as a percentage of these
// numbers and the twine SVG uses them as its viewBox units, which is what keeps the
// string glued to the pins at every window size without measuring anything.
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

    eifersucht: {
        x: 755,
        y: 509,
        rotation: -3,
        pin: "#2f6fbf",
        label: "Eifersucht",
    },
    geld: { x: 715, y: 714, rotation: -5, pin: "#e8c33a", label: "Geld" },
    rache: { x: 706, y: 908, rotation: -6, pin: "#f2ece0", label: "Rache" },

    // the board says "Haus des Opfers" where the engine says "verlassenes-haus"
    "verlassenes-haus": {
        x: 1016,
        y: 499,
        rotation: -2,
        pin: "#e8c33a",
        label: "Haus des Opfers",
    },
    wald: { x: 966, y: 730, rotation: 2, pin: "#2f8f6f", label: "Wald" },
    gertrudenlinde: {
        x: 966,
        y: 929,
        rotation: -3,
        pin: "#e06a8a",
        label: "Gertruden-Linde",
    },

    schlag: {
        x: 1240,
        y: 519,
        rotation: -8,
        pin: "#d33a5c",
        label: "Schlag auf den Kopf",
    },
    cyanid: { x: 1231, y: 744, rotation: -6, pin: "#7b3fb5", label: "Cyanid" },
    insulin: {
        x: 1205,
        y: 975,
        rotation: -2,
        pin: "#e8c33a",
        label: "Insulin",
    },
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

// The twine hangs from the pin, not from the middle of the note.
export const anchorOf = (n: NoteLayout) => ({ x: n.x, y: n.y - NOTE_H * 0.35 });

// --- scenery ------------------------------------------------------------

// Unlike the notes, every photo has its own size, so w/h are carried per item
// instead of coming from a shared constant. Values are the printed size in
// board units, taken from the reference photo.
export interface PropLayout {
    src: string;
    x: number; // center, same board units as the notes
    y: number;
    w: number;
    h: number;
    rotation: number;
    // Only set where the picture carries story, not atmosphere - the decorative
    // props stay hidden from assistive technology.
    alt?: string;
}

// Vite resolves these to hashed URLs in /assets, which is what gets them the
// immutable cache header from the Caddyfile.
import street1 from "../../assets/props/street-1.webp";
import street2 from "../../assets/props/street-2.webp";
import portraitSuit from "../../assets/props/portrait-suit.webp";
import portraitGirl from "../../assets/props/portrait-girl.webp";
import portraitMan from "../../assets/props/portrait-man.webp";

// Pure decoration - never clickable, never part of the engine. Ordered back to front.
export const PROPS: PropLayout[] = [
    { src: portraitMan, x: 180, y: 195, w: 200, h: 343, rotation: -2 },
    { src: portraitSuit, x: 528, y: 62, w: 78, h: 90, rotation: -6 },
    { src: portraitGirl, x: 1055, y: 105, w: 215, h: 163, rotation: 3 },
    { src: street1, x: 495, y: 1045, w: 272, h: 217, rotation: -8 },
    // hangs half off the left edge on the reference board
    { src: street2, x: 22, y: 355, w: 110, h: 84, rotation: -4 },
];

import geistVonGertrude from "../../assets/cards/geist-von-gertrude.webp";
import schuhGr from "../../assets/cards/schuh-gr-4243.webp";
import juni1973 from "../../assets/cards/juni-1973.webp";
import umkreis30km from "../../assets/cards/umkreis-30km.webp";
import ermordet from "../../assets/cards/ermordet.webp";
import ottoSchulz from "../../assets/cards/otto-schulz.webp";
import fundortLeiche from "../../assets/cards/fundort-leiche.webp";
import verbindungDmz from "../../assets/cards/verbindung-dmz.webp";

// The handwritten white clue cards. Same layout shape as PROPS, but kept apart
// because they render without a CSS shadow - theirs is baked into the artwork.
export const CARDS: PropLayout[] = [
    { src: geistVonGertrude, x: 872, y: 200, w: 155, h: 148, rotation: -2 },
    { src: schuhGr, x: 548, y: 483, w: 135, h: 135, rotation: -6 },
    { src: juni1973, x: 1425, y: 350, w: 150, h: 153, rotation: -4 },
    // the right-hand pair hangs over the edge of the board on the photo
    { src: umkreis30km, x: 1550, y: 505, w: 140, h: 141, rotation: -8 },
    { src: ermordet, x: 1405, y: 980, w: 155, h: 155, rotation: -4 },
    // mostly covered by the "Wald" note, exactly as on the reference board
    { src: ottoSchulz, x: 940, y: 665, w: 135, h: 129, rotation: 0 },
    { src: fundortLeiche, x: 1585, y: 55, w: 145, h: 148, rotation: -3 },
    { src: verbindungDmz, x: 35, y: 660, w: 140, h: 141, rotation: -5 },
];

import posterGertrudenlinde from "../../assets/props/poster-gertrudenlinde.webp";

// Scenery the story pins on mid-session, keyed by the graph's "revealsProp".
// The Gertrudenlinde drawing goes where it has always belonged: the large blank
// sheet on the left of the reference photo, which was left empty for it.
export const REVEALED_PROPS: Record<string, PropLayout> = {
    "gertrudenlinde-poster": {
        src: posterGertrudenlinde,
        x: 300,
        y: 620,
        w: 390,
        h: 550,
        rotation: -2,
        alt: "Zeichnung der Gertruden-Linde",
    },
};

// Decorative cord between the photos and the clue cards. Deliberately its own
// pin coordinates instead of anchors on PROPS/CARDS: on the reference board the
// string runs past the pictures, not exactly through their centers. Each entry
// is one continuous strand. Structurally a TwinePoint[], without importing the
// type from Twine.tsx and creating a cycle.
export const DECOR_STRANDS: {
    key: string;
    x: number;
    y: number;
    pin?: string;
}[][] = [
    // NOTE: every strand has to end on a pin, inside the stage. These used to
    // run off past the board edge on the idea that the cork continues beyond
    // the crop - but the cork background fills the whole viewport while the
    // stage does not, so on a wide screen the twine visibly stopped in the
    // middle of open cork with nothing holding it.

    // the long run: "ermordet" up to the small portrait, on to the girl, then
    // over to the top right corner
    [
        { key: "long-ermordet", x: 1391, y: 935, pin: "#e8c33a" },
        { key: "long-suit", x: 566, y: 62, pin: "#e8c33a" },
        { key: "long-girl", x: 1070, y: 40, pin: "#d33a5c" },
        { key: "long-corner", x: 1556, y: 38, pin: "#e8c33a" },
    ],
    // down the left edge: the portrait to the small picture below it, then
    // down to the lower left
    [
        { key: "left-man", x: 250, y: 120, pin: "#f2ece0" },
        { key: "left-street", x: 48, y: 342, pin: "#2f6fbf" },
        { key: "left-low", x: 30, y: 706, pin: "#d33a5c" },
    ],
    // between the date card and Otto Schulz
    [
        { key: "clue-juni", x: 1416, y: 322, pin: "#d33a5c" },
        { key: "clue-otto", x: 983, y: 645, pin: "#2f8f6f" },
    ],
];

// --- shared positioning -------------------------------------------------

// Notes and scenery resolve through the same function, so both live in one
// coordinate space and stay aligned when BOARD_W/BOARD_H ever change.
const placeStyle = (
    x: number,
    y: number,
    w: number,
    h: number,
    rotation: number,
) => ({
    left: `${(x / BOARD_W) * 100}%`,
    top: `${(y / BOARD_H) * 100}%`,
    width: `${(w / BOARD_W) * 100}%`,
    height: `${(h / BOARD_H) * 100}%`,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
});

export const spotStyle = (n: NoteLayout) =>
    placeStyle(n.x, n.y, NOTE_W, NOTE_H, n.rotation);

export const propStyle = (p: PropLayout) =>
    placeStyle(p.x, p.y, p.w, p.h, p.rotation);
