import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { defaultLocale } from "@/lib/i18n/config";
import { en, type Dictionary } from "@/lib/i18n/dictionaries/en";
import { fr } from "@/lib/i18n/dictionaries/fr";

const dictionaries: Record<Locale, Dictionary> = { en, fr };

/** Server-side dictionary lookup, falling back to the default locale. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
