"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import CornerFrame from "@/components/CornerFrame";
import HeatShaderBackground from "@/components/HeatShaderBackground";
import DitherCycler from "@/components/variants/dither/DitherCycler";
import WaitlistForm from "@/components/WaitlistForm";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { useDictionary } from "@/lib/i18n/context";

/**
 * V4 "Dither" hero — the Heat composition with the silhouette rendered
 * through the Originkit Dither Reveal shader: she reads as an ordered-
 * dither halftone at rest and resolves back into full-colour photography
 * under the cursor. Same scroll parallax as Heat (spec §3.3): titles
 * part left/right and a night veil dims the heat on scroll-out.
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

      // The waitlist bar is fixed to the viewport bottom so it stays put
      // while you scroll the page. Retire it once the footer's own join
      // form rises into view, so the two never overlap. Runs regardless of
      // motion preference (native scroll drives ScrollTrigger under reduce).
      const footer = document.querySelector<HTMLElement>("#join");
      if (footer)
        ScrollTrigger.create({
          trigger: footer,
          start: "top bottom",
          onEnter: () =>
            gsap.to("[data-hero-form]", {
              autoAlpha: 0,
              y: 24,
              duration: 0.4,
              ease: "power2.out",
              overwrite: "auto",
            }),
          onLeaveBack: () =>
            gsap.to("[data-hero-form]", {
              autoAlpha: 1,
              y: 0,
              duration: 0.4,
              ease: "power2.out",
              overwrite: "auto",
            }),
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

      {/* Corner-blob composition. The static CSS base is only a FIRST-
          PAINT stand-in until the WebGL shader boots and fades over it —
          so its colours mirror the shader's palette (violet-dominant,
          warm at the very corner) instead of the old warm blobs, or the
          hand-off flashes the wrong gradient for a beat. */}
      <div
        aria-hidden="true"
        data-hero-gradient
        className="absolute inset-0 origin-bottom opacity-50"
        style={{
          background:
            "radial-gradient(52% 48% at 108% -6%, #FFF1DC 0%, #FF9A4E 16%, #FF5A12 32%, #C489E8 60%, transparent 100%), radial-gradient(56% 52% at -8% 106%, #FFF1DC 0%, #FF9A4E 16%, #FF5A12 32%, #C489E8 60%, transparent 100%), transparent",
        }}
      >
        <HeatShaderBackground
          // Pin the field/dark tones to the page backdrop (#07050b), which
          // sits a couple stops below --color-night — otherwise the hero
          // reads lighter than the rest of the page.
          colorBack="#07050b"
          colorDark="#07050b"
          intensity={0.14}
          grain={0.95}
          grainNoise={0.9}
          grainBlur={6}
          grainBlend="soft-light"
        />
      </div>
      {/* Bottom fade — dissolves the heat field into the page backdrop
          (#07050b) at the section's bottom edge so the hero melts into the
          next section instead of ending on a hard seam. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[30vh]"
        style={{
          background: "linear-gradient(to bottom, rgba(7,5,11,0) 0%, #07050b 100%)",
        }}
      />
      {/* Night veil — darkens the heat as you scroll away */}
      <div aria-hidden="true" data-hero-veil className="absolute inset-0 bg-night opacity-0" />

      {/* Silhouette in the haze — a set of rim-lit dancer photographs
          cross-dissolving at random through the Dither Reveal shader:
          each reads as an ordered-dither halftone at rest and resolves
          to full colour under the cursor. On desktop the frame runs BIG —
          up to 86svh tall, bottom-anchored (the `min(…,104vw)` guard keeps
          her from overflowing width). On MOBILE the maquette's big
          bottom-anchored figure would bury her lower body behind the stacked
          hook + form, so she reflows to the UPPER band (top-anchored, 54svh)
          with a clear floor gap above the copy. BRAND RULE: never crop the
          feet, always
          keep floor beneath the heels. So the ratio hugs the 0.806 source
          (4:5 ≈ 0.8, a hair narrower) → `cover` barely trims the sides and
          keeps the FULL height (head→feet), and the frame is lifted off the
          viewport bottom to leave a band of floor under her. Paired with
          `focusY=100` in DitherCycler, which pins the image's bottom edge
          (the feet) so no frame ever clips them. z-[5]: she stands IN FRONT
          of the display letterforms; pinned to the frame (no scroll
          parallax). Per-frame blend (lighten for black-backed, multiply for
          white-backed) melts each backdrop into the dark page — see
          DitherCycler. */}
      {/* Black backdrop behind HER — a soft, blurred radial ellipse that
          seats the rim-lit figure against black so she reads, while the
          feathered edges melt back into the heat gradient (no hard box).
          Sits at z-[4]: under the silhouette (z-[5]), over the gradient. */}
      <div
        aria-hidden="true"
        data-hero-silhouette-backdrop
        className="pointer-events-none absolute top-[-2svh] left-1/2 z-[4] h-[64svh] w-[min(62svh,92vw)] -translate-x-1/2 lg:top-auto lg:bottom-0 lg:h-[94svh] lg:w-[min(80svh,94vw)]"
        style={{
          background:
            "radial-gradient(52% 56% at 50% 44%, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.82) 42%, rgba(0,0,0,0) 76%)",
          filter: "blur(30px)",
        }}
      />
      <div
        data-hero-silhouette
        className="absolute top-[4svh] left-1/2 z-[5] h-[54svh] -translate-x-1/2 opacity-95 lg:top-auto lg:bottom-[clamp(1.25rem,3.5vh,2.75rem)] lg:h-[min(86svh,104vw)]"
        style={{ aspectRatio: "4 / 5" }}
      >
        <DitherCycler />
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
          className="mx-auto mt-10 flex w-full max-w-[560px] justify-center sm:mt-12 lg:fixed lg:bottom-[56px] lg:left-1/2 lg:z-40 lg:mt-0 lg:w-[520px] lg:max-w-none lg:-translate-x-1/2"
        >
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
