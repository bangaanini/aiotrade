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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,200,74,0.12)_0%,rgba(255,200,74,0)_100%)]" />
      <div className="pointer-events-none absolute left-[-10%] top-16 h-64 w-64 rounded-full bg-[#ffd972]/18 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-8 right-[-6%] h-72 w-72 rounded-full bg-[#58a6ff]/10 blur-[120px]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-[1.1rem] font-semibold tracking-[-0.015em] text-[#1b74df] sm:text-[2.05rem]">
            {content.eyebrow}
          </p>
          <h2 className="mt-4 text-[3rem] font-semibold leading-none tracking-[-0.04em] text-[#ffc84a] sm:text-[4.5rem]">
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
                  "relative overflow-hidden rounded-[24px] border px-0 py-0 text-center shadow-[0_24px_50px_rgba(15,23,42,0.12)] transition duration-300",
                  plan.emphasis
                    ? "border-[#ece7dc] bg-[linear-gradient(180deg,#ffffff_0%,#fbfaf7_100%)] lg:shadow-[0_30px_70px_rgba(15,23,42,0.18)]"
                    : "border-[#e6e1d6] bg-[linear-gradient(180deg,#ffffff_0%,#f9f8f4_100%)]",
                )}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(27,116,223,0.06)_0%,rgba(27,116,223,0)_100%)]" />
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(27,116,223,0.28)_50%,rgba(255,255,255,0)_100%)]" />

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
                    <p className="text-[4.55rem] font-bold leading-none tracking-[-0.05em] text-[#1b74df]">
                      #{content.plans.slice(0, index + 1).filter((entry) => !entry.emphasis).length}
                    </p>
                  ) : null}

                  {plan.emphasis ? (
                    <h3 className="text-[4rem] font-semibold leading-none tracking-[-0.055em] text-[#1b74df] sm:text-[4.9rem]">
                      {plan.name}
                    </h3>
                  ) : null}

                  <p
                    className={cn(
                      "mt-3 font-semibold tracking-[-0.025em] text-[#111827]",
                      plan.emphasis ? "text-[2rem] sm:text-[2.2rem]" : "text-[1.78rem]",
                    )}
                  >
                    {plan.emphasis ? "Akses Bot Crypto & Saham" : plan.name}
                  </p>

                  <div className="mt-6 flex items-end justify-center gap-3">
                    <span className="text-[3.2rem] font-bold leading-none tracking-[-0.04em] text-[#101728]">
                      {plan.price}
                    </span>
                    <span className="pb-1 text-[1.15rem] font-semibold text-[#22c55e]">Lifetime</span>
                  </div>

                  <p className="mx-auto mt-8 max-w-[24rem] text-[1.02rem] leading-[1.8] text-[#4b5563]">
                    {plan.description}
                  </p>

                  <div className="mt-8 flex justify-center">
                    <LandingCtaButton
                      className={cn(
                        "min-w-[212px]",
                        plan.emphasis && "shadow-[0_14px_30px_rgba(0,0,0,0.12)]",
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
