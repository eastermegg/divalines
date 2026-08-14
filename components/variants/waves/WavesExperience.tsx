"use client";

import { Wordmark } from "@/components/Brand";
import ChromaticWaves from "@/components/originkit/chromatic-waves-custom-style";
import WavesPreloader from "@/components/variants/waves/Preloader";
import AccentText from "@/components/AccentText";
import { useDictionary } from "@/lib/i18n/context";

/**
 * Client shell for the "/waves" preloader proposal. The halftone field +
 * top-left lockup live here and are unveiled by <WavesPreloader/>.
 */
export default function WavesExperience() {
  const { dict } = useDictionary();
  return (
    <div className="relative min-h-dvh overflow-hidden bg-night text-cream">
      {/* persistent chromatic-waves field (saved `custom-style` preset),
          revealed as the veil lifts */}
      <div data-waves-field className="fixed inset-0 opacity-0">
        <ChromaticWaves />
      </div>

      {/* the lockup that persists once the intro completes — top-left,
          left-aligned, matching where the preloader leaves it */}
      <main className="relative min-h-dvh">
        <div
          data-waves-lockup
          className="absolute top-8 left-8 flex flex-col items-start pr-6 opacity-0 sm:top-10 sm:left-10"
        >
          {/* radial black glow seating the lockup against the dot field */}
          <div
            aria-hidden="true"
            className="absolute -inset-x-40 -inset-y-28 bg-[radial-gradient(ellipse_62%_62%_at_28%_42%,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.55)_48%,transparent_76%)]"
          />
          <Wordmark title="Diva Lines" className="relative h-[52px] w-[250px] text-white" />
          <p className="relative mt-5 max-w-[min(34rem,86vw)] text-left font-display text-[clamp(1.5rem,3.4vw,2.25rem)] leading-[1.08] tracking-[0.02em] text-white italic">
            <span className="block">
              <AccentText text={dict.tagline.line1} />
            </span>
            <span className="block">
              <AccentText text={dict.tagline.line2} />
            </span>
          </p>
        </div>
      </main>

      <WavesPreloader />
    </div>
  );
}
