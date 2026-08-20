"use client";

import { Monogram } from "@/components/Brand";
import Countdown from "@/components/Countdown";
import NavMenu from "@/components/NavMenu";
import PrizeBanner from "@/components/PrizeBanner";
import VinylPlayer from "@/components/VinylPlayer";
import { useEffect, useState } from "react";
import { useDictionary } from "@/lib/i18n/context";

/**
 * Header on the maquette's editorial grid (1512×900 reference):
 * logo at x≈29, brand block left-aligned on the HOOK column (25.6% —
 * same x as the hero copy), countdown left-aligned at exactly 50%,
 * vinyl 108px hanging below the 65px bar at right 26 / top 30.
 * Small screens collapse to logo + countdown. The prize marquee rides
 * above the bar, so the whole chrome is banner + header.
 */
export default function Header({ releaseDate }: { releaseDate: string }) {
  const { dict, locale } = useDictionary();

  // Contrast-aware ink: the fixed bar rides over dark night sections
  // (cream text) until the bright footer gradient slides under it, where
  // cream washes out. Track the footer's position and flip to night ink.
  const [overLight, setOverLight] = useState(false);
  useEffect(() => {
    const footer = document.querySelector<HTMLElement>("#join");
    if (!footer) return;
    const chrome = () => {
      const s = getComputedStyle(document.documentElement);
      return (
        parseFloat(s.getPropertyValue("--banner-h")) +
        parseFloat(s.getPropertyValue("--header-h"))
      );
    };
    const onScroll = () => {
      const r = footer.getBoundingClientRect();
      setOverLight(r.top < chrome() && r.bottom > 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <PrizeBanner />
      <header
        data-site-header
        className={`fixed inset-x-0 top-[var(--banner-h)] z-50 h-[var(--header-h)] transition-colors duration-300 ${
          overLight ? "text-night" : "text-cream"
        }`}
      >
        {/* Mobile scrim — full-width content scrolls under the header on
            phones (the board is edge-to-edge there), so a soft night
            gradient keeps the logo/countdown/menu legible. Desktop stays
            clean (the board sits in a side column). Hidden over the light
            footer, where the ink is already flipped to night. */}
        {overLight ? null : (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 bottom-[-18px] -z-10 bg-gradient-to-b from-night via-night/85 to-transparent lg:hidden"
          />
        )}

        {/* Logo — monogram, x 29 / y 34 in the maquette. Always routes to
            the locale home, so it works from subpages (/privacy, /wall). */}
        <a
          href={`/${locale}`}
          aria-label={dict.header.topAria}
          className="absolute top-1/2 left-[17px] -translate-y-1/2 transition-opacity hover:opacity-80 md:top-[34px] md:left-[29px] md:translate-y-0"
        >
          <Monogram title="Divalines" className="h-[26px] w-auto" />
        </a>

        {/* Brand block — left-aligned on the hook column (25.6%). One
            flowing sentence ("…. Conçue à Paris" inline, no forced
            break), wrapped tight so it never nears the countdown. */}
        <p className="absolute top-[19px] left-[25.57%] hidden max-w-[240px] text-[12px] leading-[1.25] tracking-[-0.19px] font-medium md:block">
          {dict.site.brandLine[0]}. {dict.site.brandLine[1]}
        </p>

        {/* Countdown — centered on mobile, left-edge at 50% on desktop
            (maquette grid). */}
        <div className="absolute top-[19px] left-1/2 -translate-x-1/2 md:top-[25px] md:translate-x-0">
          <Countdown target={releaseDate} />
        </div>

        {/* Menu — a "menu" trigger opening the overlay nav (manifeste ·
            collection · liste d'attente). Clear of the vinyl on lg. */}
        <div className="absolute top-[19px] right-[17px] md:top-[26px] md:right-[29px] lg:right-[150px]">
          <NavMenu />
        </div>

        {/* Vinyl — 108px, deliberately overflowing the 65px bar.
            Wrapper span carries the placement: the widget's root is
            position:relative for its own tonearm/disc internals. */}
        <span className="absolute top-[30px] right-[26px] hidden lg:block">
          <VinylPlayer />
        </span>
      </header>
    </>
  );
}
