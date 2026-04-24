import { cookies } from "next/headers";
import { buildProfileUrl, getSiteUrl } from "@/lib/site";
import { requireCurrentProfile } from "@/lib/auth";
import { MemberLandingPagePanel } from "@/components/dashboard/member-landing-page-panel";
import { parseSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";
import { translateSimpleMemberCopy } from "@/lib/member-translations";

export default async function DashboardAccountLandingPagePage() {
  const [profile, siteUrl, cookieStore] = await Promise.all([requireCurrentProfile(), getSiteUrl(), cookies()]);
  const landingPageUrl = buildProfileUrl(siteUrl, profile.username);
  const currentLanguage = parseSiteLanguage(cookieStore.get(SITE_LANGUAGE_COOKIE)?.value);
  const labels = await translateSimpleMemberCopy(
    {
      activateButton: "Activate My Landing Page",
      activatePending: "Activating...",
      activeStatus: "Active and Shareable",
      badge: "Landing Page",
      copiedLink: "Copied",
      copyLink: "Copy Link",
      description:
        "Generate halaman referral pribadi Anda, cek statusnya, lalu bagikan link yang sudah siap dipakai untuk entry member baru.",
      generateDescription:
        "Visitor akan masuk ke homepage utama dengan referral Anda tetap menempel. Praktis dan lebih rapi untuk dibagikan.",
      inactiveHint:
        "Landing page Anda belum aktif. Setelah diaktifkan, sistem akan membuat link shareable berbasis username member.",
      inactiveStatus: "Belum diaktifkan",
      landingLinkDescription:
        "Tombol daftar di landing page Anda akan mengikuti referral link yang tersimpan pada profil member.",
      landingLinkLabel: "Link landing page Anda",
      openEntryLink: "Open Entry Link",
      pageTitle: "Landing page referral",
      sectionTitle: "Generate landing page",
      statusLabel: "Status",
    },
    currentLanguage,
  );

  return <MemberLandingPagePanel labels={labels} landingPageUrl={landingPageUrl} profile={profile} />;
}
