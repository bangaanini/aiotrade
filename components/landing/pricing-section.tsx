"use client";

import { LogIn } from "lucide-react";
import { LandingCtaButton } from "@/components/landing/landing-cta-button";
import { SectionBackgroundLayer } from "@/components/landing/section-background-layer";
import type { PricingContent } from "@/components/landing/types";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type PricingSectionProps = {
  content: PricingContent;
  ctaExternal?: boolean;
  ctaHref: string;
};

export function PricingSection({ content, ctaExternal = false, ctaHref }: PricingSectionProps) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24" id="harga">
      <SectionBackgroundLayer
        config={content.background}
        fallbackOverlayColor="#f8f6f0"
        fallbackOverlayOpacity={24}
        fallbackPreset="warm-ivory"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--landing-accent-gold)_14%,transparent)_0%,transparent_100%)]" />
      <div className="pointer-events-none absolute left-[-10%] top-16 h-64 w-64 rounded-full blur-[110px]" style={{ background: "color-mix(in srgb, var(--landing-accent-gold) 14%, transparent)" }} />
      <div className="pointer-events-none absolute bottom-8 right-[-6%] h-72 w-72 rounded-full blur-[120px]" style={{ background: "color-mix(in srgb, var(--landing-accent-blue) 10%, transparent)" }} />
      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-[1.1rem] font-semibold tracking-[-0.015em] text-[var(--landing-accent-blue)] sm:text-[2.05rem]">
            {content.eyebrow}
          </p>
          <h2 className="mt-4 text-[3rem] font-semibold leading-none tracking-[-0.04em] text-[var(--landing-accent-gold)] sm:text-[4.5rem]">
            {content.title}
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-center">
          {content.plans.map((plan, index) => (
            <Reveal
              className={cn(plan.emphasis ? "lg:-my-6" : undefined)}
              delay={index * 0.08}
              direction="right"
              distance={52}
              duration={1.28}
              hover
              key={plan.name}
            >
              <Card
                className={cn(
                  "landing-glass-card landing-glass-card-hover relative overflow-hidden rounded-[30px] px-0 py-0 text-center transition duration-300",
                  plan.emphasis
                    ? "lg:shadow-[0_34px_74px_rgba(148,163,184,0.22),0_14px_34px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.94)]"
                    : undefined,
                )}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(27,116,223,0.06)_0%,rgba(27,116,223,0)_100%)]" />
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.82)_50%,rgba(255,255,255,0)_100%)]" />

                {plan.highlight ? (
                  <span className="absolute right-6 top-5 inline-flex rounded-full bg-[#ffcc45] px-4 py-2 text-sm font-bold uppercase text-[#1f2937]">
                    {plan.highlight}
                  </span>
                ) : null}

                <CardContent
                  className={cn(
                    "px-8 py-10 lg:px-7 lg:py-9",
                    plan.emphasis && "lg:px-8 lg:py-12",
                  )}
                >
                  {!plan.emphasis ? (
                    <p className="text-[4.55rem] font-bold leading-none tracking-[-0.05em] text-[var(--landing-accent-blue)]">
                      #{content.plans.slice(0, index + 1).filter((entry) => !entry.emphasis).length}
                    </p>
                  ) : null}

                  {plan.emphasis ? (
                    <h3 className="text-[4rem] font-semibold leading-none tracking-[-0.055em] text-[var(--landing-accent-blue)] sm:text-[4.9rem]">
                      {plan.name}
                    </h3>
                  ) : null}

                  <p
                    className={cn(
                      "mt-3 font-semibold tracking-[-0.025em] text-[var(--landing-text-primary)]",
                      plan.emphasis ? "text-[2rem] sm:text-[2.2rem]" : "text-[1.78rem]",
                    )}
                  >
                    {plan.emphasis ? "Akses Bot Crypto & Saham" : plan.name}
                  </p>

                  <div className="mt-6 flex items-end justify-center gap-3">
                    <span className="text-[3.2rem] font-bold leading-none tracking-[-0.04em] text-[var(--landing-text-primary)]">
                      {plan.price}
                    </span>
                    <span className="pb-1 text-[1.15rem] font-semibold text-[var(--landing-accent-green)]">Lifetime</span>
                  </div>

                  <p className="mx-auto mt-8 max-w-[24rem] text-[1.02rem] leading-[1.8] text-[var(--landing-text-secondary)]">
                    {plan.description}
                  </p>

                  <div className="mt-8 flex justify-center">
                    <LandingCtaButton
                      className={cn(
                        "landing-pricing-cta min-w-[212px]",
                        plan.emphasis && "landing-glass-button-accent text-white",
                      )}
                      external={ctaExternal}
                      href={ctaHref}
                      icon={LogIn}
                      label={content.buttonLabel}
                      size="compact"
                    />
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
