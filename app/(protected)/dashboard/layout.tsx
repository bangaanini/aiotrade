import { headers } from "next/headers";
import { requireCurrentProfile } from "@/lib/auth";
import { MemberShell } from "@/components/dashboard/member-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireCurrentProfile();
  const pathname = (await headers()).get("x-current-pathname") ?? "/dashboard";

  return (
    <MemberShell isAdmin={profile.isAdmin} pathname={pathname} username={profile.username}>
      {children}
    </MemberShell>
  );
}
