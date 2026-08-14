"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import AccentText from "@/components/AccentText";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useDictionary } from "@/lib/i18n/context";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * "The first line" — the collection section as a scroll-scrubbed stack
 * of the real close-up plates. The line is FINITE (four-ish pieces), so
 * this is deliberately NOT an infinite tunnel: scroll progress maps
 * straight onto a bounded track position (0 → N-1). Scrubbing forward
 * walks piece 1 → N, scrubbing back walks N → 1, and it simply stops at
 * either end — no wrap, no idle drift, no repeats. Each plate arrives
 * from depth, holds centred and fully lit as it passes the focus point,
 * then recedes toward the camera and dissolves.
 *
 * The caption under the counter is driven by the same track position, so
 * the name always matches the plate the eye lands on.
 *
 * Feed plates via PLATE_SRCS + dict.line.plates (zipped by index); the
 * counter and the whole track derive from LINE.length, so adding a
 * fourth/fifth piece is just one image + one dict entry per locale.
 */
type LinePlate = {
  src: string;
  name: string;
  alt?: string;
};

/** Image paths are config; names + alt text come from the active locale
 * (dict.line.plates), zipped in by index inside the component. */
const PLATE_SRCS = [
  "/images/line/combi.jpg",
  "/images/line/cachecoeur.jpg",
  "/images/line/top.jpg",
];

/** How much extra scroll the section holds while pinned (× viewport).
 *  This is the whole travel across all plates — bounded, no loop. */
const PIN_LENGTH = "+=220%";
/** Depth (px of translateZ) a plate sits from centre per track unit —
 *  upcoming plates wait back in the haze, passed ones drift toward you. */
const DEPTH = 340;

export default function LineGallery({
  interactive = false,
}: {
  /** Standalone route passes true — only toggles the controls hint now;
   *  both paths scrub from scroll, so the behaviour is identical. */
  interactive?: boolean;
}) {
  const { dict } = useDictionary();
  const LINE: LinePlate[] = PLATE_SRCS.map((src, i) => ({
    src,
    ...dict.line.plates[i],
  }));
  const N = LINE.length;

  // Gate the animated stack on mount so SSR / reduced-motion render the
  // static, accessible contact sheet (native scroll, no pin).
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(true);
  // Which piece is centred — set by the scrub, not a timer.
  const [caption, setCaption] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastActive = useRef(0);

  useEffect(() => {
    setMounted(true);
    setReduced(prefersReducedMotion());
  }, []);

  // Scroll-lock: pin the section and let scroll scrub the bounded track.
  // progress 0→1 maps to track position 0→N-1; each plate's pose is a
  // pure function of its signed distance from that position, so reversing
  // scroll just plays the poses backward. No velocity, no wrap.
  useGSAP(
    () => {
      if (reduced || N === 0) return;

      const pose = (progress: number) => {
        const t = progress * (N - 1); // bounded track position
        for (let i = 0; i < N; i++) {
          const el = plateRefs.current[i];
          if (!el) continue;
          const e = i - t; // >0 upcoming (far), <0 already passed (near)
          const a = Math.min(1, Math.abs(e));
          gsap.set(el, {
            transformPerspective: 1000,
            z: -e * DEPTH,
            scale: 1 - 0.12 * e, // passed plates a touch larger, upcoming smaller
            autoAlpha: 1 - a, // fully faded by ±1 → only neighbours cross-fade
            filter: `blur(${(a * 5).toFixed(2)}px)`,
            zIndex: Math.round(200 - Math.abs(e) * 20),
          });
        }
        const active = Math.max(0, Math.min(N - 1, Math.round(t)));
        if (active !== lastActive.current) {
          lastActive.current = active;
          setCaption(active);
        }
      };

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: PIN_LENGTH,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => pose(self.progress),
        onRefresh: (self) => pose(self.progress),
      });
      pose(0);

      return () => st.kill();
    },
    { scope: sectionRef, dependencies: [reduced, mounted, N] },
  );

  const total = String(N).padStart(2, "0");
  const active = LINE[caption] ?? LINE[0];

  return (
    <section
      ref={sectionRef}
      id="collection"
      aria-label={dict.line.sectionAria}
      className="relative h-[100svh] w-full overflow-hidden bg-night"
    >
      {/* warm floor-glow so the plates feel lit from within the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-15%] left-1/2 h-[55%] w-[120%] -translate-x-1/2 rounded-[100%] bg-heat-orange/12 blur-[120px]"
      />

      {/* the scrubbed plate stack (or a static contact sheet at rest) */}
      {mounted && !reduced ? (
        <div className="absolute inset-0 [perspective:1200px]">
          {LINE.map((item, i) => (
            <div
              key={item.src}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                ref={(el) => {
                  plateRefs.current[i] = el;
                }}
                className="relative aspect-[4/5] h-[68%] max-h-[600px] will-change-transform"
                style={{
                  opacity: i === 0 ? 1 : 0,
                  visibility: i === 0 ? "visible" : "hidden",
                  zIndex: i === 0 ? 200 : 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt ?? item.name}
                  className="h-full w-full rounded-sm object-cover shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">
          {LINE.map((item) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.src}
              src={item.src}
              alt={item.alt ?? item.name}
              className="h-full w-full rounded-sm object-cover"
            />
          ))}
        </div>
      )}

      {/* editorial overlay — sits above the stack, never eats pointers */}
      <div className="pointer-events-none absolute inset-0 p-6 sm:p-10">
        <header className="max-w-xl">
          <p className="text-[11px] tracking-[0.3em] text-cream/55 uppercase">
            {dict.collection.label}
          </p>
          <h2 className="mt-4 font-display text-[clamp(2rem,5.5vw,4.5rem)] leading-[1.05] text-cream italic">
            <AccentText text={dict.collection.title} />
          </h2>
          <p className="mt-3 max-w-sm text-sm text-cream/60">{dict.collection.sub}</p>
        </header>

        {/* piece caption — floats in the right gutter, level with the plate,
            on wide screens; tucks bottom-left on narrow screens where the
            plate fills the frame and there's no gutter. */}
        <div
          aria-live="polite"
          className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 lg:top-1/2 lg:right-16 lg:bottom-auto lg:left-auto lg:-translate-y-1/2 lg:text-right"
        >
          <p className="text-[11px] tracking-[0.3em] text-cream/50 uppercase tabular-nums">
            look {String(caption + 1).padStart(2, "0")} / {total}
          </p>
          <p className="mt-1 font-display text-[clamp(1.5rem,4vw,2.75rem)] leading-none text-cream italic">
            {active.name}
          </p>
        </div>

        {interactive && (
          <p className="absolute right-6 bottom-6 text-right text-[10px] tracking-[0.3em] text-cream/35 uppercase sm:right-10 sm:bottom-10">
            {dict.line.controls}
          </p>
        )}
      </div>
    </section>
  );
}
