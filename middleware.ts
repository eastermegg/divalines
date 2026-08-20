import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, locales } from "@/lib/i18n/config";

const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * The site is French-first: every first visit lands on /fr, whatever the
 * browser language says. Only an explicit choice (the language switcher
 * writes the NEXT_LOCALE cookie) routes elsewhere.
 */
function pickLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && isLocale(cookie)) return cookie;
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Already prefixed with a known locale → let it through.
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  // Otherwise redirect to the negotiated locale, preserving the path.
  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  // Skip Next internals, API routes, and any file with an extension
  // (robots.txt, sitemap.xml, icon.svg, images, fonts…).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
