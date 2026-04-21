"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { SectionBackgroundLayer } from "@/components/landing/section-background-layer";
import type { GuideContent } from "@/components/landing/types";
import { Reveal } from "@/components/ui/reveal";

type GuideSectionProps = {
  content: GuideContent;
};

export function GuideSection({ content }: GuideSectionProps) {
  return (
    <section className="relative overflow-hidden py-20" id="panduan">
      <SectionBackgroundLayer
        config={content.background}
        fallbackOverlayColor="#ffffff"
        fallbackOverlayOpacity={20}
        fallbackPreset="sky-blue-accent"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(37,99,235,0.05)_0%,rgba(37,99,235,0)_100%)]" />
      <div className="pointer-events-none absolute left-[-5%] top-24 h-52 w-52 rounded-full bg-[#76a9ff]/10 blur-[96px]" />
      <div className="pointer-events-none absolute bottom-0 right-[-8%] h-64 w-64 rounded-full bg-[#ffd673]/16 blur-[120px]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-[1.05rem] font-semibold tracking-[-0.02em] text-[#1c74de] sm:text-[1.3rem]">
            {content.eyebrow}
          </p>
          <h2 className="mt-5 text-[3rem] font-semibold leading-none tracking-[-0.045em] text-[#ffc84a] sm:text-[4.45rem]">
            {content.title}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {content.steps.map((step, index) => (
            <Reveal
              className="rounded-[24px] border border-[#ece7dc] bg-white px-7 py-9 text-center shadow-[0_18px_46px_rgba(15,23,42,0.12)]"
              delay={index * 0.08}
              direction="right"
              distance={40}
              duration={1.18}
              hover
              key={step.number}
            >
              <p className="text-[4.2rem] font-bold leading-none tracking-[-0.05em] text-[#1b74df] sm:text-[4.7rem]">
                {step.number}.
              </p>
              <h3 className="mt-4 text-[1.95rem] font-semibold leading-[1.15] tracking-[-0.03em] text-[#121826]">
                {step.title}
              </h3>
              <p className="mx-auto mt-5 max-w-[21rem] text-[1.02rem] leading-[1.75] text-[#4b5563]">
                {step.description}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex justify-center" delay={0.16}>
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border border-[#5aa0ff] bg-white px-6 text-[1.05rem] font-medium text-[#2a7df1] shadow-[0_10px_24px_rgba(42,125,241,0.1)] transition duration-300 hover:bg-[#eef5ff]"
            href="#faq"
          >
            <BookOpen className="h-4 w-4" />
            {content.buttonLabel}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
