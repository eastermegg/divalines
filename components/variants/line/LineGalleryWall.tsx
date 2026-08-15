"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import AccentText from "@/components/AccentText";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useDictionary } from "@/lib/i18n/context";
import { prefersReducedMotion } from "@/lib/motion";
import { RELEASE_DATE_FALLBACK } from "@/lib/site";
import VeiledPlate, { VEIL_MIN_BLUR, useVeilBlur } from "@/components/variants/line/veil";

/**
 * "The first line" as an INFINITE WALL — inspired by the Codrops infinite
 * GSAP scroll gallery, adapted to a one-page site:
 *
 *  · a vertical track of scattered, veiled plates that loops seamlessly
 *    (gsap.utils.wrap folds each plate's position back in at the edges),
 *  · a slow autoplay drift so the wall is always alive,
 *  · per-plate parallax driven by page scroll (each plate shifts at its
 *    own rate as the section passes), the multi-speed feel of the demo.
 *
 * Passive by design — no drag, no wheel capture, no click-to-open — so
 * page scroll is never trapped and Lenis stays in charge. The line is
 * finite (3–5 pieces), so plates repeat as the wall loops (a "wallpaper
 * of veiled pieces"); the pieces stay teased until launch (see veil.tsx).
 */

// Per-index scatter, size and parallax — cycled by index so the loop never
// looks like a repeating strip even though the pieces themselves repeat.
const STAGGER = [-0.16, 0.13, -0.05, 0.19, -0.11, 0.07, -0.2, 0.15, -0.03, 0.17, -0.09, 0.1]; // × viewport width
const HFRAC = [0.86, 0.72, 0.9, 0.76, 0.82, 0.7, 0.88, 0.74, 0.84, 0.78, 0.8, 0.73]; // × slot height
const FACTOR = [0.3, -0.22, 0.16, -0.3, 0.24, -0.18, 0.28, -0.26, 0.2, -0.14, 0.3, -0.2]; // parallax

