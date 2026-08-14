"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type DictionaryValue = { dict: Dictionary; locale: Locale };

const DictionaryContext = createContext<DictionaryValue | null>(null);

/**
 * Supplies the active dictionary + locale to client components. Mounted
 * once in app/[lang]/layout.tsx with the server-loaded dictionary; the
 * dictionary is a plain serializable object, so it crosses the RSC
 * boundary as a prop with no extra work.
 */
export function DictionaryProvider({
  dict,
  locale,
  children,
}: DictionaryValue & { children: React.ReactNode }) {
  return (
    <DictionaryContext.Provider value={{ dict, locale }}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary(): DictionaryValue {
  const value = useContext(DictionaryContext);
  if (!value) {
    throw new Error("useDictionary must be used within a DictionaryProvider");
  }
  return value;
}
