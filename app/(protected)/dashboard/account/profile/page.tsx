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
      editDescription: "Perbarui nomor WhatsApp dan member ID Anda dari sini.",
      editNote: "Saat member ID diubah, direct signup link Anda juga akan ikut diperbarui.",
      editTitle: "Edit info akun",
      email: "Email",
      memberId: "Member ID",
      memberIdPlaceholder: "Masukkan member ID",
      pageBadge: "Akun Member",
      pageDescription: "Informasi utama akun Anda.",
      pageTitle: "Profil akun",
      referredBy: "Referred By",
      saveProfileChanges: "Simpan perubahan",
      saveProfilePending: "Menyimpan perubahan...",
      sectionDescription: "Detail profil, kontak, dan informasi referral yang tersimpan pada akun member Anda.",
      sectionTitle: "Info akun",
      username: "Username",
      whatsapp: "WhatsApp",
      whatsappPlaceholder: "Masukkan nomor WhatsApp",
    },
    currentLanguage,
  );

  return <MemberAccountOverview currentLanguage={currentLanguage} labels={labels} profile={profile} />;
}
