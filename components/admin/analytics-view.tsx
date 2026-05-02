import Link from "next/link";
import {
  BarChart3,
  Clock3,
  Globe2,
  type LucideIcon,
  MousePointerClick,
  Route,
  Users,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  analyticsRangeOptions,
  type AnalyticsRange,
  type ReferralAnalyticsSnapshot,
} from "@/lib/admin-analytics";
import type { GoogleAnalyticsSnapshot } from "@/lib/google-analytics";
import { cn } from "@/lib/utils";

type AnalyticsViewProps = {
  googleAnalytics: GoogleAnalyticsSnapshot;
  range: AnalyticsRange;
  referralAnalytics: ReferralAnalyticsSnapshot;
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

function AnalyticsCard({
  description,
  icon: Icon,
  title,
  value,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
  value: number;
}) {
  return (
    <Card className="rounded-[30px] border-transparent">
      <CardHeader className="pb-3">
        <CardDescription>{description}</CardDescription>
        <CardTitle className="flex items-center gap-2 text-3xl">
          <Icon className="h-6 w-6 text-sky-600" />
          {formatNumber(value)}
        </CardTitle>
        <p className="text-sm font-medium text-[var(--admin-text-secondary)]">{title}</p>
      </CardHeader>
    </Card>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-[24px] border border-dashed border-[var(--admin-row-border)] px-5 text-center text-sm text-[var(--admin-text-muted)]">
      {label}
    </div>
  );
}

function DailyChart({
  data,
  label,
  tone,
}: {
  data: Array<{ date: string; uniqueVisitors?: number; users?: number; views: number }>;
  label: string;
  tone: "sky" | "emerald";
}) {
  const maxViews = Math.max(...data.map((item) => item.views), 1);

  return (
    <Card className="rounded-[30px] border-transparent">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>Views harian dalam periode aktif.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length ? (
          <div className="flex h-56 items-end gap-2 overflow-x-auto pb-2">
            {data.map((item) => {
              const height = Math.max(8, Math.round((item.views / maxViews) * 100));

              return (
                <div className="flex min-w-[42px] flex-1 flex-col items-center gap-2" key={item.date}>
                  <div className="flex h-40 w-full items-end rounded-full bg-stone-100/80 px-1.5 pb-1.5">
                    <div
                      className={cn(
                        "w-full rounded-full",
                        tone === "sky"
                          ? "bg-gradient-to-t from-sky-600 to-cyan-300"
                          : "bg-gradient-to-t from-emerald-600 to-lime-300",
                      )}
                      style={{ height: `${height}%` }}
                      title={`${formatDate(item.date)}: ${formatNumber(item.views)} views`}
                    />
                  </div>
                  <p className="text-[0.68rem] font-medium text-[var(--admin-text-muted)]">{formatDate(item.date)}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState label="Belum ada data harian untuk periode ini." />
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsView({
  googleAnalytics,
  range,
  referralAnalytics,
}: AnalyticsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="admin-page-badge inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]">
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </div>
          <h1 className="mt-4 text-[2rem] font-semibold tracking-tight text-[var(--admin-text-primary)]">
            Web & Referral Analytics
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--admin-text-secondary)]">
            Pantau traffic public/auth dari Google Analytics dan kunjungan entry referral per username dari database internal.
          </p>
        </div>

        <div className="admin-glass-row flex flex-wrap gap-2 rounded-[24px] border-transparent p-1.5">
          {analyticsRangeOptions.map((option) => (
            <Link
              className={cn(
                "rounded-[18px] px-4 py-2 text-sm font-semibold transition",
                range === option
                  ? "admin-active-surface text-[var(--admin-sidebar-active-text)]"
                  : "admin-soft-button text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]",
              )}
              href={`/admin/analytics?range=${option}`}
              key={option}
            >
              {rangeLabels[option]}
            </Link>
          ))}
        </div>
      </div>

      {googleAnalytics.error ? (
        <Alert variant={googleAnalytics.isConfigured ? "error" : "default"}>
          {googleAnalytics.error}
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <AnalyticsCard
          description="GA users"
          icon={Users}
          title="Users"
          value={googleAnalytics.summary.users}
        />
        <AnalyticsCard
          description="GA sessions"
          icon={Route}
          title="Sessions"
          value={googleAnalytics.summary.sessions}
        />
        <AnalyticsCard
          description="GA views"
          icon={BarChart3}
          title="Views"
          value={googleAnalytics.summary.views}
        />
        <AnalyticsCard
          description="Referral views"
          icon={MousePointerClick}
          title="Referral Views"
          value={referralAnalytics.summary.totalViews}
        />
        <AnalyticsCard
          description="Referral unique"
          icon={Users}
          title="Unique"
          value={referralAnalytics.summary.uniqueVisitors}
        />
        <AnalyticsCard
          description="Member aktif"
          icon={Globe2}
          title="Members"
          value={referralAnalytics.summary.activeMembers}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DailyChart data={googleAnalytics.daily} label="Global Traffic" tone="sky" />
        <DailyChart data={referralAnalytics.daily} label="Referral Entry Traffic" tone="emerald" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-[30px] border-transparent">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Halaman public/auth paling banyak views di GA4.</CardDescription>
          </CardHeader>
          <CardContent>
            {googleAnalytics.topPages.length ? (
              <div className="overflow-x-auto">
                <table className="admin-data-table min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-text-muted)]">
                      <th className="px-3 py-3.5">Page</th>
                      <th className="px-3 py-3.5 text-right">Views</th>
                      <th className="px-3 py-3.5 text-right">Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {googleAnalytics.topPages.map((page) => (
                      <tr className="admin-data-row text-[var(--admin-text-secondary)]" key={page.path}>
                        <td className="max-w-[24rem] truncate px-3 py-4 font-medium text-[var(--admin-text-primary)]">{page.path}</td>
                        <td className="px-3 py-4 text-right">{formatNumber(page.views)}</td>
                        <td className="px-3 py-4 text-right">{formatNumber(page.users)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState label="Top pages belum tersedia." />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border-transparent">
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Negara visitor dari Google Analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            {googleAnalytics.countries.length ? (
              <div className="overflow-x-auto">
                <table className="admin-data-table min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-text-muted)]">
                      <th className="px-3 py-3.5">Country</th>
                      <th className="px-3 py-3.5 text-right">Users</th>
                      <th className="px-3 py-3.5 text-right">Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {googleAnalytics.countries.map((country) => (
                      <tr className="admin-data-row text-[var(--admin-text-secondary)]" key={country.country}>
                        <td className="px-3 py-4 font-medium text-[var(--admin-text-primary)]">{country.country}</td>
                        <td className="px-3 py-4 text-right">{formatNumber(country.users)}</td>
                        <td className="px-3 py-4 text-right">{formatNumber(country.views)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState label="Country dari GA4 belum tersedia." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[30px] border-transparent">
          <CardHeader>
            <CardTitle>Top Referral Members</CardTitle>
            <CardDescription>Ranking member berdasarkan entry link `domain.com/username`.</CardDescription>
          </CardHeader>
          <CardContent>
            {referralAnalytics.topMembers.length ? (
              <div className="overflow-x-auto">
                <table className="admin-data-table min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-text-muted)]">
                      <th className="px-3 py-3.5">Username</th>
                      <th className="px-3 py-3.5 text-right">Views</th>
                      <th className="px-3 py-3.5 text-right">Unique</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralAnalytics.topMembers.map((member) => (
                      <tr className="admin-data-row text-[var(--admin-text-secondary)]" key={member.profileId}>
                        <td className="px-3 py-4 font-semibold text-[var(--admin-text-primary)]">@{member.username}</td>
                        <td className="px-3 py-4 text-right">{formatNumber(member.views)}</td>
                        <td className="px-3 py-4 text-right">{formatNumber(member.uniqueVisitors)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState label="Belum ada kunjungan referral pada periode ini." />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border-transparent">
          <CardHeader>
            <CardTitle>Referral Countries</CardTitle>
            <CardDescription>Negara dari header platform untuk entry `/username`.</CardDescription>
          </CardHeader>
          <CardContent>
            {referralAnalytics.countries.length ? (
              <div className="space-y-3">
                {referralAnalytics.countries.map((country) => (
                  <div className="admin-glass-row rounded-[20px] border-transparent px-4 py-3" key={country.countryCode}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--admin-text-primary)]">{formatCountry(country.countryCode)}</p>
                        <p className="text-xs text-[var(--admin-text-muted)]">{country.countryCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[var(--admin-text-primary)]">{formatNumber(country.views)}</p>
                        <p className="text-xs text-[var(--admin-text-muted)]">{formatNumber(country.uniqueVisitors)} unique</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState label="Belum ada country referral." />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[30px] border-transparent">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-sky-600" />
            Recent Referral Visits
          </CardTitle>
          <CardDescription>Kunjungan terbaru ke entry link referral.</CardDescription>
        </CardHeader>
        <CardContent>
          {referralAnalytics.recentVisits.length ? (
            <div className="overflow-x-auto">
              <table className="admin-data-table min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-text-muted)]">
                    <th className="px-3 py-3.5">Time</th>
                    <th className="px-3 py-3.5">Username</th>
                    <th className="px-3 py-3.5">Path</th>
                    <th className="px-3 py-3.5">Country</th>
                    <th className="px-3 py-3.5">Device</th>
                    <th className="px-3 py-3.5">Referrer</th>
                  </tr>
                </thead>
                <tbody>
                  {referralAnalytics.recentVisits.map((visit) => (
                    <tr className="admin-data-row text-[var(--admin-text-secondary)]" key={`${visit.username}-${visit.createdAt}`}>
                      <td className="whitespace-nowrap px-3 py-4">{formatDateTime(visit.createdAt)}</td>
                      <td className="px-3 py-4 font-semibold text-[var(--admin-text-primary)]">@{visit.username}</td>
                      <td className="px-3 py-4">{visit.sourcePath}</td>
                      <td className="px-3 py-4">{formatCountry(visit.countryCode)}</td>
                      <td className="px-3 py-4 capitalize">{visit.deviceType ?? "-"}</td>
                      <td className="max-w-[18rem] truncate px-3 py-4">{visit.referrer ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState label="Belum ada recent referral visit." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
