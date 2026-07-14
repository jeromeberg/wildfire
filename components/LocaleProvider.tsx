"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { TRANSLATIONS, type Translations } from "@/lib/translations";
import { SITE } from "@/lib/config";
import type { Locale } from "@/lib/types";

const STORAGE_KEY = "fires-locale";
const LOCALE_EVENT = "fires-locale-change";

// A saved choice wins; otherwise detect from the browser. Only read on the
// client — getServerSnapshot below keeps SSR/hydration stable at SITE.defaultLocale.
function detectLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "fr") return stored;
  return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
}

function getServerSnapshot(): Locale {
  return SITE.defaultLocale;
}

// Notifies useSyncExternalStore when the locale changes: "storage" fires in
// OTHER tabs when localStorage changes, and our own setLocale() below
// dispatches LOCALE_EVENT so this same tab re-reads immediately too.
function subscribe(onChange: () => void) {
  window.addEventListener(LOCALE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LOCALE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function setLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale);
  window.dispatchEvent(new Event(LOCALE_EVENT));
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // SSR and the first client paint both use getServerSnapshot (SITE.defaultLocale,
  // "fr"), so there's no hydration mismatch; React re-reads via detectLocale()
  // right after hydration, which may flip to "en" for English-browser
  // first-time visitors (a one-time flash, consistent with /api/fires only
  // populating the map after mount too).
  const locale = useSyncExternalStore(subscribe, detectLocale, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = TRANSLATIONS[locale];

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
