"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/lib/i18n/context";

/**
 * The site menu — three routes: manifesto + collection (home anchors)
 * and the waitlist game (/classement). Visible as inline links on
 * desktop (lg); a hairline "menu" button opening a full-screen editorial
 * overlay below that.
 *
 * Anchors resolve relative to the home: on the home page they stay bare
 * (`#manifesto`) so Lenis smooth-scrolls; elsewhere they're prefixed
 * (`/fr#manifesto`) so the browser lands home and jumps to the section.
 */
export default function NavMenu() {
  const { dict, locale } = useDictionary();
  const H = dict.header;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pathname = usePathname();
  const isHome = pathname === `/${locale}`;
  const anchor = (hash: string) => (isHome ? hash : `/${locale}${hash}`);

  // Lock the scroll and wire Escape while the overlay is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const items = [
    { label: H.nav.manifesto, href: anchor("#manifesto") },
    { label: H.nav.collection, href: anchor("#collection") },
    { label: H.nav.join, href: `/${locale}/classement` },
  ];

  return (
    <>
      {/* Inline nav — only where there's room between the centered
          countdown and the vinyl (≥1400px), so the links can match the
          header's 13px without colliding. Three plain links. */}
      <nav
        aria-label={H.navAria}
        className="hidden items-center gap-4 min-[1400px]:flex"
      >
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="text-[13px] whitespace-nowrap tracking-[-0.19px] underline-offset-4 transition-opacity hover:underline hover:opacity-80"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Trigger — narrower viewports: a hairline "menu" with a two-rule
          glyph, same 13px as the rest of the header. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 text-[13px] tracking-[-0.19px] transition-opacity hover:opacity-80 min-[1400px]:hidden"
      >
        <span aria-hidden className="flex flex-col gap-[4px]">
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-4 bg-current" />
        </span>
        {H.menu}
      </button>

      {/* Overlay — portaled to body so it escapes the header's stacking
          context (z-50) and covers the banner (z-60) too. */}
      {open && mounted
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={H.navAria}
              className="fixed inset-0 z-[80] flex flex-col bg-night/95 backdrop-blur-md"
            >
              {/* dim heat glow, top-right, so the sheet isn't flat black */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 opacity-70"
                style={{
                  background:
                    "radial-gradient(60% 70% at 92% -8%, #ff7a2f 0%, rgba(196,64,143,0.28) 34%, transparent 64%)",
                }}
              />
              <div
                aria-hidden
                className="grain pointer-events-none absolute inset-0 -z-10 opacity-[0.25] mix-blend-soft-light"
              />

              <div className="flex items-center justify-end px-[17px] pt-[calc(var(--banner-h)+18px)] md:px-[29px]">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={H.close}
                  className="text-cream/70 hover:text-cream cursor-pointer text-sm tracking-[-0.19px] transition-colors"
                >
                  {H.close} ✕
                </button>
              </div>

              <nav
                aria-label={H.navAria}
                className="container-editorial flex flex-1 flex-col justify-center gap-3 pb-[12vh]"
              >
                {items.map((item, i) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group text-cream flex items-baseline gap-5 transition-opacity hover:opacity-80"
                  >
                    <span className="font-sans text-xs text-cream/40 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-[clamp(2.5rem,8vw,5.5rem)] leading-[1.02] italic">
                      {item.label}
                    </span>
                  </a>
                ))}
              </nav>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
