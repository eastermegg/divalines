/**
 * Concentric neon waves hugging a portrait (spec §2.5): 1.5px pink
 * strokes, opacities 1 / .6 / .3. `pathLength=1` normalizes every ring so
 * the stroke-draw animation is a plain dashoffset 1→0 tween — no
 * getTotalLength needed.
 */
export default function NeonWaves({ className = "" }: { className?: string }) {
  const rings = [
    { rx: 118, ry: 168, opacity: 1 },
    { rx: 142, ry: 196, opacity: 0.6 },
    { rx: 166, ry: 224, opacity: 0.3 },
  ];
  return (
    <svg
      viewBox="0 0 380 480"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      {rings.map((r, i) => (
        <ellipse
          key={i}
          data-neon-ring
          cx="190"
          cy="248"
          rx={r.rx}
          ry={r.ry}
          pathLength={1}
          stroke="var(--color-neon-pink)"
          strokeWidth="1.5"
          opacity={r.opacity}
          transform={`rotate(${-8 + i * 4} 190 248)`}
        />
      ))}
    </svg>
  );
}
