"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { useDictionary } from "@/lib/i18n/context";
import AccentText from "@/components/AccentText";

/**
 * V1 manifesto. The type is a mask over a cream/dim gradient whose
 * boundary sweeps smoothly down the block under the scroll scrub
 * (see .manifesto-fill in globals.css). Default state is fully lit, so
 * no-JS, SEO and reduced-motion all read cream on night with zero
 * branches.
 */
export default function Manifesto() {
  const { dict } = useDictionary();
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
        <p
          data-manifesto
          className="manifesto-fill mx-auto max-w-[68rem] font-display text-manifesto italic"
        >
          <AccentText text={dict.manifesto} />
        </p>
      </div>
    </section>
  );
}
