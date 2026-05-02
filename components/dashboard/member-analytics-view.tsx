import Link from "next/link";
import {
  BarChart3,
  Clock3,
  ExternalLink,
  Globe2,
  Link2,
  MonitorSmartphone,
  MousePointerClick,
  Users,
  type LucideIcon,
} from "lucide-react";
import { analyticsRangeOptions, type AnalyticsRange } from "@/lib/admin-analytics";
import type { MemberLandingPageAnalyticsSnapshot } from "@/lib/member-landing-page-analytics";
import {
  memberGlassPanelClass,
  memberGlassRowClass,
  memberIconSurfaceClass,
  MemberPageHeader,
  memberSoftButtonClass,
  memberTextMutedClass,
  memberTextPrimaryClass,
  memberTextSecondaryClass,
} from "@/components/dashboard/member-ui";
import { cn } from "@/lib/utils";

type MemberAnalyticsViewProps = {
  analytics: MemberLandingPageAnalyticsSnapshot;
  isLandingPageActive: boolean;
  range: AnalyticsRange;
  username: string;
};

const rangeLabels = {
  "7d": "7 Hari",
  "30d": "30 Hari",
  "90d": "90 Hari",
} satisfies Record<AnalyticsRange, string>;

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatCountry(value: string) {
  if (!value || value === "Unknown" || value.length !== 2) {
    return value || "Unknown";
  }

  try {
    return new Intl.DisplayNames(["id"], { type: "region" }).of(value) ?? value;
  } catch {
    return value;
  }
}

function formatDevice(value: string | null) {
  if (!value || value === "unknown") {
    return "Unknown";
  }

  const labels: Record<string, string> = {
    bot: "Bot",
    desktop: "Desktop",
    mobile: "Mobile",
    tablet: "Tablet",
  };

  return labels[value] ?? value;
}

function formatReferrer(value: string | null) {
  if (!value) {
    return "-";
  }

  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return value;
  }
}

function MetricCard({
  description,
  icon: Icon,
  label,
  value,
}: {
  description: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="member-row-surface rounded-[24px] px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextMutedClass}`}>
            {label}
          </p>
          <p className={`mt-3 text-[1.55rem] font-semibold tracking-tight sm:text-[1.75rem] ${memberTextPrimaryClass}`}>
            {value}
          </p>
          <p className={`mt-2 text-sm leading-6 ${memberTextSecondaryClass}`}>{description}</p>
        </div>
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/12 text-sky-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[160px] items-center justify-center rounded-[24px] border border-dashed border-[var(--member-row-border)] px-5 text-center text-sm leading-7 text-[var(--member-text-muted)]">
      {label}
    </div>
  );
}

