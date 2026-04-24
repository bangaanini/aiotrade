import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CalendarRange,
  CheckCircle2,
  CreditCard,
  FileText,
  Infinity,
  Link2,
  PlayCircle,
  Settings2,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { requireCurrentProfile } from "@/lib/auth";
import { getMemberDashboardStats } from "@/lib/member-dashboard-stats";
import { getMemberSubscription } from "@/lib/member-subscription";
import {
  memberGlassPanelClass,
  memberIconSurfaceClass,
  MemberPageHeader,
  memberSolidButtonClass,
  memberTextMutedClass,
  memberTextPrimaryClass,
  memberTextSecondaryClass,
} from "@/components/dashboard/member-ui";

type MemberStatCard = {
  accentClassName: string;
  icon: LucideIcon;
  label: string;
  value: string;
  valueIcon?: LucideIcon;
};

const quickLinks = [
  {
    description: "Kelola profil akun dan landing page.",
    href: "/dashboard/account/profile",
    icon: UserRound,
    label: "Buka menu akun",
    title: "Akun",
  },
  {
    description: "Panduan video untuk setup bot, materi lanjutan, dan file PDF.",
    href: "/dashboard/guides/activation",
    icon: BookOpen,
    label: "Lihat panduan",
    title: "Panduan",
  },
  {
    description: "Lihat masa aktif langganan anda.",
    href: "/dashboard/subscription",
    icon: CreditCard,
    label: "Cek langganan",
    title: "Langganan",
  },
] as const;

function formatMembershipDate(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(value);
}

function formatPlanDuration(durationMonths: number, isLifetime: boolean) {
  if (isLifetime) {
    return "Lifetime";
  }

  return `${durationMonths} bulan`;
}

