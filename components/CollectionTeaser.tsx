"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { Garment, Hanger } from "./garments";
import AccentText from "@/components/AccentText";
import { useDictionary } from "@/lib/i18n/context";

/**
 * Collection teaser — five framed plates on an asymmetric editorial
 * grid. Each frame holds an aluminium hanger and a garment drawn in
 * thin outline (1.5px, cream), like plates in a lookbook that hasn't
 * been shot yet. On scroll the frames rise in sequence, the garment
 * strokes draw themselves, and the columns drift at slightly different
 * speeds. Hovering warms the linework to neon pink.
 *
 * Reduced motion: strokes fully drawn, frames static.
 */
export default function CollectionTeaser() {
  const { dict } = useDictionary();
  const COLLECTION = dict.collection;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>("[data-plate]").forEach((plate, i) => {
          const side = i % 2 === 0 ? -1 : 1;

          gsap.fromTo(
            plate,
            { y: 70, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: { trigger: plate, start: "top 85%" },
            },
          );

          // the garment sketches itself in
          const strokes = plate.querySelectorAll("[data-outline]");
          gsap.fromTo(
            strokes,
            { strokeDasharray: "1 1", strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              duration: 1.6,
              stagger: 0.2,
              ease: "power2.inOut",
              scrollTrigger: { trigger: plate, start: "top 80%" },
            },
          );

          // editorial drift — columns move at slightly different speeds
          gsap.to(plate, {
            yPercent: side * (4 + (i % 3) * 3),
            ease: "none",
            scrollTrigger: {
              trigger: plate,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });

          // barely-there pendulum on the hung garment
          const hang = plate.querySelector("[data-hang]");
          if (hang) {
            gsap.fromTo(
              hang,
              { rotation: -1.1 },
              {
                rotation: 1.1,
                duration: 3.4 + i * 0.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: -i * 1.2,
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
      aria-labelledby="collection-title"
      className="relative py-[var(--section-gap)]"
    >
      <div className="container-editorial">
        <p className="text-xs tracking-[0.3em] text-cream/50 uppercase">
          {COLLECTION.label}
        </p>
        <h2
          id="collection-title"
          className="mt-4 font-display text-manifesto text-cream italic"
        >
          <AccentText text={COLLECTION.title} />
        </h2>
        <p className="mt-3 text-sm text-cream/60">{COLLECTION.sub}</p>

        <div className="mt-20 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-20">
          {COLLECTION.items.map((item, i) => (
            <Plate key={item.n} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Asymmetric placements — three plates on the first row, two offset on
 * the second, no two at the same height. */
const PLACEMENTS = [
  "lg:col-span-3 lg:col-start-1",
  "lg:col-span-3 lg:col-start-5 lg:mt-24",
  "lg:col-span-3 lg:col-start-9 lg:mt-10",
  "lg:col-span-3 lg:col-start-3 lg:-mt-4",
  "lg:col-span-3 lg:col-start-7 lg:mt-20",
];

function Plate({
  item,
  index,
}: {
  item: { n: string; name: string };
  index: number;
}) {
  const { dict } = useDictionary();
  return (
    <figure
      data-plate
      className={`group relative aspect-[4/5] border border-cream/12 transition-colors duration-500 hover:border-cream/30 ${
        PLACEMENTS[index % PLACEMENTS.length]
      } ${index === 4 ? "col-span-2 mx-auto w-[calc(50%-0.5rem)] lg:col-span-3 lg:w-auto" : ""}`}
    >
      <div
        data-hang
        className="absolute inset-x-0 top-[8%] origin-[50%_0%] text-cream/50 transition-colors duration-500 group-hover:text-neon-pink"
      >
        <Hanger className="mx-auto w-[46%]" />
        <Garment index={index} className="mx-auto -mt-[13%] w-[58%]" />
      </div>

      <figcaption className="absolute inset-x-4 bottom-3 flex items-baseline justify-between text-xs text-cream/60">
        <span className="tabular-nums">{item.n}</span>
        <span aria-hidden="true" className="blur-[3px] select-none">
          {item.name}
        </span>
        <span className="sr-only">{dict.collection.revealed}</span>
      </figcaption>
    </figure>
  );
}
