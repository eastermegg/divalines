"use client";

import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MOTION_OK, prefersReducedMotion } from "@/lib/motion";
import { LookArt } from "./garments";
import AccentText from "@/components/AccentText";
import { fill, useDictionary } from "@/lib/i18n/context";
import { en } from "@/lib/i18n/dictionaries/en";

/**
 * Lookbook turntable — an infinite carousel of looks. Every piece sits
 * on a circular track addressed by its slot (signed shortest offset
 * from the active look, −2…+2): slot 0 spins on the platter, slots ±1
 * are the ghosted neighbours at the stage edges, slots ±2 wait
 * off-stage. Switching looks slides the whole train one step — the
 * ghost glides into the centre and starts to turn, the centre piece
 * flattens out and becomes a ghost, and the wrapping item teleports
 * across while invisible, so the loop never ends in either direction.
 *
 * The centre piece spins on itself: slow idle rotation you can grab
 * and throw (drag inertia melts back into the idle spin), with a live
 * degree readout and a tick-strip scrubber that doubles as the
 * keyboard control (a real slider). Names and spec rows scramble over
 * on each switch.
 *
 * The wireframe garments are placeholders for 360° photography — when
 * shot exists, feed frames per look (see COLLECTION in lib/site.ts)
 * and replace the layered LookArt stack with a frame-scrub; every
 * control here only reads/writes an angle, so nothing else changes.
 *
 * Reduced motion: no idle spin, no throw, instant look switches — the
 * scrubber still turns the piece because that motion is user-driven.
 */

/** Look count is structural (identical across locales), so the carousel
 * geometry reads it from the reference dictionary; the display copy comes
 * from the active locale via useDictionary() inside the component. */
const LOOK_COUNT = en.collection.items.length;
/** Three copies of the line art spread across Z — a flat drawing reads
 * as a card; layered it reads as a wireframe volume once it turns.
 * Side ghosts collapse to the single front layer (flat, no doubling). */
const DEPTHS = [-22, 0, 22];
const IDLE_DEG_PER_SEC = 16;
const DRAG_RATIO = 0.45; // px dragged → degrees turned
const SLOT_X = 38; // % of stage width per carousel step

/** Signed shortest offset of look i from the active one, in −2…+2. */
const slotOf = (i: number, active: number) =>
  ((((i - active) % LOOK_COUNT) + LOOK_COUNT + 2) % LOOK_COUNT) - 2;

const slotProps = (slot: number) => ({
  // x:0 clears the px offset GSAP parses from the SSR inline transform —
  // otherwise it stacks with xPercent and double-shifts the piece
  x: 0,
  xPercent: SLOT_X * slot,
  scale: slot === 0 ? 1 : 0.52,
  autoAlpha: slot === 0 ? 1 : Math.abs(slot) === 1 ? 0.16 : 0,
});

const layerOpacity = (slot: number, depth: number) =>
  depth === 0 ? (slot === 0 ? 0.95 : 1) : slot === 0 ? 0.3 : 0;

