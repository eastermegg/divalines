"use client";

import { Wordmark } from "@/components/Brand";
import WaitlistForm from "@/components/WaitlistForm";
import { SITE, SOCIALS } from "@/lib/site";
import AccentText from "@/components/AccentText";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useDictionary } from "@/lib/i18n/context";

export default function Footer() {
  const { dict, locale } = useDictionary();
  return (
    <footer id="join" className="footer-heat relative isolate overflow-hidden">
      {/* Grain overlay — softens the gradient so it reads printed, not flat */}
      <div
        aria-hidden
        className="grain pointer-events-none absolute inset-0 -z-10 opacity-[0.38] mix-blend-soft-light"
      />
      <div className="w-full px-[17px] py-[clamp(4rem,10vh,8rem)] md:pr-[26px] md:pl-[29px]">
        {/* Centered join block — the slot the hero's fixed form docks
            into: same center axis, same width, so the handoff at the end
            of the scroll reads as the form settling in. */}
        <div className="mx-auto flex max-w-[720px] flex-col items-center gap-7 text-center">
          <p className="font-display text-manifesto text-night italic">
            <AccentText text={dict.footer.joinLine} />
          </p>
          <div data-footer-form className="w-full lg:max-w-[520px]">
            <WaitlistForm onLight />
          </div>
        </div>

        {/* Full wordmark signature — solid black fill, full-bleed (negative
            margins cancel the container padding) and widened so it bleeds off
            the left/right only; top/bottom stay intact. */}
        <div className="mt-16 -mx-[17px] flex justify-center overflow-hidden md:-mr-[26px] md:-ml-[29px]">
          <Wordmark className="w-[112%] max-w-none shrink-0 text-night" />
        </div>

        <div className="mt-16 flex flex-col gap-6 text-sm text-night/70 sm:flex-row sm:items-end sm:justify-between">
          <nav
            aria-label={dict.footer.socialLegalAria}
            className="flex flex-nowrap items-center gap-6 whitespace-nowrap"
          >
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-night"
              >
                {s.label}
              </a>
            ))}
            <a href={`/${locale}/classement`} className="transition-colors hover:text-night">
              {dict.header.board}
            </a>
            <a href={`/${locale}/privacy`} className="transition-colors hover:text-night">
              {dict.footer.privacy}
            </a>
            <a href={`/${locale}/privacy#legal`} className="transition-colors hover:text-night">
              {dict.footer.legal}
            </a>
            <LanguageSwitcher />
          </nav>

          <p>© 2026 {SITE.name}.</p>
        </div>
      </div>
    </footer>
  );
}
