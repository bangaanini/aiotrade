import { PendingRegistrationsView } from "@/components/admin/pending-registrations-view";
import {
  getAdminPendingRegistrations,
  parseAdminPendingRegistrationStatusFilter,
} from "@/lib/admin-pending-registrations";

type AdminPendingRegistrationsPageProps = {
  searchParams: Promise<{
    filter?: string;
    status?: string;
  }>;
};

export default async function AdminPendingRegistrationsPage({
  searchParams,
}: AdminPendingRegistrationsPageProps) {
  const query = await searchParams;
  const filter = parseAdminPendingRegistrationStatusFilter(query.filter);
  const { counts, rows } = await getAdminPendingRegistrations(filter);

  return (
    <PendingRegistrationsView
      counts={counts}
      filter={filter}
      rows={rows}
      status={query.status}
    />
  );
}
