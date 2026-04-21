"use client";

import { useRef } from "react";
import Image from "next/image";
import { Users } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { landingImages, partnerLogos } from "@/components/landing/data";
import { LandingCtaButton } from "@/components/landing/landing-cta-button";
import { SectionBackgroundLayer } from "@/components/landing/section-background-layer";
import { TickerStrip } from "@/components/landing/ticker-strip";
import { Reveal } from "@/components/ui/reveal";
import type { OverviewContent } from "@/components/landing/types";

type OverviewSectionProps = {
  content: OverviewContent;
  ctaExternal?: boolean;
  ctaHref: string;
  previewMode?: boolean;
};

const duplicatedPartnerLogos = [...partnerLogos, ...partnerLogos];

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
  const phoneY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [16, -22]);
  const contentY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [12, -14]);

  return (
    <section className="relative text-white" id="fitur" ref={sectionRef}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <SectionBackgroundLayer
          config={content.background}
          fallbackOverlayColor="#0f1728"
          fallbackOverlayOpacity={52}
          fallbackPreset="dark-navy"
        />
        <motion.div className="absolute bottom-0 left-0 h-full w-[58%]" style={{ y: leftChartY }}>
          <Image
            alt=""
            aria-hidden
            className="absolute bottom-0 left-0 h-full w-full object-cover object-left opacity-[0.14]"
            src={landingImages.chartImage}
          />
        </motion.div>
        <motion.div className="absolute inset-y-0 right-0 h-full w-[62%]" style={{ y: rightChartY }}>
          <Image
            alt=""
            aria-hidden
            className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-[0.18]"
            src={landingImages.chartImage}
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,40,0.98)_0%,rgba(15,23,40,0.92)_36%,rgba(18,74,139,0.54)_100%)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-12 pt-8 sm:px-8 sm:pb-20 sm:pt-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10 lg:px-10 lg:pt-14">
        <motion.div
          animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
          className="relative flex min-h-[250px] items-center justify-center pb-2 lg:min-h-[600px] lg:justify-start lg:pb-0"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -36 }}
          style={{ y: phoneY }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    rotate: [0, -1.2, 0.9, 0],
                    y: [0, -10, 0, -6, 0],
                  }
            }
            className="relative w-full max-w-[280px] sm:max-w-[430px] lg:max-w-[520px] lg:-ml-4"
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    duration: 7.2,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                  }
            }
            whileHover={
              prefersReducedMotion
                ? undefined
                : {
                    rotate: -1.5,
                    y: -8,
                    scale: 1.015,
                  }
            }
          >
            <div className="absolute inset-x-[10%] bottom-6 h-16 rounded-full bg-[#0ea5ff]/14 blur-[34px] sm:bottom-8 sm:h-24 sm:blur-[52px]" />
            <Image
              alt="Mockup aplikasi mobile AIOTrade berisi trade history dan profit."
              className="relative z-10 h-auto w-full drop-shadow-[0_24px_42px_rgba(0,0,0,0.4)] sm:drop-shadow-[0_34px_58px_rgba(0,0,0,0.44)] lg:origin-left lg:scale-[1.06]"
              priority
              sizes="(max-width: 1024px) 100vw, 520px"
              src={landingImages.phoneImage}
            />
          </motion.div>
        </motion.div>

        <motion.div
          animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
          className="relative z-10 mx-auto flex w-full max-w-[24rem] flex-col items-center text-center lg:max-w-none lg:items-start lg:pl-3 lg:text-left"
          initial={prefersReducedMotion ? false : { opacity: 0, x: 36 }}
          style={{ y: contentY }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <Reveal className="w-full" delay={0.02}>
            <h2 className="text-[2.2rem] font-medium uppercase leading-none tracking-[0.03em] text-white sm:text-[3.05rem] sm:tracking-[0.055em] lg:text-[3.85rem]">
              <span className="text-[#10a7ff]">{content.titleBlue}</span>
              {content.titleWhite}
            </h2>
          </Reveal>
          <Reveal className="w-full" delay={0.08}>
            <p className="mt-5 max-w-[22rem] text-[0.95rem] leading-[1.9] text-white/78 sm:mt-7 sm:max-w-[44rem] sm:text-[1.08rem] sm:leading-[2.05] lg:text-[1.12rem]">
              {content.description}
            </p>
          </Reveal>

          <Reveal className="relative mt-8 w-full max-w-[24rem] overflow-hidden sm:mt-10 lg:max-w-none" delay={0.14}>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-[linear-gradient(90deg,#0f1728_0%,rgba(15,23,40,0)_100%)] sm:w-16" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-[linear-gradient(270deg,#124a8b_0%,rgba(18,74,139,0)_100%)] sm:w-16" />
            <motion.div
              animate={prefersReducedMotion ? { x: "0%" } : { x: ["0%", "-50%"] }}
              className="flex w-max items-center gap-8 py-2 sm:gap-14 sm:py-3"
              transition={
                prefersReducedMotion
                  ? undefined
                  : {
                      duration: 16,
                      ease: "linear",
                      repeat: Number.POSITIVE_INFINITY,
                    }
              }
            >
              {duplicatedPartnerLogos.map((logo, index) => (
                <div
                  className="flex h-[70px] w-[170px] flex-none items-center justify-center sm:h-[84px] sm:w-[260px]"
                  key={`${logo.alt}-${index}`}
                >
                  <Image
                    alt={logo.alt}
                    className="h-auto max-h-12 w-auto opacity-100 sm:max-h-16"
                    src={logo.src}
                  />
                </div>
              ))}
            </motion.div>
          </Reveal>

          <Reveal
            className="mt-8 flex w-full justify-center sm:mt-10 lg:justify-start"
            delay={0.18}
          >
            <LandingCtaButton
              className="w-full max-w-[220px] sm:min-w-[304px] sm:max-w-none sm:w-auto"
              external={ctaExternal}
              href={ctaHref}
              icon={Users}
              label={content.ctaLabel}
            />
          </Reveal>
        </motion.div>
      </div>

      <TickerStrip
        className="relative z-10 mt-2 border-white/10 bg-[rgba(8,14,27,0.38)]"
        previewMode={previewMode}
      />
    </section>
  );
}
