import { GoogleAnalyticsTag } from "@/components/analytics/google-analytics-tag";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <GoogleAnalyticsTag />
    </>
  );
}
