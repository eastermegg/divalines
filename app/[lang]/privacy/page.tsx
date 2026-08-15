import type { Metadata } from "next";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { SITE, getReleaseDate } from "@/lib/site";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { fill } from "@/lib/i18n/fill";

type LangParams = { params: Promise<{ lang: string }> };

const CONTACT_EMAIL = "privacy@divalines.com";

export async function generateMetadata({
  params,
}: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(isLocale(lang) ? lang : "fr");
  return {
    title: `${dict.privacy.title} — ${SITE.name}`,
    robots: { index: false },
  };
}

export default async function PrivacyPage({ params }: LangParams) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "fr";
  const dict = getDictionary(locale);
  const p = dict.privacy;
  const releaseDate = getReleaseDate();

  const emailLink = (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className="text-heat-orange underline underline-offset-4 transition-colors hover:text-cream"
    >
      {CONTACT_EMAIL}
    </a>
  );

  return (
    <div id="top" className="overflow-x-clip">
      <SmoothScroll />
      <Header releaseDate={releaseDate} />

      <main>
        {/* Title band — warm heat glow + grain over the night page, the
            display wordmark voice: lowercase italic. */}
        <section className="relative isolate overflow-hidden pt-[calc(var(--header-h)+clamp(5rem,15vh,9.5rem))] pb-[clamp(4rem,9vh,7.5rem)]">
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
          <div className="container-editorial max-w-[72ch]">
            <a
              href={`/${locale}`}
              className="text-[11px] tracking-[0.3em] text-cream/50 uppercase transition-colors hover:text-cream"
            >
              ← {p.back}
            </a>
            <h1 className="mt-8 font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] text-cream italic lowercase">
              {p.title}
            </h1>
            <p className="mt-7 text-xs tracking-[0.08em] text-cream/45">{p.updated}</p>
          </div>
        </section>

        {/* Body */}
        <div className="container-editorial max-w-[72ch] pt-[clamp(3rem,8vh,6rem)] pb-[var(--section-gap)]">
          <p className="max-w-[62ch] text-[15px] leading-relaxed text-cream/70">
            {fill(p.intro, { name: SITE.name })}
          </p>

          <div className="mt-10">
            <Section h={p.controller.h}>
              <p>
                {p.controller.before}
                {emailLink}
                {p.controller.after}
              </p>
            </Section>

            <Section h={p.collect.h}>
              <p>{p.collect.p}</p>
            </Section>

            <Section h={p.why.h}>
              <p>{fill(p.why.p, { name: SITE.name })}</p>
            </Section>

            <Section h={p.where.h}>
              <p>{p.where.p}</p>
            </Section>

            <Section h={p.transfers.h}>
              <p>{p.transfers.p}</p>
            </Section>

            <Section h={p.howLong.h}>
              <p>{p.howLong.p}</p>
            </Section>

            <Section h={p.rights.h}>
              <p>
                {p.rights.before}
                {emailLink}
                {p.rights.after}
              </p>
            </Section>

            <Section h={p.cookies.h}>
              <p>{p.cookies.p}</p>
            </Section>

            <Section h={p.legal.h} id="legal">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Kicker>{p.legal.editorH}</Kicker>
                  <p>
                    {p.legal.editorBefore}
                    {emailLink}
                    {p.legal.editorAfter}
                  </p>
                </div>
                <div className="space-y-2">
                  <Kicker>{p.legal.hostH}</Kicker>
                  <p>{p.legal.hostBody}</p>
                </div>
                <div className="space-y-2">
                  <Kicker>{p.legal.ipH}</Kicker>
                  <p>{p.legal.ipBody}</p>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/** One privacy section — a hairline rule, a display-italic heading, and
 *  the copy. Consistent rhythm down the page. */
function Section({
  h,
  id,
  children,
}: {
  h: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-[calc(var(--header-h)+2rem)] border-t border-cream/10 py-11"
    >
      <h2 className="font-display text-[clamp(1.35rem,3vw,1.9rem)] text-cream italic lowercase">
        {h}
      </h2>
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-cream/70">
        {children}
      </div>
    </section>
  );
}

/** Small uppercase micro-label for the legal sub-blocks. */
function Kicker({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[11px] tracking-[0.24em] text-cream/45 uppercase">
      {children}
    </h3>
  );
}
