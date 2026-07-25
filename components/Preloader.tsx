"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { Monogram } from "@/components/Brand";
import WaveArcs from "@/components/originkit/wave-arcs";
import { gsap } from "@/lib/gsap";
import {
  introAlreadyPlayed,
  markIntroPlayed,
  prefersReducedMotion,
} from "@/lib/motion";
import { SITE } from "@/lib/site";

/**
 * Once-per-session entry sequence, ~4s total:
 *   1. neon wave-arcs surface out of the night and keep sweeping
 *   2. the D✦ monogram rises through its mask, brand line settles
 *   3. the counter runs long to 100 — a held beat of pure arcs
 *   4. the veil clips upward, the hero blooms in
 *
 * Visibility contract: the preloader itself is CSS-hidden unless the
 * pre-paint script marked the session "pending"; page content always
 * paints (early LCP) but sits beneath this opaque overlay until the
 * timeline reveals it. finish() flips the attribute to "done", which
 * hides the preloader again — no-JS visitors never see it at all.
 */
export default function Preloader() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const finish = () => {
      markIntroPlayed();
      document.documentElement.dataset.intro = "done";
    };

    if (
      introAlreadyPlayed() ||
      prefersReducedMotion() ||
      document.documentElement.dataset.intro !== "pending"
    ) {
      finish();
      return;
    }

    const counterEl = ref.current?.querySelector("[data-pl-counter]");
    const counter = { v: 0 };

    // Initial states — applied at hydration, while the opaque preloader
    // still covers the page, so nothing flashes at its final position.
    // Titles keep full opacity (they're covered until the clip-out) so
    // their SSR paint counts as LCP; only their position animates.
    gsap.set("[data-hero-form], [data-site-header], [data-hook-para]", {
      autoAlpha: 0,
    });
    gsap.set("[data-title-diva]", { xPercent: -8 });
    gsap.set("[data-title-lines]", { xPercent: 8 });
    gsap.set("[data-hook-line] > span", { yPercent: 110 });

    const tl = gsap.timeline({ onComplete: finish });

    tl
      // 1 — the neon arcs surface out of the night and keep sweeping
      .to("[data-pl-arcs]", { opacity: 0.45, duration: 1.4, ease: "power2.out" }, 0)
      // 2 — the monogram rises through its mask
      .fromTo(
        "[data-pl-logo]",
        { yPercent: 110 },
        { yPercent: 0, duration: 1.0, ease: "power3.out" },
        0.5,
      )
      // 3 — brand line settles beneath, counter runs long
      .fromTo(
        "[data-pl-brand] > span",
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.16, ease: "power2.out" },
        1.1,
      )
      .to(
        counter,
        {
          v: 100,
          duration: 2.3,
          ease: "power1.inOut",
          onUpdate() {
            if (counterEl)
              counterEl.textContent = String(Math.round(counter.v)).padStart(3, "0");
          },
        },
        0.3,
      )
      .to("[data-pl-counter]", { color: "#FF5EC4", duration: 0.25 }, 2.6)
      // …a held beat of pure arcs…
      // 4 — exit: the veil dissolves upward
      .to("[data-pl-logo]", { yPercent: -110, duration: 0.5, ease: "power3.in" }, 3.0)
      .to("[data-pl-brand], [data-pl-counter]", { autoAlpha: 0, duration: 0.35 }, 3.0)
      .to("[data-pl-arcs]", { opacity: 0, duration: 0.5, ease: "power2.in" }, 3.05)
      .set(ref.current, { pointerEvents: "none" }, 3.15)
      .to(
        ref.current,
        { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "power4.inOut" },
        3.15,
      )
      // — hero blooms in underneath (same choreography, after the veil)
      .fromTo(
        "[data-hero-gradient]",
        { scaleY: 0, filter: "saturate(0.6)", transformOrigin: "50% 100%" },
        { scaleY: 1, filter: "saturate(1)", duration: 1.0, ease: "power2.out" },
        2.95,
      )
      .fromTo(
        "[data-hero-silhouette]",
        { autoAlpha: 0, y: 40, filter: "blur(12px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power2.out",
          // fall back to each variant's own class styles (blur, opacity)
          clearProps: "filter,opacity,visibility",
        },
        3.3,
      )
      .to("[data-title-diva]", { xPercent: 0, duration: 0.9, ease: "power3.out" }, 3.4)
      .to("[data-title-lines]", { xPercent: 0, duration: 0.9, ease: "power3.out" }, 3.52)
      .to(
        "[data-hook-line] > span",
        { yPercent: 0, duration: 0.7, stagger: 0.09, ease: "power3.out" },
        3.7,
      )
      .to("[data-hook-para]", { autoAlpha: 1, duration: 0.5 }, 3.9)
      .fromTo(
        "[data-hero-form], [data-site-header]",
        { y: 16 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
        4.0,
      );
  });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="preloader fixed inset-0 z-[100] items-center justify-center bg-night"
    >
      {/* concentric neon arcs sweeping from below — the brand's wave
          motif (Originkit wave-arcs). It self-pauses once the preloader
          is display:none. Dimmed so the monogram stays dominant. */}
      <div data-pl-arcs className="absolute inset-0 opacity-0">
        <WaveArcs
          backgroundColor="#0E0A16"
          lineColor="#FF5EC4"
          lineWidth={1}
          lineCount={60}
          speed={2.5}
          glow={6}
          interactive={false}
        />
      </div>

      {/* monogram rising through its mask, centered */}
      <div className="absolute top-[calc(50%-58px)] left-1/2 h-[92px] -translate-x-1/2 overflow-hidden px-6 pt-[12px]">
        <div data-pl-logo className="select-none">
          <Monogram title="Diva Lines" className="h-[68px] w-auto text-cream" />
        </div>
      </div>

      {/* brand line beneath the monogram */}
      <p
        data-pl-brand
        className="absolute top-[calc(50%+52px)] left-1/2 -translate-x-1/2 text-center text-[11px] leading-relaxed tracking-[0.3em] whitespace-nowrap text-cream/50 uppercase"
      >
        <span className="block">{SITE.brandLine[0]}</span>
        <span className="block">{SITE.brandLine[1]}</span>
      </p>

      <span
        data-pl-counter
        className="absolute right-10 bottom-8 text-xs text-cream/50 tabular-nums"
      >
        000
      </span>
    </div>
  );
}
