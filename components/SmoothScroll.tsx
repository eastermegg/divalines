"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Lenis smooth scroll, synced with ScrollTrigger (spec §3.1). Renders
 * nothing. Under prefers-reduced-motion Lenis is never instantiated and
 * native scrolling (plus scrollIntoView for anchors) takes over.
 */
export default function SmoothScroll({ lerp = 0.1 }: { lerp?: number }) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Lenis has no built-in anchor handling.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest?.('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -72 });
    };
    document.addEventListener("click", onClick);

    // Font swaps shift SplitText geometry and clamp() display sizes.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [lerp]);

  return null;
}
