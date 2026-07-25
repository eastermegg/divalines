"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import CornerFrame from "@/components/CornerFrame";
import DancerSilhouette from "@/components/DancerSilhouette";
import WaitlistForm from "@/components/WaitlistForm";
import { gsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { HERO } from "@/lib/site";

/**
 * V3 "Night Pulse" hero — club-night maximal. Three depth planes
 * (gradient → neon rings + pink echo → silhouette) scrub at different
 * speeds; big concentric rings breathe continuously; titles are stacked
 * hard-left uppercase and part violently on scroll. Vestibular-safe: no
 * strobing, all loops are slow sine breathing.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // breathing rings — slow opacity/scale pulse, staggered
        gsap.utils.toArray<SVGElement>("[data-pulse-ring]").forEach((ring, i) => {
          gsap.to(ring, {
            opacity: 0.15 + (i % 3) * 0.1,
            scale: 1.05,
            transformOrigin: "50% 50%",
            duration: 3.6 + i * 0.7,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });

        // three-plane parallax
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ref.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          })
          .to("[data-plane-back]", { y: () => window.innerHeight * 0.05 }, 0)
          .to("[data-plane-mid]", { y: () => window.innerHeight * 0.12 }, 0)
          .to("[data-hero-silhouette]", { y: () => window.innerHeight * 0.2 }, 0)
          .to("[data-title-diva]", { x: "-10vw" }, 0)
          .to("[data-title-lines]", { x: "10vw" }, 0)
          .to("[data-hero-veil]", { opacity: 0.7 }, 0);
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      data-hero
      className="relative flex min-h-svh flex-col justify-end pb-[clamp(2rem,6vh,4.5rem)]"
    >
      <h1 className="sr-only">Diva Lines — independ heels dancewear, designed in Paris</h1>

      {/* Plane 1 — hard heat, more saturated than V1 */}
      <div
        aria-hidden="true"
        data-plane-back
        data-hero-gradient
        className="absolute inset-0 origin-bottom"
        style={{
          background:
            "radial-gradient(110% 80% at 50% 104%, var(--color-heat-glow) 0%, var(--color-heat-orange) 22%, var(--color-heat-magenta) 48%, var(--color-heat-violet) 68%, var(--color-night) 96%)",
          filter: "saturate(1.25)",
        }}
      />

      {/* Plane 2 — giant breathing neon rings + pink echo */}
      <div aria-hidden="true" data-plane-mid className="absolute inset-0">
        <svg
          viewBox="0 0 1440 900"
          className="absolute inset-0 size-full"
          preserveAspectRatio="xMidYMax slice"
          fill="none"
        >
          {[260, 340, 430, 530].map((r, i) => (
            <circle
              key={r}
              data-pulse-ring
              cx="720"
              cy="760"
              r={r}
              stroke="var(--color-neon-pink)"
              strokeWidth="1.5"
              opacity={0.45 - i * 0.1}
            />
          ))}
        </svg>
        <div className="absolute bottom-0 left-[calc(50%+3vw)] h-[70svh] -translate-x-1/2 opacity-25 blur-[10px]">
          <DancerSilhouette className="h-full w-auto" fill="var(--color-neon-pink)" />
        </div>
      </div>

      <div aria-hidden="true" data-hero-veil className="absolute inset-0 bg-night opacity-0" />

      {/* Plane 3 — the dancer */}
      <div
        aria-hidden="true"
        data-hero-silhouette
        className="pointer-events-none absolute bottom-0 left-1/2 h-[78svh] -translate-x-1/2 opacity-95 blur-[3px]"
      >
        <DancerSilhouette className="h-full w-auto" fill="#160d20" />
      </div>

      <CornerFrame />

      {/* Stacked hard-left uppercase display */}
      <div className="pointer-events-none absolute top-[calc(var(--header-h)-1vh)] left-[-1vw] select-none">
        <span
          aria-hidden="true"
          data-title-diva
          className="text-outline block font-sans text-display font-medium tracking-[-0.03em] uppercase"
        >
          Diva
        </span>
        <span
          aria-hidden="true"
          data-title-lines
          className="text-outline mt-[-0.18em] block pl-[0.8em] font-sans text-display font-medium tracking-[-0.03em] uppercase"
        >
          Lines
        </span>
      </div>

      <div className="container-editorial relative z-10">
        <div data-hero-hook className="ml-auto max-w-[560px] text-right sm:text-left">
          {HERO.hook.map((line) => (
            <span
              key={line}
              data-hook-line
              className="block overflow-hidden text-lg leading-snug font-medium tracking-tight text-cream uppercase sm:text-[1.6rem]"
            >
              <span className="block">{line}</span>
            </span>
          ))}
          <p data-hook-para className="mt-4 max-w-[44ch] text-sm leading-relaxed text-cream/70 sm:ml-0">
            {HERO.paragraph}
          </p>
        </div>

        <div data-hero-form className="mx-auto mt-10 flex w-full max-w-[560px] justify-center sm:mt-12">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
