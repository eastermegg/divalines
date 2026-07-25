/** Shared motion constants + helpers. */

/** gsap.matchMedia() query — animations only build inside this branch;
 *  the static markup (fully lit, final positions) IS the reduced state. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCE = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(MOTION_REDUCE).matches
  );
}

export const INTRO_FLAG = "dl:intro";

export function introAlreadyPlayed(): boolean {
  try {
    return sessionStorage.getItem(INTRO_FLAG) !== null;
  } catch {
    return true; // storage blocked → never gate content on the intro
  }
}

export function markIntroPlayed(): void {
  try {
    sessionStorage.setItem(INTRO_FLAG, "1");
  } catch {
    /* ignore */
  }
}
