import { GoogleAnalyticsTag } from "@/components/analytics/google-analytics-tag";

export default function AuthLayout({
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
