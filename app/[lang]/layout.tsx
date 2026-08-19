import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { display, sans, serif } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { DictionaryProvider } from "@/lib/i18n/context";
import "../globals.css";

type LangParams = { params: Promise<{ lang: string }> };

/** Pre-render one static tree per locale. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LangParams): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(isLocale(lang) ? lang : "fr");
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, `/${locale}`]),
  );
  return {
    title: dict.site.title,
    description: dict.site.description,
    metadataBase: new URL(SITE.url),
    alternates: { canonical: `/${lang}`, languages },
    openGraph: {
      title: dict.site.title,
      description: dict.site.description,
      url: `${SITE.url}/${lang}`,
      siteName: SITE.name,
      locale: lang,
      type: "website",
      // Regenerate with `node scripts/og-image.mjs` after asset changes.
      images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.site.title,
      description: dict.site.description,
      images: ["/og.png"],
    },
  };
}

/**
 * Runs pre-paint: decides whether the intro preloader plays this session.
 * The preloader is display:none unless this marks the session "pending",
 * so no-JS visitors and returning sessions see the page immediately —
 * and React renders identical JSX either way (no hydration mismatch).
 */
const introScript = `try{document.documentElement.dataset.intro=sessionStorage.getItem("dl:intro")?"done":"pending"}catch(e){}`;

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode }> & LangParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = getDictionary(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    description: dict.site.description,
  };

  return (
    // suppressHydrationWarning: the inline intro script mutates data-intro
    // on <html> pre-hydration by design (attribute-level only).
    <html
      lang={locale}
      className={`${sans.variable} ${serif.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      {/* data-waitlist-closed: J-3 freeze flag (spec §4), read by
          WaitlistForm on mount. Baked at build — flipping WAITLIST_CLOSED
          on Vercel needs a redeploy; the API enforces it live regardless. */}
      <body
        data-waitlist-closed={
          process.env.WAITLIST_CLOSED === "true" ? "true" : undefined
        }
      >
        <DictionaryProvider dict={dict} locale={locale}>
          {children}
        </DictionaryProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
