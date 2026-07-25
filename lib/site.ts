/** Central copy + config. The spec (§9) corrects the mockup's "Here" → "Her". */

export const SITE = {
  name: "Diva Lines",
  title: "Diva Lines — Independ Heels Dancewear. Join the waitlist",
  description:
    "Independ heels dancewear, designed in Paris. Heels engineered for the floor, cut for the body. First drop this fall — limited run, waitlist first.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://divalines.com",
  brandLine: ["Independ Heels Dancewear Brand", "Designed in Paris"],
} as const;

/** ISO 8601 with timezone. Overridable via RELEASE_DATE env (server-side). */
export const RELEASE_DATE_FALLBACK = "2026-10-01T18:00:00+02:00";

export function getReleaseDate(): string {
  return process.env.RELEASE_DATE ?? RELEASE_DATE_FALLBACK;
}

export const HERO = {
  hook: ["You'll Feel Her.", "Before You See Her.", "Period."],
  paragraph:
    "Heels engineered for the floor, cut for the body. First drop this fall — limited run, waitlist first.",
} as const;

/**
 * Exact wording + casing from the Figma maquette (the Title Case /
 * lowercase alternation is deliberate). Repeated twice, as designed —
 * the scroll light-up runs across both passes.
 */
const MANIFESTO_PHRASE =
  "She doesn't wait To Be Chosen. she chooses herself. " +
  "She Doesn't Follow The Rhythm. she is the rhythm. " +
  "Soft. Don't Mistake It For Weakness. " +
  "You Don't Become Her. you remember you are her.";

export const MANIFESTO = `${MANIFESTO_PHRASE} ${MANIFESTO_PHRASE}`;

export const COLLECTION = {
  label: "The first line — fall 2026",
  title: "five pieces. cut for the floor.",
  sub: "Blurred until the drop. The waitlist sees them first.",
  items: [
    { n: "N°01", name: "the bodysuit" },
    { n: "N°02", name: "the wrap skirt" },
    { n: "N°03", name: "the second skin" },
    { n: "N°04", name: "the flare pant" },
    { n: "N°05", name: "the crop top" },
  ],
} as const;

export const FORM = {
  placeholder: "Enter your email",
  cta: "Join the waitlist",
  success: "You're on the list. ✦",
  errorInvalid: "That email doesn't look right — try again.",
  errorServer: "Something slipped. Try again in a moment.",
  errorRateLimited: "Easy — too many tries. Give it a few minutes.",
  consent: "By joining you agree to receive launch updates.",
} as const;

/** Placeholder (Spotify's editorial "Dance Party") — swap for the brand
 * playlist ID once it exists. The ID is the segment after /playlist/ in
 * any Spotify playlist URL. */
export const SPOTIFY_PLAYLIST_ID = "37i9dQZF1DXaXB8fQg7xif";

export const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/divalines" },
  { label: "TikTok", href: "https://tiktok.com/@divalines" },
] as const;
