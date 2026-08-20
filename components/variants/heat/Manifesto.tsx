"use client";

import { useGSAP } from "@gsap/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useDictionary } from "@/lib/i18n/context";
import AccentText from "@/components/AccentText";

/**
 * The manifesto, staged in three scroll acts:
 *
 *   1. THE REPROACHES — the section PINS (scroll locks) and the overheard
 *      put-downs (« arrête de faire ta diva »…) come ONE AT A TIME, centre
 *      stage: each rises in, holds, falls out, then the next arrives —
 *      then the pin releases.
 *   2. THE ANSWER — the body reveals word by word, dim → full cream, a
 *      reading wave sweeping down (scrubbed, reverses on scroll-up).
 *   3. THE TAGLINE — the payoff rises and settles, the biggest moment.
 *
 * Fully lit by default, so no-JS / SEO / reduced-motion read cream on night
 * with zero branches: they get a plain stacked list of the reproaches, no
 * pin, no scroll trap. The staged version only mounts under motion.
 */
const DIM = 0.22; // resting opacity of an unread body word
// Total scroll the reproaches are pinned for — kept close to ONE screen so
// the four cut through on the same screen rather than a screen apiece.
const QUOTES_PIN = "+=115%";

export default function Manifesto() {
  const { dict } = useDictionary();
  const parts = dict.manifestoParts;
  const ref = useRef<HTMLElement>(null);
  const quotesRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const tagRef = useRef<HTMLParagraphElement>(null);

  // Gate the pinned/animated version on mount so SSR / reduced-motion get
  // the plain, accessible stack (no pin, no scroll lock).
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    setMounted(true);
    setReduced(prefersReducedMotion());
  }, []);
  const animate = mounted && !reduced;

  // Split the body into words. [[bracketed]] punches become heat-coloured
  // highlights that flash in with their reveal — one palette colour per
  // highlight span, cycled, so it's an occasional pop, not a monotone.
  const words = useMemo(() => {
    const HL = ["#ff7a2f", "#ff5ec4", "#c4408f"]; // orange · neon pink · magenta
    let hi = 0;
    const out: { text: string; color?: string }[] = [];
    parts.body.split(/(\[\[[^\]]*\]\])/).forEach((seg) => {
      if (!seg) return;
      const isHL = seg.startsWith("[[") && seg.endsWith("]]");
      const raw = isHL ? seg.slice(2, -2) : seg;
      const color = isHL ? HL[hi++ % HL.length] : undefined;
      raw
        .split(/\s+/)
        .filter(Boolean)
        .forEach((tok) => out.push({ text: tok, color }));
    });
    return out;
  }, [parts.body]);

  useGSAP(
    () => {
      if (!animate) return;

      // Act 1 — pin, then play the reproaches one at a time: each rises in,
      // holds, falls out before the next arrives. Scrubbed to the scroll.
      const quoteEls = gsap.utils.toArray<HTMLElement>(".mq", quotesRef.current);
      if (quoteEls.length) {
        gsap.set(quoteEls, { autoAlpha: 0, y: 30 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: quotesRef.current,
            start: "top top",
            end: QUOTES_PIN,
            pin: true,
            scrub: true,
            anticipatePin: 1,
          },
        });
        quoteEls.forEach((el, i) => {
          // Overlap each entrance with the previous exit (-=0.55) so a new
          // reproach is always arriving as the last one leaves — no empty
          // screen between quotes.
          tl.to(
            el,
            { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" },
            i === 0 ? 0 : "-=0.55",
          )
            .to(el, {}, "+=0.4") // hold — long enough to read
            .to(el, { autoAlpha: 0, y: -30, duration: 0.8, ease: "power2.in" });
        });
      }

      // Act 2 — the body reveals word by word (scrubbed reading wave).
      const els = gsap.utils.toArray<HTMLElement>(".mword", ref.current);
      if (els.length) {
        gsap.set(els, { opacity: DIM });
        gsap.to(els, {
          opacity: 1,
          ease: "none",
          duration: 0.15,
          stagger: { each: 0.1, from: "start" },
          scrollTrigger: {
            trigger: bodyRef.current,
            start: "top 78%",
            end: "bottom 62%",
            scrub: 0.6,
          },
        });
      }

      // Act 3 — the tagline rises and settles.
      if (tagRef.current) {
        gsap.fromTo(
          tagRef.current,
          { autoAlpha: 0, y: 44 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: tagRef.current, start: "top 82%", toggleActions: "play none none reverse" },
          },
        );
      }
    },
    { scope: ref, dependencies: [animate] },
  );

  return (
    <section
      ref={ref}
      data-manifesto-section
      className="relative py-[var(--section-gap)]"
    >
      {/* Act 1 — the reproaches. Pinned & one-at-a-time when animating;
          a plain stacked list otherwise (accessible, no scroll trap). */}
      {animate ? (
        <div
          ref={quotesRef}
          className="grid h-svh place-items-center overflow-hidden"
        >
          {parts.quotes.map((q, i) => (
            <p
              key={i}
              className="mq px-6 text-center font-display text-[clamp(2rem,6.5vw,4.25rem)] leading-[1.05] text-cream/70 italic [grid-area:1/1]"
            >
              « <AccentText text={q} /> »
            </p>
          ))}
        </div>
      ) : (
        <div className="container-editorial">
          <div className="mx-auto max-w-[46rem] space-y-[clamp(1.25rem,3.5vh,2.75rem)] text-center">
            {parts.quotes.map((q, i) => (
              <p
                key={i}
                className="font-display text-[clamp(1.5rem,4.5vw,3rem)] leading-tight text-cream/50 italic"
              >
                « <AccentText text={q} /> »
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="container-editorial">
        {/* Act 2 — the answer. THE manifesto anchor lands here (not on the
            pinned reproaches above), so #manifesto opens on the text. */}
        <p
          ref={bodyRef}
          id="manifesto"
          data-manifesto
          className="mx-auto mt-[clamp(4rem,10vh,8rem)] max-w-[68rem] scroll-mt-[calc(var(--banner-h)+var(--header-h)+2rem)] font-display text-manifesto text-cream italic"
        >
          {words.map((w, i) => (
            <span key={i} className="mword" style={w.color ? { color: w.color } : undefined}>
              {w.text}{" "}
            </span>
          ))}
        </p>

        {/* Act 3 — the tagline */}
        <p
          ref={tagRef}
          className="mx-auto mt-[clamp(6rem,16vh,12rem)] max-w-[68rem] font-display text-[clamp(2.2rem,7vw,5rem)] leading-[0.98] text-cream italic"
        >
          <AccentText text={parts.tagline} />
        </p>
      </div>
    </section>
  );
}
