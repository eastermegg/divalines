# Fonts

- `MigraItalic-ExtralightItalic.woff2` — the brand display serif,
  self-hosted via `next/font/local` in `lib/fonts.ts`
  (`--font-serif-var`). Italic-only, weight 200.
- Sans is currently Archivo from Google Fonts (`--font-sans-var`); to
  switch to PP Neue Montreal later, drop its WOFF2 files here and
  replace the Archivo export in `lib/fonts.ts` with `next/font/local`,
  keeping the same `variable` name. Nothing else changes.
