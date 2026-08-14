"use client";

import { usePathname } from "next/navigation";
import { useDictionary } from "@/lib/i18n/context";

const VARIANTS = [
  { path: "", label: "Dither" },
  { path: "/liquid", label: "Liquid" },
  { path: "/pulse", label: "Pulse" },
];

/**
 * Dev affordance for comparing the design proposals — remove (or
 * keep the chosen route only) before launch.
 */
export default function VariantSwitcher() {
  const { dict, locale } = useDictionary();
  const pathname = usePathname();
  return (
    <nav
      aria-label={dict.variantSwitcher.aria}
      className="surface-veil fixed bottom-5 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-1 rounded-pill p-1 text-xs"
    >
      {VARIANTS.map((v) => {
        const href = `/${locale}${v.path}`;
        return (
        <a
          key={v.path}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className={`rounded-pill px-3 py-1.5 transition-colors ${
            pathname === href
              ? "bg-cream text-night"
              : "text-cream/60 hover:text-cream"
          }`}
        >
          {v.label}
        </a>
        );
      })}
    </nav>
  );
}
