import { cookies } from "next/headers";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ExternalLink, FileText, Sparkles } from "lucide-react";
import { SiteLanguageSelector } from "@/components/shared/site-language-selector";
import { FloatingWhatsAppButton } from "@/components/landing/floating-whatsapp-button";
import { navItems } from "@/components/landing/data";
import type { PublicGuidePdfPost } from "@/lib/public-guide-types";
import { translateHomepageContent, translateLandingNavItems, translatePublicGuidePdfPosts } from "@/lib/public-translations";
import { getPublishedPublicGuidePdfPosts } from "@/lib/public-guides";
import { getHomepageContent } from "@/lib/homepage-content";
import { LANDING_REFERRAL_COOKIE_NAME, resolveHomepageReferralState } from "@/lib/referral";
import { parseSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";
import { getSiteSeoSettings } from "@/lib/site-seo";
import { getSupportedSiteLanguages, translateRecordStrings } from "@/lib/translatex";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeoSettings();

  return {
    title: `Panduan PDF | ${seo.siteName}`,
    description: "Kumpulan file panduan PDF resmi AIOTrade yang bisa dibuka langsung dari halaman publik.",
    openGraph: {
      description: "Kumpulan file panduan PDF resmi AIOTrade yang bisa dibuka langsung dari halaman publik.",
      title: `Panduan PDF | ${seo.siteName}`,
      type: "website",
      url: `${seo.siteUrl.replace(/\/$/, "")}/guide`,
    },
  };
}

