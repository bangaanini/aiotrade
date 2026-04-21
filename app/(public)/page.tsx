import { cookies } from "next/headers";
import type { Metadata } from "next";
import LandingPageUI from "@/components/LandingPageUI";
import { getPublishedBlogPosts } from "@/lib/blog-posts";
import { getHomepageContent } from "@/lib/homepage-content";
import { LANDING_REFERRAL_COOKIE_NAME, resolveHomepageReferralState } from "@/lib/referral";
import { buildHomePageMetadata, getSiteSeoSettings } from "@/lib/site-seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSiteSeoSettings();

  return buildHomePageMetadata(seo);
}

export default async function HomePage() {
  const [content, cookieStore, blogPosts] = await Promise.all([
    getHomepageContent(),
    cookies(),
    getPublishedBlogPosts(3),
  ]);
  const referralState = await resolveHomepageReferralState(
    cookieStore.get(LANDING_REFERRAL_COOKIE_NAME)?.value ?? null,
  );

  return (
    <LandingPageUI
      blogPosts={blogPosts.map((post) => ({
        category: post.category,
        excerpt: post.excerpt,
        publishedAt: post.publishedAt,
        slug: post.slug,
        thumbnailUrl: post.thumbnailUrl,
        title: post.title,
      }))}
      content={content}
      ctaExternal={referralState.ctaExternal}
      ctaHref={referralState.ctaHref}
      signupCtaExternal={referralState.signupExternal}
      signupCtaHref={referralState.signupHref}
    />
  );
}
