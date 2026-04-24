"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings2,
  UserRound,
} from "lucide-react";
import { logoutAction } from "@/app/(protected)/account/actions";
import { MemberThemeToggle } from "@/components/dashboard/member-theme-toggle";
import type { MemberTheme } from "@/lib/member-theme";
import { cn } from "@/lib/utils";

type MemberSidebarProps = {
  isAdmin: boolean;
  onNavigate?: () => void;
  onThemeChange: (theme: MemberTheme) => void;
  pathname: string;
  theme: MemberTheme;
  username: string;
};

const primaryItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/subscription", label: "Langganan", icon: CreditCard },
] as const;

const guideItems = [
  { href: "/dashboard/guides/start", label: "Mulai" },
  { href: "/dashboard/guides/activation", label: "Setup Bot" },
  { href: "/dashboard/guides/bot-settings", label: "Materi Lanjutan" },
  { href: "/dashboard/guides/files", label: "File PDF" },
] as const;

const accountItems = [
  { href: "/dashboard/account/profile", label: "Profil" },
  { href: "/dashboard/account/landing-page", label: "Landing Page" },
  { href: "/dashboard/account/reset-password", label: "Reset Password" },
] as const;

export function MemberSidebar({ isAdmin, onNavigate, onThemeChange, pathname, theme, username }: MemberSidebarProps) {
  const resolvedPathname = usePathname() ?? pathname;
  const isGuidesRoute = resolvedPathname.startsWith("/dashboard/guides");
  const isAccountRoute =
    resolvedPathname.startsWith("/dashboard/account") || resolvedPathname === "/dashboard/reset-password";
  const [guidesExpanded, setGuidesExpanded] = useState(isGuidesRoute);
  const [accountExpanded, setAccountExpanded] = useState(isAccountRoute);
  const guidesOpen = isGuidesRoute || guidesExpanded;
  const accountOpen = isAccountRoute || accountExpanded;

  return (
    <div className="member-glass-panel flex h-full flex-col rounded-[30px] backdrop-blur-3xl">
      <div className="px-6 py-6">
        <div className="flex items-start justify-between gap-3">
          <div className="member-page-badge inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.24em]">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Member Area
          </div>
          <MemberThemeToggle onChange={onThemeChange} theme={theme} />
        </div>
        <h1 className="mt-5 text-[1.65rem] font-semibold tracking-tight text-[var(--member-text-primary)]">Dashboard Member</h1>
        <p className="mt-2 max-w-[16rem] text-sm leading-6 text-[var(--member-text-secondary)]">
          Akses informasi akun dan panduan.
        </p>
      </div>

      <div className="mx-6 h-px bg-[linear-gradient(90deg,transparent_0%,var(--member-grid-y)_18%,var(--member-grid-x)_82%,transparent_100%)]" />

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <nav className="space-y-3">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = resolvedPathname === item.href;

            return (
              <Link
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-sm font-semibold transition duration-300",
                  active
                    ? "text-[var(--member-sidebar-active-text)]"
                    : "member-row-surface member-row-surface-hover text-[var(--member-text-secondary)] hover:text-[var(--member-text-primary)]",
                )}
                href={item.href}
                key={item.href}
                onClick={onNavigate}
                style={active ? { background: "var(--member-sidebar-active-bg)", boxShadow: "var(--member-sidebar-active-shadow)" } : undefined}
              >
                <span
                  className="pointer-events-none absolute inset-x-3 top-0 h-px"
                  style={{
                    background: active
                      ? "var(--member-sidebar-active-highlight)"
                      : "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.72) 50%, rgba(255,255,255,0) 100%)",
                  }}
                />
                <span
                  className="pointer-events-none absolute -right-8 top-1/2 h-16 w-24 -translate-y-1/2 rounded-full blur-2xl"
                  style={{
                    background: active ? "var(--member-sidebar-active-glow)" : "rgba(255,255,255,0.22)",
                    opacity: active ? 1 : 0.8,
                  }}
                />
                <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.02)_42%,rgba(255,255,255,0)_100%)]" />
                <span
                  className={cn(
                    "relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-2xl transition",
                    active
                      ? "bg-white/18 text-[var(--member-sidebar-active-text)]"
                      : "member-icon-surface",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}

          <div
            className="space-y-2 rounded-[24px] p-2"
            style={{
              background: "var(--member-row-bg)",
              border: "1px solid var(--member-row-border)",
              boxShadow: "var(--member-row-shadow)",
            }}
          >
            <button
              className={cn(
                "relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition duration-300",
                isGuidesRoute
                  ? "text-[var(--member-sidebar-active-text)]"
                  : "member-row-surface text-[var(--member-text-secondary)] hover:text-[var(--member-text-primary)]",
              )}
              onClick={() => setGuidesExpanded((current) => !current)}
              style={isGuidesRoute ? { background: "var(--member-sidebar-active-bg)", boxShadow: "var(--member-sidebar-active-shadow)" } : undefined}
              type="button"
            >
              {isGuidesRoute ? (
                <>
                  <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-[var(--member-sidebar-active-highlight)]" />
                  <span className="pointer-events-none absolute -right-8 top-1/2 h-16 w-24 -translate-y-1/2 rounded-full bg-[var(--member-sidebar-active-glow)] blur-2xl" />
                </>
              ) : null}
              <span className="relative z-10 inline-flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
                    isGuidesRoute ? "bg-white/18 text-[var(--member-sidebar-active-text)]" : "member-icon-surface",
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                </span>
                Panduan
              </span>
              <ChevronDown className={cn("relative z-10 h-4 w-4 transition-transform duration-300", guidesOpen && "rotate-180")} />
            </button>

            <div
              className={cn(
                "grid overflow-hidden transition-[grid-template-rows] duration-300",
                guidesOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0">
                <div className="space-y-1 px-2 pb-2">
                  {guideItems.map((item) => {
                    const active = resolvedPathname === item.href;

                    return (
                      <Link
                        className={cn(
                          "relative block overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition",
                          active
                            ? "text-[var(--member-text-primary)] member-row-surface"
                            : "text-[var(--member-text-secondary)] hover:text-[var(--member-text-primary)]",
                        )}
                        href={item.href}
                        key={item.href}
                        onClick={onNavigate}
                        style={active ? { background: "var(--member-soft-button-hover-bg)", boxShadow: "var(--member-soft-button-hover-shadow)" } : undefined}
                      >
                        {active ? (
                          <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-[var(--member-sidebar-active-highlight)]" />
                        ) : null}
                        <span className="relative z-10">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div
            className="space-y-2 rounded-[24px] p-2"
            style={{
              background: "var(--member-row-bg)",
              border: "1px solid var(--member-row-border)",
              boxShadow: "var(--member-row-shadow)",
            }}
          >
            <button
              className={cn(
                "relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl px-4 py-3.5 text-left text-sm font-semibold transition duration-300",
                isAccountRoute
                  ? "text-[var(--member-sidebar-active-text)]"
                  : "member-row-surface text-[var(--member-text-secondary)] hover:text-[var(--member-text-primary)]",
              )}
              onClick={() => setAccountExpanded((current) => !current)}
              style={isAccountRoute ? { background: "var(--member-sidebar-active-bg)", boxShadow: "var(--member-sidebar-active-shadow)" } : undefined}
              type="button"
            >
              {isAccountRoute ? (
                <>
                  <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-[var(--member-sidebar-active-highlight)]" />
                  <span className="pointer-events-none absolute -right-8 top-1/2 h-16 w-24 -translate-y-1/2 rounded-full bg-[var(--member-sidebar-active-glow)] blur-2xl" />
                </>
              ) : null}
              <span className="relative z-10 inline-flex items-center gap-3">
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
                    isAccountRoute ? "bg-white/18 text-[var(--member-sidebar-active-text)]" : "member-icon-surface",
                  )}
                >
                  <UserRound className="h-4 w-4" />
                </span>
                Akun
              </span>
              <ChevronDown className={cn("relative z-10 h-4 w-4 transition-transform duration-300", accountOpen && "rotate-180")} />
            </button>

            <div
              className={cn(
                "grid overflow-hidden transition-[grid-template-rows] duration-300",
                accountOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0">
                <div className="space-y-1 px-2 pb-2">
                  {accountItems.map((item) => {
                    const active = resolvedPathname === item.href;

                    return (
                      <Link
                        className={cn(
                          "relative block overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition",
                          active
                            ? "text-[var(--member-text-primary)] member-row-surface"
                            : "text-[var(--member-text-secondary)] hover:text-[var(--member-text-primary)]",
                        )}
                        href={item.href}
                        key={item.href}
                        onClick={onNavigate}
                        style={active ? { background: "var(--member-soft-button-hover-bg)", boxShadow: "var(--member-soft-button-hover-shadow)" } : undefined}
                      >
                        {active ? (
                          <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-[var(--member-sidebar-active-highlight)]" />
                        ) : null}
                        <span className="relative z-10">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="px-5 pb-5">
        <div className="member-glass-row rounded-[24px] px-4 py-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--member-text-muted)]">
            Login sebagai
          </p>
          <p className="mt-2 text-base font-semibold text-[var(--member-text-primary)]">@{username}</p>
        </div>

        {isAdmin ? (
          <Link
            className="member-admin-link mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5"
            href="/admin"
            onClick={onNavigate}
          >
            <Settings2 className="h-4 w-4" />
            Admin Panel
          </Link>
        ) : null}

        <form action={logoutAction}>
          <button
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--member-row-border)] px-4 py-3 text-sm font-medium text-[var(--member-text-primary)] transition duration-300"
            onClick={onNavigate}
            style={{
              background: "var(--member-soft-button-bg)",
              boxShadow: "var(--member-soft-button-shadow)",
            }}
            type="submit"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
