"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import PortraitCard from "@/components/PortraitCard";
import { gsap, SplitText } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { MANIFESTO } from "@/lib/site";

/**
 * V2 manifesto — words float up through the liquid as they light
 * (yPercent drift + color, same scrub), card halos morph like blobs,
 * reveals are longer and softer than V1.
 */
export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const split = SplitText.create("[data-manifesto]", {
          type: "words",
          wordsClass: "w",
          autoSplit: true,
          aria: "none", // the animated copy is aria-hidden; a sr-only twin carries meaning
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { color: "var(--color-cream-dim)", yPercent: 12, opacity: 0.75 },
              {
                color: "var(--color-cream)",
                yPercent: 0,
                opacity: 1,
                stagger: 0.35,
                ease: "none",
                scrollTrigger: {
                  trigger: ref.current,
                  start: "top 68%",
                  end: "bottom 50%",
                  scrub: 1,
                },
              },
            ),
        });

        gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card, i) => {
          const side = i % 2 === 0 ? -1 : 1;

          gsap.fromTo(
            card,
            { opacity: 0, y: 90, scale: 0.94 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1.5,
              ease: "power2.out",
              scrollTrigger: { trigger: card, start: "top 88%" },
            },
          );

          gsap.to(card, {
            yPercent: side * 10,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          });

          const halo = card.querySelector("[data-card-halo]");
          if (halo) {
            // blob morph: the halo slowly kneads itself while pulsing
            gsap.fromTo(
              halo,
              { borderRadius: "58% 42% 55% 45% / 45% 52% 48% 55%", opacity: 0.7 },
              {
                borderRadius: "42% 58% 40% 60% / 60% 40% 62% 38%",
                opacity: 1,
                rotation: 18,
                duration: 8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
              },
            );
          }

          const rings = card.querySelectorAll("[data-neon-ring]");
          if (rings.length) {
            gsap.fromTo(
              rings,
              { strokeDasharray: "1 1", strokeDashoffset: 1 },
              {
                strokeDashoffset: 0,
                duration: 2,
                stagger: 0.25,
                ease: "power1.inOut",
                scrollTrigger: { trigger: card, start: "top 82%" },
              },
            );
          }
        });

        return () => split.revert();
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} data-manifesto-section className="relative py-[var(--section-gap)]">
      <div className="container-editorial">
        <div className="grid grid-cols-12 gap-x-6 gap-y-16 lg:gap-y-24">
          <PortraitCard
            heatFrom="left"
            rotate={-1}
            alt="Dancer portrait, heat-cam treatment"
            className="col-span-9 col-start-1 sm:col-span-6 lg:col-span-3 lg:row-start-1 lg:-mt-6"
          />
          <div className="col-span-12 self-center lg:col-span-6 lg:col-start-4 lg:row-span-2 lg:row-start-1">
              <p className="sr-only">{MANIFESTO}</p>
              <p
                aria-hidden="true"
                data-manifesto
                className="font-serif text-manifesto text-cream italic"
              >
                {MANIFESTO}
              </p>
            </div>
          <PortraitCard
            heatFrom="right"
            rotate={1}
            alt="Dancer portrait, neon waves"
            className="col-span-9 col-start-4 sm:col-span-6 sm:col-start-7 lg:col-span-3 lg:col-start-10 lg:row-start-2 lg:mt-16"
          />
          <PortraitCard
            aspect="landscape"
            heatFrom="center"
            waves={false}
            rotate={0}
            alt="Dance floor, heat horizon"
            className="col-span-12 sm:col-span-9 lg:col-span-5 lg:col-start-2 lg:row-start-3 lg:mt-10"
          />
        </div>
      </div>
    </section>
  );
}
