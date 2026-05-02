import Link from "next/link";
import { BadgeCheck, CircleUserRound, Link2, Search, ShieldCheck } from "lucide-react";
import { AdminCreateUserForm } from "@/components/admin/admin-create-user-form";
import { AssignUserPackageButton } from "@/components/admin/assign-user-package-button";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { EditMemberIdButton } from "@/components/admin/edit-member-id-button";
import { Alert } from "@/components/ui/alert";
import type { AdminUserRow } from "@/lib/admin-users";
import type { PaymentSubscriptionPlan } from "@/lib/payment-gateway-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { extractMemberIdFromReferralLink } from "@/lib/member-id";

type UsersTableViewProps = {
  currentAdminId: string;
  searchQuery: string;
  status?: string;
  subscriptionPlans: PaymentSubscriptionPlan[];
  users: AdminUserRow[];
};

const subscriptionDateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

function StatusPill({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-100 text-emerald-800"
          : "bg-stone-100 text-stone-600"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function formatSubscriptionDate(date: Date | null | undefined) {
  if (!date) {
    return null;
  }

  return subscriptionDateFormatter.format(date);
}

function getSubscriptionDisplay(user: AdminUserRow) {
  if (!user.subscriptionPlanLabel) {
    return {
      detail: "Belum ada paket aktif",
      isActive: false,
      label: "Belum ada",
      status: "Inactive",
    };
  }

  const expiresAt = user.subscriptionExpiresAt;
  const expiresAtLabel = formatSubscriptionDate(user.subscriptionExpiresAt);
  const isExpired =
    !user.subscriptionIsLifetime &&
    (expiresAt ? expiresAt.getTime() < Date.now() : false);
  const durationLabel = user.subscriptionIsLifetime
    ? "Lifetime"
    : expiresAtLabel
      ? `Exp ${expiresAtLabel}`
      : `${user.subscriptionDurationMonths ?? 0} bulan`;

  return {
    detail: durationLabel,
    isActive: !isExpired && user.subscriptionStatus !== "inactive",
    label: user.subscriptionPlanLabel,
    status: isExpired ? "Expired" : user.subscriptionStatus ?? "Active",
  };
}

export function UsersTableView({
  currentAdminId,
  searchQuery,
  status,
  subscriptionPlans,
  users,
}: UsersTableViewProps) {
  const totalReferrals = users.reduce((sum, user) => sum + user.referralCount, 0);
  const adminCardClass = "rounded-[30px] border-transparent";

  return (
    <div className="space-y-6">
      {status === "deleted" ? (
        <Alert variant="success">User berhasil dihapus.</Alert>
      ) : null}
      {status === "self-delete-blocked" ? (
        <Alert variant="error">Akun admin yang sedang dipakai tidak bisa dihapus.</Alert>
      ) : null}
      {status === "error" ? (
        <Alert variant="error">User tidak bisa dihapus sekarang. Coba lagi.</Alert>
      ) : null}
      {status === "member-id-updated" ? (
        <Alert variant="success">Member ID user berhasil diperbarui.</Alert>
      ) : null}
      {status === "member-id-invalid" ? (
        <Alert variant="error">Member ID harus tepat 8 huruf atau angka.</Alert>
      ) : null}
      {status === "member-id-taken" ? (
        <Alert variant="error">Member ID sudah dipakai user lain atau masih tertahan pendaftaran pending.</Alert>
      ) : null}
      {status === "member-id-error" ? (
        <Alert variant="error">Member ID belum bisa diperbarui sekarang. Coba lagi.</Alert>
      ) : null}
      {status === "package-updated" ? (
        <Alert variant="success">Paket user berhasil diperbarui secara manual.</Alert>
      ) : null}
      {status === "package-invalid" ? (
        <Alert variant="error">Paket yang dipilih tidak valid atau sudah tidak tersedia.</Alert>
      ) : null}
      {status === "package-user-not-found" ? (
        <Alert variant="error">User tidak ditemukan.</Alert>
      ) : null}
      {status === "package-error" ? (
        <Alert variant="error">Paket user belum bisa diperbarui sekarang. Coba lagi.</Alert>
      ) : null}

      <AdminCreateUserForm />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={adminCardClass}>
          <CardHeader className="pb-3">
            <CardDescription>Total User</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <CircleUserRound className="h-6 w-6 text-sky-600" />
              {users.length}
            </CardTitle>
            {searchQuery ? (
              <p className="pt-1 text-xs text-[var(--admin-text-muted)]">Hasil pencarian</p>
            ) : null}
          </CardHeader>
        </Card>
        <Card className={adminCardClass}>
          <CardHeader className="pb-3">
            <CardDescription>Total Referral</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Link2 className="h-6 w-6 text-amber-600" />
              {totalReferrals}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className={adminCardClass}>
          <CardHeader className="pb-3">
            <CardDescription>Total Admin</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              {users.filter((user) => user.isAdmin).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className={adminCardClass}>
        <CardContent>
          <form action="/admin/users" className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <label
                className="text-sm font-semibold text-[var(--admin-text-primary)]"
                htmlFor="admin-users-search"
              >
                Cari User
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                <input
                  autoComplete="off"
                  className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-3 text-sm text-stone-950 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  defaultValue={searchQuery}
                  id="admin-users-search"
                  maxLength={80}
                  name="q"
                  placeholder="Cari username, email, WhatsApp, atau Member ID"
                  type="search"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">
                <Search className="h-4 w-4" />
                Cari
              </Button>
              {searchQuery ? (
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-stone-300 bg-white px-5 text-sm font-medium text-stone-900 transition hover:bg-stone-50"
                  href="/admin/users"
                >
                  Reset
                </Link>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className={adminCardClass}>
        <CardHeader>
          <CardTitle>User Table</CardTitle>
          <CardDescription>
            {searchQuery ? `Menampilkan hasil untuk "${searchQuery}"` : "Menampilkan semua user"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="admin-data-table min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-text-muted)]">
                  <th className="px-3 py-3.5">Username</th>
                  <th className="px-3 py-3.5">Email</th>
                  <th className="px-3 py-3.5">WhatsApp</th>
                  <th className="px-3 py-3.5">Member ID</th>
                  <th className="px-3 py-3.5">Referral</th>
                  <th className="px-3 py-3.5">Paket</th>
                  <th className="px-3 py-3.5">Landing Page</th>
                  <th className="px-3 py-3.5">Admin</th>
                  <th className="px-3 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.length ? users.map((user) => {
                  const memberId = extractMemberIdFromReferralLink(user.referralLink);
                  const subscription = getSubscriptionDisplay(user);

                  return (
                    <tr className="admin-data-row align-top text-[var(--admin-text-secondary)]" key={user.id}>
                      <td className="px-3 py-4 font-semibold text-[var(--admin-text-primary)]">@{user.username}</td>
                      <td className="px-3 py-4">{user.email ?? "-"}</td>
                      <td className="px-3 py-4">{user.whatsapp ?? "-"}</td>
                      <td className="px-3 py-4">
                        <div className="space-y-1">
                          <p className="font-mono text-sm font-semibold text-[var(--admin-text-primary)]">
                            {memberId ?? "-"}
                          </p>
                          {user.referralLink ? (
                            <Link
                              className="break-all text-xs font-medium text-sky-700 underline decoration-sky-300 underline-offset-4"
                              href={user.referralLink}
                              target="_blank"
                            >
                              Buka link referral
                            </Link>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-4 font-semibold text-[var(--admin-text-primary)]">{user.referralCount}</td>
                      <td className="px-3 py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-[var(--admin-text-primary)]">{subscription.label}</p>
                          <p className="text-xs text-[var(--admin-text-muted)]">{subscription.detail}</p>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              subscription.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {subscription.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <StatusPill active={user.isLpActive} activeLabel="Active" inactiveLabel="Inactive" />
                      </td>
                      <td className="px-3 py-4">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Admin
                          </span>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <AssignUserPackageButton
                            currentPlanLabel={user.subscriptionPlanLabel}
                            plans={subscriptionPlans}
                            searchQuery={searchQuery}
                            userId={user.id}
                            username={user.username}
                          />
                          <EditMemberIdButton
                            memberId={memberId}
                            userId={user.id}
                            username={user.username}
                          />
                          {user.id === currentAdminId ? (
                            <span className="text-xs font-medium text-[var(--admin-text-muted)]">Akun aktif</span>
                          ) : (
                            <DeleteUserButton userId={user.id} username={user.username} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td className="px-3 py-10 text-center text-sm text-[var(--admin-text-muted)]" colSpan={9}>
                      Tidak ada user yang cocok dengan pencarian ini.
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
