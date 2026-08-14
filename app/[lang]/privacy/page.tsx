import type { Metadata } from "next";
import { SITE } from "@/lib/site";
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

  const emailLink = (
    <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2">
      {CONTACT_EMAIL}
    </a>
  );

  return (
    <main className="container-editorial max-w-[72ch] py-24">
      <a
        href={`/${locale}`}
        className="text-xs tracking-[0.14em] text-cream/50 uppercase hover:text-cream"
      >
        ← {p.back}
      </a>

      <h1 className="mt-8 font-serif text-3xl text-cream italic">{p.title}</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-cream/75">
        <section className="space-y-2">
          <h2 className="font-medium text-cream">{p.collect.h}</h2>
          <p>{p.collect.p}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-cream">{p.why.h}</h2>
          <p>{fill(p.why.p, { name: SITE.name })}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-cream">{p.where.h}</h2>
          <p>{p.where.p}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-cream">{p.howLong.h}</h2>
          <p>{p.howLong.p}</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-cream">{p.rights.h}</h2>
          <p>
            {p.rights.before}
            {emailLink}
            {p.rights.after}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-cream">{p.cookies.h}</h2>
          <p>{p.cookies.p}</p>
        </section>

        <section id="legal" className="space-y-2 border-t border-cream/10 pt-6">
          <h2 className="font-medium text-cream">{p.legal.h}</h2>
          <p>
            {SITE.name} — {dict.site.brandLine.join(" · ")}. {p.legal.body}{" "}
            {emailLink}.
          </p>
        </section>
      </div>
    </main>
  );
}
