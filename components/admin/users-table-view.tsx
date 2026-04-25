import Link from "next/link";
import { BadgeCheck, CircleUserRound, Link2, ShieldCheck } from "lucide-react";
import { AdminCreateUserForm } from "@/components/admin/admin-create-user-form";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { Alert } from "@/components/ui/alert";
import type { AdminUserRow } from "@/lib/admin-users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { extractMemberIdFromReferralLink } from "@/lib/member-id";

type UsersTableViewProps = {
  currentAdminId: string;
  status?: string;
  users: AdminUserRow[];
};

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

export function UsersTableView({ currentAdminId, status, users }: UsersTableViewProps) {
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

      <AdminCreateUserForm />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={adminCardClass}>
          <CardHeader className="pb-3">
            <CardDescription>Total User</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <CircleUserRound className="h-6 w-6 text-sky-600" />
              {users.length}
            </CardTitle>
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
        <CardHeader>
          <CardTitle>User Table</CardTitle>
          <CardDescription>Menampilkan semua user</CardDescription>
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
                  <th className="px-3 py-3.5">Landing Page</th>
                  <th className="px-3 py-3.5">Admin</th>
                  <th className="px-3 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const memberId = extractMemberIdFromReferralLink(user.referralLink);

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
                        {user.id === currentAdminId ? (
                          <span className="text-xs font-medium text-[var(--admin-text-muted)]">Akun aktif</span>
                        ) : (
                          <DeleteUserButton userId={user.id} username={user.username} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
