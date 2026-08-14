"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import PortraitCard from "@/components/PortraitCard";
import { gsap, SplitText } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { useDictionary } from "@/lib/i18n/context";
import AccentText, { plainText } from "@/components/AccentText";

/**
 * V3 manifesto — harder cuts: a scrambling section label, snappier
 * expo reveals with tighter staggers, continuously breathing neon rings,
 * and cards that tilt toward a fine pointer (≤6°, perspective 700).
 */
export default function Manifesto() {
  const { dict } = useDictionary();
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // scramble-in section label
        gsap.to("[data-pulse-label]", {
          scrambleText: {
            text: dict.manifestoLabel,
            chars: "✦╱╲—◆",
            speed: 0.4,
          },
          duration: 1.2,
          scrollTrigger: { trigger: ref.current, start: "top 78%" },
        });

        const split = SplitText.create("[data-manifesto]", {
          type: "words",
          wordsClass: "w",
          autoSplit: true,
          aria: "none", // the animated copy is aria-hidden; a sr-only twin carries meaning
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { color: "var(--color-cream-dim)" },
              {
                color: "var(--color-cream)",
                stagger: 0.35,
                ease: "none",
                scrollTrigger: {
                  trigger: ref.current,
                  start: "top 70%",
                  end: "bottom 55%",
                  scrub: 0.4,
                },
              },
            ),
        });

        gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          const finalRotation = Number(gsap.getProperty(card, "rotation")) || 0;

          gsap.fromTo(
            card,
            { opacity: 0, y: 80, scale: 0.92, rotation: finalRotation + side * 4 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotation: finalRotation,
              duration: 0.6,
              ease: "expo.out",
              scrollTrigger: { trigger: card, start: "top 85%" },
            },
          );

          gsap.to(card, {
            yPercent: side * 8,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });

          // rings never stop breathing in Pulse
          const rings = card.querySelectorAll("[data-neon-ring]");
          if (rings.length) {
            gsap.fromTo(
              rings,
              { strokeDasharray: "1 1", strokeDashoffset: 1 },
              {
                strokeDashoffset: 0,
                duration: 0.9,
                stagger: 0.1,
                ease: "expo.inOut",
                scrollTrigger: { trigger: card, start: "top 82%" },
              },
            );
            gsap.to(rings, {
              opacity: 0.35,
              duration: 2.8,
              stagger: 0.4,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              delay: 1.2,
            });
          }

          const halo = card.querySelector("[data-card-halo]");
          if (halo) {
            gsap.fromTo(
              halo,
              { opacity: 0.65 },
              { opacity: 1, duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut" },
            );
          }
        });

        // cursor tilt (fine pointers only — matchMedia condition below)
        return undefined;
      });

      mm.add(`${MOTION_OK} and (pointer: fine)`, () => {
        const cleanups: Array<() => void> = [];
        gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card) => {
          gsap.set(card, { transformPerspective: 700 });
          const rxTo = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power2.out" });
          const ryTo = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power2.out" });

          const onMove = (e: PointerEvent) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            rxTo(-py * 6);
            ryTo(px * 6);
          };
          const onLeave = () => {
            rxTo(0);
            ryTo(0);
          };
          card.addEventListener("pointermove", onMove, { passive: true });
          card.addEventListener("pointerleave", onLeave);
          cleanups.push(() => {
            card.removeEventListener("pointermove", onMove);
            card.removeEventListener("pointerleave", onLeave);
          });
        });
        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} data-manifesto-section className="relative py-[var(--section-gap)]">
      <div className="container-editorial">
        <p className="mb-10 text-xs tracking-[0.3em] text-neon-pink uppercase">
          <span className="sr-only">{dict.manifestoLabel}</span>
          <span data-pulse-label aria-hidden="true">
            ✦✦✦
          </span>
        </p>
        <div className="grid grid-cols-12 gap-x-6 gap-y-16 lg:gap-y-24">
          <PortraitCard
            heatFrom="left"
            rotate={-3}
            alt={dict.portraitAlt.heatCam}
            className="col-span-9 col-start-1 sm:col-span-6 lg:col-span-3 lg:row-start-1 lg:-mt-6"
          />
          <div className="col-span-12 self-center lg:col-span-6 lg:col-start-4 lg:row-span-2 lg:row-start-1">
              <p className="sr-only">{plainText(dict.manifesto)}</p>
              <p
                aria-hidden="true"
                data-manifesto
                className="font-display text-manifesto text-cream italic"
              >
                <AccentText text={dict.manifesto} />
              </p>
            </div>
          <PortraitCard
            heatFrom="right"
            rotate={3}
            alt={dict.portraitAlt.neonWaves}
            className="col-span-9 col-start-4 sm:col-span-6 sm:col-start-7 lg:col-span-3 lg:col-start-10 lg:row-start-2 lg:mt-16"
          />
          <PortraitCard
            aspect="landscape"
            heatFrom="center"
            waves={false}
            rotate={-2}
            alt={dict.portraitAlt.danceFloor}
            className="col-span-12 sm:col-span-9 lg:col-span-5 lg:col-start-2 lg:row-start-3 lg:mt-10"
          />
        </div>
      </div>
    </section>
  );
}
