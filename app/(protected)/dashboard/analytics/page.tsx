import { MemberAnalyticsView } from "@/components/dashboard/member-analytics-view";
import { parseAnalyticsRange } from "@/lib/admin-analytics";
import { requireCurrentProfile } from "@/lib/auth";
import { getMemberLandingPageAnalytics } from "@/lib/member-landing-page-analytics";

type DashboardAnalyticsPageProps = {
  searchParams: Promise<{
    range?: string | string[];
  }>;
};

export default async function DashboardAnalyticsPage({ searchParams }: DashboardAnalyticsPageProps) {
  const [profile, query] = await Promise.all([requireCurrentProfile(), searchParams]);
  const range = parseAnalyticsRange(query.range);
  const analytics = await getMemberLandingPageAnalytics({
    profileId: profile.id,
    range,
  });

  return (
    <MemberAnalyticsView
      analytics={analytics}
      isLandingPageActive={profile.isLpActive}
      range={range}
      username={profile.username}
    />
  );
}
