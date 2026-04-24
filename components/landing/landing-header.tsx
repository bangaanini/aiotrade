"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { navItems } from "@/components/landing/data";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { SiteLanguageSelector } from "@/components/shared/site-language-selector";
import type { LandingTheme } from "@/lib/landing-theme";
import type { NavItem } from "@/components/landing/types";
import type { SiteLanguage, SiteLanguageOption } from "@/lib/site-language";
import { cn } from "@/lib/utils";

type LandingHeaderProps = {
  currentLanguage?: SiteLanguage;
  languages?: SiteLanguageOption[];
  navItems?: NavItem[];
  onThemeChange?: (theme: LandingTheme) => void;
  previewMode?: boolean;
  theme?: LandingTheme;
};

export function LandingHeader({
  currentLanguage = "id",
  languages = [],
  navItems: headerItems = navItems,
  onThemeChange,
  previewMode = false,
  theme = "light",
}: LandingHeaderProps) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [activeHref, setActiveHref] = useState(headerItems[0]?.href ?? "#fitur");
  const [isPinned, setIsPinned] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    if (!previewMode) {
      setIsScrolled(value > 32);
    }
  });

  useEffect(() => {
    if (previewMode) {
      return;
    }

    const sections = headerItems
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) {
      return;
    }

    let frame = 0;

    const syncActiveSection = () => {
      const marker = window.scrollY + 180;
      let nextActiveHref = headerItems[0]?.href ?? "#fitur";

      sections.forEach((section) => {
        if (marker >= section.offsetTop) {
          nextActiveHref = `#${section.id}`;
        }
      });

      setActiveHref((current) => (current === nextActiveHref ? current : nextActiveHref));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncActiveSection);
    };

    syncActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headerItems, previewMode]);

  useEffect(() => {
    if (previewMode) {
      return;
    }

    let frame = 0;

    const syncPinnedState = () => {
      const top = anchorRef.current?.getBoundingClientRect().top ?? 1;
      setIsPinned((current) => {
        const next = top <= 0;
        return current === next ? current : next;
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(syncPinnedState);
    };

    syncPinnedState();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [previewMode]);

  const activeItem = headerItems.find((item) => item.href === activeHref) ?? headerItems[0];

  return (
    <div className="relative z-40 h-[60px] sm:h-[70px]" ref={anchorRef}>
      <header
        className={cn(
          "landing-header-shell left-0 right-0 z-40 w-full backdrop-blur-2xl transition duration-300",
          previewMode ? "absolute top-0" : isPinned ? "fixed top-0" : "absolute top-0",
          !previewMode && isScrolled && "landing-header-shell-scrolled shadow-[0_16px_42px_rgba(0,0,0,0.36)]",
        )}
      >
        <motion.div
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="relative mx-auto flex min-h-[60px] w-full max-w-7xl items-center justify-center px-3 sm:min-h-[70px] sm:px-8 lg:px-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: -18 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex w-full items-center gap-2 sm:gap-4">
            <nav
              className="landing-header-nav no-scrollbar relative flex min-w-0 flex-1 items-center justify-start overflow-x-auto px-1 text-[0.82rem] sm:justify-center sm:px-4 sm:text-[1rem]"
              style={
                {
                  "--active-nav-accent": activeItem?.accent ?? "#10a7ff",
                } as CSSProperties
              }
            >
              <div className="flex min-w-max items-center gap-2 sm:gap-6">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-80"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--active-nav-accent) 58%, white 42%) 50%, transparent 100%)",
                  }}
                />
                {headerItems.map((item, index) => (
                  <div className="flex items-center gap-2 sm:gap-6" key={item.href}>
                    {index > 0 ? <span className="landing-header-divider">|</span> : null}
                    <motion.div
                      whileHover={prefersReducedMotion ? undefined : { y: -1.5 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                    >
                      <Link
                        className={cn(
                          "group relative inline-flex whitespace-nowrap rounded-md px-2 py-2 transition duration-300 hover:text-[var(--landing-header-active-text)] sm:px-3",
                          activeHref === item.href
                            ? "text-[var(--landing-header-active-text)]"
                            : "text-[var(--landing-header-text)]",
                        )}
                        href={item.href}
                        style={
                          activeHref === item.href
                            ? {
                                color: item.accent,
                                textShadow: `0 0 18px ${item.accent}22`,
                              }
                            : undefined
                        }
                      >
                        <span>{item.label}</span>
                        {activeHref === item.href ? (
                          <motion.span
                            className="absolute inset-x-2 bottom-0 h-[2px] rounded-full sm:inset-x-3"
                            layoutId="landing-active-nav"
                            style={{
                              backgroundColor: item.accent,
                              boxShadow: `0 0 18px ${item.accent}73`,
                            }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          />
                        ) : (
                          <span
                            className="absolute inset-x-2 bottom-0 h-px origin-center scale-x-0 transition duration-300 group-hover:scale-x-100 sm:inset-x-3"
                            style={{ backgroundColor: item.accent }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  </div>
                ))}
              </div>
            </nav>
            {!previewMode && onThemeChange ? (
              <div className="flex shrink-0 items-center gap-2">
                <span className="landing-header-divider hidden sm:inline">|</span>
                <SiteLanguageSelector
                  currentLanguage={currentLanguage}
                  languages={languages}
                  variant="landing"
                />
                <LandingThemeToggle onChange={onThemeChange} theme={theme} />
              </div>
            ) : null}
          </div>
        </motion.div>
      </header>
    </div>
  );
}
