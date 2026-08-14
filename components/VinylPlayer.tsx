"use client";

import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { SPOTIFY_PLAYLIST_ID } from "@/lib/site";
import { useDictionary } from "@/lib/i18n/context";

/**
 * Vinyl widget — exact replica of the maquette's 108×108 "overlay"
 * node (Figma 0:41), built from its exported assets (public/vinyl/).
 * The disc group idles at a slow platter spin, always turning; the record
 * itself is the play/pause button, and the platter comes up to speed only
 * while audio is actually playing. The Spotify panel below can be collapsed
 * independently — hiding it never stops the music (the iframe stays mounted
 * and audio keeps running); a small "playlist" handle brings it back.
 *
 * Playback runs through Spotify's IFrame Embed API (not a bare iframe)
 * so we can call play()/pause() from the click gesture and read the
 * real playing state back to drive the spin. Note: Spotify only serves
 * full tracks to visitors signed into Spotify in this browser — everyone
 * else hears 30s previews. That's Spotify's licensing rule, not ours.
 * Autoplay is gated on the click because browsers block sound without a
 * user gesture. Reduced motion: no spin, playback still works.
 */

interface SpotifyController {
  play: () => void;
  pause: () => void;
  addListener: (
    event: "playback_update" | "ready",
    cb: (e: { data: { isPaused: boolean } }) => void,
  ) => void;
  destroy: () => void;
}
interface SpotifyIframeApi {
  createController: (
    el: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    cb: (controller: SpotifyController) => void,
  ) => void;
}
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

const IFRAME_API_SRC = "https://open.spotify.com/embed/iframe-api/v1";

/** Load the IFrame API script once; resolve when the global is ready. */
let apiPromise: Promise<SpotifyIframeApi> | null = null;
function loadSpotifyApi(): Promise<SpotifyIframeApi> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api);
    if (!document.querySelector(`script[src="${IFRAME_API_SRC}"]`)) {
      const s = document.createElement("script");
      s.src = IFRAME_API_SRC;
      s.async = true;
      document.body.appendChild(s);
    }
  });
  return apiPromise;
}

/** Now-playing glyph: an animated equalizer while the music plays, or a
 *  static pause icon when the visitor prefers reduced motion. */
