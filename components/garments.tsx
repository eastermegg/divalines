/**
 * Shared garment line-art — the brand's "lookbook that hasn't been shot
 * yet" language. Consumed by the LookViewer turntable (and the retired
 * CollectionTeaser plates). Strokes inherit currentColor; pathLength=1
 * normalizes every path so draw-ins are plain dashoffset tweens.
 */

/** Aluminium hanger — brushed-metal gradient stroke stays crisp. */
export function Hanger({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 108" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="alu" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8b8b94" />
          <stop offset="0.25" stopColor="#e9e9ef" />
          <stop offset="0.5" stopColor="#9a9aa4" />
          <stop offset="0.75" stopColor="#f2f2f6" />
          <stop offset="1" stopColor="#7e7e87" />
        </linearGradient>
      </defs>
      <path
        d="M100 36 L100 26 C100 15 88 16 89 8 C90 2 102 1 105 7"
        stroke="url(#alu)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M100 36 L24 92 Q19 97 27 98 L173 98 Q181 97 176 92 Z"
        stroke="url(#alu)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Garments as thin line drawings — outline + one interior detail line. */
const GARMENTS: Array<{ outline: string; detail: string }> = [
  {
    // bodysuit
    outline:
      "M76 6 L68 58 C54 84 50 112 54 140 C58 172 76 196 100 200 C124 196 142 172 146 140 C150 112 146 84 132 58 L124 6 L110 12 C106 42 94 42 90 12 Z",
    detail: "M68 58 C88 70 112 70 132 58",
  },
  {
    // wrap skirt
    outline: "M68 8 H132 L158 152 C118 174 82 174 42 152 Z",
    detail: "M70 22 C90 30 110 30 130 22 M100 24 L124 148",
  },
  {
    // second skin
    outline:
      "M72 8 L38 24 C22 60 18 110 24 152 C30 160 42 160 48 152 C45 116 47 84 54 60 L57 140 C59 172 70 190 100 192 C130 190 141 172 143 140 L146 60 C153 84 155 116 152 152 C158 160 170 160 176 152 C182 110 178 60 162 24 L128 8 C120 26 80 26 72 8 Z",
    detail: "M72 8 C80 22 120 22 128 8",
  },
  {
    // flare pant
    outline:
      "M72 6 H128 L136 88 L152 206 C138 220 124 220 116 208 L102 112 L88 208 C80 220 66 220 52 206 L68 88 Z",
    detail: "M72 20 H128",
  },
  {
    // crop top
    outline:
      "M62 8 L44 64 C62 78 76 82 100 82 C124 82 138 78 156 64 L138 8 L118 16 C112 38 88 38 82 16 Z",
    detail: "M82 16 C88 30 112 30 118 16",
  },
];

export function Garment({
  index,
  className = "",
}: {
  index: number;
  className?: string;
}) {
  const g = GARMENTS[index % GARMENTS.length];
  return (
    <svg viewBox="0 0 200 232" fill="none" className={className} aria-hidden="true">
      <path
        data-outline
        d={g.outline}
        pathLength={1}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        data-outline
        d={g.detail}
        pathLength={1}
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** One hung look — hanger + garment stacked, sized by its container. */
export function LookArt({
  index,
  className = "",
}: {
  index: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={className}>
      <Hanger className="mx-auto w-[44%]" />
      <Garment index={index} className="mx-auto -mt-[12%] w-[62%]" />
    </div>
  );
}
