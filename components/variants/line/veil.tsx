"use client";

import { useEffect, useState } from "react";
import { RELEASE_DATE_FALLBACK } from "@/lib/site";

/* ── The veil ────────────────────────────────────────────────────────
 * Client wants the pieces teased, never read, before launch. So every
 * plate sits behind a permanent frosted glass: heavy blur + heat wash +
 * grain. The blur is driven by the countdown — it starts thick and lifts
 * a little as the drop nears (VEIL_WINDOW_MS out). It never reaches zero:
 * even at launch the plate stays soft. The waitlist is what sees first.
 *
 * Shared by both line presentations (the scrubbed stack + the infinite
 * wall), so the veil looks identical wherever a piece appears. */
export const VEIL_MAX_BLUR = 6; // px — far from launch: a light frost, the piece reads clearly
export const VEIL_MIN_BLUR = 3; // px — at the drop: just a whisper of veil, never fully crisp
export const VEIL_WINDOW_MS = 75 * 24 * 60 * 60 * 1000; // veil lifts over the last 75d
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Countdown-driven veil thickness (px of blur). Starts at the SSR-safe
 * max, then lifts toward the drop. Consumers layer their own hover/drag
 * easing on top of the returned value.
 */
export function useVeilBlur(releaseDate: string = RELEASE_DATE_FALLBACK): number {
  const [veilBlur, setVeilBlur] = useState(VEIL_MAX_BLUR);
  useEffect(() => {
    const target = new Date(releaseDate).getTime();
    if (Number.isNaN(target)) return;
    const compute = () => {
      const remaining = target - Date.now();
      const lift = clamp01(1 - remaining / VEIL_WINDOW_MS); // 0 far → 1 at drop
      setVeilBlur(VEIL_MAX_BLUR - (VEIL_MAX_BLUR - VEIL_MIN_BLUR) * lift);
    };
    compute();
    const id = window.setInterval(compute, 30_000);
    return () => window.clearInterval(id);
  }, [releaseDate]);
  return veilBlur;
}

/**
 * One frosted plate: the real photo under blur + heat wash + grain + a
 * glass edge. Blur is inherited via the `--veil-blur` CSS variable set on
 * an ancestor, so the countdown/hover only has to move one value and every
 * plate follows in step.
 */
export default function VeiledPlate({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-sm shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
      {/* scale-[1.08] hides the transparent halo the blur pulls off the
          edges; the container clips the overflow. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full scale-[1.08] object-cover transition-[filter] duration-700 ease-out"
        style={{ filter: "blur(var(--veil-blur, 22px)) saturate(1.05) brightness(0.92)" }}
      />
      {/* heat wash — warms the glass, sinks the foot into the dark page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-heat-orange/30 via-transparent to-night/50 mix-blend-soft-light"
      />
      {/* diagonal sheen so it reads as a lit pane of glass */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(125deg, rgba(255,255,255,0.12) 0%, transparent 42%)",
        }}
      />
      {/* grain so the veil reads printed, not like a cheap CSS blur */}
      <div
        aria-hidden
        className="grain pointer-events-none absolute inset-0 opacity-[0.4] mix-blend-soft-light"
      />
      {/* hairline glass edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-sm ring-1 ring-cream/12 ring-inset"
      />
    </div>
  );
}
