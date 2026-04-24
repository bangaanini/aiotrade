"use client";

import { useRef } from "react";
import Image from "next/image";
import { LogIn } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { landingImages, partnerLogos } from "@/components/landing/data";
import { LandingCtaButton } from "@/components/landing/landing-cta-button";
import { SectionBackgroundLayer } from "@/components/landing/section-background-layer";
import { TickerStrip } from "@/components/landing/ticker-strip";
import { Reveal } from "@/components/ui/reveal";
import type { OverviewContent } from "@/components/landing/types";

const duplicatedPartnerLogos = [...partnerLogos, ...partnerLogos];

type OverviewSectionProps = {
  content: OverviewContent;
  ctaExternal?: boolean;
  ctaHref: string;
  previewMode?: boolean;
};

export function OverviewSection({
  content,
  ctaExternal = false,
  ctaHref,
  previewMode = false,
}: OverviewSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const leftChartY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [-26, 24]);
  const rightChartY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [18, -22]);

  return (
    <section className="relative text-[var(--landing-text-primary)]" id="fitur" ref={sectionRef}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <SectionBackgroundLayer
          config={content.background}
          fallbackOverlayColor="#070a12"
          fallbackOverlayOpacity={74}
          fallbackPreset="dark-slate-cinematic"
        />
        <motion.div
          className="absolute left-[-10%] top-12 h-64 w-64 rounded-full blur-[120px]"
          style={{ background: "color-mix(in srgb, var(--landing-accent-blue) 12%, transparent)", y: leftChartY }}
        />
        <motion.div
          className="absolute bottom-0 right-[-8%] h-72 w-72 rounded-full blur-[130px]"
          style={{ background: "color-mix(in srgb, var(--landing-accent-gold) 12%, transparent)", y: rightChartY }}
        />
      </div>

      <motion.div
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-8 sm:pb-14 sm:pt-10 lg:px-10 lg:pt-12"
        initial={prefersReducedMotion ? false : { opacity: 1, y: 14 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="landing-glass-panel relative overflow-hidden rounded-[34px] px-4 py-6 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--landing-accent-blue)_10%,transparent),transparent_42%),radial-gradient(circle_at_bottom_right,color-mix(in_srgb,var(--landing-accent-gold)_10%,transparent),transparent_42%)]" />
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.72)_50%,rgba(255,255,255,0)_100%)]" />

          <div className="relative z-10 grid items-center gap-7 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-10">
            <div className="relative flex min-h-[238px] items-center justify-center lg:min-h-[560px] lg:justify-start">
              <div className="relative mx-auto w-full max-w-[270px] sm:max-w-[430px] lg:mx-0 lg:max-w-[520px] lg:-ml-4">
                <div className="absolute inset-x-[10%] bottom-6 h-16 rounded-full bg-[#0ea5ff]/14 blur-[34px] sm:bottom-8 sm:h-24 sm:blur-[52px]" />
                <Image
                  alt="Mockup aplikasi mobile AIOTrade berisi trade history dan profit."
                  className="relative z-10 h-auto w-full drop-shadow-[0_24px_42px_rgba(0,0,0,0.28)] sm:drop-shadow-[0_34px_58px_rgba(0,0,0,0.32)] lg:origin-left lg:scale-[1.03]"
                  priority
                  sizes="(max-width: 1024px) 100vw, 520px"
                  src={landingImages.phoneImage}
                />
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-[24rem] flex-col items-center text-center lg:max-w-none lg:items-start lg:text-left">
              <Reveal className="w-full" delay={0.02} stable>
                <div className="mx-auto w-full max-w-[22rem] sm:max-w-[30rem] lg:mx-0 lg:max-w-[34rem]">
                  <div className="flex justify-center lg:justify-start">
                    <Image
                      alt="AIOTrade"
                      className="landing-overview-logo-image h-auto w-[180px] object-contain sm:w-[220px] lg:w-[260px]"
                      priority={false}
                      sizes="(max-width: 640px) 180px, (max-width: 1024px) 220px, 260px"
                      src={landingImages.logoImage}
                    />
                  </div>
                  <p className="landing-overview-description mx-auto mt-5 max-w-[21rem] text-[0.95rem] leading-[1.9] text-[var(--landing-text-secondary)] sm:mt-6 sm:max-w-[26rem] sm:text-[1.04rem] sm:leading-[1.95] lg:mx-0 lg:max-w-[30rem] lg:text-[1.1rem] lg:leading-[2]">
                    {content.description}
                  </p>
                </div>
              </Reveal>

              <Reveal
                className="relative mt-8 w-full max-w-[22rem] overflow-hidden rounded-[24px] sm:mt-10 sm:max-w-none"
                delay={0.14}
                stable
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-[linear-gradient(90deg,var(--landing-surface-bg)_0%,rgba(255,255,255,0)_100%)] sm:w-14" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-[linear-gradient(270deg,var(--landing-surface-bg)_0%,rgba(255,255,255,0)_100%)] sm:w-14" />
                <motion.div
                  animate={prefersReducedMotion ? { x: "0%" } : { x: ["0%", "-50%"] }}
                  className="flex w-max items-stretch gap-3 py-1"
                  transition={
                    prefersReducedMotion
                      ? undefined
                      : {
                          duration: 18,
                          ease: "linear",
                          repeat: Number.POSITIVE_INFINITY,
                        }
                  }
                >
                  {duplicatedPartnerLogos.map((logo, index) => (
                    <div
                      className="landing-glass-card flex min-h-[74px] min-w-[132px] items-center justify-center rounded-[20px] px-4 py-4 sm:min-h-[82px] sm:min-w-[168px] sm:px-5"
                      key={`${logo.alt}-${index}`}
                    >
                      <Image
                        alt={logo.alt}
                        className="h-auto max-h-8 w-auto object-contain sm:max-h-10"
                        src={logo.src}
                      />
                    </div>
                  ))}
                </motion.div>
              </Reveal>

              <Reveal
                className="mt-8 flex w-full justify-center sm:mt-10 lg:justify-start"
                delay={0.18}
                stable
              >
                <LandingCtaButton
                  className="landing-overview-cta w-full max-w-[220px] sm:min-w-[304px] sm:max-w-none sm:w-auto"
                  external={ctaExternal}
                  href={ctaHref}
                  icon={LogIn}
                  label={content.ctaLabel}
                />
              </Reveal>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-4 sm:mt-10 sm:pt-5">
            <TickerStrip
              className="rounded-none border-t-0 bg-transparent px-0 py-0"
              previewMode={previewMode}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
