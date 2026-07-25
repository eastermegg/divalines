"use client";

import { useEffect, useState } from "react";
import { Monogram } from "@/components/Brand";
import Countdown from "@/components/Countdown";
import VinylPlayer from "@/components/VinylPlayer";
import { SITE } from "@/lib/site";

/**
 * Header on the maquette's editorial grid (1512×900 reference):
 * logo at x≈29, brand block left-aligned on the HOOK column (25.6% —
 * same x as the hero copy), countdown left-aligned at exactly 50%,
 * vinyl 108px hanging below the 65px bar at right 26 / top 30.
 * Small screens collapse to logo + countdown.
 */
export default function Header({ releaseDate }: { releaseDate: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-site-header
      className={`fixed inset-x-0 top-0 z-50 h-[var(--header-h)] transition-[background-color,backdrop-filter] duration-300 ${
        scrolled
          ? "bg-[rgba(14,10,22,0.6)] backdrop-blur-[12px]"
          : "bg-transparent"
      }`}
    >
      {/* Logo — monogram, x 29 / y 34 in the maquette */}
      <a
        href="#top"
        aria-label="Diva Lines — top"
        className="absolute top-1/2 left-[17px] -translate-y-1/2 text-cream transition-opacity hover:opacity-80 md:top-[34px] md:left-[29px] md:translate-y-0"
      >
        <Monogram title="Diva Lines" className="h-[26px] w-auto" />
      </a>

      {/* Brand block — left-aligned on the hook column (25.6%) */}
      <div className="absolute top-[25px] left-[25.57%] hidden text-[15.8px] leading-[17.33px] tracking-[-0.19px] text-cream md:block">
        <p className="font-medium">{SITE.brandLine[0]}</p>
        <p className="font-light">{SITE.brandLine[1]}</p>
      </div>

      {/* Countdown — left-aligned at exactly 50% */}
      <div className="absolute top-1/2 right-[17px] -translate-y-1/2 md:top-[25px] md:right-auto md:left-1/2 md:translate-y-0">
        <Countdown target={releaseDate} />
      </div>

      {/* Vinyl — 108px, deliberately overflowing the 65px bar.
          Wrapper span carries the placement: the widget's root is
          position:relative for its own tonearm/disc internals. */}
      <span className="absolute top-[30px] right-[26px] hidden lg:block">
        <VinylPlayer />
      </span>
    </header>
  );
}
