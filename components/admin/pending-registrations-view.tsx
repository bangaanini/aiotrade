import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  Hourglass,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { ApprovePendingRegistrationButton } from "@/components/admin/approve-pending-registration-button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ADMIN_PENDING_REGISTRATION_FILTERS,
  type AdminPendingRegistrationCounts,
  type AdminPendingRegistrationRow,
  type AdminPendingRegistrationStatusFilter,
} from "@/lib/admin-pending-registrations";
import { cn } from "@/lib/utils";

type PendingRegistrationsViewProps = {
  counts: AdminPendingRegistrationCounts;
  filter: AdminPendingRegistrationStatusFilter;
  rows: AdminPendingRegistrationRow[];
  status?: string;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  currency: "IDR",
  maximumFractionDigits: 0,
  style: "currency",
});

function formatDate(date: Date | null | undefined) {
  if (!date) {
    return "-";
  }

  return dateFormatter.format(date);
}

function formatPlan(row: AdminPendingRegistrationRow) {
  if (row.planIsLifetime) {
    return "Lifetime";
  }

  return `${row.planDurationMonths} bulan`;
}

function truncateText(value: string | null | undefined, maxLength = 48) {
  if (!value) {
    return "-";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function statusLabel(status: string) {
  if (status === "paid") {
    return "Approved";
  }

  if (status === "failed") {
    return "Failed";
  }

  if (status === "expired") {
    return "Expired";
  }

  return "Pending";
}

function statusClass(status: string) {
  if (status === "paid") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "failed") {
    return "bg-rose-100 text-rose-800";
  }

  if (status === "expired") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-sky-100 text-sky-800";
}

function CountCard({
  active,
  count,
  href,
  icon: Icon,
  label,
}: {
  active: boolean;
  count: number;
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "rounded-[30px] border-transparent transition duration-300 hover:-translate-y-0.5",
          active && "ring-2 ring-emerald-500/50",
        )}
      >
        <CardHeader className="pb-3">
          <CardDescription>{label}</CardDescription>
          <CardTitle className="flex items-center gap-2 text-3xl">
            <Icon className="h-6 w-6 text-sky-600" />
            {count}
          </CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}

function StatusAlert({ status }: { status?: string }) {
  if (status === "approved") {
    return <Alert variant="success">Pending registration berhasil di-approve manual.</Alert>;
  }

  if (status === "already-approved") {
    return <Alert variant="success">Registration sudah berstatus approved. Akun dan subscription sudah disinkronkan.</Alert>;
  }

  if (status === "invalid") {
    return <Alert variant="error">ID pending registration tidak valid.</Alert>;
  }

  if (status === "not-found") {
    return <Alert variant="error">Pending registration tidak ditemukan.</Alert>;
  }

  if (status === "conflict") {
    return (
      <Alert variant="error">
        Data pending bentrok dengan akun yang sudah ada. Cek email, username, atau Member ID sebelum approve manual.
      </Alert>
    );
  }

  if (status === "error") {
    return <Alert variant="error">Pending registration belum bisa di-approve sekarang. Coba lagi.</Alert>;
  }

  return null;
}

