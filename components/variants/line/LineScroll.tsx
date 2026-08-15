"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import AccentText from "@/components/AccentText";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useDictionary } from "@/lib/i18n/context";
import { prefersReducedMotion } from "@/lib/motion";
import { RELEASE_DATE_FALLBACK } from "@/lib/site";
import VeiledPlate, { useVeilBlur } from "@/components/variants/line/veil";

/**
 * "The first line" as a SIDEWAYS SCROLLEE — an editorial filmstrip of the
 * pieces, each its own panel with the name set huge and vertical down the
 * gutter (the layout of the reference, brand-corrected: lowercase italic,
 * never the all-caps of the source). Page scroll is pinned and scrubs the
 * track left; every panel slides past like a spread being turned.
 *
 * The first panel is the section title card; then one panel per piece.
 * Plates stay veiled (see veil.tsx) and sit with floor space beneath, so
 * the heels are never cut. Reduced-motion / pre-mount falls back to a
 * native horizontal scroll-snap strip — same panels, no pin, accessible.
 *
 * Feed panels via PLATE_SRCS + dict.line.plates (zipped by index), same
 * as the other line presentations.
 */
type LinePanel = { src: string; name: string; alt?: string };

/** Image paths are config; names + alt come from the active locale. */
const PLATE_SRCS = [
  "/images/line/combi.jpg",
  "/images/line/cachecoeur.jpg",
  "/images/line/top.jpg",
];

export default function LineScroll({
  releaseDate = RELEASE_DATE_FALLBACK,
}: {
  releaseDate?: string;
}) {
  const { dict } = useDictionary();
  const LINE: LinePanel[] = PLATE_SRCS.map((src, i) => ({
    src,
    ...dict.line.plates[i],
  }));
  const N = LINE.length;
  const total = String(N).padStart(2, "0");

  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    setMounted(true);
    setReduced(prefersReducedMotion());
  }, []);

  const veilBlur = useVeilBlur(releaseDate);

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reduced || N === 0) return;
      const track = trackRef.current;
      if (!track) return;

      // Pin the section and scrub the track left by exactly the overflow —
      // so it ends flush on the last panel. Length recomputes on refresh.
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef, dependencies: [reduced, mounted, N] },
  );

  const animated = mounted && !reduced;

  return (
    <section
      ref={sectionRef}
      id="collection"
      aria-label={dict.line.sectionAria}
      className="relative h-[100svh] w-full overflow-hidden bg-night"
      style={{ "--veil-blur": `${veilBlur}px` } as CSSProperties}
    >
      {/* warm floor-glow, low on the frame — the panels sit lit above it */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-15%] left-1/2 h-[55%] w-[120%] -translate-x-1/2 rounded-[100%] bg-heat-orange/12 blur-[120px]"
      />

      {/* the filmstrip. When animated, GSAP drives `x`; otherwise it's a
          native horizontal scroll-snap strip (no pin, fully accessible). */}
      <div
        className={
          animated
            ? "absolute inset-0 overflow-hidden"
            : "absolute inset-0 snap-x snap-mandatory overflow-x-auto"
        }
      >
        <div
          ref={trackRef}
          className="flex h-full w-max items-stretch will-change-transform"
        >
          {/* title slide — a narrower opening panel so the first veiled
              plate already peeks in at the right edge at rest. The header
              itself is laid on a FULL-VIEWPORT editorial grid (absolute,
              w-screen) so its left edge still matches the manifesto exactly
              (container-editorial + centred 68rem), even though the panel is
              narrower than the viewport. */}
          <div className="relative h-full w-[85vw] shrink-0 sm:w-[74vw] lg:w-[64vw]">
            <div className="absolute inset-y-0 left-0 flex w-screen items-center">
              <div className="container-editorial">
                <div className="mx-auto max-w-[68rem]">
                  <p className="text-[11px] tracking-[0.3em] text-cream/55 uppercase">
                    {dict.collection.label}
                  </p>
                  <h2 className="mt-4 max-w-[7em] font-display text-[clamp(2.25rem,6vw,5rem)] leading-[1.02] text-cream italic">
                    <AccentText text={dict.collection.title} />
                  </h2>
                  <p className="mt-4 max-w-xs text-sm text-cream/60">{dict.collection.sub}</p>
                </div>
              </div>
            </div>
          </div>

          {/* one panel per piece — the veiled plate centred, with the big
              vertical name laid OVER it (bleeding off the left edge) rather
              than in a separate gutter. */}
          {LINE.map((item, i) => (
            <article
              key={item.src}
              className="relative flex h-full w-[86vw] shrink-0 items-end justify-center border-l border-cream/12 pb-[10vh] sm:w-[56vw] lg:w-[42vw]"
            >
              {/* the veiled plate — tall, bottom-aligned to a common floor
                  line with a band of floor kept beneath the hem (brand rule:
                  never cut the heels). It's the positioning context for the
                  name overlay. */}
              <div className="relative aspect-[4/5] h-[62vh] max-h-[620px]">
                <VeiledPlate src={item.src} alt={item.alt ?? item.name} />

                {/* the name, set huge and vertical, laid OVER the plate and
                    bleeding off its left edge — baseline on the hem so the
                    type sits on the same floor line as the plate bottom. */}
                <div className="pointer-events-none absolute bottom-0 left-0 -translate-x-1/2">
                  <p className="mb-3 text-[11px] tracking-[0.3em] text-cream/50 tabular-nums">
                    [{String(i + 1).padStart(2, "0")}/{total}]
                  </p>
                  <h3 className="font-display text-[clamp(2.5rem,8vh,5.5rem)] leading-none text-cream italic [writing-mode:vertical-rl] rotate-180 [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]">
                    {item.name}
                  </h3>
                </div>
              </div>
            </article>
          ))}

          {/* tail spacer so the last panel can rest fully in frame */}
          <div className="h-full w-[10vw] shrink-0 border-l border-cream/12 sm:w-[6vw]" />
        </div>
      </div>
    </section>
  );
}
