import { cookies } from "next/headers";
import { getPdfGuides } from "@/lib/member-guide-categories";
import { getPublishedMemberGuidePosts } from "@/lib/member-guides";
import { translateMemberGuidePosts, translateSimpleMemberCopy } from "@/lib/member-translations";
import { MemberPdfGuideSection } from "@/components/dashboard/member-guide-sections";
import { parseSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";

export default async function DashboardGuideFilesPage() {
  const cookieStore = await cookies();
  const currentLanguage = parseSiteLanguage(cookieStore.get(SITE_LANGUAGE_COOKIE)?.value);
  const guides = await translateMemberGuidePosts(getPdfGuides(await getPublishedMemberGuidePosts()), currentLanguage);
  const copy = await translateSimpleMemberCopy(
    {
      badge: "Panduan",
      description:
        "Kumpulan file PDF yang bisa Anda buka kapan saja untuk referensi materi, langkah teknis, dan panduan tertulis.",
      emptyMessage: "Belum ada file PDF panduan yang dipublish.",
      openPdf: "Buka PDF",
      sectionDescription: "Buka dokumen untuk membaca materi lebih lengkap, lebih tenang, dan bisa diulang kapan saja.",
      sectionTitle: "File PDF",
      title: "File PDF",
    },
    currentLanguage,
  );

  return (
    <MemberPdfGuideSection
      badge={copy.badge}
      description={copy.description}
      emptyMessage={copy.emptyMessage}
      guides={guides}
      labels={copy}
      title={copy.title}
    />
  );
}
