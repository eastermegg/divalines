"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import AccentText from "@/components/AccentText";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useDictionary } from "@/lib/i18n/context";
import { prefersReducedMotion } from "@/lib/motion";
import { RELEASE_DATE_FALLBACK } from "@/lib/site";
import VeiledPlate, { VEIL_MIN_BLUR, useVeilBlur } from "@/components/variants/line/veil";

/**
 * "The first line" as a SHAPE WITH FOOTAGE BEHIND IT — a dancer-shaped
 * window cut into the night page. Behind the cut, the veiled plates run
 * as a slow reel: each frame crossfades into the next while a gentle
 * Ken-Burns drift keeps the "footage" alive, so the figure reads like a
 * lit pane onto moving image rather than a still.
 *
 * The window is a real cutout (s02.png — transparent ground, opaque
 * figure with heels planted), used as a CSS mask. So the ONLY thing that
 * ever shows is the moving veil inside the silhouette; the rest is page.
 * That keeps the two brand rules intact at once: the pieces stay teased
 * (the reel is frosted, see veil.tsx), and the feet are never cropped —
 * the heels sit on the floor-line of the mask.
 *
 * Feed frames via PLATE_SRCS + dict.line.plates (zipped by index), same
 * as the other line presentations. Reduced-motion / pre-mount renders the
 * window with a single still frame — no reel, fully accessible.
 */
type LineFrame = { src: string; name: string; alt?: string };

/** Image paths are config; names + alt come from the active locale. */
const PLATE_SRCS = [
  "/images/line/combi.jpg",
  "/images/line/cachecoeur.jpg",
  "/images/line/top.jpg",
];

/** The dancer cutout used as the window. Transparent ground, opaque
 *  figure — so it masks straight on alpha, no luminance tricks. */
const MASK_SRC = "/images/silhouettes/s02.png";

/** Reel timing (seconds): how long each frame holds lit, and the
 *  crossfade between frames. */
const HOLD = 3.2;
const FADE = 1.4;
/** Per-frame Ken-Burns drift (xPercent / yPercent of the frame). Cycled
 *  by index so no two neighbouring frames pan the same way. */
const DRIFT_X = [2.5, -3, 1.8];
const DRIFT_Y = [-2, 1.5, -2.4];

