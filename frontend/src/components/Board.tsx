import { useEffect, useState } from "react";
import { ATTRIBUTE_KEYS, type AttributeKey, type Selection } from "../engine/types";

// "verlassenes-haus" -> "Verlassenes Haus" (display only, engine keeps the slugs)
const pretty = (slug: string) =>
  slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

const HEADINGS: Record<AttributeKey, string> = {
  ort: "Ort",
  zeit: "Zeit",
  mordwaffe: "Mordwaffe",
  motiv: "Motiv",
};

interface BoardProps {
  attributes: Record<AttributeKey, string[]>;
  // pre-made selection on the first visit: shown briefly, then submitted automatically
  auto?: string[];
  onSubmit: (sel: Selection) => void;
}

export function Board({ attributes, auto, onSubmit }: BoardProps) {
  const [sel, setSel] = useState<Partial<Selection>>({});
  const complete = ATTRIBUTE_KEYS.every((k) => sel[k]);

  // first visit: the film pre-selects for the viewer, then plays on
  useEffect(() => {
    if (!auto) return;
    const autoSel = Object.fromEntries(
      ATTRIBUTE_KEYS.map((k, i) => [k, auto[i]])
    ) as Selection;
    const show = setTimeout(() => setSel(autoSel), 900);
    const submit = setTimeout(() => onSubmit(autoSel), 2600);
    return () => {
      clearTimeout(show);
      clearTimeout(submit);
    };
  }, [auto, onSubmit]);

  const choose = (key: AttributeKey, value: string) =>
    setSel((s) => ({ ...s, [key]: value }));

  return (
    <div className="board">
      <div className="board-columns">
        {ATTRIBUTE_KEYS.map((key) => (
          <section key={key} className="board-column">
            <h2>{HEADINGS[key]}</h2>
            {attributes[key].map((value) => (
              <button
                key={value}
                className={sel[key] === value ? "attr selected" : "attr"}
                disabled={!!auto}
                onClick={() => choose(key, value)}
              >
                {pretty(value)}
              </button>
            ))}
          </section>
        ))}
      </div>
      <button
        className="solve"
        disabled={!complete || !!auto}
        onClick={() => onSubmit(sel as Selection)}
      >
        Auflösen
      </button>
    </div>
  );
}
