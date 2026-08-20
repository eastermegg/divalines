/**
 * Non-translatable config + constants. All user-facing copy now lives in
 * the per-locale dictionaries (lib/i18n/dictionaries/*). The brand name
 * is intentionally here, not in the dictionaries — it reads the same in
 * every language.
 */

export const SITE = {
  name: "Divalines",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://divalines.com",
} as const;

/** Prize tiers. PRIZE_TOP_N ("XX" — still open) = 24h early access;
 * PRIZE_DISCOUNT_TOP_N = −10% on the drop. PRIZE_TOP_N is the single
 * source of truth for every "les {top} premières" in the copy. NOTE: the
 * database's get_rank RPC computes `to_top10` against a hardcoded 10 —
 * changing PRIZE_TOP_N needs a matching SQL migration. */
export const PRIZE_TOP_N = 10;
export const PRIZE_DISCOUNT_TOP_N = 5;

/** ISO 8601 with timezone. Overridable via RELEASE_DATE env (server-side). */
export const RELEASE_DATE_FALLBACK = "2026-10-01T18:00:00+02:00";

export function getReleaseDate(): string {
  return process.env.RELEASE_DATE ?? RELEASE_DATE_FALLBACK;
}

/** Divalines brand playlist. The ID is the segment after /playlist/ in
 * any Spotify playlist URL. */
export const SPOTIFY_PLAYLIST_ID = "1cdj0Rt4BAXXQgbIbkOOvx";

export const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/divalines" },
] as const;
