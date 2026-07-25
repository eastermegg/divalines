"use client";

import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { SPOTIFY_PLAYLIST_ID } from "@/lib/site";

/**
 * Vinyl widget — exact replica of the maquette's 108×108 "overlay"
 * node (Figma 0:41), built from its exported assets (public/vinyl/).
 * The disc group idles at a slow platter spin, always turning; clicking
 * opens a Spotify playlist panel beneath and brings the platter up to
 * speed. Reduced motion: no spin, panel still works.
 */
export default function VinylPlayer({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      spinRef.current = gsap.to("[data-vinyl-rotor]", {
        rotation: 360,
        duration: 4,
        repeat: -1,
        ease: "none",
      });
      spinRef.current.timeScale(0.25); // idle: barely turning
    },
    { scope: rootRef },
  );

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) setLoaded(true);
    if (spinRef.current) {
      gsap.to(spinRef.current, {
        timeScale: next ? 1 : 0.25,
        duration: next ? 0.8 : 1.2,
        ease: next ? "power2.in" : "power2.out",
      });
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Close the playlist" : "Play the Diva Lines playlist"}
        data-vinyl
        className="relative block size-[108px] cursor-pointer overflow-clip rounded-[9px] border-[0.45px] border-solid border-white shadow-[0px_1.8px_7.2px_0px_rgba(0,0,0,0.2)]"
      >
        {/* card: charcoal + soft-light noise (maquette texture) */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[9px]">
          <span className="absolute inset-0 rounded-[9px] bg-[#2f3033]" />
          <span
            className="absolute inset-0 rounded-[9px] opacity-25 mix-blend-soft-light"
            style={{
              backgroundImage: "url(/vinyl/card-noise.png)",
              backgroundSize: "99px 99px",
              backgroundPosition: "top left",
            }}
          />
        </span>

        {/* glow bed: violet→orange gradient in a clipped circle + blue cast + ring glow */}
        <span aria-hidden="true" className="absolute top-1/2 left-1/2 size-[83.5px] -translate-1/2 overflow-clip rounded-full">
          <span
            className="absolute top-1/2 left-[calc(50%+2.7px)] size-[89.5px] -translate-1/2"
            style={{ background: "linear-gradient(90deg, #5c15c8 0%, #f04a1a 100%)" }}
          />
        </span>
        <span aria-hidden="true" className="absolute top-1/2 left-1/2 size-[83.6px] -translate-1/2 rounded-full bg-[rgba(61,107,240,0.22)]" />
        <span aria-hidden="true" className="absolute top-1/2 left-1/2 size-[83.6px] -translate-1/2">
          <span className="absolute inset-[-25.85%_-21.54%_-23.7%_-21.54%]">
            <img alt="" src="/vinyl/ring-glow.png" className="block size-full max-w-none" />
          </span>
        </span>

        {/* the record — this whole group rotates */}
        <span
          aria-hidden="true"
          data-vinyl-rotor
          className="absolute top-[17.31px] left-[17.79px] block size-[73.37px]"
        >
          <img alt="" src="/vinyl/disc.svg" className="absolute inset-0 block size-full max-w-none" />
          <span className="absolute top-1/2 left-1/2 size-[22.87px] -translate-1/2 mix-blend-multiply">
            <span className="absolute inset-[-0.69%_-1.37%_-2.06%_-1.37%]">
              <img alt="" src="/vinyl/label.svg" className="block size-full max-w-none" />
            </span>
          </span>
          <span className="absolute top-1/2 left-1/2 size-[7.86px] -translate-1/2">
            <span className="absolute inset-[-68.74%_-91.65%_-114.56%_-91.65%]">
              <img alt="" src="/vinyl/hole.png" className="block size-full max-w-none" />
            </span>
          </span>
        </span>

        {/* tonearm (static): pivot glow, arm at -2.49°, red stylus dot */}
        <span aria-hidden="true" className="absolute top-[10.56px] left-[85.82px] block size-[11.78px]">
          <span className="absolute inset-[-183.31%_-152.76%_-168.04%_-152.76%]">
            <img alt="" src="/vinyl/knob-shadow.png" className="block size-full max-w-none" />
          </span>
        </span>
        <span aria-hidden="true" className="absolute top-[12.87px] left-[55.67px] flex h-[60.28px] w-[41.85px] items-center justify-center">
          <span className="block rotate-[-2.49deg]">
            <span className="relative block h-[58.63px] w-[39.34px]">
              <span className="absolute inset-[-36.84%_-45.75%_-33.77%_-45.75%]">
                <img alt="" src="/vinyl/tonearm.png" className="block size-full max-w-none" />
              </span>
            </span>
          </span>
        </span>
        <span aria-hidden="true" className="absolute top-[67.21px] left-[60.92px] flex size-[2.9px] items-center justify-center">
          <span className="block size-[2.8px] rotate-[-2.49deg] rounded-full bg-[#eb5d5c]" />
        </span>

        {/* volume knob + ticks, bottom-left */}
        <span aria-hidden="true" className="absolute top-[88.05px] left-[7.21px] block size-[11.78px]">
          <span className="absolute inset-[-183.31%_-152.76%_-168.04%_-152.76%]">
            <img alt="" src="/vinyl/knob-shadow.png" className="block size-full max-w-none" />
          </span>
        </span>
        <span aria-hidden="true" className="absolute top-[90.29px] left-[9.45px] block size-[7.3px]">
          <span className="absolute inset-[-73.96%_-98.62%_-123.27%_-98.62%]">
            <img alt="" src="/vinyl/knob.png" className="block size-full max-w-none" />
          </span>
        </span>
        <span aria-hidden="true" className="absolute top-[84.98px] left-[13.1px] block h-[1.28px] w-[0.43px] bg-black" />
        {[
          [15.04, 85.22, 15],
          [16.86, 86.04, 30],
          [18.44, 87.39, 45],
          [19.67, 89.17, 60],
          [20.47, 91.26, 75],
        ].map(([x, y, r]) => (
          <span
            key={r}
            aria-hidden="true"
            className="absolute block h-[1.28px] w-[0.43px] bg-[#ababa9]"
            style={{ left: x, top: y, transform: `rotate(${r}deg)` }}
          />
        ))}
        <span
          aria-hidden="true"
          className="absolute block h-[1.28px] w-[0.43px] rotate-90 bg-[#eb5d5c]"
          style={{ left: 20.78, top: 93.51 }}
        />
      </button>

      {/* Spotify panel — slides out beneath the widget */}
      <div
        className={`absolute top-[calc(100%+10px)] right-0 w-[320px] origin-top-right transition-all duration-500 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        {loaded && (
          <iframe
            title="Diva Lines — playlist"
            src={`https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?theme=0`}
            width="100%"
            height="152"
            style={{ borderRadius: 12, display: "block", border: 0 }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
