"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { COLLECTION } from "@/lib/site";

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
          className="mt-4 font-serif text-manifesto text-cream italic"
        >
          {COLLECTION.title}
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
        <span className="sr-only">— revealed at the drop</span>
      </figcaption>
    </figure>
  );
}

/** Aluminium hanger — brushed-metal gradient stroke stays crisp. */
function Hanger({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 108" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="alu" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8b8b94" />
          <stop offset="0.25" stopColor="#e9e9ef" />
          <stop offset="0.5" stopColor="#9a9aa4" />
          <stop offset="0.75" stopColor="#f2f2f6" />
          <stop offset="1" stopColor="#7e7e87" />
        </linearGradient>
      </defs>
      <path
        d="M100 36 L100 26 C100 15 88 16 89 8 C90 2 102 1 105 7"
        stroke="url(#alu)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M100 36 L24 92 Q19 97 27 98 L173 98 Q181 97 176 92 Z"
        stroke="url(#alu)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Garments as thin line drawings — outline + one interior detail line
 * each, stroke inherits currentColor (cream, pink on hover). pathLength
 * normalizes every path so the draw-in is a plain dashoffset tween.
 */
const GARMENTS: Array<{ outline: string; detail: string }> = [
  {
    // bodysuit
    outline:
      "M76 6 L68 58 C54 84 50 112 54 140 C58 172 76 196 100 200 C124 196 142 172 146 140 C150 112 146 84 132 58 L124 6 L110 12 C106 42 94 42 90 12 Z",
    detail: "M68 58 C88 70 112 70 132 58",
  },
  {
    // wrap skirt
    outline: "M68 8 H132 L158 152 C118 174 82 174 42 152 Z",
    detail: "M70 22 C90 30 110 30 130 22 M100 24 L124 148",
  },
  {
    // second skin
    outline:
      "M72 8 L38 24 C22 60 18 110 24 152 C30 160 42 160 48 152 C45 116 47 84 54 60 L57 140 C59 172 70 190 100 192 C130 190 141 172 143 140 L146 60 C153 84 155 116 152 152 C158 160 170 160 176 152 C182 110 178 60 162 24 L128 8 C120 26 80 26 72 8 Z",
    detail: "M72 8 C80 22 120 22 128 8",
  },
  {
    // flare pant
    outline:
      "M72 6 H128 L136 88 L152 206 C138 220 124 220 116 208 L102 112 L88 208 C80 220 66 220 52 206 L68 88 Z",
    detail: "M72 20 H128",
  },
  {
    // crop top
    outline:
      "M62 8 L44 64 C62 78 76 82 100 82 C124 82 138 78 156 64 L138 8 L118 16 C112 38 88 38 82 16 Z",
    detail: "M82 16 C88 30 112 30 118 16",
  },
];

function Garment({ index, className = "" }: { index: number; className?: string }) {
  const g = GARMENTS[index % GARMENTS.length];
  return (
    <svg viewBox="0 0 200 232" fill="none" className={className} aria-hidden="true">
      <path
        data-outline
        d={g.outline}
        pathLength={1}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        data-outline
        d={g.detail}
        pathLength={1}
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
