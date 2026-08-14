# DIVA LINES — waitlist site

One-page editorial waitlist for the Diva Lines heels-dancewear brand
(Paris). Built per `SPEC-DIVALINES.md`: Next.js 15 · TypeScript ·
Tailwind v4 · GSAP + Lenis · Supabase · Notion sync · Vercel.

## Three design proposals

The site ships as three complete visual versions sharing one foundation
(header, countdown, vinyl, waitlist form, footer, API). Compare them in
the browser with the switcher chip at the bottom:

| Route | Version | Character |
|---|---|---|
| `/` | **Heat** | Spec/Figma-faithful: rising heat gradient, silhouette parallax, word-by-word manifesto light-up |
| `/liquid` | **Liquid** | Drifting gradient blobs, feTurbulence-distorted silhouette, blob-morphing halos, floatier scroll |
| `/pulse` | **Night Pulse** | Three-plane parallax, breathing neon rings, marquee strip, scramble text, cursor-tilt cards |

Once a direction is chosen: keep its Hero/Manifesto as `/`, delete the
other two `components/variants/*` folders + routes, and remove
`components/VariantSwitcher.tsx`.

## Run it

```bash
pnpm install
pnpm dev          # zero env vars needed — API runs in logged dev mode
```

Don't run `pnpm build` while `pnpm dev` is running (they share `.next`;
the build clobbers the dev server's chunks).

## Backend

Leads land in Supabase (source of truth) and mirror to Notion via an
Edge Function + webhook. Nothing is provisioned yet — the app runs fully
without env vars; `POST /api/waitlist` validates (Zod), honeypots,
rate-limits (5/10min/IP, in-memory), then no-ops with a warning until
`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` exist. See **docs/SETUP.md**
for the full provisioning guide (Supabase → Notion → webhook → Vercel).

## Placeholders / drop-in seams

- **Fonts**: real brand faces self-hosted — Greed Narrow Medium Italic
  (display, TRIAL cut), Migra Italic Extralight (serif), Switzer
  (sans) — see `lib/fonts.ts` and `public/fonts/README.md`.
- **Images**: the dancer silhouette and portrait cards are generative
  (SVG + gradients). `PortraitCard` takes a `src` prop for real photos;
  replace `DancerSilhouette` with a detoured `next/image` when shot.
- **Audio**: drop `public/audio/loop.mp3` for the vinyl widget.

## Quality gates (verified)

- Lighthouse (desktop): 99 perf / 100 a11y / 100 best-practices / 100 SEO, LCP 0.6s
- Lighthouse (mobile, simulated): 93 / 100 / 100 / 100 (the once-per-session intro delays simulated LCP)
- First-load JS ≈ 174 kB gzipped (budget ≤ 250 kB)
- `prefers-reduced-motion`: no Lenis, no parallax/scrubs — static lit layout
- Keyboard-only pass, honeypot, silent duplicate handling, 429 rate limiting
- Intro plays once per session, skips on reload, invisible to no-JS visitors

Still to do on a real device: mobile Safari pass (text-stroke rendering,
`svh` behavior, backdrop-filter).
