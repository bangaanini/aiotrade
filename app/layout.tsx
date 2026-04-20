import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Referral Landing Pages",
  description: "Referral and replicated landing page system powered by Next.js and Supabase.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full overflow-x-hidden bg-background text-foreground font-sans">
        <div className="flex min-h-full flex-col">{children}</div>
      </body>
    </html>
  );
}
