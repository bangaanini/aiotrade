import { BenefitsSection } from "@/components/landing/benefits-section";
import { BlogSection } from "@/components/landing/blog-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FaqSection } from "@/components/landing/faq-section";
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
    <main className="flex-1 overflow-x-hidden bg-[#f4f2ec] text-[#111827]">
      <HeroSection
        ctaExternal={ctaExternal}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
      />
      <LandingHeader />
      <OverviewSection ctaHref={registrationHref} />
      <BenefitsSection />
      <PricingSection ctaHref={registrationHref} />
      <FaqSection />
      <GuideSection />
      <BlogSection />
      <CtaSection ctaHref={registrationHref} />
    </main>
  );
}
