"use client";

import { usePathname } from "next/navigation";
import { locales } from "@/lib/i18n/config";
import { useDictionary } from "@/lib/i18n/context";

/**
 * FR / EN toggle. Swaps the leading locale segment of the current path
 * and persists the choice in the NEXT_LOCALE cookie so the middleware
 * honours it on later visits. Plain <a> links keep it working with no JS.
 */
export default function LanguageSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const { dict, locale } = useDictionary();
  const pathname = usePathname();

  const pathFor = (target: string) => {
    const rest = pathname.replace(/^\/(fr|en)(?=\/|$)/, "");
    return `/${target}${rest}`;
  };

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="group"
      aria-label={dict.languageSwitcher.aria}
    >
      {locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden="true" className="opacity-40">/</span>}
          <a
            href={pathFor(loc)}
            hrefLang={loc}
            aria-current={loc === locale ? "true" : undefined}
            onClick={() => {
              document.cookie = `NEXT_LOCALE=${loc};path=/;max-age=31536000;samesite=lax`;
            }}
            className={`uppercase tracking-[0.14em] transition-colors ${
              loc === locale ? "text-night" : "hover:text-night"
            }`}
          >
            {dict.languageSwitcher[loc]}
          </a>
        </span>
      ))}
    </div>
  );
}
