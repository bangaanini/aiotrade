"use client";

import Link from "next/link";
import { ArrowUp, MessageCircle } from "lucide-react";
import { navItems } from "@/components/landing/data";
import { SectionBackgroundLayer } from "@/components/landing/section-background-layer";
import type { FooterContent } from "@/components/landing/types";
import { Reveal } from "@/components/ui/reveal";

type FooterSectionProps = {
  content: FooterContent;
  ctaExternal?: boolean;
  ctaHref: string;
  previewMode?: boolean;
};

export function FooterSection({
  content,
  ctaExternal = false,
  ctaHref,
  previewMode = false,
}: FooterSectionProps) {
  return (
    <footer className="relative overflow-hidden py-18 text-white sm:py-20">
      <SectionBackgroundLayer
        config={content.background}
        fallbackOverlayColor="#121a2d"
        fallbackOverlayOpacity={22}
        fallbackPreset="dark-slate-cinematic"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(17,167,255,0.1)_0%,rgba(17,167,255,0)_34%)]" />
      <div className="pointer-events-none absolute bottom-[-5rem] left-[-3rem] h-64 w-64 rounded-full bg-[#0ea5ff]/10 blur-[110px]" />
      <div className="pointer-events-none absolute right-[-4rem] top-[-2rem] h-56 w-56 rounded-full bg-[#f4c85b]/8 blur-[105px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.45fr_0.72fr_0.52fr] lg:gap-14">
          <Reveal className="max-w-[36rem]">
            <Link className="inline-flex items-center" href="#top">
              <span className="inline-flex items-baseline text-[2.1rem] font-semibold tracking-[-0.06em] sm:text-[2.35rem]">
                <span className="text-[#10a7ff]">AIO</span>
                <span className="text-white">TRADE</span>
              </span>
            </Link>
            <p className="mt-5 max-w-[35rem] text-[1.02rem] leading-[1.72] text-white/72 sm:text-[1.06rem]">
              {content.description}
            </p>

            <div className="mt-7 flex items-center gap-5 text-white/90">
              <Link
                aria-label="Facebook"
                className="inline-flex h-8 items-center justify-center text-[2rem] font-semibold leading-none transition duration-300 hover:text-[#5aa0ff]"
                href="#top"
              >
                <span className="translate-y-[1px]">f</span>
              </Link>
              <Link
                aria-label="X"
                className="inline-flex h-8 items-center justify-center text-[1.85rem] font-medium leading-none transition duration-300 hover:text-[#f4c85b]"
                href="#top"
              >
                <span>X</span>
              </Link>
              <Link
                aria-label="WhatsApp"
                className="inline-flex h-8 items-center justify-center transition duration-300 hover:text-[#58d56f]"
                href={ctaHref}
                rel={ctaExternal ? "noreferrer" : undefined}
                target={ctaExternal ? "_blank" : undefined}
              >
                <MessageCircle className="h-6 w-6" strokeWidth={2.1} />
              </Link>
            </div>
          </Reveal>

          <Reveal className="lg:justify-self-center lg:pt-2" delay={0.08}>
            <h3 className="text-[1.9rem] font-semibold tracking-[-0.03em] text-[#f7c85f]">
              Panduan Pengguna
            </h3>
            <ul className="mt-5 space-y-4 text-[1.06rem] leading-none text-white/72">
              {content.guideLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    className="transition duration-300 hover:text-white"
                    href={item.href === "/signup" ? ctaHref : item.href}
                    rel={item.href === "/signup" && ctaExternal ? "noreferrer" : undefined}
                    target={item.href === "/signup" && ctaExternal ? "_blank" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="lg:justify-self-end lg:pt-2" delay={0.12}>
            <h3 className="text-[1.9rem] font-semibold tracking-[-0.03em] text-[#f7c85f]">
              Akses Cepat
            </h3>
            <ul className="mt-5 space-y-4 text-[1.06rem] leading-none text-white/72">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link className="transition duration-300 hover:text-white" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="mt-16 flex items-center justify-center text-center text-[1.02rem] text-white/54 sm:mt-18">
          <p>{content.copyright}</p>
        </Reveal>
      </div>

      <Reveal
        className={previewMode ? "absolute bottom-5 right-5 z-30" : "fixed bottom-5 right-5 z-30"}
        delay={0.16}
      >
        <Link
          aria-label="Kembali ke atas"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/12 bg-[#3c495e] text-white shadow-[0_14px_32px_rgba(0,0,0,0.28)] transition duration-300 hover:bg-[#51627d]"
          href="#top"
        >
          <ArrowUp className="h-5 w-5" />
        </Link>
      </Reveal>
    </footer>
  );
}
