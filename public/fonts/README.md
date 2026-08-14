# Fonts

The brand's three-face system, all self-hosted via `next/font/local`
in `lib/fonts.ts`:

- `GreedNarrow-MediumItalic.woff2` — display face
  (`--font-display-var`), the giant "Divalines" wordmark-scale type.
  Italic-only, weight 500. **TRIAL cut — license the full version
  before launch.**
- `MigraItalic-ExtralightItalic.woff2` — editorial serif
  (`--font-serif-var`), "join the first line."-style accents.
  Italic-only, weight 200.
- `Switzer-{Regular,Italic,Medium,MediumItalic}.woff2` — UI/body sans
  (`--font-sans-var`). Weights 400 and 500 only, so stick to
  `font-normal` / `font-medium`; heavier or lighter classes fall back
  to the nearest real cut (or faux-bold).

Components consume `--font-display` / `--font-serif` / `--font-sans`
(mapped in `app/globals.css`), so swapping a family only touches
`lib/fonts.ts`. Greed and Migra are italic-only — always pair them
with the `italic` class so the requested style matches the face.
