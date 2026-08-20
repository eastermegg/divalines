"use client";

import { useDictionary } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/fill";
import { PRIZE_TOP_N } from "@/lib/site";

/** Copies of the item run per track half — enough that one half always
 * outspans the viewport, which the -50% loop depends on. */
const REPEATS = 4;

/**
 * Prize marquee — the sticky strip above the header that states what the
 * waitlist game pays out (−10% + the drop 24h early). The whole strip is
 * one link to the leaderboard, so it doubles as the always-visible route
 * back to /classement on small screens where the header has no room.
 */
export default function PrizeBanner() {
  const { dict, locale } = useDictionary();
  const B = dict.banner;

  const items = B.items.map((item) => fill(item, { top: PRIZE_TOP_N }));
  const run = Array.from({ length: REPEATS }, () => items).flat();

  const half = (
    <span className="flex shrink-0 items-center">
      {run.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-5">{item}</span>
          <span className="text-night/55">✦</span>
        </span>
      ))}
    </span>
  );

  return (
    <a
      href={`/${locale}/classement`}
      aria-label={fill(B.aria, { top: PRIZE_TOP_N })}
      className="marquee fixed inset-x-0 top-0 z-[60] block h-[var(--banner-h)] overflow-hidden bg-[linear-gradient(100deg,#d1569e_0%,#ff7a2f_55%,#ffd9a8_100%)] text-night"
    >
      {/* aria-label carries the message; the looping copies are decoration */}
      <span aria-hidden="true" className="marquee-track text-sm font-medium">
        {half}
        {half}
      </span>
    </a>
  );
}
