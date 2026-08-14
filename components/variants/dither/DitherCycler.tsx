"use client";

import { useEffect, useRef, useState } from "react";
import DitherReveal from "@/components/originkit/dither-reveal";
import { prefersReducedMotion } from "@/lib/motion";

type Silo = { src: string; bg: "light" | "dark" };

/**
 * The rim-lit dancer silhouettes the hero cycles through. `bg` says
 * which backdrop to key OUT to transparent so the figure floats on the
 * dark page: most frames are shot on WHITE, one (the magenta dancer) on
 * BLACK. Keying happens in-browser (see keyBackground) — no blend-mode
 * tricks, which fail inside the wrapper's isolated stacking context.
 */
const SILHOUETTES: Silo[] = [
  { src: "/images/silhouettes/s02.png", bg: "dark" },
  { src: "/images/silhouettes/s01.png", bg: "light" },
  { src: "/images/silhouettes/s04.jpg", bg: "light" },
  { src: "/images/silhouettes/s05.jpg", bg: "light" },
  { src: "/images/silhouettes/s06.png", bg: "light" },
  { src: "/images/silhouettes/s07.jpg", bg: "light" },
  { src: "/images/silhouettes/s08.jpg", bg: "light" },
  { src: "/images/silhouettes/s09.jpg", bg: "light" },
  { src: "/images/silhouettes/s10.jpg", bg: "light" },
];

// Hold each frame a random beat before the next swap — "not too fast,
// not too slow" — then a slow cross-dissolve so cuts never snap.
const HOLD_MIN = 4500;
const HOLD_MAX = 6500;
const FADE_MS = 900;
const holdMs = () => HOLD_MIN + Math.random() * (HOLD_MAX - HOLD_MIN);

// Longest processed edge — the dither pixelates anyway, so this is plenty
// of detail while keeping the per-pixel key and memory bounded.
const MAX_EDGE = 1600;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Draw the source onto a canvas and knock its studio backdrop out to
 * transparent, returning an object-URL PNG cutout. `light` frames key
 * near-white (min channel high) so saturated rim-light survives; `dark`
 * frames key near-black by luminance. RGB is premultiplied toward the
 * removed alpha so soft edges fade to nothing instead of fringing.
 */
async function keyBackground(src: string, mode: Silo["bg"]): Promise<string> {
  const img = await loadImage(src);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;
  ctx.drawImage(img, 0, 0, w, h);
  const frame = ctx.getImageData(0, 0, w, h);
  const px = frame.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    let a: number;
    if (mode === "light") {
      // White backdrop → high min-channel; magenta/orange rim → low.
      const minc = Math.min(r, g, b) / 255;
      a = 1 - smoothstep(0.8, 0.96, minc);
    } else {
      // Black backdrop → near-zero luminance; lit body stays.
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      a = smoothstep(0.03, 0.12, lum);
    }
    px[i] = r * a;
    px[i + 1] = g * a;
    px[i + 2] = b * a;
    px[i + 3] = Math.round(a * 255);
  }
  ctx.putImageData(frame, 0, 0);
  const blob: Blob | null = await new Promise((res) =>
    canvas.toBlob((b) => res(b), "image/png"),
  );
  return blob ? URL.createObjectURL(blob) : src;
}

