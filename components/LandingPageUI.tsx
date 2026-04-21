"use client";

import { BenefitsSection } from "@/components/landing/benefits-section";
import { BlogSection } from "@/components/landing/blog-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FooterSection } from "@/components/landing/footer-section";
import { GuideSection } from "@/components/landing/guide-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingHeader } from "@/components/landing/landing-header";
import { OverviewSection } from "@/components/landing/overview-section";
import { PricingSection } from "@/components/landing/pricing-section";
import type { LandingPageUIProps } from "@/components/landing/types";

export default function LandingPageUI({
  blogPosts = [],
  content,
  ctaExternal,
  ctaHref,
  ctaLabel,
  previewMode = false,
  signupCtaExternal,
  signupCtaHref,
}: LandingPageUIProps) {
  const registrationHref = signupCtaHref ?? ctaHref;
  const registrationExternal = signupCtaExternal ?? false;

  return (
    <main className="flex-1 bg-[#f4f2ec] text-[#111827]" id="top">
      <HeroSection
        content={content.hero}
        ctaExternal={ctaExternal}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
      />

      <div className="relative">
        <LandingHeader previewMode={previewMode} />
        <OverviewSection
          content={content.overview}
          ctaExternal={registrationExternal}
          ctaHref={registrationHref}
          previewMode={previewMode}
        />
        <BenefitsSection content={content.benefits} />
        <PricingSection content={content.pricing} ctaExternal={registrationExternal} ctaHref={registrationHref} />
        <FaqSection content={content.faq} />
        <GuideSection content={content.guide} />
        <BlogSection content={content.blog} posts={blogPosts} />
        <FooterSection
          content={content.footer}
          ctaExternal={registrationExternal}
          ctaHref={registrationHref}
          previewMode={previewMode}
        />
      </div>
    </main>
  );
}
