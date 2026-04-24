"use client";

import { ChevronDown, Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  SITE_LANGUAGE_COOKIE,
  type SiteLanguage,
  type SiteLanguageOption,
} from "@/lib/site-language";
import { cn } from "@/lib/utils";

type SiteLanguageSelectorProps = {
  currentLanguage: SiteLanguage;
  languages: SiteLanguageOption[];
  variant?: "landing" | "member";
};

export function SiteLanguageSelector({
  currentLanguage,
  languages,
  variant = "landing",
}: SiteLanguageSelectorProps) {
  const router = useRouter();

  function handleChange(nextLanguage: SiteLanguage) {
    if (!nextLanguage || nextLanguage === currentLanguage) {
      return;
    }

    document.cookie = `${SITE_LANGUAGE_COOKIE}=${nextLanguage}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <label
      className={cn(
        "relative inline-flex h-10 items-center overflow-hidden rounded-2xl border pl-3 pr-9 backdrop-blur-xl transition",
        variant === "landing"
          ? "border-white/14 bg-white/8 text-[var(--landing-header-text)] shadow-[0_10px_28px_rgba(15,23,42,0.12)]"
          : "border-[var(--member-row-border)] bg-[var(--member-soft-button-bg)] text-[var(--member-text-primary)] shadow-[var(--member-soft-button-shadow)]",
      )}
    >
      <Languages
        className={cn(
          "mr-2 h-4 w-4 shrink-0",
          variant === "landing" ? "text-[var(--landing-header-text)]" : "text-[var(--member-text-secondary)]",
        )}
      />
      <select
        aria-label="Pilih bahasa"
        className="h-full appearance-none bg-transparent pr-1 text-sm font-medium outline-none"
        onChange={(event) => handleChange(event.target.value)}
        value={currentLanguage}
      >
        {languages.map((language) => (
          <option className="text-slate-900" key={language.language} value={language.language}>
            {language.name}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-3 h-4 w-4",
          variant === "landing" ? "text-[var(--landing-header-text)]" : "text-[var(--member-text-secondary)]",
        )}
      />
    </label>
  );
}
