"use client";

import { usePathname } from "next/navigation";

const VARIANTS = [
  { href: "/", label: "Heat" },
  { href: "/liquid", label: "Liquid" },
  { href: "/pulse", label: "Pulse" },
];

/**
 * Dev affordance for comparing the three design proposals — remove (or
 * keep the chosen route only) before launch.
 */
export default function VariantSwitcher() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Design versions"
      className="surface-veil fixed bottom-5 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-1 rounded-pill p-1 text-xs"
    >
      {VARIANTS.map((v) => (
        <a
          key={v.href}
          href={v.href}
          aria-current={pathname === v.href ? "page" : undefined}
          className={`rounded-pill px-3 py-1.5 transition-colors ${
            pathname === v.href
              ? "bg-cream text-night"
              : "text-cream/60 hover:text-cream"
          }`}
        >
          {v.label}
        </a>
      ))}
    </nav>
  );
}
