"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import PortraitCard from "@/components/PortraitCard";
import { gsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { MANIFESTO } from "@/lib/site";

/**
 * V1 manifesto. The type is a mask over a cream/dim gradient whose
 * boundary sweeps smoothly down the block under the scroll scrub
 * (see .manifesto-fill in globals.css). Default state is fully lit, so
 * no-JS, SEO and reduced-motion all read cream on night with zero
 * branches. Cards: entrance reveal + parallax (yPercent — a separate
 * transform channel from the reveal's y) + ring stroke-draws.
 */
export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // — the signature move: the gradient boundary sweeps down the
        // type mask, smoothly filling the text with light as you read
        gsap.fromTo(
          "[data-manifesto]",
          { "--fill": "-15%" },
          {
            "--fill": "115%",
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 70%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          },
        );

        // — cards: reveal, parallax, ring draw
        gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          const finalRotation = Number(gsap.getProperty(card, "rotation")) || 0;

          gsap.fromTo(
            card,
            {
              opacity: 0,
              y: 60,
              scale: 0.96,
              rotation: finalRotation + side * 3,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotation: finalRotation,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: { trigger: card, start: "top 85%" },
            },
          );

          gsap.to(card, {
            yPercent: side * 6,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });

          const rings = card.querySelectorAll("[data-neon-ring]");
          if (rings.length) {
            gsap.fromTo(
              rings,
              { strokeDasharray: "1 1", strokeDashoffset: 1 },
              {
                strokeDashoffset: 0,
                duration: 1.2,
                stagger: 0.15,
                ease: "power2.inOut",
                scrollTrigger: { trigger: card, start: "top 80%" },
              },
            );
          }
        });
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      data-manifesto-section
      className="relative py-[var(--section-gap)]"
    >
      <div className="container-editorial">
        <div className="grid grid-cols-12 gap-x-6 gap-y-16 lg:gap-y-24">
          <PortraitCard
            heatFrom="left"
            rotate={-2}
            alt="Dancer portrait, heat-cam treatment"
            className="col-span-9 col-start-1 sm:col-span-6 lg:col-span-2 lg:row-start-1 lg:-mt-6"
          />

          {/* wider editorial column for the text (cols 3–9) */}
          <div className="col-span-12 self-center lg:col-span-7 lg:col-start-3 lg:row-span-2 lg:row-start-1">
            <p
              data-manifesto
              className="manifesto-fill font-serif text-manifesto italic"
            >
              {MANIFESTO}
            </p>
          </div>

          <PortraitCard
            heatFrom="right"
            rotate={2}
            alt="Dancer portrait, neon waves"
            className="col-span-9 col-start-4 sm:col-span-6 sm:col-start-7 lg:col-span-3 lg:col-start-10 lg:row-start-2 lg:mt-16"
          />

          <PortraitCard
            aspect="landscape"
            heatFrom="center"
            waves={false}
            rotate={-1}
            alt="Dance floor, heat horizon"
            className="col-span-12 sm:col-span-9 lg:col-span-5 lg:col-start-2 lg:row-start-3 lg:mt-10"
          />
        </div>
      </div>
    </section>
  );
}
