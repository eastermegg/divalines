"use client";

/**
 * Client-side referral state — the two localStorage keys from the spec
 * plus the shared rank fetch. No auth, no cookies: `divalines_ref`
 * remembers whose link brought you here (survives navigation before
 * signup), `divalines_me` remembers who YOU are once signed up so the
 * form can turn into your live ranking on the next visit.
 */

export const REF_KEY = "divalines_ref";
export const ME_KEY = "divalines_me";

export type RankInfo = {
  ref_code: string;
  rank?: number;
  referrals?: number;
  total?: number;
  to_top10?: number;
  /** Public stage name shown on the leaderboard ("Diva Stella Elektra"). */
  diva_name?: string;
};

export type LeaderboardRow = {
  rank: number;
  diva_name: string;
  referrals: number;
};

export type Leaderboard = {
  ok: boolean;
  closed?: boolean;
  total: number;
  top: LeaderboardRow[];
};

export async function fetchLeaderboard(fresh = false): Promise<Leaderboard> {
  // `fresh` skips the CDN cache (s-maxage=60) right after her own signup,
  // so her row/total appear without a reload.
  const url = fresh
    ? `/api/waitlist/leaderboard?fresh=${Date.now()}`
    : "/api/waitlist/leaderboard";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`leaderboard fetch failed: ${res.status}`);
  return (await res.json()) as Leaderboard;
}

/** Safe localStorage access — private browsing / blocked storage never throws. */
function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — the flow degrades to email re-entry */
  }
}

/** Capture ?ref=XXX into localStorage so the sponsorship survives
 * navigating around before signing up. Call once on mount. */
export function captureRef() {
  const ref = new URLSearchParams(window.location.search)
    .get("ref")
    ?.trim()
    .toLowerCase();
  if (ref && /^[a-z0-9]{4,12}$/.test(ref)) storageSet(REF_KEY, ref);
}

export function getStoredRef(): string | null {
  return storageGet(REF_KEY);
}

export function getMe(): string | null {
  return storageGet(ME_KEY);
}

export function setMe(refCode: string | null) {
  storageSet(ME_KEY, refCode);
}

// The page renders two independent WaitlistForm instances (hero + footer).
// Signup or "not you?" in one must flip the other too — a same-tab event
// does it (the localStorage `storage` event only fires in OTHER tabs).
const ME_EVENT = "divalines:me";

export function broadcastMe(info: RankInfo | null) {
  window.dispatchEvent(new CustomEvent(ME_EVENT, { detail: info }));
}

export function onMeChange(
  fn: (info: RankInfo | null) => void,
): () => void {
  const handler = (e: Event) =>
    fn((e as CustomEvent<RankInfo | null>).detail);
  window.addEventListener(ME_EVENT, handler);
  return () => window.removeEventListener(ME_EVENT, handler);
}

export function buildRefLink(refCode: string): string {
  return `${window.location.origin}/?ref=${refCode}`;
}

/** Ordinal rank for display: 47 → "47e" (fr) / "47th" (en). */
export function formatRank(rank: number, locale: string): string {
  if (locale === "fr") return rank === 1 ? "1re" : `${rank}e`;
  const mod10 = rank % 10;
  const mod100 = rank % 100;
  if (mod10 === 1 && mod100 !== 11) return `${rank}st`;
  if (mod10 === 2 && mod100 !== 12) return `${rank}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${rank}rd`;
  return `${rank}th`;
}

type RankResponse = RankInfo & { ok: boolean; closed?: boolean };

// One in-flight/settled fetch per code, shared by the hero + footer form
// instances so a returning visit costs a single request.
const rankCache = new Map<string, Promise<RankResponse | null>>();

/**
 * Fetch the live ranking for a code. Resolves null on a 404 (stale code —
 * caller should clear `divalines_me`) and rethrows on anything else so
 * callers can fall back to cached values.
 */
export function fetchRank(code: string): Promise<RankResponse | null> {
  let promise = rankCache.get(code);
  if (!promise) {
    promise = fetch(`/api/waitlist/rank?code=${encodeURIComponent(code)}`).then(
      async (res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`rank fetch failed: ${res.status}`);
        return (await res.json()) as RankResponse;
      },
    );
    // Drop failed lookups from the cache so a retry is possible.
    promise.catch(() => rankCache.delete(code));
    rankCache.set(code, promise);
  }
  return promise;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older Safari / non-secure contexts: hidden textarea + execCommand.
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
