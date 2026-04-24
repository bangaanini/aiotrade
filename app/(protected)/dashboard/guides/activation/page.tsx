import { cookies } from "next/headers";
import { getActivationGuides } from "@/lib/member-guide-categories";
import { getPublishedMemberGuidePosts } from "@/lib/member-guides";
import { translateMemberGuidePosts, translateSimpleMemberCopy } from "@/lib/member-translations";
import { MemberVideoGuideSection } from "@/components/dashboard/member-guide-sections";
import { parseSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";

export default async function DashboardGuideActivationPage() {
  const cookieStore = await cookies();
  const currentLanguage = parseSiteLanguage(cookieStore.get(SITE_LANGUAGE_COOKIE)?.value);
  const guides = await translateMemberGuidePosts(
    getActivationGuides(await getPublishedMemberGuidePosts()),
    currentLanguage,
  );
  const copy = await translateSimpleMemberCopy(
    {
      badge: "Panduan",
      description: "Materi langkah awal untuk setup bot, sambungan API, dan persiapan penggunaan member area.",
      emptyMessage: "Belum ada video panduan setup bot yang dipublish.",
      listDescription: "Semua materi yang masuk kategori ini akan muncul di sini.",
      listTitle: "Daftar video",
      nowPlaying: "Sedang diputar",
      sectionDescription: "Pilih materi di samping untuk melihat preview utama dan mulai belajar lebih cepat.",
      title: "Setup Bot",
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
