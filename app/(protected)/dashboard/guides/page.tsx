import { MemberGuidesView } from "@/components/dashboard/member-guides-view";
import { getPublishedMemberGuidePosts } from "@/lib/member-guides";

export default async function DashboardGuidesPage() {
  const guides = await getPublishedMemberGuidePosts();

  return <MemberGuidesView guides={guides} />;
}
