/**
 * i18n configuration. Locales are URL-prefixed (`/fr`, `/en`); the
 * default is used only when a visitor's Accept-Language matches nothing.
 * Add a locale here + a dictionary file and the middleware, routing and
 * language switcher all pick it up.
 */
export const locales = ["fr", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
