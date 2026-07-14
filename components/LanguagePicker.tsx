"use client";

import { useLocale } from "./LocaleProvider";
import type { Locale } from "@/lib/types";

const FLAG: Record<Locale, string> = { en: "🇺🇸", fr: "🇫🇷" };

export default function LanguagePicker() {
  const { locale, setLocale, t } = useLocale();
  const next: Locale = locale === "en" ? "fr" : "en";
  const label = locale === "en" ? t.nav.switchToFrench : t.nav.switchToEnglish;

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-lg leading-none text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-500"
    >
      <span aria-hidden>{FLAG[locale]}</span>
    </button>
  );
}
