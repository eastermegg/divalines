"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import CornerFrame from "@/components/CornerFrame";
import DancerSilhouette from "@/components/DancerSilhouette";
import WaitlistForm from "@/components/WaitlistForm";
import { gsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { useDictionary } from "@/lib/i18n/context";

/**
 * V2 "Liquid" hero — the heat becomes fluid. Three blurred gradient
 * blobs drift in slow sine loops over a fixed horizon glow, and the
 * silhouette's edge wobbles through an animated feTurbulence
 * displacement. Both display words go serif italic lowercase, floating
 * apart on scroll. Reduced motion: everything static, no filter.
 */
export default function Hero() {
  const { dict } = useDictionary();
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // — lava drift: each blob wanders on its own slow orbit
        gsap.utils.toArray<HTMLElement>("[data-blob]").forEach((blob, i) => {
          gsap.to(blob, {
            xPercent: [14, -12, 9][i % 3],
            yPercent: [-10, 8, -14][i % 3],
            scale: [1.15, 0.9, 1.1][i % 3],
            duration: 9 + i * 2.6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });

        // — liquid edge: breathe the turbulence frequency
        const noise = ref.current?.querySelector("[data-liquid-noise]");
        if (noise) {
          const state = { f: 0.008 };
          gsap.to(state, {
            f: 0.016,
            duration: 6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            onUpdate() {
              noise.setAttribute(
                "baseFrequency",
                `${state.f.toFixed(4)} ${(state.f * 1.6).toFixed(4)}`,
              );
            },
          });
        }

        // — the silhouette itself sways gently
        gsap.to("[data-hero-silhouette]", {
          rotation: 1.6,
          duration: 7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          transformOrigin: "50% 90%",
        });

        // — scroll: everything floats apart like oil on water
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ref.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.8,
            },
          })
          .to("[data-hero-silhouette]", { y: () => window.innerHeight * 0.18 }, 0)
          .to("[data-title-diva]", { x: "-7vw", y: "3vh" }, 0)
          .to("[data-title-lines]", { x: "7vw", y: "-2vh" }, 0)
          .to("[data-blob]", { yPercent: "+=6" }, 0)
          .to("[data-hero-veil]", { opacity: 0.65 }, 0);
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
      <h1 className="sr-only">{dict.hero.sr}</h1>

      {/* SVG defs: liquid displacement for the silhouette edge */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="liquid-distort" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            data-liquid-noise
            type="fractalNoise"
            baseFrequency="0.008 0.013"
            numOctaves="2"
            seed="7"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Fixed horizon glow + drifting heat blobs */}
      <div aria-hidden="true" data-hero-gradient className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 55% at 50% 108%, var(--color-heat-glow) 0%, var(--color-heat-orange) 30%, transparent 70%)",
          }}
        />
        <div
          data-blob
          className="absolute top-[8%] left-[-12%] size-[55vw] rounded-full opacity-70 blur-[90px]"
          style={{ background: "radial-gradient(circle, var(--color-heat-violet) 0%, transparent 65%)" }}
        />
        <div
          data-blob
          className="absolute top-[30%] right-[-10%] size-[48vw] rounded-full opacity-60 blur-[90px]"
          style={{ background: "radial-gradient(circle, var(--color-heat-magenta) 0%, transparent 65%)" }}
        />
        <div
          data-blob
          className="absolute bottom-[-14%] left-[22%] size-[52vw] rounded-full opacity-70 blur-[80px]"
          style={{ background: "radial-gradient(circle, var(--color-heat-orange) 0%, transparent 62%)" }}
        />
      </div>
      <div aria-hidden="true" data-hero-veil className="absolute inset-0 bg-night opacity-0" />

      <div
        aria-hidden="true"
        data-hero-silhouette
        className="pointer-events-none absolute bottom-0 left-1/2 h-[76svh] -translate-x-1/2 opacity-90 blur-[3px]"
      >
        <DancerSilhouette className="h-full w-auto" filterId="liquid-distort" />
      </div>

      <CornerFrame />

      {/* Liquid typography: both words serif italic, lowercase */}
      <span
        aria-hidden="true"
        data-title-diva
        className="text-outline pointer-events-none absolute top-[calc(var(--header-h)+1vh)] left-[-2vw] font-display text-display italic lowercase select-none"
      >
        diva
      </span>
      <span
        aria-hidden="true"
        data-title-lines
        className="text-outline pointer-events-none absolute top-[38svh] right-[-3vw] font-display text-display italic lowercase select-none"
      >
        lines
      </span>

      <div className="container-editorial relative z-10">
        <div data-hero-hook className="max-w-[560px]">
          {dict.hero.hook.map((line) => (
            <span
              key={line}
              data-hook-line
              className="block overflow-hidden text-lg leading-snug font-medium text-cream sm:text-[1.9rem]"
            >
              <span className="block">{line}</span>
            </span>
          ))}
          <p data-hook-para className="mt-4 max-w-[44ch] text-[13px] leading-[1.35] text-cream/70">
            {dict.hero.paragraph}
          </p>
        </div>

        <div data-hero-form className="mx-auto mt-10 flex w-full max-w-[560px] justify-center sm:mt-12">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
