/**
 * Generative placeholder for the hero dancer (spec: detoured PNG/WebP,
 * softly blurred). A stylized figure — arched back, arm overhead, weight
 * on one stiletto — reading impressionistically under blur. Swap for a
 * real cutout later by replacing this component's usage with next/image.
 */
export default function DancerSilhouette({
  className = "",
  fill = "var(--color-ink)",
  filterId,
}: {
  className?: string;
  fill?: string;
  /** Optional SVG filter reference (e.g. the liquid distortion). */
  filterId?: string;
}) {
  return (
    <svg
      viewBox="0 0 400 800"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g fill={fill} filter={filterId ? `url(#${filterId})` : undefined}>
        {/* head */}
        <circle cx="196" cy="88" r="33" />
        {/* torso → hips → front leg → stiletto */}
        <path
          d="M182 114
             C148 148 146 206 168 248
             C190 284 216 300 226 340
             C234 372 230 398 220 424
             C242 470 254 540 248 610
             C245 660 240 700 238 728
             L268 734 L214 750 L206 728
             C200 688 196 640 190 590
             C186 550 178 502 170 470
             C150 430 142 380 150 340
             C138 300 142 250 158 220
             C132 198 120 158 134 126
             C150 100 170 98 182 114 Z"
        />
        {/* arm swept low */}
        <path d="M170 182 C128 172 94 150 76 118 C68 104 74 90 88 96 C120 112 152 142 180 154 Z" />
        {/* arm raised overhead */}
        <path d="M214 168 C252 148 288 118 298 82 C302 68 316 70 314 86 C306 130 264 176 226 192 Z" />
        {/* back leg, bent */}
        <path d="M176 468 C160 520 148 570 150 618 C151 646 158 668 172 682 L186 672 C176 654 172 630 176 600 C180 560 190 520 198 486 Z" />
      </g>
    </svg>
  );
}
