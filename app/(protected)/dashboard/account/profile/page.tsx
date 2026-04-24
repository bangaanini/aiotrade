import { cookies } from "next/headers";
import { requireCurrentProfile } from "@/lib/auth";
import { MemberAccountOverview } from "@/components/dashboard/member-account-overview";
import { parseSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";
import { translateSimpleMemberCopy } from "@/lib/member-translations";

export default async function DashboardAccountProfilePage() {
  const [profile, cookieStore] = await Promise.all([requireCurrentProfile(), cookies()]);
  const currentLanguage = parseSiteLanguage(cookieStore.get(SITE_LANGUAGE_COOKIE)?.value);
  const labels = await translateSimpleMemberCopy(
    {
      directSignup: "Direct signup",
      email: "Email",
      memberId: "Member ID",
      pageBadge: "Akun Member",
      pageDescription: "Informasi utama akun Anda.",
      pageTitle: "Profil akun",
      referredBy: "Referred By",
      sectionDescription: "Detail profil, kontak, dan informasi referral yang tersimpan pada akun member Anda.",
      sectionTitle: "Info akun",
      username: "Username",
      whatsapp: "WhatsApp",
    },
    currentLanguage,
  );

  return <MemberAccountOverview labels={labels} profile={profile} />;
}
