"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { type CSSProperties, useEffect, useState } from "react";
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
  // The shader's field/back tone. Defaults to the night ink; pass
  // "transparent" (with a transparent colorDark) to let the page
  // backdrop show through the calm center instead of an opaque plate.
  colorBack = "#0E0A16",
  colorDark = "#0E0A16",
  // Grain strength. `grain` is the living overlay's opacity; `grainNoise`
  // is the shader's own grain; `grainBlur` (px) softens the gradient —
  // LOWER it to keep the shader grain crisp instead of melting it away.
  grain = 0.6,
  grainNoise = 0.55,
  grainBlur = 24,
  // How the living grain overlay blends. Default multiply melts it into
  // the night; on a dark/transparent field try "soft-light"/"overlay"
  // so it reads as even texture instead of dark blotches.
  grainBlend = "multiply",
  // Colour strength of the gradient — raise for a brighter, hotter field.
  intensity = 0.3,
}: {
  shape?: "wave" | "dots" | "truchet" | "corners" | "ripple" | "blob" | "sphere";
  speed?: number;
  className?: string;
  colorBack?: string;
  colorDark?: string;
  grain?: number;
  grainNoise?: number;
  grainBlur?: number;
  grainBlend?: CSSProperties["mixBlendMode"];
  intensity?: number;
}) {
  // Paper Shaders' colour parser only understands hex/rgb(a)/hsl(a) — the
  // CSS keyword "transparent" throws "Unsupported color format". Translate
  // it to a fully-transparent hex8 so callers can still pass "transparent"
  // to let the page backdrop show through.
  const toShaderColor = (c: string) =>
    c === "transparent" ? "#00000000" : c;
  const backColor = toShaderColor(colorBack);
  const darkColor = toShaderColor(colorDark);

  const [ready, setReady] = useState(false);
  // Boot the shader at its real speed from the very first render — the
  // ShaderMount stops its RAF whenever speed is 0 and doesn't reliably
  // restart on a 0→n hand-off, so starting at 0 leaves the gradient
  // frozen until an unrelated re-render kicks it. Reduced-motion drops
  // it back to 0 in the effect below.
  const [liveSpeed, setLiveSpeed] = useState(speed);

  useEffect(() => {
    setReady(true);
    setLiveSpeed(prefersReducedMotion() ? 0 : speed);
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
        colorBack={backColor}
        colors={[darkColor, darkColor, "#C489E8", "#FF5A12", "#FF9A4E", "#FFF1DC"]}
        shape={shape}
        softness={0.9}
        intensity={intensity}
        noise={grainNoise}
        speed={liveSpeed}
        scale={0.65}
        fit="cover"
        // blur melts band edges into pure glow — lower grainBlur keeps
        // the shader's grain crisp instead of smearing it away
        style={{ width: "100%", height: "100%", filter: `blur(${grainBlur}px)` }}
      />
      {/* the shader's own grain is blurred away with the field — this
          layer is the grain that actually lives (steps-looped, never
          stops), clipped to the hero by the wrapper */}
      <div
        aria-hidden="true"
        className="grain-live"
        style={{ opacity: grain, mixBlendMode: grainBlend }}
      />
    </div>
  );
}
