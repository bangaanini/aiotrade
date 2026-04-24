import { cookies } from "next/headers";
import type { Metadata } from "next";
import LandingPageUI from "@/components/LandingPageUI";
import { navItems } from "@/components/landing/data";
import { getPublishedBlogPosts } from "@/lib/blog-posts";
import { getHomepageContent } from "@/lib/homepage-content";
import { LANDING_THEME_COOKIE, parseLandingTheme } from "@/lib/landing-theme";
import { translateBlogPreviewItems, translateHomepageContent, translateLandingNavItems } from "@/lib/public-translations";
import { LANDING_REFERRAL_COOKIE_NAME, resolveHomepageReferralState } from "@/lib/referral";
import { parseSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";
import { buildHomePageMetadata, getSiteSeoSettings } from "@/lib/site-seo";
import { getSupportedSiteLanguages } from "@/lib/translatex";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeoSettings();

  return buildHomePageMetadata(seo);
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const currentLanguage = parseSiteLanguage(cookieStore.get(SITE_LANGUAGE_COOKIE)?.value);
  const [content, blogPosts, languageOptions, translatedNavItems] = await Promise.all([
    getHomepageContent(),
    getPublishedBlogPosts(3),
    getSupportedSiteLanguages(),
    translateLandingNavItems(navItems, currentLanguage),
  ]);
  const referralState = await resolveHomepageReferralState(
    cookieStore.get(LANDING_REFERRAL_COOKIE_NAME)?.value ?? null,
  );
  const translatedContent = await translateHomepageContent(content, currentLanguage);
  const translatedBlogPosts = await translateBlogPreviewItems(
    blogPosts.map((post) => ({
      category: post.category,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      slug: post.slug,
      thumbnailUrl: post.thumbnailUrl,
      title: post.title,
    })),
    currentLanguage,
  );

  return (
    <LandingPageUI
      blogPosts={translatedBlogPosts}
      content={translatedContent}
      currentLanguage={currentLanguage}
      ctaExternal={referralState.ctaExternal}
      ctaHref={referralState.ctaHref}
      signupCtaExternal={referralState.signupExternal}
      signupCtaHref={referralState.signupHref}
      whatsappHref={referralState.whatsappHref}
      initialTheme={parseLandingTheme(cookieStore.get(LANDING_THEME_COOKIE)?.value)}
      languageOptions={languageOptions}
      navItems={translatedNavItems}
    />
  );
}
