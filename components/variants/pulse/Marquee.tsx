"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";

const LINE = "you'll feel her before you see her ✦ diva lines ✦ first drop this fall ✦ limited run ✦ ";

/**
 * Slim brand marquee between sections (V3). Two identical halves, track
 * loops xPercent 0→-50 seamlessly. Static under reduced motion.
 */
export default function Marquee() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.to("[data-marquee-track]", {
          xPercent: -50,
          duration: 22,
          repeat: -1,
          ease: "none",
        });
      });
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative overflow-hidden border-y border-cream/10 py-3"
    >
      <div data-marquee-track className="flex w-max whitespace-nowrap">
        {[0, 1].map((half) => (
          <span
            key={half}
            className="font-serif text-lg italic lowercase text-cream/50"
          >
            {LINE.repeat(3)}
          </span>
        ))}
      </div>
    </div>
  );
}