export default function LineSilhouette({
  releaseDate = RELEASE_DATE_FALLBACK,
}: {
  releaseDate?: string;
}) {
  const { dict } = useDictionary();
  const LINE: LineFrame[] = PLATE_SRCS.map((src, i) => ({
    src,
    ...dict.line.plates[i],
  }));
  const N = LINE.length;

  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [caption, setCaption] = useState(0);
  useEffect(() => {
    setMounted(true);
    setReduced(prefersReducedMotion());
  }, []);

  // Countdown veil, eased a touch on hover — "presque, mais pas encore".
  const veilBlur = useVeilBlur(releaseDate);
  const [hovered, setHovered] = useState(false);
  const effectiveBlur = hovered
    ? Math.max(VEIL_MIN_BLUR * 0.6, veilBlur * 0.55)
    : veilBlur;

  const sectionRef = useRef<HTMLElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]); // crossfade layer
  const kenRefs = useRef<(HTMLDivElement | null)[]>([]); // Ken-Burns wrapper

  useGSAP(
    () => {
      if (reduced || N === 0) return;
      const frames = frameRefs.current;
      const kens = kenRefs.current;

      // Rest state: only the first frame lit.
      frames.forEach((el, i) => el && gsap.set(el, { autoAlpha: i === 0 ? 1 : 0 }));
      kens.forEach((el, i) => {
        const k = i % DRIFT_X.length;
        el && gsap.set(el, { scale: 1.06, xPercent: DRIFT_X[k], yPercent: DRIFT_Y[k] });
      });

      // The reel: hold → crossfade → hold, looping. Each frame Ken-Burns
      // across its whole lit span; the caption flips as it comes up.
      const tl = gsap.timeline({ repeat: -1 });
      for (let i = 0; i < N; i++) {
        const cur = frames[i];
        const nxt = frames[(i + 1) % N];
        const kCur = kens[i];
        const kNxt = kens[(i + 1) % N];
        const k = i % DRIFT_X.length;
        const kn = (i + 1) % N % DRIFT_X.length;
        const at = `f${i}`;
        tl.addLabel(at);
        tl.call(() => setCaption(i), undefined, at);
        if (kCur)
          tl.fromTo(
            kCur,
            { scale: 1.06, xPercent: DRIFT_X[k], yPercent: DRIFT_Y[k] },
            {
              scale: 1.17,
              xPercent: -DRIFT_X[k],
              yPercent: -DRIFT_Y[k],
              duration: HOLD + FADE,
              ease: "none",
            },
            at,
          );
        // arm the incoming frame's drift start, then crossfade into it
        if (kNxt)
          tl.set(kNxt, { scale: 1.06, xPercent: DRIFT_X[kn], yPercent: DRIFT_Y[kn] }, `${at}+=${HOLD}`);
        tl.to(cur, { autoAlpha: 0, duration: FADE, ease: "power1.inOut" }, `${at}+=${HOLD}`);
        tl.to(nxt, { autoAlpha: 1, duration: FADE, ease: "power1.inOut" }, `${at}+=${HOLD}`);
      }

      // Gentle parallax drift of the whole window as the section passes —
      // never captures scroll, just floats the figure a few percent.
      const par = gsap.fromTo(
        windowRef.current,
        { yPercent: -3 },
        {
          yPercent: 3,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );

      return () => {
        tl.kill();
        par.scrollTrigger?.kill();
        par.kill();
      };
    },
    { scope: sectionRef, dependencies: [reduced, mounted, N] },
  );

  const total = String(N).padStart(2, "0");
  const active = LINE[caption] ?? LINE[0];
  const animated = mounted && !reduced;

  return (
    <section
      ref={sectionRef}
      id="collection"
      aria-label={dict.line.sectionAria}
      className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-night"
      style={{ "--veil-blur": `${effectiveBlur}px` } as CSSProperties}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* warm floor-glow so the figure feels lit from within the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-15%] left-1/2 h-[55%] w-[120%] -translate-x-1/2 rounded-[100%] bg-heat-orange/12 blur-[120px]"
      />

      {/* the dancer-shaped window. The mask cuts the reel to the figure;
          bottom-anchored so the heels land on the page floor-line. */}
      <div
        ref={windowRef}
        className="relative aspect-[1289/1600] h-[86%] max-h-[860px] will-change-transform"
        style={{
          WebkitMaskImage: `url(${MASK_SRC})`,
          maskImage: `url(${MASK_SRC})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center bottom",
          maskPosition: "center bottom",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      >
        {(animated ? LINE : LINE.slice(0, 1)).map((item, i) => (
          <div
            key={item.src}
            ref={(el) => {
              frameRefs.current[i] = el;
            }}
            className="absolute inset-0"
            style={animated ? undefined : { opacity: 1 }}
          >
            <div
              ref={(el) => {
                kenRefs.current[i] = el;
              }}
              className="absolute inset-0 will-change-transform"
            >
              <VeiledPlate src={item.src} alt={item.alt ?? item.name} />
            </div>
          </div>
        ))}
      </div>

      {/* editorial overlay — above the window, never eats pointers */}
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

        {/* piece caption — tucked in the free bottom-left gutter (the figure
            is centred, and the global waitlist bar owns the middle), flips
            with the reel */}
        <div
          aria-live="polite"
          className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10"
        >
          <p className="text-[11px] tracking-[0.3em] text-cream/50 uppercase tabular-nums">
            look {String(caption + 1).padStart(2, "0")} / {total}
          </p>
          <p className="mt-1 font-display text-[clamp(1.5rem,4vw,2.75rem)] leading-none text-cream italic">
            {active.name}
          </p>
        </div>
      </div>
    </section>
  );
}