const TARGET_ITEMS = 9; // repeat the pieces up to at least this many plates
const AUTOPLAY_PPS = 20; // px/s the wall drifts upward on its own
const PARALLAX_AMP = 90; // px of per-plate parallax across the section
// The wall's plates are small and drifting, so the shared veil reads
// heavier here — dial it down (still veiled, never crisp).
const WALL_VEIL_SCALE = 0.55;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export default function LineGalleryWall({
  releaseDate = RELEASE_DATE_FALLBACK,
}: {
  releaseDate?: string;
}) {
  const { dict } = useDictionary();

  // Repeat the finite line into enough plates to fill the loop.
  const plates = dict.line.plates;
  const base = useMemo(
    () => PLATE_SRCS.map((src, i) => ({ src, ...plates[i] })),
    [plates],
  );
  const items = useMemo(() => {
    if (base.length === 0) return [];
    const reps = Math.max(2, Math.ceil(TARGET_ITEMS / base.length));
    return Array.from({ length: base.length * reps }, (_, i) => base[i % base.length]);
  }, [base]);
  const N = items.length;

  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    setMounted(true);
    setReduced(prefersReducedMotion());
  }, []);

  const veilBlur = useVeilBlur(releaseDate) * WALL_VEIL_SCALE;
  const effectiveBlur = hovered
    ? Math.max(VEIL_MIN_BLUR * 0.5, veilBlur * 0.55)
    : veilBlur;

  const sectionRef = useRef<HTMLElement>(null);
  const outerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (reduced || N === 0) return;
      const outers = outerRefs.current;
      const inners = innerRefs.current;
      const boxes = boxRefs.current;

      // Mutable loop geometry — recomputed on resize.
      let SLOT = 0;
      let total = 0;
      let wrapY = (v: number) => v;
      const factors = new Array<number>(N);

      const layout = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const mobile = vw < 640;
        SLOT = vh * (mobile ? 0.5 : 0.46);
        total = N * SLOT;
        wrapY = gsap.utils.wrap(0, total);
        for (let i = 0; i < N; i++) {
          const outer = outers[i];
          const inner = inners[i];
          const box = boxes[i];
          if (!outer || !inner || !box) continue;
          const k = i % STAGGER.length;
          factors[i] = FACTOR[k];
          // Size the plate to sit inside its slot; keep the 4:5 ratio.
          let heightPx = HFRAC[k] * SLOT;
          let widthPx = heightPx * 0.8;
          const maxW = vw * (mobile ? 0.82 : 0.9);
          if (widthPx > maxW) {
            widthPx = maxW;
            heightPx = widthPx / 0.8;
          }
          box.style.width = `${widthPx}px`;
          box.style.height = `${heightPx}px`;
          outer.style.height = `${SLOT}px`;
          // Horizontal scatter, clamped so no plate ever leaves the frame.
          const maxStag = Math.max(0, vw / 2 - widthPx / 2 - 12);
          const staggerPx = clamp(STAGGER[k] * vw, -maxStag, maxStag);
          gsap.set(inner, { x: staggerPx });
        }
      };
      layout();

      const setOuterY = outers.map((el) => (el ? gsap.quickSetter(el, "y", "px") : null));
      const setInnerY = inners.map((el) => (el ? gsap.quickSetter(el, "y", "px") : null));

      // scroll advances the loop; par.p tracks page-scroll for parallax.
      const scroll = { v: 0 };
      const par = { p: 0.5 };

      const render = () => {
        for (let i = 0; i < N; i++) {
          setOuterY[i]?.(wrapY(i * SLOT - scroll.v) - SLOT);
          setInnerY[i]?.((par.p - 0.5) * factors[i] * PARALLAX_AMP);
        }
      };

      // Autoplay drift + per-frame render — frozen while the wall is
      // scrolled out of view so it never burns CPU off-screen.
      let visible = true;
      const tick = (_t: number, dt: number) => {
        if (!visible) return;
        scroll.v += AUTOPLAY_PPS * (dt / 1000);
        render();
      };
      gsap.ticker.add(tick);

      // Parallax from page scroll (all devices — never captures scroll).
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          visible = self.isActive;
        },
        onUpdate: (self) => {
          par.p = self.progress;
        },
        onRefresh: () => layout(),
      });
      visible = st.isActive;
      render(); // paint the resting frame immediately

      const onResize = () => layout();
      window.addEventListener("resize", onResize);

      return () => {
        gsap.ticker.remove(tick);
        st.kill();
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: sectionRef, dependencies: [reduced, mounted, N] },
  );

  return (
    <section
      ref={sectionRef}
      id="collection"
      aria-label={dict.line.sectionAria}
      className="relative h-[100svh] w-full overflow-hidden bg-night"
      style={{ "--veil-blur": `${effectiveBlur}px` } as CSSProperties}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* warm floor-glow so the wall feels lit from within the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-15%] left-1/2 h-[55%] w-[120%] -translate-x-1/2 rounded-[100%] bg-heat-orange/12 blur-[120px]"
      />

      {/* the infinite wall — each plate loops seamlessly and parallaxes.
          Before mount / under reduced-motion we render a static veiled
          contact sheet instead (accessible, no JS motion). */}
      {mounted && !reduced ? (
        <div className="absolute inset-0">
          {items.map((item, i) => (
            <div
              key={i}
              ref={(el) => {
                outerRefs.current[i] = el;
              }}
              className="absolute top-0 left-0 flex w-full items-center justify-center will-change-transform"
              style={{ height: "48vh" }}
            >
              <div
                ref={(el) => {
                  innerRefs.current[i] = el;
                }}
                className="will-change-transform"
              >
                <div
                  ref={(el) => {
                    boxRefs.current[i] = el;
                  }}
                  className="relative aspect-[4/5] h-[40vh]"
                >
                  <VeiledPlate src={item.src} alt={item.alt ?? item.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">
          {base.map((item) => (
            <div key={item.src} className="relative aspect-[4/5]">
              <VeiledPlate src={item.src} alt={item.alt ?? item.name} />
            </div>
          ))}
        </div>
      )}

      {/* editorial overlay — above the wall, never eats the drag */}
      <div className="pointer-events-none absolute inset-0">
        {/* header rides the same editorial grid as the manifesto
            (container-editorial + centred 68rem), so their left edges line
            up as the section scrolls in beneath it. */}
        <div className="container-editorial pt-6 sm:pt-10">
          <header className="mx-auto max-w-[68rem]">
            <p className="text-[11px] tracking-[0.3em] text-cream/55 uppercase">
              {dict.collection.label}
            </p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5.5vw,4.5rem)] leading-[1.05] text-cream italic">
              <AccentText text={dict.collection.title} />
            </h2>
            <p className="mt-3 max-w-sm text-sm text-cream/60">{dict.collection.sub}</p>
          </header>
        </div>
      </div>
    </section>
  );
}

/** Image paths are config; names + alt come from the active locale
 *  (dict.line.plates), zipped in by index. Mirrors LineGallery. */
const PLATE_SRCS = [
  "/images/line/combi.jpg",
  "/images/line/cachecoeur.jpg",
  "/images/line/top.jpg",
];
