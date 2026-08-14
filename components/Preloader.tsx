"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import AccentText from "@/components/AccentText";
import { Wordmark } from "@/components/Brand";
import ChromaticWaves from "@/components/originkit/chromatic-waves-custom-style";
import { gsap } from "@/lib/gsap";
import {
  introAlreadyPlayed,
  markIntroPlayed,
  prefersReducedMotion,
} from "@/lib/motion";

/**
 * Once-per-session entry sequence (validated on /waves), ~4s total:
 *   1. the chromatic-waves halftone field surfaces out of the night
 *   2. the "Diva lines" wordmark rises through its mask, the tagline
 *      settles beneath, both seated on a radial black oval
 *   3. the big count runs long to 100 — a held beat of pure field
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
    gsap.set("[data-pl-logo]", { yPercent: 110 });
    gsap.set("[data-pl-tag] > span", { autoAlpha: 0, y: 10 });

    const tl = gsap.timeline({ onComplete: finish });

    tl
      // 1 — the halftone field surfaces out of the night
      .to("[data-pl-field]", { autoAlpha: 1, duration: 1.4, ease: "power2.out" }, 0)
      // 2 — the wordmark rises through its mask
      .to("[data-pl-logo]", { yPercent: 0, duration: 1.0, ease: "power3.out" }, 0.5)
      // 3 — the tagline settles beneath, counter runs long
      .to(
        "[data-pl-tag] > span",
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.14, ease: "power2.out" },
        1.1,
      )
      .to(
        counter,
        {
          v: 100,
          duration: 2.3,
          ease: "power1.inOut",
          onUpdate() {
            if (counterEl) counterEl.textContent = String(Math.round(counter.v));
          },
        },
        0.3,
      )
      .to("[data-pl-counter]", { color: "#FF5EC4", duration: 0.25 }, 2.6)
      // …a held beat of pure field…
      // 4 — exit: the veil dissolves upward
      .to("[data-pl-logo]", { yPercent: -110, duration: 0.5, ease: "power3.in" }, 3.0)
      .to("[data-pl-tag], [data-pl-oval]", { autoAlpha: 0, duration: 0.35 }, 3.0)
      .to(
        "[data-pl-count]",
        { yPercent: 30, autoAlpha: 0, duration: 0.45, ease: "power3.in" },
        3.0,
      )
      .to("[data-pl-field]", { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 3.05)
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
      {/* chromatic-waves halftone field — the saved Originkit `custom-style`
          preset. It self-pauses once the preloader is display:none. */}
      <div data-pl-field className="absolute inset-0 opacity-0">
        <ChromaticWaves />
      </div>

      {/* top-left lockup: wordmark rising through its mask, tagline beneath,
          left-aligned and seated on a radial black glow. Sits diagonally
          opposite the count. */}
      <div className="absolute top-8 left-8 flex flex-col items-start pr-6 sm:top-10 sm:left-10">
        <div
          data-pl-oval
          className="absolute -inset-x-40 -inset-y-28 bg-[radial-gradient(ellipse_62%_62%_at_28%_42%,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.55)_48%,transparent_76%)]"
        />
        <div className="relative overflow-hidden py-[6px]">
          <div data-pl-logo className="select-none">
            <Wordmark title="Diva Lines" className="h-[46px] w-[220px] text-white" />
          </div>
        </div>
        <p
          data-pl-tag
          className="relative mt-5 max-w-[min(34rem,86vw)] text-left font-display text-[clamp(1.5rem,3.4vw,2.25rem)] leading-[1.08] tracking-[0.02em] text-white italic"
        >
          <span className="block">
            <AccentText text="Heels *dancewear* brand" />
          </span>
          <span className="block">
            <AccentText text="made for dancers by dancers, for *movement*" />
          </span>
        </p>
      </div>

      {/* big 0 → 100 count, pinned to the opposite (bottom-right) corner */}
      <div data-pl-count className="absolute right-8 bottom-6 overflow-hidden">
        <span
          data-pl-counter
          className="block font-serif text-[clamp(4.5rem,12vw,9rem)] leading-none text-white/90 italic tabular-nums"
        >
          0
        </span>
      </div>
    </div>
  );
}
