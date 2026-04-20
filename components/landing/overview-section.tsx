"use client";

import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { landingImages, partnerLogos } from "@/components/landing/data";
import { TickerStrip } from "@/components/landing/ticker-strip";
import { cn } from "@/lib/utils";

type OverviewSectionProps = {
  ctaHref: string;
};

const duplicatedPartnerLogos = [...partnerLogos, ...partnerLogos];

export function OverviewSection({ ctaHref }: OverviewSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative bg-[#0f1728] text-white" id="fitur">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          alt=""
          aria-hidden
          className="absolute bottom-0 left-0 h-full w-[58%] object-cover object-left opacity-[0.14]"
          src={landingImages.chartImage}
        />
        <Image
          alt=""
          aria-hidden
          className="absolute inset-y-0 right-0 h-full w-[62%] object-cover opacity-[0.18]"
          src={landingImages.chartImage}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,40,0.98)_0%,rgba(15,23,40,0.92)_36%,rgba(18,74,139,0.54)_100%)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-12 pt-8 sm:px-8 sm:pb-20 sm:pt-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10 lg:px-10 lg:pt-14">
        <motion.div
          animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
          className="relative flex min-h-[250px] items-center justify-center pb-2 lg:min-h-[600px] lg:justify-start lg:pb-0"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -36 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative w-full max-w-[280px] sm:max-w-[430px] lg:max-w-[520px] lg:-ml-4">
            <div className="absolute inset-x-[10%] bottom-6 h-16 rounded-full bg-[#0ea5ff]/14 blur-[34px] sm:bottom-8 sm:h-24 sm:blur-[52px]" />
            <Image
              alt="Mockup aplikasi mobile AIOTrade berisi trade history dan profit."
              className="relative z-10 h-auto w-full drop-shadow-[0_24px_42px_rgba(0,0,0,0.4)] sm:drop-shadow-[0_34px_58px_rgba(0,0,0,0.44)] lg:origin-left lg:scale-[1.06]"
              priority
              sizes="(max-width: 1024px) 100vw, 520px"
              src={landingImages.phoneImage}
            />
          </div>
        </motion.div>

        <motion.div
          animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
          className="relative z-10 mx-auto flex w-full max-w-[24rem] flex-col items-center text-center lg:max-w-none lg:items-start lg:pl-3 lg:text-left"
          initial={prefersReducedMotion ? false : { opacity: 0, x: 36 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-[2.2rem] font-light uppercase leading-none tracking-[0.05em] text-white sm:text-[3.2rem] sm:tracking-[0.08em] lg:text-[4.15rem]">
            <span className="text-[#10a7ff]">AIO</span>TRADE
          </h2>
          <p className="mt-5 max-w-[22rem] text-[0.95rem] leading-[1.9] text-white/78 sm:mt-7 sm:max-w-[44rem] sm:text-[1.08rem] sm:leading-[2.05] lg:text-[1.12rem]">
            Alat bantu trading otomatis berbasis Artificial Intelligence (AI) yang dirancang
            untuk membantu pengguna menjalankan trading aset kripto di <strong className="font-semibold text-white">pasar spot</strong>.
            {" "}AIOTrade terhubung dengan Binance, Tokocrypto, dan Bitget melalui API yang aman,
            sehingga strategi dapat dijalankan lebih rapi, efisien, dan konsisten.
          </p>

          <div className="relative mt-8 w-full max-w-[24rem] overflow-hidden sm:mt-10 lg:max-w-none">
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
          </div>

          <motion.div
            className="mt-8 flex w-full justify-center sm:mt-10 lg:justify-start"
            whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.01 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          >
            <Link
              className={cn(
                "group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-lg border border-white/18 bg-[#ffcf10] px-6 py-3 text-base font-semibold text-[#101726] shadow-[0_18px_48px_rgba(0,0,0,0.22)] transition duration-300 hover:border-[#ffe075] hover:bg-[#ffd83a] hover:shadow-[0_24px_56px_rgba(255,207,16,0.26)] sm:min-h-14 sm:px-8 sm:py-4 sm:text-lg",
                "w-full max-w-[220px] sm:min-w-[304px] sm:max-w-none sm:w-auto",
              )}
              href={ctaHref}
            >
              <span className="absolute inset-0 rounded-lg bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.34)_50%,transparent_78%)] opacity-0 transition duration-500 group-hover:opacity-100" />
              <span className="relative z-10 inline-flex items-center gap-3">
                <Users className="h-5 w-5 transition duration-300 group-hover:scale-110" />
                Daftar Sekarang
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <TickerStrip className="relative z-10 mt-2 border-white/10 bg-[rgba(8,14,27,0.38)]" />
    </section>
  );
}
