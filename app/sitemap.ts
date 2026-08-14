import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { locales } from "@/lib/i18n/config";

/** One entry per locale for each indexable page, cross-linked via
 * `alternates.languages` so search engines pair the translations. */
export default function sitemap(): MetadataRoute.Sitemap {
  const languagesFor = (path: string) =>
    Object.fromEntries(locales.map((l) => [l, `${SITE.url}/${l}${path}`]));

  return locales.map((locale) => ({
    url: `${SITE.url}/${locale}`,
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages: languagesFor("") },
  }));
}
