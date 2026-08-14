/**
 * Non-translatable config + constants. All user-facing copy now lives in
 * the per-locale dictionaries (lib/i18n/dictionaries/*). The brand name
 * is intentionally here, not in the dictionaries — it reads the same in
 * every language.
 */

export const SITE = {
  name: "Diva Lines",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://divalines.com",
} as const;

/** ISO 8601 with timezone. Overridable via RELEASE_DATE env (server-side). */
export const RELEASE_DATE_FALLBACK = "2026-10-01T18:00:00+02:00";

export function getReleaseDate(): string {
  return process.env.RELEASE_DATE ?? RELEASE_DATE_FALLBACK;
}

/** Diva Lines brand playlist. The ID is the segment after /playlist/ in
 * any Spotify playlist URL. */
export const SPOTIFY_PLAYLIST_ID = "1cdj0Rt4BAXXQgbIbkOOvx";

export const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/divalines" },
] as const;
