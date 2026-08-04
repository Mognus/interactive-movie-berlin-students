import { useEffect, useRef, useState } from "react";
import { ATTRIBUTE_KEYS, type AttributeKey, type Selection } from "../engine/types";
import { Zettel, ZettelStatic } from "./board/Zettel";
import { Twine } from "./board/Twine";
import { anchorOf, HEADERS, NOTES, SOLVE_NOTE, STRING_ORDER, spotStyle } from "./board/positions";
import "./board/board.css";

const GROUP_LABELS: Record<AttributeKey, string> = {
  ort: "Ort",
  zeit: "Zeit",
  mordwaffe: "Mordwaffe",
  motiv: "Motiv",
};

// Scripted first-visit beat: the picks land one by one so the twine visibly grows,
// left to right. The submit time is unchanged from the original placeholder board.
const AUTO_PICK_MS = [900, 1250, 1600, 1950];
const AUTO_SUBMIT_MS = 2600;

interface BoardProps {
  attributes: Record<AttributeKey, string[]>;
  // pre-made selection on the first visit: played back, then submitted automatically
  auto?: string[];
  onSubmit: (sel: Selection) => void;
}

export function Board({ attributes, auto, onSubmit }: BoardProps) {
  const [sel, setSel] = useState<Partial<Selection>>({});
  const chosen = ATTRIBUTE_KEYS.filter((k) => sel[k]).length;
  const complete = chosen === ATTRIBUTE_KEYS.length;

  // onSubmit is an inline arrow in App, so depending on it directly would restart
  // the scripted timers below on every parent re-render
  const submitRef = useRef(onSubmit);
  useEffect(() => {
    submitRef.current = onSubmit;
  });

  useEffect(() => {
    if (!auto) return;
    const autoSel = Object.fromEntries(
      ATTRIBUTE_KEYS.map((key, i) => [key, auto[i]])
    ) as Selection;

    const timers = STRING_ORDER.map((key, i) =>
      setTimeout(() => setSel((s) => ({ ...s, [key]: autoSel[key] })), AUTO_PICK_MS[i])
    );
    timers.push(setTimeout(() => submitRef.current(autoSel), AUTO_SUBMIT_MS));
    return () => timers.forEach(clearTimeout);
  }, [auto]);

  // catch an attribute value that has no place on the board before it silently vanishes
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    for (const key of ATTRIBUTE_KEYS)
      for (const value of attributes[key])
        if (!NOTES[value]) console.warn(`board: no position for attribute "${value}"`);
  }, [attributes]);

  // pin coordinates of the chosen notes, in board order so the twine sweeps
  // left to right across the columns
  const points = STRING_ORDER.flatMap((key) => {
    const value = sel[key];
    if (!value) return [];
    const note = NOTES[value];
    return note ? [{ key: value, ...anchorOf(note) }] : [];
  });

  return (
    <div className="board-screen">
      <div className="board-stage" aria-busy={!!auto}>
        {HEADERS.map((header) => (
          <ZettelStatic key={header.label} note={header} />
        ))}

        <Twine points={points} />

        {/* rendered in STRING_ORDER so tab order runs left to right across the board */}
        {STRING_ORDER.map((key) => (
          <div key={key} className="board-group" role="group" aria-label={GROUP_LABELS[key]}>
            {attributes[key].map((value) =>
              NOTES[value] ? (
                <Zettel
                  key={value}
                  note={NOTES[value]}
                  selected={sel[key] === value}
                  disabled={!!auto}
                  // re-clicking the chosen note does nothing; clearing it has no purpose
                  // now that confirming is an explicit step
                  onSelect={() => setSel((s) => ({ ...s, [key]: value }))}
                />
              ) : null
            )}
          </div>
        ))}

        {complete && !auto && (
          <button
            type="button"
            className="zettel solve-note"
            style={spotStyle(SOLVE_NOTE)}
            onClick={() => submitRef.current(sel as Selection)}
          >
            <span className="zettel-pin" style={{ background: SOLVE_NOTE.pin }} />
            <span className="zettel-label">{SOLVE_NOTE.label}</span>
          </button>
        )}

        <p className="sr-only" aria-live="polite">
          {complete
            ? "Alle vier Attribute gewählt. Fall lösen ist möglich."
            : `${chosen} von 4 Attributen gewählt.`}
        </p>
      </div>
    </div>
  );
}