export function PendingRegistrationsView({
  counts,
  filter,
  rows,
  status,
}: PendingRegistrationsViewProps) {
  return (
    <div className="space-y-6">
      <StatusAlert status={status} />

      <Card className="rounded-[30px] border-transparent">
        <CardHeader>
          <CardTitle>Pending Registration</CardTitle>
          <CardDescription>
            Pantau signup yang masih tertahan di pembayaran dan approve manual setelah verifikasi.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-5">
        <CountCard
          active={filter === "pending"}
          count={counts.pending}
          href="/admin/pending-registrations?filter=pending"
          icon={Hourglass}
          label="Pending Aktif"
        />
        <CountCard
          active={filter === "failed"}
          count={counts.failed}
          href="/admin/pending-registrations?filter=failed"
          icon={AlertCircle}
          label="Failed"
        />
        <CountCard
          active={filter === "expired"}
          count={counts.expired}
          href="/admin/pending-registrations?filter=expired"
          icon={Clock3}
          label="Expired"
        />
        <CountCard
          active={filter === "paid"}
          count={counts.paid}
          href="/admin/pending-registrations?filter=paid"
          icon={ShieldCheck}
          label="Approved"
        />
        <CountCard
          active={filter === "all"}
          count={counts.all}
          href="/admin/pending-registrations?filter=all"
          icon={CreditCard}
          label="Semua"
        />
      </div>

      <Card className="rounded-[30px] border-transparent">
        <CardHeader className="gap-4 md:flex md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Daftar Registration</CardTitle>
            <CardDescription>
              Menampilkan maksimal 100 data terbaru berdasarkan filter status.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {ADMIN_PENDING_REGISTRATION_FILTERS.map((item) => (
              <Link
                className={cn(
                  "inline-flex rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  filter === item.value
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200",
                )}
                href={`/admin/pending-registrations?filter=${item.value}`}
                key={item.value}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="admin-data-table min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-text-muted)]">
                  <th className="px-3 py-3.5">User</th>
                  <th className="px-3 py-3.5">Kontak</th>
                  <th className="px-3 py-3.5">Member ID</th>
                  <th className="px-3 py-3.5">Paket</th>
                  <th className="px-3 py-3.5">Payment</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5">Waktu</th>
                  <th className="px-3 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((row) => (
                    <tr
                      className="admin-data-row align-top text-[var(--admin-text-secondary)]"
                      key={row.id}
                    >
                      <td className="px-3 py-4">
                        <p className="font-semibold text-[var(--admin-text-primary)]">@{row.username}</p>
                        <p className="mt-1 max-w-52 break-all text-xs text-[var(--admin-text-muted)]">
                          {row.referredBy ? `Ref: ${row.referredBy}` : "Tanpa referral"}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <p>{row.email}</p>
                        <p className="mt-1 text-xs text-[var(--admin-text-muted)]">{row.whatsapp}</p>
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-mono text-sm font-semibold text-[var(--admin-text-primary)]">
                          {row.memberId}
                        </p>
                        <Link
                          className="mt-1 block max-w-48 truncate text-xs font-medium text-sky-700 underline decoration-sky-300 underline-offset-4"
                          href={row.referralLink}
                          target="_blank"
                        >
                          {row.referralLink}
                        </Link>
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-semibold text-[var(--admin-text-primary)]">{row.planLabel}</p>
                        <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                          {formatPlan(row)} - {currencyFormatter.format(row.planPrice)}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-mono text-xs font-semibold text-[var(--admin-text-primary)]">
                          {row.transactionReferenceId ?? row.paymentReferenceId ?? "-"}
                        </p>
                        <p className="mt-1 text-xs capitalize text-[var(--admin-text-muted)]">
                          {row.transactionStatus ?? "no transaction"}
                        </p>
                        {row.paymentMessage ? (
                          <p className="mt-1 max-w-56 text-xs text-[var(--admin-text-muted)]">
                            {truncateText(row.paymentMessage, 64)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                            statusClass(row.displayStatus),
                          )}
                        >
                          {row.displayStatus === "paid" ? (
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          ) : null}
                          {statusLabel(row.displayStatus)}
                        </span>
                        <p className="mt-2 text-xs text-[var(--admin-text-muted)]">
                          Raw: {row.status}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <p className="text-xs">
                          Dibuat: <span className="font-medium">{formatDate(row.createdAt)}</span>
                        </p>
                        <p className="mt-1 text-xs">
                          Exp: <span className="font-medium">{formatDate(row.expiresAt)}</span>
                        </p>
                        {row.transactionPaidAt ? (
                          <p className="mt-1 text-xs text-emerald-700">
                            Paid: {formatDate(row.transactionPaidAt)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-4 text-right">
                        {row.displayStatus === "paid" ? (
                          <span className="text-xs font-medium text-[var(--admin-text-muted)]">
                            Approved
                          </span>
                        ) : (
                          <ApprovePendingRegistrationButton
                            filter={filter}
                            pendingId={row.id}
                            username={row.username}
                          />
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-10 text-center text-sm text-[var(--admin-text-muted)]" colSpan={8}>
                      Belum ada registration untuk filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
