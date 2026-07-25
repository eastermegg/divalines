import type { Metadata } from "next";
import { sans, serif } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
};

/**
 * Runs pre-paint: decides whether the intro preloader plays this session.
 * The preloader is display:none unless this marks the session "pending",
 * so no-JS visitors and returning sessions see the page immediately —
 * and React renders identical JSX either way (no hydration mismatch).
 */
const introScript = `try{document.documentElement.dataset.intro=sessionStorage.getItem("dl:intro")?"done":"pending"}catch(e){}`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the inline intro script mutates data-intro
    // on <html> pre-hydration by design (attribute-level only).
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
