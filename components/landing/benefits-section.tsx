"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { features, landingImages } from "@/components/landing/data";
import { Reveal } from "@/components/ui/reveal";

export function BenefitsSection() {
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
    <section className="relative overflow-hidden py-20 text-white sm:py-24" ref={sectionRef}>
      <motion.div className="absolute inset-0" style={{ scale: backgroundScale, y: backgroundY }}>
        <Image
          alt="Komunitas AIOTrade di acara edukasi trading."
          className="absolute inset-0 h-full w-full object-cover"
          fill
          sizes="100vw"
          src={landingImages.heroImage}
        />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,18,0.7)_0%,rgba(7,10,18,0.78)_28%,rgba(7,10,18,0.74)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,194,63,0.08)_0%,rgba(255,194,63,0)_28%)]" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-5xl text-center">
          <p className="text-lg font-semibold text-[#f6be4f] sm:text-[2.2rem]">
            Mengapa Trading Crypto Menggunakan Aio Trade?
          </p>
          <p className="mx-auto mt-4 max-w-4xl text-base leading-8 text-white/82 sm:text-[1.05rem]">
            Aio Trade cocok digunakan untuk semua kalangan, Trader (Pemula atau Profesional)
            dan Investor
          </p>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-6xl gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Reveal
                className="rounded-lg border border-white/8 bg-[rgba(10,18,34,0.78)] px-6 py-8 text-center shadow-[0_24px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:px-7"
                delay={index * 0.08}
                hover
                key={feature.title}
              >
                <span className="inline-flex h-16 w-16 items-center justify-center text-[#ffbf00]">
                  <Icon className="h-12 w-12" strokeWidth={2.1} />
                </span>
                <h3 className="mt-5 text-[1.9rem] font-semibold leading-tight text-white">
                  {feature.title}
                </h3>
                <p className="mt-4 text-lg leading-8 text-white/72">{feature.description}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
