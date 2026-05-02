import { UsersTableView } from "@/components/admin/users-table-view";
import { getAdminUsers, normalizeAdminUserSearchQuery } from "@/lib/admin-users";
import { requireAdminProfile } from "@/lib/auth";
import { getPaymentGatewaySettings } from "@/lib/payment-gateway-settings";

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const query = await searchParams;
  const searchQuery = normalizeAdminUserSearchQuery(query.q);
  const [users, admin, paymentSettings] = await Promise.all([
    getAdminUsers(searchQuery),
    requireAdminProfile(),
    getPaymentGatewaySettings(),
  ]);

  return (
    <UsersTableView
      currentAdminId={admin.id}
      searchQuery={searchQuery}
      status={query.status}
      subscriptionPlans={paymentSettings.subscriptionPlans}
      users={users}
    />
  );
}
