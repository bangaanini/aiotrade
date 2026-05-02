import { AnalyticsView } from "@/components/admin/analytics-view";
import { getReferralAnalytics, parseAnalyticsRange } from "@/lib/admin-analytics";
import { getGoogleAnalyticsSnapshot } from "@/lib/google-analytics";

type AdminAnalyticsPageProps = {
  searchParams: Promise<{
    range?: string | string[];
  }>;
};

export default async function AdminAnalyticsPage({ searchParams }: AdminAnalyticsPageProps) {
  const query = await searchParams;
  const range = parseAnalyticsRange(query.range);
  const [googleAnalytics, referralAnalytics] = await Promise.all([
    getGoogleAnalyticsSnapshot(range),
    getReferralAnalytics(range),
  ]);

  return (
    <AnalyticsView
      googleAnalytics={googleAnalytics}
      range={range}
      referralAnalytics={referralAnalytics}
    />
  );
}