export default async function GuidePage() {
  const cookieStore = await cookies();
  const currentLanguage = parseSiteLanguage(cookieStore.get(SITE_LANGUAGE_COOKIE)?.value);
  const [pdfs, content, languageOptions, translatedNavItems, guideCopy] = await Promise.all([
    getPublishedPublicGuidePdfPosts(),
    getHomepageContent(),
    getSupportedSiteLanguages(),
    translateLandingNavItems(navItems, currentLanguage),
    translateRecordStrings({
      record: {
        backToHome: "Kembali ke beranda",
        ctaButton: "Masuk ke Member Area",
        ctaDescription:
          "Dapatkan akses penuh ke guide, materi member, dan alur setup yang lebih terarah setelah Anda membuat akun.",
        ctaEyebrow: "KHUSUS MEMBER",
        ctaTitle: "Akses member area untuk panduan lengkap.",
        empty: "Belum ada panduan PDF yang dipublish.",
        fallbackDescription: "File panduan resmi AIOTrade yang bisa Anda buka langsung dari halaman ini.",
        footerBlog: "Blog",
        footerFaq: "FAQ",
        footerFeature: "Feature",
        footerGuide: "User Guide",
        footerHarga: "Harga",
        heading: "Guide PDF",
        openPdf: "Buka PDF",
        pageEyebrow: "Panduan resmi AIOTrade",
      },
      targetLanguage: currentLanguage,
    }),
  ]);
  const referralState = await resolveHomepageReferralState(
    cookieStore.get(LANDING_REFERRAL_COOKIE_NAME)?.value ?? null,
  );
  const [translatedPdfs, translatedContent] = await Promise.all([
    translatePublicGuidePdfPosts(pdfs, currentLanguage),
    translateHomepageContent(content, currentLanguage),
  ]);

  return (
    <main className="min-h-screen bg-[#f4f2ec] text-[#111827]" id="top">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(11,19,34,0.96)] backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[60px] w-full max-w-7xl items-center justify-between gap-6 px-4 sm:min-h-[70px] sm:px-8 lg:px-10">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-white/72 transition hover:text-white"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            {guideCopy.backToHome}
          </Link>

          <div className="flex items-center gap-3">
            <nav className="no-scrollbar flex max-w-full items-center gap-2 overflow-x-auto text-[0.82rem] text-white/80 sm:gap-6 sm:text-[1rem]">
              {translatedNavItems.map((item, index) => {
                const href = item.href === "#blog" ? "/blog" : item.href === "#panduan" ? "/guide" : `/${item.href}`;
                const isActive = item.href === "#panduan";

                return (
                  <div className="flex items-center gap-2 sm:gap-6" key={item.href}>
                    {index > 0 ? <span className="text-white/28">|</span> : null}
                    <Link
                      className="relative inline-flex whitespace-nowrap rounded-md px-2 py-2 transition duration-300 hover:text-white sm:px-3"
                      href={href}
                      style={
                        isActive
                          ? {
                              color: item.accent,
                              textShadow: `0 0 18px ${item.accent}22`,
                            }
                          : undefined
                      }
                    >
                      <span>{item.label}</span>
                      {isActive ? (
                        <span
                          className="absolute inset-x-2 bottom-0 h-[2px] rounded-full sm:inset-x-3"
                          style={{
                            backgroundColor: item.accent,
                            boxShadow: `0 0 18px ${item.accent}73`,
                          }}
                        />
                      ) : null}
                    </Link>
                  </div>
                );
              })}
            </nav>
            <SiteLanguageSelector
              currentLanguage={currentLanguage}
              languages={languageOptions}
              variant="landing"
            />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-18 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,200,74,0.10)_0%,rgba(255,200,74,0)_30%),radial-gradient(circle_at_top_left,rgba(27,116,223,0.10),transparent_34%)]" />
        <div className="pointer-events-none absolute left-[-7%] top-16 h-64 w-64 rounded-full bg-[#ffd972]/18 blur-[110px]" />
        <div className="pointer-events-none absolute bottom-10 right-[-5%] h-72 w-72 rounded-full bg-[#58a6ff]/12 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div className="max-w-4xl">
              <p className="text-[1.05rem] font-semibold tracking-[-0.02em] text-[#1c74de] sm:text-[1.3rem]">
                {guideCopy.pageEyebrow}
              </p>
              <h1 className="mt-5 text-[3rem] font-semibold leading-none tracking-[-0.045em] text-[#ffc84a] sm:text-[4.45rem]">
                {guideCopy.heading}
              </h1>
              
            </div>

            
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {translatedPdfs.length ? (
              translatedPdfs.map((pdf: PublicGuidePdfPost, index: number) => (
                <article
                  className="relative overflow-hidden rounded-[26px] border border-[#e6e1d6] bg-[linear-gradient(180deg,#ffffff_0%,#f9f8f4_100%)] px-7 py-8 shadow-[0_24px_50px_rgba(15,23,42,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_rgba(15,23,42,0.14)]"
                  key={pdf.id}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(27,116,223,0.06)_0%,rgba(27,116,223,0)_100%)]" />
                  <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(27,116,223,0.28)_50%,rgba(255,255,255,0)_100%)]" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#eef5ff] text-[#1b74df]">
                        <FileText className="h-6 w-6" />
                      </div>
                      <span className="inline-flex rounded-full bg-[#ffcc45] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#1f2937]">
                        PDF #{index + 1}
                      </span>
                    </div>

                    <h2 className="mt-6 text-[1.85rem] font-semibold leading-[1.12] tracking-[-0.04em] text-[#111827]">
                      {pdf.title}
                    </h2>
                    <p className="mt-5 min-h-[7.5rem] text-[1rem] leading-[1.85] text-[#4b5563]">
                      {pdf.description || guideCopy.fallbackDescription}
                    </p>

                    <div className="mt-7 flex items-end justify-between gap-4">
                      

                      <Link
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border border-[#5aa0ff] bg-white px-5 text-[1rem] font-medium text-[#2a7df1] shadow-[0_10px_24px_rgba(42,125,241,0.1)] transition duration-300 hover:bg-[#eef5ff]"
                        href={pdf.fileUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {guideCopy.openPdf}
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-[#d9d1c3] bg-[rgba(255,255,255,0.82)] px-8 py-16 text-center text-[#667085] shadow-[0_18px_46px_rgba(15,23,42,0.08)] md:col-span-2 xl:col-span-3">
                {guideCopy.empty}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 pb-18 sm:px-8 sm:pb-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[32px] border border-[#0b1322]/8 bg-[linear-gradient(135deg,#0b1322_0%,#102340_54%,#15457a_100%)] px-7 py-8 text-white shadow-[0_30px_70px_rgba(11,19,34,0.24)] sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,200,74,0.2)_0%,rgba(255,200,74,0)_32%),radial-gradient(circle_at_bottom_right,rgba(16,167,255,0.2)_0%,rgba(16,167,255,0)_28%)]" />
            <div className="pointer-events-none absolute -left-10 top-10 h-36 w-36 rounded-full bg-[#ffc84a]/14 blur-[76px]" />
            <div className="pointer-events-none absolute -right-8 bottom-4 h-40 w-40 rounded-full bg-[#10a7ff]/18 blur-[86px]" />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.2em] text-[#ffd972]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {guideCopy.ctaEyebrow}
                </div>
                <h2 className="mt-5 text-[2rem] font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-[2.7rem] lg:text-[3.2rem]">
                  {guideCopy.ctaTitle}
                </h2>
                <p className="mt-5 max-w-2xl text-[1rem] leading-[1.9] text-white/74 sm:text-[1.06rem]">
                  {guideCopy.ctaDescription}
                </p>
              </div>

              <div className="flex shrink-0 items-center">
                <Link
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[18px] bg-[#ffc84a] px-6 py-3 text-[1rem] font-semibold text-[#0b1322] shadow-[0_18px_36px_rgba(255,200,74,0.26)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffd972]"
                  href={referralState.signupHref}
                  rel={referralState.signupExternal ? "noreferrer" : undefined}
                  target={referralState.signupExternal ? "_blank" : undefined}
                >
                  {guideCopy.ctaButton}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden border-t border-white/10 bg-[#0b1322] px-6 py-10 text-white sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(17,167,255,0.08)_0%,rgba(17,167,255,0)_34%)]" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[34rem]">
            <Link className="inline-flex items-baseline text-[2rem] font-semibold tracking-[-0.06em]" href="/">
              <span className="text-[#10a7ff]">AIO</span>
              <span className="text-white">TRADE</span>
            </Link>
            <p className="mt-4 text-[1rem] leading-[1.75] text-white/70">{translatedContent.footer.description}</p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[0.98rem] text-white/72">
            <Link className="transition hover:text-white" href="/#fitur">
              {guideCopy.footerFeature}
            </Link>
            <Link className="transition hover:text-white" href="/#harga">
              {guideCopy.footerHarga}
            </Link>
            <Link className="transition hover:text-white" href="/#faq">
              {guideCopy.footerFaq}
            </Link>
            <Link className="transition hover:text-white" href="/guide">
              {guideCopy.footerGuide}
            </Link>
            <Link className="transition hover:text-white" href="/blog">
              {guideCopy.footerBlog}
            </Link>
          </div>
        </div>
      </footer>

      {referralState.whatsappHref ? <FloatingWhatsAppButton href={referralState.whatsappHref} /> : null}
    </main>
  );
}
