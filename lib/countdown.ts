/** Pure countdown math — unit-testable, no DOM. */

export interface CountdownParts {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  totalMs: number;
  live: boolean; // target reached
}

const pad = (n: number) => String(n).padStart(2, "0");

export const ZERO_PARTS: CountdownParts = {
  days: "00",
  hours: "00",
  minutes: "00",
  seconds: "00",
  totalMs: 0,
  live: false,
};

/**
 * Diff from `nowMs` to the target ISO date. `nowMs === null` (SSR and the
 * first client render) yields the all-zero shell so hydration matches.
 */
export function countdownParts(
  targetIso: string,
  nowMs: number | null,
): CountdownParts {
  if (nowMs === null) return ZERO_PARTS;

  const totalMs = new Date(targetIso).getTime() - nowMs;
  if (Number.isNaN(totalMs) || totalMs <= 0) {
    return { ...ZERO_PARTS, live: !Number.isNaN(totalMs) };
  }

  const totalSec = Math.floor(totalMs / 1000);
  return {
    days: pad(Math.floor(totalSec / 86400)),
    hours: pad(Math.floor((totalSec % 86400) / 3600)),
    minutes: pad(Math.floor((totalSec % 3600) / 60)),
    seconds: pad(totalSec % 60),
    totalMs,
    live: false,
  };
}
