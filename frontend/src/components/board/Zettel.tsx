import { spotStyle, type NoteLayout } from "./positions";

interface ZettelProps {
    note: NoteLayout;
    selected?: boolean;
    disabled?: boolean;
    onSelect: () => void;
}

// One clickable sticky note. The pin sits inside the note, so it always covers the
// twine that is drawn on the layer below - same as a real pin holding a real string.
export function Zettel({ note, selected, disabled, onSelect }: ZettelProps) {
    return (
        <button
            type="button"
            className={selected ? "zettel is-selected" : "zettel"}
            style={spotStyle(note)}
            aria-pressed={selected}
            disabled={disabled}
            onClick={onSelect}
        >
            <span className="zettel-pin" style={{ background: note.pin }} />
            <span className="zettel-label">{note.label}</span>
        </button>
    );
}

// Non-interactive twin used for the column headings.
export function ZettelStatic({ note }: { note: NoteLayout }) {
    return (
        <div
            className="zettel zettel--header"
            style={spotStyle(note)}
            aria-hidden="true"
        >
            <span className="zettel-pin" style={{ background: note.pin }} />
            <span className="zettel-label">{note.label}</span>
        </div>
    );
}
