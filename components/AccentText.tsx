import { Fragment } from "react";

/**
 * Brand headline renderer — the mixed-face system. The parent element
 * sets the base voice (Greed Narrow via `font-display italic`); copy
 * segments wrapped in *asterisks* switch to the Migra accent voice.
 *
 * Brand rule: highlight ONE word per sentence in Migra — never a whole
 * clause. Mark a single word (`... the *floor*.`), not a phrase.
 *
 * Accent runs at 1em. Pure x-height parity would be ~0.92em (Migra
 * Extralight x-height 0.522em vs Greed Medium 0.481em, measured from
 * the fonts), but at that size Migra reads too small — it's a far
 * lighter weight (200 vs 500), so its thin strokes recede. 1em gives
 * it optical presence at the cost of sitting ~8% taller in x-height,
 * which is the intended gentle accent lift. Italic is inherited (both
 * faces are italic-only).
 */
export default function AccentText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <span key={i} className="font-serif text-[1em] tracking-normal">
            {part.slice(1, -1)}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Marker-free copy for sr-only mirrors, <title>s, aria strings. */
export function plainText(text: string): string {
  return text.replaceAll("*", "");
}
