"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";

const RADIUS = 60;
const MAX_PULL = 8;

/**
 * Magnetic wrapper (spec §3.4): within 60px the content leans toward the
 * cursor (≤8px, quickTo), snapping back elastically on exit. Inert on
 * touch/coarse pointers and under reduced motion — it renders children
 * with no listeners at all.
 */
export default function MagneticButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and (pointer: fine)`, () => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.3, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.3, ease: "power3.out" });
        let inside = false;

        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.hypot(dx, dy);
          const reach = Math.max(r.width, r.height) / 2 + RADIUS;

          if (dist < reach) {
            inside = true;
            xTo((dx / reach) * MAX_PULL);
            yTo((dy / reach) * MAX_PULL);
          } else if (inside) {
            inside = false;
            gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
          }
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={`inline-block ${className}`}>
      {children}
    </span>
  );
}
