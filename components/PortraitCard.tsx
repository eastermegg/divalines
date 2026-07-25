import Image from "next/image";
import NeonWaves from "@/components/NeonWaves";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

interface PortraitCardProps {
  aspect?: "portrait" | "landscape";
  /** Real photo drop-in seam — when set, replaces the generative fill. */
  src?: string;
  alt?: string;
  /** Shifts the local heat source so no two cards glow identically. */
  heatFrom?: "left" | "center" | "right";
  rotate?: number;
  waves?: boolean;
  className?: string;
}

const HEAT_POS = { left: "20% 88%", center: "50% 92%", right: "80% 85%" };

/**
 * Portrait 4:5 / landscape 16:10 plate: square hairline frame, flat
 * duotone heat gradient, grain, neon wave overlay. No halo/radius —
 * sharp editorial treatment. data-card is the GSAP reveal hook.
 */
export default function PortraitCard({
  aspect = "portrait",
  src,
  alt = "",
  heatFrom = "center",
  rotate = 0,
  waves = true,
  className = "",
}: PortraitCardProps) {
  const gradient = `radial-gradient(130% 100% at ${HEAT_POS[heatFrom]}, var(--color-heat-glow) 0%, var(--color-heat-orange) 24%, var(--color-heat-magenta) 52%, var(--color-heat-violet) 74%, var(--color-night) 100%)`;

  return (
    <figure
      data-card
      className={`relative ${aspect === "portrait" ? "aspect-[4/5]" : "aspect-[16/10]"} ${className}`}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      {/* Sharp editorial plate: square corners, hairline frame, flat
          gradient — no halo, no inner blob (kept simple on request). */}
      <div className="relative size-full overflow-hidden border border-cream/12">
        {src ? (
          <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover" />
        ) : (
          <div aria-hidden="true" className="absolute inset-0" style={{ background: gradient }} />
        )}
        {/* duotone pull toward night + grain */}
        <div aria-hidden="true" className="absolute inset-0 bg-night/20 mix-blend-multiply" />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />
        {waves && (
          <NeonWaves className="absolute inset-0 size-full mix-blend-screen" />
        )}
      </div>
      {alt ? <figcaption className="sr-only">{alt}</figcaption> : null}
    </figure>
  );
}
