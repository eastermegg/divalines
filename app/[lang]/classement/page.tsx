import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import AccentText, { plainText } from "@/components/AccentText";
import LeaderboardBoard from "@/components/LeaderboardBoard";
import WaitlistForm from "@/components/WaitlistForm";
import { PRIZE_TOP_N, SITE, getReleaseDate } from "@/lib/site";
import { fill } from "@/lib/i18n/fill";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type LangParams = { params: Promise<{ lang: string }> };

export async function generateMetadata({
  params,
}: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(isLocale(lang) ? lang : "fr");
  return {
    title: `${dict.leaderboard.metaTitle} · ${SITE.name}`,
    description: plainText(fill(dict.referral.rule, { top: PRIZE_TOP_N })),
  };
}

/**
 * The waitlist game's home — public top 10 (stage names only), your own
 * position, and the join/share block. Joining stays frictionless on the
 * landing page; this page is where the already-signed-up come back to
 * check, compare, and share ("je suis 3e 👀").
 */
export default async function ClassementPage({ params }: LangParams) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "fr";
  const dict = getDictionary(locale);
  const L = dict.leaderboard;
  const releaseDate = getReleaseDate();

  return (
    <div id="top" className="overflow-x-clip">
      <SmoothScroll />
      <Header releaseDate={releaseDate} />

      <main>
        {/* Title band — same warm heat glow as the privacy page */}
        {/* Title band — compact on purpose: the ranking must be visible
            without scrolling, the title just introduces it. */}
        <section className="relative isolate overflow-hidden pt-[calc(var(--banner-h)+var(--header-h)+clamp(1.75rem,4vh,3rem))] pb-[clamp(6.5rem,14vh,9.5rem)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-80"
            style={{
              background:
                "radial-gradient(70% 90% at 88% -10%, #ff7a2f 0%, rgba(196,64,143,0.35) 34%, transparent 66%)",
            }}
          />
          <div
            aria-hidden
            className="grain pointer-events-none absolute inset-0 -z-10 opacity-[0.28] mix-blend-soft-light"
          />
          {/* Breadcrumb, no eyebrow, then straight into the pitch. Same
              container width as the board below so left edges line up. */}
          <div className="container-editorial max-w-[720px] lg:max-w-[1200px]">
            <a
              href={`/${locale}`}
              className="text-[11px] tracking-[0.3em] text-cream/50 transition-colors hover:text-cream"
            >
              ← {SITE.name}
            </a>
            <h1 className="mt-4 font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.02] text-cream italic">
              {L.title.map((line) => (
                <span key={line} className="block">
                  <AccentText text={line} />
                </span>
              ))}
            </h1>
            {/* The rules, in one quiet line under the title. */}
            <p className="mt-4 text-sm text-cream/65">
              {fill(dict.referral.sharePitch, { top: PRIZE_TOP_N })}
            </p>
          </div>
        </section>

        {/* Side by side on desktop — top 10 left, card sticky right so
            form/link stay in view. Mobile keeps the funnel order: form
            (above the fold) → urgency → top 10. */}
        <div className="container-editorial relative z-10 max-w-[720px] pt-[clamp(0.75rem,2vh,1.25rem)] pb-[var(--section-gap)] lg:max-w-[1200px]">
          <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-x-16">
            {/* The board does NOT straddle the band (its rows would sit
                astride the grain seam) — it starts right below it. */}
            <div className="order-2 mt-[clamp(2.5rem,6vh,4rem)] lg:order-1 lg:mt-0">
              <LeaderboardBoard />
            </div>
            {/* Only the CARD straddles the title band (negative margin
                pulls it up into the glow); the board column stays put. */}
            <aside className="order-1 -mt-[clamp(6.5rem,14.5vh,9rem)] lg:order-2 lg:-mt-[clamp(5.5rem,12.5vh,8.25rem)]">
              <div className="lg:sticky lg:top-[calc(var(--banner-h)+var(--header-h)+2rem)]">
                <WaitlistForm compact expanded />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
