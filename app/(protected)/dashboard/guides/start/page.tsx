import { cookies } from "next/headers";
import { MemberVideoGuideSection } from "@/components/dashboard/member-guide-sections";
import { translateMemberGuidePosts, translateSimpleMemberCopy } from "@/lib/member-translations";
import { getStartGuides } from "@/lib/member-guide-categories";
import { getPublishedMemberGuidePosts } from "@/lib/member-guides";
import { parseSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";

export default async function DashboardGuideStartPage() {
  const cookieStore = await cookies();
  const currentLanguage = parseSiteLanguage(cookieStore.get(SITE_LANGUAGE_COOKIE)?.value);
  const guides = await translateMemberGuidePosts(getStartGuides(await getPublishedMemberGuidePosts()), currentLanguage);
  const copy = await translateSimpleMemberCopy(
    {
      badge: "Panduan",
      description: "Materi pembuka untuk mengenali langkah penting sebelum lanjut ke setup bot maupun materi lanjutan.",
      emptyMessage: "Belum ada video panduan mulai yang dipublish.",
      listDescription: "Semua materi yang masuk kategori ini akan muncul di sini.",
      listTitle: "Daftar video",
      nowPlaying: "Sedang diputar",
      sectionDescription: "Pilih materi di samping untuk melihat preview utama dan mulai belajar lebih cepat.",
      title: "Mulai",
      videoTitle: "Video panduan",
    },
    currentLanguage,
  );

  return (
    <MemberVideoGuideSection
      badge={copy.badge}
      description={copy.description}
      emptyMessage={copy.emptyMessage}
      guides={guides}
      labels={copy}
      title={copy.title}
    />
  );
}
