"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Animated grainy heat gradient (Paper Shaders) in the Diva palette —
 * night → violet → magenta → orange → glow, warm at the horizon.
 *
 * Layered ON TOP of the static CSS --gradient-heat so the first paint
 * (before the WebGL canvas boots) already shows the heat; the canvas
 * fades in over it. Under prefers-reduced-motion the shader stays on
 * speed 0 — a static grainy still, no animation.
 */
export default function HeatShaderBackground({
  shape = "corners",
  speed = 0.9,
  className = "",
}: {
  shape?: "wave" | "dots" | "truchet" | "corners" | "ripple" | "blob" | "sphere";
  speed?: number;
  className?: string;
}) {
  const [ready, setReady] = useState(false);
  const [liveSpeed, setLiveSpeed] = useState(0);

  useEffect(() => {
    setReady(true);
    if (!prefersReducedMotion()) setLiveSpeed(speed);
  }, [speed]);

  return (
    <div
      aria-hidden="true"
      // overflow-hidden: the grain layer is oversized (200%, -50% inset)
      // so its jump loop never shows an edge — without clipping it
      // spills onto the section below the hero.
      className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${
        ready ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      <GrainGradient
        colorBack="#0E0A16"
        colors={["#0E0A16", "#0E0A16", "#6E2BA8", "#C4408F", "#FF7A2F", "#FFD9A8"]}
        shape={shape}
        softness={0.9}
        intensity={0.3}
        noise={0.3}
        speed={liveSpeed}
        scale={0.65}
        fit="cover"
        // extra blur melts any remaining band edges into pure glow
        style={{ width: "100%", height: "100%", filter: "blur(24px)" }}
      />
      {/* the shader's own grain is blurred away with the field — this
          layer is the grain that actually lives (steps-looped, never
          stops), clipped to the hero by the wrapper */}
      <div aria-hidden="true" className="grain-live opacity-40" />
    </div>
  );
}
