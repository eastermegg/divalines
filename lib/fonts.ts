/**
 * Font layer — the brand's real three-face system, all self-hosted
 * from public/fonts/:
 *
 *   --font-display-var  Greed Narrow Medium Italic (TRIAL) — the
 *                       wordmark-scale display face (giant "Divalines"
 *                       type). Italic-only, weight 500.
 *   --font-serif-var    Migra Italic Extralight — editorial serif
 *                       accents ("join the first line."). Italic-only,
 *                       weight 200.
 *   --font-sans-var     Switzer — all UI/body text. Regular + Medium,
 *                       with true italics for both.
 *
 * Every component consumes the CSS variables via --font-display /
 * --font-serif / --font-sans in globals.css, so swapping a family only
 * touches this file. The italic-only faces (Greed, Migra) are always
 * requested with `italic` in markup so the face matches.
 *
 * NOTE: Greed Narrow is the TRIAL cut — license the full version
 * before launch.
 */
import localFont from "next/font/local";

export const display = localFont({
  src: "../public/fonts/GreedNarrow-MediumItalic.woff2",
  weight: "500",
  style: "italic",
  variable: "--font-display-var",
  display: "swap",
});

export const serif = localFont({
  src: "../public/fonts/MigraItalic-ExtralightItalic.woff2",
  weight: "200",
  style: "italic",
  variable: "--font-serif-var",
  display: "swap",
});

export const sans = localFont({
  src: [
    { path: "../public/fonts/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Switzer-Italic.woff2", weight: "400", style: "italic" },
    { path: "../public/fonts/Switzer-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Switzer-MediumItalic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-sans-var",
  display: "swap",
});
