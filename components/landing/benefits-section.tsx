"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { features } from "@/components/landing/data";
import { SectionBackgroundLayer } from "@/components/landing/section-background-layer";
import { Reveal } from "@/components/ui/reveal";
import type { BenefitsContent } from "@/components/landing/types";

type BenefitsSectionProps = {
  content: BenefitsContent;
};

export function BenefitsSection({ content }: BenefitsSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [-34, 36]);
  const backgroundScale = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [1, 1] : [1.06, 1.12],
  );

  return (
    <section className="relative overflow-hidden py-20 text-[var(--landing-text-primary)] sm:py-24" ref={sectionRef}>
      <motion.div className="absolute inset-0" style={{ scale: backgroundScale, y: backgroundY }}>
        <SectionBackgroundLayer
          config={content.background}
          fallbackOverlayColor="#070a12"
          fallbackOverlayOpacity={74}
          fallbackPreset="dark-slate-cinematic"
        />
      </motion.div>
      <div className="absolute left-[-6%] top-10 h-56 w-56 rounded-full blur-[110px]" style={{ background: "color-mix(in srgb, var(--landing-accent-blue) 10%, transparent)" }} />
      <div className="absolute bottom-0 right-[-8%] h-64 w-64 rounded-full blur-[120px]" style={{ background: "color-mix(in srgb, var(--landing-accent-gold) 10%, transparent)" }} />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-5xl text-center">
          <p className="text-lg font-semibold text-[var(--landing-accent-gold)] sm:text-[2.2rem]">
            {content.heading}
          </p>
          <p className="mx-auto mt-4 max-w-4xl text-base leading-8 text-[var(--landing-text-secondary)] sm:text-[1.05rem]">
            {content.description}
          </p>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-6xl gap-5 md:grid-cols-2 xl:grid-cols-3">
          {content.items.map((feature, index) => {
            const Icon = features[index % features.length]?.icon ?? features[0].icon;

            return (
              <Reveal
                className="landing-glass-dark-panel rounded-[24px] px-6 py-8 text-center sm:px-7"
                delay={index * 0.08}
                direction="right"
                distance={38}
                duration={1.18}
                hover
                key={feature.title}
              >
                <span className="inline-flex h-16 w-16 items-center justify-center text-[#ffbf00]">
                  <Icon className="h-12 w-12" strokeWidth={2.1} />
                </span>
                <h3 className="mt-5 text-[1.9rem] font-semibold leading-tight text-[var(--landing-text-primary)]">
                  {feature.title}
                </h3>
                <p className="mt-4 text-lg leading-8 text-[var(--landing-text-secondary)]">{feature.description}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
