"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { Wordmark } from "@/components/Brand";
import ChromaticWaves from "@/components/originkit/chromatic-waves-custom-style";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import AccentText from "@/components/AccentText";
import { useDictionary } from "@/lib/i18n/context";

/**
 * Experimental entry sequence for the "/waves" proposal, ~4s total:
 *   1. the chromatic-waves halftone field surfaces out of the dark
 *   2. the "Diva lines" wordmark rises through its mask
 *   3. the tagline — "made for movement" — settles beneath
 *   4. a large 0→100 count runs in the corner, then the veil clips
 *      upward, revealing the same lockup over the live field
 *
 * Unlike the shared Preloader (which gates on a pre-paint "pending" flag),
 * this one always plays on mount so the proposal can be reviewed on every
 * visit. Reduced-motion visitors skip straight to the revealed state.
 *
 * A `replayKey` remount from the page re-runs the whole thing.
 */
export default function WavesPreloader() {
  const { dict } = useDictionary();
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const finish = () => {
      document.documentElement.dataset.wavesIntro = "done";
    };

    // Revealed lockup starts hidden beneath the veil; the timeline blooms
    // it in as the veil lifts. Reduced motion → straight to final state.
    if (prefersReducedMotion()) {
      gsap.set("[data-waves-lockup], [data-waves-field]", { autoAlpha: 1 });
      gsap.set(ref.current, { autoAlpha: 0, pointerEvents: "none" });
      finish();
      return;
    }

    const counterEl = ref.current?.querySelector("[data-pl-counter]");
    const counter = { v: 0 };

    gsap.set("[data-waves-lockup]", { autoAlpha: 0 });
    gsap.set("[data-waves-field]", { autoAlpha: 0 });
    gsap.set("[data-pl-logo]", { yPercent: 110 });
    gsap.set("[data-pl-tag] > span", { autoAlpha: 0, y: 10 });

    const tl = gsap.timeline({ onComplete: finish });

    tl
      // 1 — the halftone field surfaces out of the dark
      .to("[data-pl-field]", { autoAlpha: 1, duration: 1.4, ease: "power2.out" }, 0)
      // 2 — the wordmark rises through its mask
      .to("[data-pl-logo]", { yPercent: 0, duration: 1.0, ease: "power3.out" }, 0.5)
      // 3 — the tagline settles beneath
      .to(
        "[data-pl-tag] > span",
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.14, ease: "power2.out" },
        1.1,
      )
      // 4 — the big count runs 0 → 100
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
      // exit: copy lifts, count slides out, field dims, veil clips upward
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
      // — the live field + persistent lockup bloom in underneath
      .to("[data-waves-field]", { autoAlpha: 1, duration: 1.0, ease: "power2.out" }, 3.0)
      .fromTo(
        "[data-waves-lockup]",
        { autoAlpha: 0, y: 24, filter: "blur(10px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power2.out",
          clearProps: "filter",
        },
        3.4,
      );
  });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-night"
    >
      {/* chromatic-waves halftone field, using the saved Originkit
          `custom-style` preset (the shared instance's settings) */}
      <div data-pl-field className="absolute inset-0 opacity-0">
        <ChromaticWaves />
      </div>

      {/* top-left lockup: wordmark rising through its mask, tagline beneath,
          left-aligned, seated on a radial black glow — diagonally opposite
          the count */}
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
            <AccentText text={dict.tagline.line1} />
          </span>
          <span className="block">
            <AccentText text={dict.tagline.line2} />
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
