"use client";

import Link from "next/link";
import { BookOpen, KeyRound, LayoutDashboard, LogOut, Settings2, UserRound } from "lucide-react";
import { logoutAction } from "@/app/(protected)/account/actions";
import { cn } from "@/lib/utils";

type MemberSidebarProps = {
  isAdmin: boolean;
  pathname: string;
  username: string;
};

const items = [
  { href: "/dashboard", label: "Info Akun", icon: UserRound },
  { href: "/dashboard/guides", label: "Panduan", icon: BookOpen },
] as const;

export function MemberSidebar({ isAdmin, pathname, username }: MemberSidebarProps) {
  const isResetPasswordRoute = pathname === "/dashboard/reset-password";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-5 py-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
          <LayoutDashboard className="h-3.5 w-3.5" />
          Member Area
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-stone-950">Dashboard Member</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Akses informasi akun dan panduan.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition",
                  active
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-stone-50/80 text-stone-800 hover:bg-stone-100",
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-stone-200 px-4 py-4">
        <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
            Login sebagai
          </p>
          <p className="mt-1 text-sm font-semibold text-stone-950">@{username}</p>
        </div>

        <Link
          className={cn(
            "mt-3 flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition",
            isResetPasswordRoute
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-200 bg-stone-50/80 text-stone-800 hover:bg-stone-100",
          )}
          href="/dashboard/reset-password"
        >
          <KeyRound className="h-4 w-4" />
          Reset Password
        </Link>

        {isAdmin ? (
          <Link
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-sky-300 bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-800 transition hover:bg-sky-100"
            href="/admin"
          >
            <Settings2 className="h-4 w-4" />
            Admin Panel
          </Link>
        ) : null}

        <form action={logoutAction}>
          <button
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-900 transition hover:bg-stone-50"
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