function DailyChart({
  data,
}: {
  data: MemberLandingPageAnalyticsSnapshot["daily"];
}) {
  const maxViews = Math.max(...data.map((item) => item.views), 1);

  return (
    <section className={`px-6 py-6 sm:px-7 sm:py-7 ${memberGlassPanelClass}`}>
      <div className="flex items-start gap-3">
        <span className={memberIconSurfaceClass}>
          <BarChart3 className="h-5 w-5" />
        </span>
        <div>
          <h2 className={`text-[1.32rem] font-semibold tracking-tight sm:text-[1.45rem] ${memberTextPrimaryClass}`}>
            Trend harian
          </h2>
          <p className={`mt-1 text-sm leading-7 ${memberTextSecondaryClass}`}>
            Views landing page dan unique visitors dalam periode aktif.
          </p>
        </div>
      </div>

      <div className="mt-6">
        {data.length ? (
          <div className="flex h-60 items-end gap-2 overflow-x-auto pb-2">
            {data.map((item) => {
              const height = Math.max(8, Math.round((item.views / maxViews) * 100));

              return (
                <div className="flex min-w-[44px] flex-1 flex-col items-center gap-2" key={item.date}>
                  <div className="flex h-40 w-full items-end rounded-full bg-white/24 px-1.5 pb-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
                    <div
                      className="w-full rounded-full bg-gradient-to-t from-sky-600 to-cyan-300"
                      style={{ height: `${height}%` }}
                      title={`${formatDate(item.date)}: ${formatNumber(item.views)} views, ${formatNumber(item.uniqueVisitors)} unique`}
                    />
                  </div>
                  <p className={`text-[0.68rem] font-medium ${memberTextMutedClass}`}>{formatDate(item.date)}</p>
                  <p className={`text-[0.68rem] font-semibold ${memberTextPrimaryClass}`}>{formatNumber(item.views)}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState label="Belum ada data harian untuk periode ini." />
        )}
      </div>
    </section>
  );
}

function RankingList({
  emptyLabel,
  items,
  title,
  type,
}: {
  emptyLabel: string;
  items: Array<{ label: string; subtitle: string; uniqueVisitors: number; views: number }>;
  title: string;
  type: "country" | "device";
}) {
  return (
    <section className={`px-6 py-6 sm:px-7 sm:py-7 ${memberGlassPanelClass}`}>
      <div className="flex items-start gap-3">
        <span className={memberIconSurfaceClass}>
          {type === "country" ? <Globe2 className="h-5 w-5" /> : <MonitorSmartphone className="h-5 w-5" />}
        </span>
        <div>
          <h2 className={`text-[1.24rem] font-semibold tracking-tight sm:text-[1.36rem] ${memberTextPrimaryClass}`}>
            {title}
          </h2>
          <p className={`mt-1 text-sm leading-7 ${memberTextSecondaryClass}`}>
            Ranking berdasarkan views landing page Anda.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div className={memberGlassRowClass} key={`${type}-${item.label}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className={`truncate font-semibold ${memberTextPrimaryClass}`}>{item.label}</p>
                  <p className={`mt-1 text-xs ${memberTextMutedClass}`}>{item.subtitle}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`font-semibold ${memberTextPrimaryClass}`}>{formatNumber(item.views)}</p>
                  <p className={`mt-1 text-xs ${memberTextMutedClass}`}>{formatNumber(item.uniqueVisitors)} unique</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState label={emptyLabel} />
        )}
      </div>
    </section>
  );
}

export function MemberAnalyticsView({
  analytics,
  isLandingPageActive,
  range,
  username,
}: MemberAnalyticsViewProps) {
  const countryItems = analytics.countries.map((country) => ({
    label: formatCountry(country.countryCode),
    subtitle: country.countryCode,
    uniqueVisitors: country.uniqueVisitors,
    views: country.views,
  }));
  const deviceItems = analytics.devices.map((device) => ({
    label: formatDevice(device.deviceType),
    subtitle: device.deviceType,
    uniqueVisitors: device.uniqueVisitors,
    views: device.views,
  }));

  return (
    <main className="flex-1 px-4 py-6 sm:px-5 lg:px-6 lg:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 flex-1">
            <MemberPageHeader
              badge="Analytics"
              description={`Pantau traffic landing page @${username}, termasuk views, unique visitors, negara, device, dan kunjungan terbaru.`}
              icon={BarChart3}
              title="Landing Page Analytics"
              toneClassName="bg-[linear-gradient(135deg,rgba(14,165,233,0.14)_0%,rgba(255,255,255,0)_42%,rgba(16,185,129,0.1)_100%)]"
            />
          </div>

          <div className="member-glass-row flex shrink-0 flex-wrap gap-2 rounded-[24px] px-2 py-2">
            {analyticsRangeOptions.map((option) => (
              <Link
                className={cn(
                  "rounded-[18px] px-4 py-2 text-sm font-semibold transition",
                  range === option
                    ? "text-[var(--member-sidebar-active-text)] shadow-[var(--member-sidebar-active-shadow)]"
                    : "member-soft-button text-[var(--member-text-secondary)] hover:text-[var(--member-text-primary)]",
                )}
                href={`/dashboard/analytics?range=${option}`}
                key={option}
                style={range === option ? { background: "var(--member-sidebar-active-bg)" } : undefined}
              >
                {rangeLabels[option]}
              </Link>
            ))}
          </div>
        </div>

        {!isLandingPageActive ? (
          <section className={`px-5 py-5 ${memberGlassPanelClass}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className={memberIconSurfaceClass}>
                  <Link2 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className={`text-[1.16rem] font-semibold ${memberTextPrimaryClass}`}>
                    Landing page belum aktif
                  </h2>
                  <p className={`mt-1 text-sm leading-7 ${memberTextSecondaryClass}`}>
                    Aktifkan landing page agar kunjungan ke link referral Anda mulai tercatat.
                  </p>
                </div>
              </div>
              <Link className={memberSoftButtonClass} href="/dashboard/account/landing-page">
                <ExternalLink className="h-4 w-4" />
                Kelola landing page
              </Link>
            </div>
          </section>
        ) : null}

        <section className={`px-6 py-6 sm:px-7 sm:py-7 ${memberGlassPanelClass}`}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              description="Total entry ke link referral Anda."
              icon={MousePointerClick}
              label="Views"
              value={formatNumber(analytics.summary.totalViews)}
            />
            <MetricCard
              description="Dihitung dari cookie anonim yang di-hash."
              icon={Users}
              label="Unique"
              value={formatNumber(analytics.summary.uniqueVisitors)}
            />
            <MetricCard
              description="Jumlah country yang terdeteksi."
              icon={Globe2}
              label="Countries"
              value={formatNumber(analytics.summary.countryCount)}
            />
            <MetricCard
              description="Jenis perangkat yang terdeteksi."
              icon={MonitorSmartphone}
              label="Devices"
              value={formatNumber(analytics.summary.deviceCount)}
            />
          </div>
        </section>

        <DailyChart data={analytics.daily} />

        <div className="grid gap-6 xl:grid-cols-2">
          <RankingList
            emptyLabel="Belum ada country referral untuk periode ini."
            items={countryItems}
            title="Top Countries"
            type="country"
          />
          <RankingList
            emptyLabel="Belum ada device referral untuk periode ini."
            items={deviceItems}
            title="Device Type"
            type="device"
          />
        </div>

        <section className={`px-6 py-6 sm:px-7 sm:py-7 ${memberGlassPanelClass}`}>
          <div className="flex items-start gap-3">
            <span className={memberIconSurfaceClass}>
              <Clock3 className="h-5 w-5" />
            </span>
            <div>
              <h2 className={`text-[1.32rem] font-semibold tracking-tight sm:text-[1.45rem] ${memberTextPrimaryClass}`}>
                Recent Visits
              </h2>
              <p className={`mt-1 text-sm leading-7 ${memberTextSecondaryClass}`}>
                Kunjungan terbaru ke entry link referral Anda. Data visitor mentah tidak ditampilkan.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {analytics.recentVisits.length ? (
              analytics.recentVisits.map((visit) => (
                <div className={memberGlassRowClass} key={visit.id}>
                  <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr_0.75fr_1.1fr] lg:items-center">
                    <div>
                      <p className={`font-semibold ${memberTextPrimaryClass}`}>{formatDateTime(visit.createdAt)}</p>
                      <p className={`mt-1 text-xs ${memberTextMutedClass}`}>{visit.sourcePath}</p>
                    </div>
                    <div>
                      <p className={`font-medium ${memberTextPrimaryClass}`}>{formatCountry(visit.countryCode)}</p>
                      <p className={`mt-1 text-xs ${memberTextMutedClass}`}>
                        {[visit.city, visit.region].filter(Boolean).join(", ") || visit.countryCode}
                      </p>
                    </div>
                    <div>
                      <p className={`font-medium ${memberTextPrimaryClass}`}>{formatDevice(visit.deviceType)}</p>
                      <p className={`mt-1 text-xs ${memberTextMutedClass}`}>Device</p>
                    </div>
                    <div className="min-w-0">
                      <p className={`truncate font-medium ${memberTextPrimaryClass}`}>{formatReferrer(visit.referrer)}</p>
                      <p className={`mt-1 text-xs ${memberTextMutedClass}`}>Referrer</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="Belum ada recent visit untuk periode ini." />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