function PlayingIndicator({ reduced }: { reduced: boolean }) {
  if (reduced) {
    return (
      <span aria-hidden="true" className="flex h-3 items-center gap-[3px]">
        <span className="h-3 w-[2px] rounded-full bg-neon-pink" />
        <span className="h-3 w-[2px] rounded-full bg-neon-pink" />
      </span>
    );
  }
  // staggered delays turn four bars into a travelling wave
  return (
    <span aria-hidden="true" className="flex h-3 items-end gap-[2px]">
      {[0, 0.18, 0.36, 0.12].map((delay, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-neon-pink"
          style={{
            height: "100%",
            transformOrigin: "bottom",
            animation: `eq 0.9s ease-in-out ${delay}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

export default function VinylPlayer({ className = "" }: { className?: string }) {
  const { dict } = useDictionary();
  const [panelOpen, setPanelOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<gsap.core.Tween | null>(null);
  const controllerRef = useRef<SpotifyController | null>(null);

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

  useEffect(() => setReduced(prefersReducedMotion()), []);

  // Build the Spotify controller once, up front, so play() can fire
  // synchronously inside the click (keeping the browser's autoplay gesture).
  useEffect(() => {
    let cancelled = false;
    loadSpotifyApi().then((api) => {
      if (cancelled || !embedRef.current || controllerRef.current) return;
      api.createController(
        embedRef.current,
        { uri: `spotify:playlist:${SPOTIFY_PLAYLIST_ID}`, width: "100%", height: 152 },
        (controller) => {
          controllerRef.current = controller;
          // real playback state drives the platter speed
          controller.addListener("playback_update", (e) =>
            setPlaying(!e.data.isPaused),
          );
        },
      );
    });
    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  // Platter comes up to speed only while audio is actually playing.
  useEffect(() => {
    if (!spinRef.current) return;
    gsap.to(spinRef.current, {
      timeScale: playing ? 1 : 0.25,
      duration: playing ? 0.8 : 1.2,
      ease: playing ? "power2.in" : "power2.out",
    });
  }, [playing]);

  // The record IS the play/pause button. Playback is never tied to the
  // panel's visibility — collapsing the embed (below) leaves the music
  // running. play() fires inside the click so the browser allows autoplay.
  const toggle = () => {
    const c = controllerRef.current;
    if (playing) {
      c?.pause();
    } else {
      setPanelOpen(true); // reveal the embed the first time you start it
      c?.play();
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? dict.vinyl.pause : dict.vinyl.play}
        data-vinyl
        className="relative block size-[108px] cursor-pointer overflow-clip rounded-[9px] border-[0.45px] border-solid border-white/10 shadow-[0px_1.8px_7.2px_0px_rgba(0,0,0,0.2)]"
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

        {/* the record — matte vinyl, concentric grooves, and a warm
            specular sweep that rides the disc so rotation reads at a
            glance. This whole group spins. */}
        <span
          aria-hidden="true"
          data-vinyl-rotor
          className="absolute top-[17.31px] left-[17.79px] block size-[73.37px] rounded-full"
          style={{
            boxShadow:
              "inset 0 0 0 0.8px rgba(255,255,255,0.10), inset 0 1px 2px rgba(255,255,255,0.14), inset 0 -3px 7px rgba(0,0,0,0.55)",
          }}
        >
          {/* vinyl body — dark, with a soft top-left cast */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(120% 120% at 34% 28%, rgba(255,255,255,0.12), rgba(255,255,255,0) 40%), radial-gradient(circle at 50% 50%, #211d24 0%, #151318 42%, #0a090b 100%)",
            }}
          />
          {/* concentric grooves */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 0.5px, rgba(0,0,0,0.30) 0.9px, rgba(0,0,0,0) 2.1px)",
            }}
          />
          {/* iridescent specular sweep — two opposed arcs; the spin cue */}
          <span
            className="absolute inset-0 rounded-full mix-blend-screen"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, rgba(255,180,110,0) 22deg, rgba(255,184,116,0.48) 52deg, rgba(255,120,175,0.24) 76deg, rgba(255,180,110,0) 108deg, rgba(255,180,110,0) 210deg, rgba(255,152,96,0.38) 236deg, rgba(232,110,162,0.2) 252deg, rgba(255,180,110,0) 288deg)",
            }}
          />
          {/* label — brand gradient, hairline rings, and one off-centre
              print mark so the spin is unmistakable */}
          <span className="absolute top-1/2 left-1/2 size-[22.87px] -translate-1/2 overflow-hidden rounded-full">
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(135deg, #ff6a2a 0%, #e11d74 100%)",
                boxShadow:
                  "inset 0 0 0 0.6px rgba(242,237,228,0.7), inset 0 0 0 3px rgba(0,0,0,0.14), inset 0 0 5px rgba(0,0,0,0.35)",
              }}
            />
            <span className="absolute top-1/2 left-1/2 size-[13px] -translate-1/2 rounded-full border border-[rgba(242,237,228,0.35)]" />
            <span className="absolute top-[2.4px] left-1/2 size-[2px] -translate-x-1/2 rounded-full bg-[#f2ede4]" />
          </span>
          {/* spindle hole */}
          <span
            className="absolute top-1/2 left-1/2 size-[4px] -translate-1/2 rounded-full bg-[#050406]"
            style={{ boxShadow: "0 0 0 0.5px rgba(255,255,255,0.18)" }}
          />
        </span>

        {/* fixed sheen — a constant light glint the grooves catch as they
            pass under it (does not rotate) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[17.31px] left-[17.79px] size-[73.37px] rounded-full"
          style={{
            background:
              "linear-gradient(125deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.06) 100%)",
          }}
        />

        {/* tonearm — pivot mount is fixed; the arm + stylus swing about it,
            dropping onto the record when playing and lifting off when paused */}
        <span aria-hidden="true" className="absolute top-[10.56px] left-[85.82px] block size-[11.78px]">
          <span className="absolute inset-[-183.31%_-152.76%_-168.04%_-152.76%]">
            <img alt="" src="/vinyl/knob-shadow.png" className="block size-full max-w-none" />
          </span>
        </span>
        <span
          aria-hidden="true"
          className="absolute size-0"
          style={{
            top: "16.45px",
            left: "91.71px",
            transformOrigin: "0px 0px",
            transform: `rotate(${playing ? 0 : -17}deg)`,
            transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <span className="absolute flex h-[60.28px] w-[41.85px] items-center justify-center" style={{ top: "-3.58px", left: "-36.04px" }}>
            <span className="block rotate-[-2.49deg]">
              <span className="relative block h-[58.63px] w-[39.34px]">
                <span className="absolute inset-[-36.84%_-45.75%_-33.77%_-45.75%]">
                  <img alt="" src="/vinyl/tonearm.png" className="block size-full max-w-none" />
                </span>
              </span>
            </span>
          </span>
          <span
            className="absolute size-[2.8px] rounded-full bg-[#eb5d5c]"
            style={{
              top: "50.76px",
              left: "-30.79px",
              boxShadow: playing
                ? "0 0 5px 1px rgba(235,93,92,0.9), 0 0 2px rgba(255,120,150,0.9)"
                : "0 0 0 rgba(235,93,92,0)",
              transition: "box-shadow 0.5s ease",
            }}
          />
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

      {/* Spotify panel — visibility is independent of playback. Collapsing
          it only hides the embed; the audio keeps running (the record stays
          spinning to say so). The API swaps the inner div for its iframe on
          mount, so the iframe is never unmounted and audio never cuts. */}
      <div
        className={`absolute top-0 right-[calc(100%+12px)] w-[320px] origin-top-right transition-all duration-500 ${
          panelOpen
            ? "pointer-events-auto translate-x-0 opacity-100"
            : "pointer-events-none translate-x-2 opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121013] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="flex items-center gap-2 text-[10px] tracking-[0.18em] text-cream/45">
              <span>
                {dict.vinyl.panelTitle}
                {playing ? ` · ${dict.vinyl.nowPlaying}` : ""}
              </span>
              {playing && <PlayingIndicator reduced={reduced} />}
            </span>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              aria-label={dict.vinyl.collapse}
              className="-mr-1 flex size-5 items-center justify-center rounded text-cream/45 transition-colors hover:text-cream"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 3 L8 8 M8 3 L3 8" />
              </svg>
            </button>
          </div>
          <div ref={embedRef} />
        </div>
      </div>

      {/* When the embed is collapsed but audio is still going, a small
          handle lets you bring the playlist back without breaking playback. */}
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        aria-label={dict.vinyl.show}
        className={`absolute top-[calc(100%+10px)] right-0 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#121013] px-3 py-1.5 text-[10px] tracking-[0.18em] text-cream/55 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)] transition-all duration-500 hover:text-cream ${
          !panelOpen && playing
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <PlayingIndicator reduced={reduced} />
        {dict.vinyl.handle}
      </button>
    </div>
  );
}