export default function LookViewer() {
  const { dict } = useDictionary();
  const COLLECTION = dict.collection;
  const LOOKS = COLLECTION.items;
  const sectionRef = useRef<HTMLElement>(null);
  const platterRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const metaRef = useRef<HTMLDListElement>(null);
  const degRef = useRef<HTMLSpanElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tableRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [active, setActive] = useState(0);
  const spin = useRef({
    angle: 0,
    v: 0, // deg per frame, decays into the idle spin
    dragging: false,
    lastX: 0,
    inView: false,
    stripW: 0,
    lastDeg: -1,
  });
  /** rotationY setter bound to whichever look holds the centre slot */
  const rotSet = useRef<((v: number) => void) | null>(null);
  const prevSlots = useRef<number[] | null>(null);
  const prevActive = useRef(0);
  const switching = useRef(false);
  const switchDir = useRef<1 | -1>(1);

  /* ---- angle engine: one ticker drives table, platter, readout ---- */
  useGSAP(
    () => {
      const setPlatter = gsap.quickSetter(platterRef.current!, "rotation", "deg");
      const setCursor = gsap.quickSetter(cursorRef.current!, "x", "px");
      const reduced = prefersReducedMotion();

      const measure = () => {
        spin.current.stripW = stripRef.current?.clientWidth ?? 0;
      };
      measure();
      const ro = new ResizeObserver(measure);
      if (stripRef.current) ro.observe(stripRef.current);

      // don't burn frames while the section is offscreen
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          spin.current.inView = self.isActive;
        },
      });

      const tick = (_t: number, dtMs: number) => {
        const s = spin.current;
        if (!s.inView) return;
        const dt = Math.min(dtMs, 50) / 1000;
        if (!s.dragging) {
          // throw velocity eases into the idle spin (or to rest, reduced)
          const target = reduced ? 0 : IDLE_DEG_PER_SEC * dt;
          s.v += (target - s.v) * Math.min(1, dt * 2.5);
          s.angle += s.v;
        }
        rotSet.current?.(s.angle);
        setPlatter(s.angle);
        const deg = Math.round(((s.angle % 360) + 360) % 360) % 360;
        if (deg !== s.lastDeg) {
          s.lastDeg = deg;
          if (degRef.current)
            degRef.current.textContent = String(deg).padStart(3, "0");
          stripRef.current?.setAttribute("aria-valuenow", String(deg));
          setCursor((deg / 360) * s.stripW);
        }
      };
      gsap.ticker.add(tick);

      // scroll entrance — header, widget, stage, rail rise in sequence
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-reveal]", {
          y: 44,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        });
        // initial active look sketches itself in (ghosts stay drawn)
        const first = tableRefs.current[0];
        if (first) {
          gsap.fromTo(
            first.querySelectorAll("[data-outline]"),
            { strokeDasharray: "1 1", strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              duration: 1.6,
              stagger: 0.1,
              ease: "power2.inOut",
              scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
            },
          );
        }
      });

      return () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
        st.kill();
      };
    },
    { scope: sectionRef },
  );

  /* ---- carousel: every look tweens (or wraps) to its new slot ---- */
  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const first = prevSlots.current === null;
      const dir = switchDir.current;
      const slots = LOOKS.map((_, i) => slotOf(i, active));

      slots.forEach((slot, i) => {
        const el = slotRefs.current[i];
        if (!el) return;
        const old = prevSlots.current?.[i] ?? slot;
        // wrapping items (−2 ↔ +2) jump while invisible — that's the
        // seam of the infinite loop
        const jump = first || reduced || Math.abs(slot - old) > 1;
        if (jump) gsap.set(el, slotProps(slot));
        else if (slot !== old)
          gsap.to(el, {
            ...slotProps(slot),
            duration: 0.85,
            ease: "power3.inOut",
            overwrite: "auto",
          });
        el.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
          const o = layerOpacity(slot, Number(layer.dataset.depth));
          if (jump) gsap.set(layer, { opacity: o });
          else gsap.to(layer, { opacity: o, duration: 0.85, ease: "power2.inOut" });
        });
      });

      // hand the spin to the new centre piece
      const table = tableRefs.current[active];
      if (table)
        rotSet.current = gsap.quickSetter(table, "rotationY", "deg") as (
          v: number,
        ) => void;

      if (!first && prevActive.current !== active) {
        // outgoing centre settles flat as it becomes a ghost
        const old = tableRefs.current[prevActive.current];
        if (old) {
          const cur = Number(gsap.getProperty(old, "rotationY"));
          if (reduced) gsap.set(old, { rotationY: 0 });
          else
            gsap.to(old, {
              rotationY: Math.round(cur / 360) * 360,
              duration: 0.85,
              ease: "power3.out",
            });
        }
        // incoming piece arrives facing front with a push in the
        // travel direction, then melts into the idle spin
        spin.current.angle = 0;
        spin.current.v = reduced ? 0 : dir * 1.6;
        spin.current.lastDeg = -1;

        if (!reduced) {
          // text is already swapped by React — scramble settles onto it
          gsap.to(nameRef.current, {
            duration: 0.9,
            scrambleText: {
              text: LOOKS[active].name,
              chars: "lowerCase",
              speed: 0.6,
            },
          });
          metaRef.current
            ?.querySelectorAll<HTMLElement>("[data-scramble]")
            .forEach((el, i) => {
              gsap.to(el, {
                duration: 0.6,
                delay: 0.1 + i * 0.08,
                scrambleText: {
                  text: el.textContent ?? "",
                  chars: "lowerCase",
                  speed: 0.5,
                },
              });
            });
          gsap.delayedCall(0.9, () => {
            switching.current = false;
          });
        }
      }

      prevSlots.current = slots;
      prevActive.current = active;
    },
    { scope: sectionRef, dependencies: [active] },
  );

  const go = (dir: 1 | -1) => {
    if (switching.current) return;
    const next = (active + dir + LOOKS.length) % LOOKS.length;
    if (!prefersReducedMotion()) {
      switching.current = true;
      switchDir.current = dir;
    }
    setActive(next);
  };

  /** Hover on a side hit-zone warms the ghost it would bring in. */
  const glow = (i: number, on: boolean) => {
    if (switching.current) return;
    const el = slotRefs.current[i];
    if (el)
      gsap.to(el, {
        autoAlpha: on ? 0.34 : 0.16,
        duration: 0.35,
        overwrite: "auto",
      });
  };

  /* ---- drag to spin ---- */
  const onStageDown = (e: React.PointerEvent<HTMLDivElement>) => {
    spin.current.dragging = true;
    spin.current.lastX = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onStageMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = spin.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    s.lastX = e.clientX;
    s.angle += dx * DRAG_RATIO;
    s.v = dx * DRAG_RATIO;
  };
  const onStageUp = () => {
    spin.current.dragging = false;
  };

  /* ---- tick-strip scrubber (also the keyboard control) ---- */
  const scrubTo = (clientX: number) => {
    const strip = stripRef.current;
    if (!strip) return;
    const r = strip.getBoundingClientRect();
    const pct = gsap.utils.clamp(0, 1, (clientX - r.left) / r.width);
    const s = spin.current;
    const current = ((s.angle % 360) + 360) % 360;
    s.angle += pct * 360 - current;
    s.v = 0;
  };
  const onStripDown = (e: React.PointerEvent<HTMLDivElement>) => {
    spin.current.dragging = true; // pause idle spin while scrubbing
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubTo(e.clientX);
  };
  const onStripMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (spin.current.dragging) scrubTo(e.clientX);
  };
  const onStripKey = (e: React.KeyboardEvent) => {
    const s = spin.current;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") s.angle += 15;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") s.angle -= 15;
    else return;
    e.preventDefault();
    s.v = 0;
  };

  const look = LOOKS[active];
  const prevI = (active - 1 + LOOKS.length) % LOOKS.length;
  const nextI = (active + 1) % LOOKS.length;

  return (
    <section
      ref={sectionRef}
      id="collection"
      aria-labelledby="collection-title"
      className="relative overflow-x-clip py-[var(--section-gap)]"
    >
      <div className="container-editorial">
        <div data-reveal>
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
        </div>

        {/* viewer header — counter, look name, angle widget */}
        <header data-reveal className="mt-16 lg:mt-20">
          <p className="text-xs tracking-[0.3em] text-cream/50 uppercase tabular-nums">
            look {String(active + 1).padStart(2, "0")} /{" "}
            {String(LOOKS.length).padStart(2, "0")}
          </p>
          <h3
            ref={nameRef}
            className="mt-2 font-display text-[clamp(2.5rem,6.5vw,5.5rem)] leading-none text-cream italic"
          >
            {look.name}
          </h3>
          <p className="sr-only" aria-live="polite">
            {fill(dict.look.srCount, {
              n: active + 1,
              total: LOOKS.length,
              name: look.name,
            })}
          </p>

          <div className="mt-6 flex items-center gap-5">
            <p className="text-xs tracking-[0.2em] text-cream/60 tabular-nums">
              <span ref={degRef}>000</span>°{" "}
              <span className="text-cream/30">/ 360°</span>
            </p>
            <div
              ref={stripRef}
              role="slider"
              tabIndex={0}
              aria-label={dict.look.turntableAngle}
              aria-valuemin={0}
              aria-valuemax={359}
              aria-valuenow={0}
              onPointerDown={onStripDown}
              onPointerMove={onStripMove}
              onPointerUp={onStageUp}
              onPointerCancel={onStageUp}
              onKeyDown={onStripKey}
              className="relative h-6 w-56 max-w-[50vw] cursor-ew-resize touch-none select-none"
            >
              <div className="absolute inset-0 flex items-center justify-between">
                {Array.from({ length: 41 }, (_, i) => (
                  <span
                    key={i}
                    className={`w-px bg-cream/25 ${i % 5 === 0 ? "h-3.5" : "h-2"}`}
                  />
                ))}
              </div>
              <div
                ref={cursorRef}
                className="absolute top-1 left-0 h-4 w-[3px] bg-neon-pink"
              />
            </div>
          </div>
        </header>

        <div className="relative mt-6 lg:mt-0">
          {/* stage */}
          <div data-reveal className="relative h-[min(66vh,620px)]">
            {/* under-glow + platter */}
            <div className="absolute bottom-[4%] left-1/2 h-36 w-[68%] -translate-x-1/2 rounded-[100%] bg-heat-magenta/12 blur-3xl" />
            <div
              className="absolute bottom-[2%] left-1/2 h-[300px] w-[300px] sm:h-[360px] sm:w-[360px]"
              style={{ transform: "translate(-50%, 42%) scaleY(0.3)" }}
            >
              <div
                ref={platterRef}
                className="h-full w-full rounded-full border border-dashed border-cream/35"
              />
              <div className="absolute inset-[12%] rounded-full border border-cream/12" />
            </div>

            {/* carousel track — every look, addressed by slot. Inline
                styles mirror the initial slot layout so the server
                render matches; GSAP owns them after hydration (they
                derive from the constant initial active=0, so React
                never rewrites them). */}
            <div className="pointer-events-none absolute inset-0 [perspective:1200px]">
              {LOOKS.map((item, i) => {
                const slot0 = slotOf(i, 0);
                const p = slotProps(slot0);
                return (
                  <div
                    key={item.n}
                    ref={(el) => {
                      slotRefs.current[i] = el;
                    }}
                    className="absolute inset-0 flex items-center justify-center will-change-transform"
                    style={{
                      transform: `translateX(${p.xPercent}%) scale(${p.scale})`,
                      opacity: p.autoAlpha,
                      visibility: p.autoAlpha === 0 ? "hidden" : undefined,
                    }}
                  >
                    <div
                      ref={(el) => {
                        tableRefs.current[i] = el;
                      }}
                      className="relative h-[88%] max-w-full aspect-[4/5]"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {DEPTHS.map((z) => (
                        <div
                          key={z}
                          data-depth={z}
                          className="absolute inset-0 text-cream/80"
                          style={{
                            transform: `translateZ(${z}px)`,
                            opacity: layerOpacity(slot0, z),
                          }}
                        >
                          <LookArt index={i} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* turntable drag surface */}
            <div
              onPointerDown={onStageDown}
              onPointerMove={onStageMove}
              onPointerUp={onStageUp}
              onPointerCancel={onStageUp}
              className="absolute inset-0 cursor-grab select-none active:cursor-grabbing"
              style={{ touchAction: "pan-y" }}
            />

            {/* side hit-zones — step the carousel */}
            <button
              type="button"
              onClick={() => go(-1)}
              onMouseEnter={() => glow(prevI, true)}
              onMouseLeave={() => glow(prevI, false)}
              aria-label={fill(dict.look.prev, { name: LOOKS[prevI].name })}
              className="absolute top-1/2 left-0 z-10 h-[60%] w-[18%] -translate-y-1/2 cursor-w-resize"
            />
            <button
              type="button"
              onClick={() => go(1)}
              onMouseEnter={() => glow(nextI, true)}
              onMouseLeave={() => glow(nextI, false)}
              aria-label={fill(dict.look.next, { name: LOOKS[nextI].name })}
              className="absolute top-1/2 right-0 z-10 h-[60%] w-[18%] -translate-y-1/2 cursor-e-resize"
            />

            <p className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] text-cream/35 uppercase">
              {COLLECTION.hint}
            </p>
          </div>

          {/* spec rail — overlays the stage on desktop, stacks below on mobile */}
          <dl
            ref={metaRef}
            data-reveal
            className="mt-10 grid max-w-sm gap-5 lg:pointer-events-none lg:absolute lg:top-1/2 lg:left-0 lg:z-20 lg:mt-0 lg:w-48 lg:-translate-y-1/2"
          >
            {look.details.map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[72px_1fr] items-baseline gap-4 lg:grid-cols-1 lg:gap-1"
              >
                <dt className="text-[10px] tracking-[0.3em] text-cream/40 uppercase">
                  {label}
                </dt>
                <dd data-scramble className="text-sm text-cream/85">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