export default async function DashboardPage() {
  const profile = await requireCurrentProfile();
  const [stats, membership] = await Promise.all([
    getMemberDashboardStats({
      isLpActive: profile.isLpActive,
      username: profile.username,
    }),
    getMemberSubscription(profile.id),
  ]);

  const statCards: MemberStatCard[] = [
    {
      accentClassName: "bg-sky-500/12 text-sky-700",
      icon: Users,
      label: "Referral Masuk",
      value: String(stats.referralCount),
    },
    {
      accentClassName: stats.landingPageActive ? "bg-emerald-500/12 text-emerald-700" : "bg-slate-400/14 text-slate-700",
      icon: Link2,
      label: "Landing Page",
      value: stats.landingPageActive ? "Active" : "Inactive",
    },
    {
      accentClassName: "bg-amber-500/12 text-amber-700",
      icon: BookOpen,
      label: "Total Panduan",
      value: String(stats.publishedGuideCount),
    },
    {
      accentClassName: "bg-violet-500/12 text-violet-700",
      icon: PlayCircle,
      label: "Video / PDF",
      value: `${stats.publishedVideoCount} / ${stats.publishedPdfCount}`,
      valueIcon: FileText,
    },
  ];

  const subscriptionToneClassName = membership?.isLifetime
    ? "bg-[linear-gradient(135deg,rgba(56,189,248,0.14)_0%,rgba(255,255,255,0)_42%,rgba(139,92,246,0.12)_100%)]"
    : "bg-[linear-gradient(135deg,rgba(16,185,129,0.12)_0%,rgba(255,255,255,0)_42%,rgba(245,158,11,0.12)_100%)]";

  return (
    <main className="flex-1 px-4 py-6 sm:px-5 lg:px-6 lg:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <MemberPageHeader
          badge="Dashboard"
          description="Ini pusat statistik member Anda."
          icon={Sparkles}
          title={`Halo, ${profile.username}`}
        />

        <section className={`px-6 py-6 sm:px-7 sm:py-7 ${memberGlassPanelClass}`}>
          <div className="flex items-start gap-3">
            <span className={memberIconSurfaceClass}>
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className={`text-[1.5rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>Statistik member</h2>
              <p className={`mt-1 text-sm leading-7 ${memberTextSecondaryClass}`}>
                Ringkasan performa referral dan panduan yang bisa Anda akses saat ini.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((item) => {
              const Icon = item.icon;
              const ValueIcon = item.valueIcon;

              return (
                <div
                  className="member-row-surface rounded-[24px] px-5 py-5"
                  key={item.label}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextMutedClass}`}>
                        {item.label}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <p className={`text-[1.7rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>{item.value}</p>
                        {ValueIcon ? <ValueIcon className="h-4 w-4 text-[var(--member-text-muted)]" /> : null}
                      </div>
                    </div>
                    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] ${item.accentClassName}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={`relative overflow-hidden px-6 py-6 sm:px-7 sm:py-7 ${memberGlassPanelClass}`}>
          <div className={`pointer-events-none absolute inset-0 ${subscriptionToneClassName}`} />
          <div className="relative">
            <div className="flex items-start gap-3">
              <span className={memberIconSurfaceClass}>
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <h2 className={`text-[1.5rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>Langganan aktif</h2>
                
              </div>
            </div>

            {membership ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
                <article className="member-row-surface overflow-hidden rounded-[26px] px-5 py-5 sm:px-6 sm:py-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Aktif
                        </span>
                        {membership.isLifetime ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                            <Infinity className="h-3.5 w-3.5" />
                            Lifetime
                          </span>
                        ) : null}
                      </div>
                      <h3 className={`mt-4 text-[1.7rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>
                        {membership.planLabel}
                      </h3>
                      
                    </div>

                    <Link
                      className={`${memberSolidButtonClass} h-11 px-4`}
                      href="/dashboard/subscription"
                    >
                      Detail langganan
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[22px] bg-white/55 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                      <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextMutedClass}`}>
                        Durasi paket
                      </p>
                      <div className={`mt-3 inline-flex items-center gap-2 text-lg font-semibold ${memberTextPrimaryClass}`}>
                        {membership.isLifetime ? <Infinity className="h-4 w-4" /> : <CalendarRange className="h-4 w-4" />}
                        {formatPlanDuration(membership.durationMonths, membership.isLifetime)}
                      </div>
                    </div>
                    <div className="rounded-[22px] bg-white/55 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                      <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextMutedClass}`}>
                        Mulai aktif
                      </p>
                      <p className={`mt-3 text-lg font-semibold ${memberTextPrimaryClass}`}>
                        {formatMembershipDate(membership.startedAt)}
                      </p>
                    </div>
                    <div className="rounded-[22px] bg-white/55 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                      <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextMutedClass}`}>
                        {membership.isLifetime ? "Masa akses" : "Berlaku sampai"}
                      </p>
                      <p className={`mt-3 text-lg font-semibold ${memberTextPrimaryClass}`}>
                        {membership.isLifetime ? "Seumur hidup" : formatMembershipDate(membership.expiresAt)}
                      </p>
                    </div>
                  </div>
                </article>

                
              </div>
            ) : (
              <div className="member-row-surface mt-6 rounded-[26px] px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className={`text-[1.35rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>
                      Belum ada data langganan
                    </h3>
                    <p className={`mt-2 max-w-2xl text-sm leading-7 ${memberTextSecondaryClass}`}>
                      Saat ini akun Anda belum memiliki membership yang tercatat. Data paket akan muncul otomatis di sini
                      setelah pendaftaran dan pembayaran selesai.
                    </p>
                  </div>
                  <Link className={`${memberSolidButtonClass} h-11 px-4`} href="/dashboard/subscription">
                    Buka menu langganan
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className={`px-6 py-6 sm:px-7 sm:py-7 ${memberGlassPanelClass}`}>
          <div className="flex items-start gap-3">
            <span className={memberIconSurfaceClass}>
              <Settings2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className={`text-[1.5rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>Akses cepat</h2>
              
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="member-row-surface member-row-surface-hover group rounded-[24px] px-5 py-5 transition duration-300 hover:-translate-y-0.5"
                  href={item.href}
                  key={item.href}
                >
                  <span className="member-icon-surface inline-flex h-11 w-11 items-center justify-center rounded-2xl transition group-hover:text-[var(--member-sidebar-active-text)]" style={{ background: "var(--member-icon-surface)" }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className={`mt-4 text-[1.2rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>{item.title}</h3>
                  <p className={`mt-2 text-sm leading-7 ${memberTextSecondaryClass}`}>{item.description}</p>
                  <span className={`mt-5 inline-flex items-center text-sm font-semibold ${memberTextPrimaryClass}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
