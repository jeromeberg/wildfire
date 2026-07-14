"use client";

import Link from "next/link";
import LanguagePicker from "./LanguagePicker";
import { useLocale } from "./LocaleProvider";

interface NavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

function SlidersIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <line x1="4" y1="7" x2="11" y2="7" />
      <line x1="17" y1="7" x2="20" y2="7" />
      <circle cx="14" cy="7" r="3" />
      <line x1="4" y1="17" x2="7" y2="17" />
      <line x1="13" y1="17" x2="20" y2="17" />
      <circle cx="10" cy="17" r="3" />
    </svg>
  );
}

export default function Navbar({ sidebarOpen, onToggleSidebar }: NavbarProps) {
  const { t } = useLocale();

  return (
    <header className="flex h-14 items-center justify-between bg-white px-6 shrink-0 border-b border-neutral-200">
      <div className="flex items-baseline gap-3">
        <h1 className="text-base font-semibold tracking-tight text-neutral-900">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span aria-hidden className="text-lg leading-none">
              🔥
            </span>
            Fires
          </Link>
        </h1>
        <p className="hidden text-sm text-neutral-500 sm:block">{t.nav.tagline}</p>
      </div>
      <div className="flex items-center gap-1">
        <LanguagePicker />
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-pressed={sidebarOpen}
          aria-label={sidebarOpen ? t.nav.closeOptions : t.nav.openOptions}
          title={sidebarOpen ? t.nav.closeOptions : t.nav.openOptions}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-500 ${
            sidebarOpen
              ? "bg-neutral-100 text-neutral-900"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          }`}
        >
          <SlidersIcon />
        </button>
      </div>
    </header>
  );
}
