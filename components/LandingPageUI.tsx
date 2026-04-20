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
  ctaExternal,
  ctaHref,
  ctaLabel,
  signupCtaHref,
}: LandingPageUIProps) {
  const registrationHref = signupCtaHref ?? ctaHref;

  return (
    <main className="flex-1 bg-[#f4f2ec] text-[#111827]" id="top">
      <HeroSection
        ctaExternal={ctaExternal}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
      />

      <div className="relative">
        <LandingHeader />
        <OverviewSection ctaHref={registrationHref} />
        <BenefitsSection />
        <PricingSection ctaHref={registrationHref} />
        <FaqSection />
        <GuideSection />
        <BlogSection />
        <FooterSection ctaHref={registrationHref} />
      </div>
    </main>
  );
}
