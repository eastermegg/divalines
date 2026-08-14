"use client";

import { useState } from "react";
import { Wordmark } from "@/components/Brand";
import ChromaticWaves from "@/components/originkit/chromatic-waves-custom-style";
import WavesPreloader from "@/components/variants/waves/Preloader";
import AccentText from "@/components/AccentText";

/**
 * Client shell for the "/waves" preloader proposal. The halftone field +
 * centered lockup live here and are unveiled by <WavesPreloader/>; "Replay"
 * remounts the preloader (via key) to re-run the intro without a reload.
 */
export default function WavesExperience() {
  const [replay, setReplay] = useState(0);

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
              <AccentText text="Heels *dancewear* brand" />
            </span>
            <span className="block">
              <AccentText text="made for dancers by dancers, for *movement*" />
            </span>
          </p>
        </div>
      </main>

      <button
        type="button"
        onClick={() => setReplay((n) => n + 1)}
        className="fixed right-6 bottom-6 z-[110] rounded-pill border border-cream/20 bg-night/50 px-4 py-2 text-[11px] tracking-[0.2em] text-cream/70 uppercase backdrop-blur transition-colors hover:border-neon-pink/60 hover:text-cream"
      >
        Replay intro
      </button>

      <WavesPreloader key={replay} />
    </div>
  );
}
