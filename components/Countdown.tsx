"use client";

import { useEffect, useRef, useState } from "react";
import { countdownParts } from "@/lib/countdown";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useDictionary } from "@/lib/i18n/context";
import { fill } from "@/lib/i18n/fill";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * DD:HH:MM:SS countdown. SSR renders the all-zero shell; the interval only
 * starts after mount, so the first client render matches byte-for-byte.
 * Digits are aria-hidden (no per-second screen-reader churn) — meaning is
 * carried by a visually-hidden static sentence.
 */
export default function Countdown({ target }: { target: string }) {
  const { dict, locale } = useDictionary();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = countdownParts(target, now);
  const urgent = parts.totalMs > 0 && parts.totalMs < DAY_MS;

  const targetDate = new Date(target);
  const humanDate = Number.isNaN(targetDate.getTime())
    ? target
    : targetDate.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    // Maquette style: two left-aligned lines — label Medium, digits
    // Regular (Switzer ships 400/500 only) — matching the header's brand
    // block typography.
    <div className="text-left text-[13px] leading-[1.15] tracking-[-0.19px]">
      <p className={urgent ? "font-medium text-neon-pink" : "font-medium"}>
        {dict.countdown.label}
      </p>
      <p
        aria-hidden="true"
        className="font-normal tabular-nums"
        data-countdown
      >
        <Group value={parts.days} />
        <Sep />
        <Group value={parts.hours} />
        <Sep />
        <Group value={parts.minutes} />
        <Sep />
        <Group value={parts.seconds} />
      </p>
      <p className="sr-only" aria-live="off">
        {fill(dict.countdown.launching, { date: humanDate })}
      </p>
    </div>
  );
}

function Group({ value }: { value: string }) {
  return (
    <span className="inline-flex">
      {value.split("").map((d, i) => (
        <Digit key={i} d={d} />
      ))}
    </span>
  );
}

/**
 * Clipped cell with a micro-flip on change: the old face slides up and
 * out (yPercent → -100) while the new one rises from below (spec §3.3).
 */
function Digit({ d }: { d: string }) {
  const cellRef = useRef<HTMLSpanElement>(null);
  const shown = useRef(d);
  const [faces, setFaces] = useState<{ cur: string; prev: string | null }>({
    cur: d,
    prev: null,
  });

  useEffect(() => {
    if (shown.current === d) return;
    const prev = shown.current;
    shown.current = d;
    setFaces(prefersReducedMotion() ? { cur: d, prev: null } : { cur: d, prev });
  }, [d]);

  useEffect(() => {
    const cell = cellRef.current;
    if (faces.prev === null || !cell) return;
    const [prevEl, curEl] = Array.from(cell.querySelectorAll("[data-face]"));
    gsap.fromTo(
      curEl,
      { yPercent: 100 },
      { yPercent: 0, duration: 0.35, ease: "power2.out" },
    );
    gsap.fromTo(
      prevEl,
      { yPercent: 0 },
      {
        yPercent: -100,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => setFaces((f) => ({ ...f, prev: null })),
      },
    );
  }, [faces]);

  return (
    <span
      ref={cellRef}
      className="relative inline-block w-[1.1ch] overflow-hidden text-center"
    >
      {faces.prev !== null && (
        <span data-face aria-hidden="true" className="absolute inset-0">
          {faces.prev}
        </span>
      )}
      <span data-face className="inline-block">
        {faces.cur}
      </span>
    </span>
  );
}

function Sep() {
  return <span className="mx-px opacity-40">:</span>;
}