export default function DitherCycler() {
  // Transparent-cutout URL per silhouette (indexed like SILHOUETTES).
  // Entries fill in progressively as each backdrop is keyed, so the hero
  // can paint the first frame without waiting on all 9 (see the keying
  // effect below). `null` = not yet processed.
  const [cutouts, setCutouts] = useState<(string | null)[]>(() =>
    SILHOUETTES.map(() => null),
  );
  // Which indices have finished keying — read synchronously by the cycler
  // so a cross-dissolve never lands on a frame that isn't ready yet.
  const readyRef = useRef<boolean[]>(SILHOUETTES.map(() => false));
  // Ambient auto-reveal — enabled once, unless the user prefers reduced
  // motion. Resolved in an effect to avoid an SSR/client mismatch.
  const [ambient, setAmbient] = useState(false);
  useEffect(() => setAmbient(!prefersReducedMotion()), []);
  // Two stacked layers we cross-dissolve between; each holds an index.
  // The hidden layer sits pre-loaded on the NEXT frame so the one that
  // fades in has already decoded — no placeholder flash mid-dissolve.
  const [layers, setLayers] = useState<[number, number]>([0, 1]);
  const [front, setFront] = useState(0);
  const frontRef = useRef(front);
  frontRef.current = front;
  const layersRef = useRef(layers);
  layersRef.current = layers;

  // Key every backdrop to transparent — but one at a time and in order,
  // so the first frame is ready in a fraction of the time it takes to
  // process all 9. The hero paints as soon as index 0 lands; the rest
  // stream in behind it and widen the pool the cross-dissolve draws from.
  useEffect(() => {
    let alive = true;
    const made: string[] = [];
    (async () => {
      for (let i = 0; i < SILHOUETTES.length; i++) {
        const s = SILHOUETTES[i];
        let url: string;
        try {
          url = await keyBackground(s.src, s.bg);
        } catch {
          url = s.src; // fall back to the raw frame rather than dropping it
        }
        if (!alive) {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
          return;
        }
        made.push(url);
        readyRef.current[i] = true;
        setCutouts((prev) => {
          const next = [...prev];
          next[i] = url;
          return next;
        });
      }
    })();
    return () => {
      alive = false;
      made.forEach((u) => u.startsWith("blob:") && URL.revokeObjectURL(u));
    };
  }, []);

  // Randomly cross-dissolve, once the first frame is ready.
  useEffect(() => {
    if (!cutouts[0] || prefersReducedMotion()) return; // rest on first frame
    const timers: number[] = [];
    const tick = () => {
      const oldFront = frontRef.current;
      const newFront = (oldFront ^ 1) as 0 | 1;
      // Only dissolve toward a frame that's finished keying — early on,
      // most of the pool is still null. If nothing else is ready yet,
      // hold the current frame and try again next beat.
      const visible = layersRef.current[newFront];
      const pool = readyRef.current
        .map((ok, i) => (ok && i !== visible ? i : -1))
        .filter((i) => i >= 0);
      if (!pool.length) {
        timers.push(window.setTimeout(tick, holdMs()));
        return;
      }
      setFront(newFront);
      timers.push(
        window.setTimeout(() => {
          const next = pool[Math.floor(Math.random() * pool.length)];
          const nextLayers = [...layersRef.current] as [number, number];
          nextLayers[oldFront] = next;
          setLayers(nextLayers);
        }, FADE_MS),
      );
      timers.push(window.setTimeout(tick, holdMs()));
    };
    timers.push(window.setTimeout(tick, holdMs()));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [cutouts]);

  if (!cutouts[0]) return null;

  return (
    <>
      {([0, 1] as const).map((slot) => {
        const url = cutouts[layers[slot]];
        const isFront = slot === front;
        // The back layer may point at a frame that's still keying — skip
        // it rather than let DitherReveal fall back to its remote default.
        if (!url) return null;
        return (
          <div
            key={slot}
            aria-hidden={isFront ? undefined : true}
            style={{
              position: "absolute",
              inset: 0,
              opacity: isFront ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease`,
              // Only the lit layer takes the cursor, so the reveal never
              // lands on the invisible one stacked over it.
              pointerEvents: isFront ? "auto" : "none",
            }}
          >
            <DitherReveal
              key={url}
              image={url}
              fit="cover"
              focusY={50}
              ditherStyle="bayer8"
              dotSize={3}
              revealRadius={130}
              revealSoftness={60}
              wave
              waveSpeed={30}
              waveDensity={18}
              // Faint self-driving reveal on the lit layer so the effect
              // hints at itself; the real cursor still takes over at full
              // strength. Skipped under reduced-motion.
              autoReveal={isFront && ambient}
              autoRevealStrength={0.75}
              // Only the visible layer renders; the hidden one freezes on
              // its last frame (it's opacity-0 anyway) — halves GPU load.
              paused={!isFront}
            />
          </div>
        );
      })}
    </>
  );
}
