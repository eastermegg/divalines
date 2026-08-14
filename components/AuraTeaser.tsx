"use client";

import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import MagneticButton from "@/components/MagneticButton";
import AuraCursor from "@/components/originkit/aura-cursor-custom-style";
import GradientOrb from "@/components/ui/gradient-orb";
import { gsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { useDictionary } from "@/lib/i18n/context";
import AccentText from "@/components/AccentText";

/**
 * Aura quiz teaser — the lead-magnet push before the footer. The whole
 * section is the demo: an Originkit fluid-sim cursor trail fills the
 * frame, so the visitor literally leaves an aura across the pitch for a
 * quiz that measures theirs. Palette, splat and fade settings are baked
 * into the `custom-style` preset variant — pass no props here, or they
 * would override the saved instance.
 *
 * Split layout: pitch + CTA on the left, the quiz result made literal
 * on the right — a shader aura orb (the shareable card) with the five
 * energy names drifting around it. The orb canvas is transparent, so
 * the fluid trails pass behind it uninterrupted. Each name is sized by
 * its share of the sample mix — the spectrum reads through scale
 * instead of a numbers table; the exact mix stays available to
 * assistive tech via the aria-label.
 *
 * Both WebGL layers (fluid + orb) only mount inside the MOTION_OK
 * branch — neither has a reduced-motion mode of its own. The reduced /
 * no-JS state swaps the orb for a static radial-gradient glow, with
 * names parked at their rest positions. Both cursor layers ignore
 * pointer events by design, so nothing here steals a click.
 */

/** Rest positions around the orb, one per energy (matches AURA order). */
const NAME_POSITIONS: React.CSSProperties[] = [
  { top: "6%", left: "-10%" },
  { top: "24%", right: "-16%" },
  { bottom: "16%", left: "-14%" },
  { bottom: "0%", right: "-4%" },
  { top: "-6%", right: "20%" },
];

export default function AuraTeaser() {
  const { dict } = useDictionary();
  const ref = useRef<HTMLElement>(null);
  const [motionOk, setMotionOk] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        setMotionOk(true);

        gsap.fromTo(
          "[data-aura-reveal]",
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: ref.current, start: "top 72%" },
          },
        );

        // Names orbit loosely: slow sine drift, phase-shifted per index
        // so the constellation never moves in lockstep.
        gsap.utils.toArray<HTMLElement>("[data-aura-float]").forEach((el, i) => {
          gsap.to(el, {
            y: i % 2 === 0 ? -14 : 12,
            x: i % 3 === 0 ? 10 : -8,
            duration: 3.6 + i * 0.7,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: i * 0.45,
          });
        });
      });
    },
    { scope: ref },
  );

  return (
    <section
      id="aura"
      ref={ref}
      className="relative overflow-hidden py-[var(--section-gap)]"
    >
      {/* Fluid aura layer — clipped to the section, never intercepts clicks */}
      {motionOk && (
        <div className="absolute inset-0" aria-hidden>
          <AuraCursor />
        </div>
      )}

      {/* Full-bleed padding matches the footer so the two columns share
          the same left/right margins as the "join the first line." block. */}
      <div className="relative w-full px-[17px] md:pr-[26px] md:pl-[29px]">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
          {/* Left: the pitch */}
          <div className="flex max-w-[560px] flex-col items-start text-left">
            <p
              data-aura-reveal
              className="text-xs tracking-[0.22em] text-cream/60 uppercase"
            >
              {dict.aura.label}
            </p>

            <h2
              data-aura-reveal
              className="mt-6 font-display text-manifesto text-cream italic"
            >
              <AccentText text={dict.aura.title} />
            </h2>

            <p data-aura-reveal className="mt-6 max-w-[46ch] text-sm leading-[1.4] text-cream/70">
              {dict.aura.sub}
            </p>

            <div data-aura-reveal className="mt-10">
              <MagneticButton>
                <a
                  href="#join"
                  className="cta-heat cta-sheen inline-flex h-[54px] items-center rounded-pill px-8 text-base font-medium"
                >
                  {dict.aura.cta}
                </a>
              </MagneticButton>
            </div>

            <p
              data-aura-reveal
              className="mt-8 text-xs tracking-[0.14em] text-cream/40 uppercase"
            >
              {dict.aura.hint}
            </p>
          </div>

          {/* Right: the orb — the shareable result, energies constellated around it */}
          <div
            data-aura-reveal
            className="relative mx-auto aspect-square w-[min(72vw,480px)] lg:mx-0 lg:justify-self-center"
            role="img"
            aria-label={`${dict.aura.sampleMix} : ${dict.aura.energies
              .map(([name, pct]) => `${name} ${pct}%`)
              .join(", ")}`}
          >
            {motionOk ? (
              <GradientOrb
                config={{ background: "transparent", hue: 30 }}
                className="absolute inset-0"
              />
            ) : (
              /* Static stand-in: frozen glow, soft-edged to nothing */
              <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(196,64,143,0.55),rgba(110,43,168,0.35)_55%,rgba(14,10,22,0)_78%)]" />
            )}

            {dict.aura.energies.map(([name, pct], i) => (
              <span
                key={name}
                data-aura-float
                className="absolute font-serif text-cream/90 italic [text-shadow:0_2px_24px_rgba(14,10,22,0.9)]"
                style={{
                  ...NAME_POSITIONS[i],
                  // Share of the mix → scale of the name (42% ≈ 2.2rem, 6% ≈ 1.1rem)
                  fontSize: `calc(0.95rem + ${pct * 0.03}rem)`,
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
