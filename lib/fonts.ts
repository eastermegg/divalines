/**
 * Font layer — swappable seam.
 *
 *   --font-serif-var  Migra Italic Extralight (brand display serif,
 *                     self-hosted from public/fonts/)
 *   --font-sans-var   Archivo (Google) ≈ PP Neue Montreal stand-in
 *
 * Every component consumes the CSS variables via --font-serif /
 * --font-sans in globals.css, so swapping a family only touches this
 * file. Migra ships italic-only at 200 — all serif usage in the app
 * requests `italic`, so the face always matches.
 */
import { Archivo } from "next/font/google";
import localFont from "next/font/local";

export const serif = localFont({
  src: "../public/fonts/MigraItalic-ExtralightItalic.woff2",
  weight: "200",
  style: "italic",
  variable: "--font-serif-var",
  display: "swap",
});

export const sans = Archivo({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans-var",
  display: "swap",
});
