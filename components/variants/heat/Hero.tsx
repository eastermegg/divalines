"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef } from "react";
import CornerFrame from "@/components/CornerFrame";
import HeatShaderBackground from "@/components/HeatShaderBackground";
import WaitlistForm from "@/components/WaitlistForm";
import { gsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { useDictionary } from "@/lib/i18n/context";

/**
 * V1 "Heat" hero — spec-faithful. Scroll parallax (spec §3.3): the
 * silhouette lags at 0.85× scroll speed, the titles part left/right, and
 * a night veil dims the heat as the section leaves the viewport.
 */
export default function Hero() {
  const { dict } = useDictionary();
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
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
          .to("[data-title-diva]", { x: "-6vw" }, 0)
          .to("[data-title-lines]", { x: "6vw" }, 0)
          .to("[data-hero-veil]", { opacity: 0.6 }, 0);
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

      {/* Heat — corner-blob composition (night field, glow clusters in
          opposite corners, calm center for the copy). Static CSS base
          matches for first paint; the grainy shader animates over it.
          Both live in the wrapper the intro scaleY's. */}
      <div
        aria-hidden="true"
        data-hero-gradient
        className="absolute inset-0 origin-bottom"
        style={{
          background:
            "radial-gradient(52% 48% at 108% -6%, #FFF1DC 0%, #FF8A3A 22%, #FF5A12 42%, #C489E8 68%, transparent 100%), radial-gradient(56% 52% at -8% 106%, #FFF1DC 0%, #FF8A3A 22%, #FF5A12 42%, #C489E8 68%, transparent 100%), #0E0A16",
        }}
      >
        <HeatShaderBackground />
      </div>
      {/* Night veil — darkens the heat as you scroll away */}
      <div aria-hidden="true" data-hero-veil className="absolute inset-0 bg-night opacity-0" />

      {/* Silhouette in the haze — real cutout (matted from the brand
          shoot, transparent PNG) over a soft violet backlight that keeps
          her legible against the corner-blob layout's dark center.
          z-[5]: she stands IN FRONT of the display letterforms; pinned
          to the frame (no scroll parallax). */}
      <div
        aria-hidden="true"
        data-hero-silhouette
        className="pointer-events-none absolute bottom-0 left-1/2 z-[5] h-[92svh] -translate-x-1/2 opacity-95"
      >
        <div
          className="absolute top-1/2 left-1/2 size-[130%] -translate-1/2 rounded-full opacity-35 blur-[70px]"
          style={{
            background:
              "radial-gradient(circle, #C489E8 0%, #7A3FB0 45%, transparent 70%)",
          }}
        />
        <Image
          src="/images/dancer.png"
          alt=""
          width={1300}
          height={1600}
          priority
          className="relative h-full w-auto"
        />
      </div>

      <CornerFrame />

      {/* Display titles — the brand's actual letterform vectors (star-D
          outline + script "lines"), on the exact maquette grid
          (1512×900 ref): DIVA at (-2.9%, 16.2%), lines at (56.5%,
          51.2%), both bleeding off-frame. Same data hooks: the intro
          slides them in (xPercent), the scroll scrub parts them (x). */}
      <span
        aria-hidden="true"
        data-title-diva
        className="pointer-events-none absolute top-[16.2svh] left-[-2.9vw] block w-[min(85vw,780px)] opacity-25 select-none lg:w-[51.4vw]"
      >
        <img src="/logos/diva-display.svg" alt="" className="h-auto w-full" />
      </span>
      <span
        aria-hidden="true"
        data-title-lines
        className="pointer-events-none absolute top-[51.2svh] left-[56.5vw] block w-[min(75vw,659px)] opacity-25 select-none lg:w-[43.5vw]"
      >
        <img src="/logos/lines-display.svg" alt="" className="h-auto w-full" />
      </span>

      {/* Hook — column at 25.6% left, 56.9% top; form — centered, 56px
          from the bottom, 398px wide (maquette values). Below lg the
          hero falls back to the stacked flow layout. */}
      <div className="container-editorial relative z-10 lg:static">
        <div
          data-hero-hook
          className="max-w-[560px] lg:absolute lg:top-[56.9svh] lg:left-[25.6%] lg:max-w-none"
        >
          {dict.hero.hook.map((line) => (
            <span
              key={line}
              data-hook-line
              className="block overflow-hidden text-lg leading-snug font-medium text-cream sm:text-[27.3px] sm:leading-[1.1] sm:tracking-[-1.09px]"
            >
              <span className="block">{line}</span>
            </span>
          ))}
          <p
            data-hook-para
            className="mt-4 max-w-[44ch] text-[13px] leading-[1.35] text-cream/85 lg:w-[257px]"
          >
            {dict.hero.paragraph}
          </p>
        </div>

        <div
          data-hero-form
          className="mx-auto mt-10 flex w-full max-w-[560px] justify-center sm:mt-12 lg:absolute lg:bottom-[56px] lg:left-1/2 lg:mt-0 lg:w-[398px] lg:max-w-none lg:-translate-x-1/2"
        >
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
