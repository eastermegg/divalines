import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import AccentText, { plainText } from "@/components/AccentText";
import LeaderboardBoard from "@/components/LeaderboardBoard";
import WaitlistForm from "@/components/WaitlistForm";
import { SITE, getReleaseDate } from "@/lib/site";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type LangParams = { params: Promise<{ lang: string }> };

export async function generateMetadata({
  params,
}: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(isLocale(lang) ? lang : "fr");
  return {
    title: `${dict.leaderboard.metaTitle} — ${SITE.name}`,
    description: plainText(dict.referral.rule),
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
        <section className="relative isolate overflow-hidden pt-[calc(var(--header-h)+clamp(5rem,15vh,9.5rem))] pb-[clamp(3rem,7vh,5.5rem)]">
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
          <div className="container-editorial max-w-[720px]">
            <a
              href={`/${locale}`}
              className="text-[11px] tracking-[0.3em] text-cream/50 uppercase transition-colors hover:text-cream"
            >
              ← {SITE.name}
            </a>
            <p className="mt-8 text-[11px] tracking-[0.3em] text-cream/50">
              {L.eyebrow}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] text-cream italic lowercase">
              <AccentText text={L.title} />
            </h1>
            <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-cream/70">
              {dict.referral.rule}
            </p>
          </div>
        </section>

        {/* The board */}
        <div className="container-editorial max-w-[720px] pb-[clamp(3rem,7vh,5rem)]">
          <LeaderboardBoard />
        </div>

        {/* Join / your link — WaitlistForm already renders the right
            state: form for new visitors, ranking panel when signed up,
            frozen block when closed. */}
        <div className="container-editorial max-w-[720px] pb-[var(--section-gap)]">
          <p className="font-display mb-6 text-2xl text-cream italic sm:text-3xl">
            <AccentText text={L.joinTitle} />
          </p>
          <WaitlistForm compact />
        </div>
      </main>

      <Footer />
    </div>
  );
}
