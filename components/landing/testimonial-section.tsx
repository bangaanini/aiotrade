"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { SectionBackgroundLayer } from "@/components/landing/section-background-layer";
import type { TestimonialContent } from "@/components/landing/types";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

type TestimonialSectionProps = {
  content: TestimonialContent;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function TestimonialSection({ content }: TestimonialSectionProps) {
  const items = useMemo(() => content.items.filter((item) => item.name && item.quote && item.role), [content.items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const normalizedActiveIndex = items.length ? activeIndex % items.length : 0;

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [items.length]);

  if (!items.length) {
    return null;
  }

  const activeItem = items[normalizedActiveIndex] ?? items[0];

  return (
    <section className="relative overflow-hidden py-20 sm:py-24" id="testimoni">
      <SectionBackgroundLayer
        config={content.background}
        fallbackOverlayColor="#f8f6f0"
        fallbackOverlayOpacity={18}
        fallbackPreset="warm-ivory"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,200,74,0.10)_0%,rgba(255,200,74,0)_100%)]" />
      <div className="pointer-events-none absolute left-[-8%] top-10 h-64 w-64 rounded-full bg-[#7ab2ff]/12 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 right-[-5%] h-72 w-72 rounded-full bg-[#ffd972]/16 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--landing-accent-blue)] sm:text-[1.3rem]">
            {content.eyebrow}
          </p>
          <h2 className="mt-5 text-[3rem] font-semibold leading-none tracking-[-0.045em] text-[var(--landing-accent-gold)] sm:text-[4.45rem]">
            {content.title}
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-[1.02rem] leading-[1.85] text-[var(--landing-text-secondary)] sm:text-[1.08rem]">
            {content.subtitle}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-stretch">
          <Reveal
            className="landing-glass-card overflow-hidden rounded-[30px]"
            direction="right"
            distance={40}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[linear-gradient(135deg,#eef5ff_0%,#f8fafc_54%,#fff8e9_100%)]">
              {activeItem.imageUrl ? (
                <Image
                  alt={activeItem.imageAlt || activeItem.name}
                  className="h-full w-full object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  src={activeItem.imageUrl}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_38%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_54%,#fff7e7_100%)]">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/80 bg-white/70 text-[2rem] font-semibold tracking-[-0.05em] text-[#1b74df] shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-md">
                    {getInitials(activeItem.name)}
                  </div>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0)_0%,rgba(17,24,39,0.16)_100%)]" />
            </div>
          </Reveal>

          <Reveal
            className="landing-glass-card rounded-[30px] p-6 sm:p-8"
            delay={0.08}
            direction="right"
            distance={48}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#eef5ff] text-[#1b74df]">
                <Quote className="h-6 w-6" />
              </div>

              <div className="flex items-center gap-2">
                <button
                  aria-label="Testimoni sebelumnya"
                  className="landing-glass-button inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[#1b74df] transition hover:bg-[#eef5ff]"
                  onClick={() => setActiveIndex((current) => (current - 1 + items.length) % items.length)}
                  type="button"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  aria-label="Testimoni berikutnya"
                  className="landing-glass-button inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[#1b74df] transition hover:bg-[#eef5ff]"
                  onClick={() => setActiveIndex((current) => (current + 1) % items.length)}
                  type="button"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-7 flex items-center gap-1 text-[#ffc84a]">
              {Array.from({ length: 5 }, (_, index) => (
                <Star className="h-4 w-4 fill-current" key={index} />
              ))}
            </div>

            <blockquote className="mt-6 text-[1.28rem] leading-[1.72] tracking-[-0.025em] text-[var(--landing-text-primary)] sm:text-[1.45rem]">
              &ldquo;{activeItem.quote}&rdquo;
            </blockquote>

            <div className="mt-7 border-t border-white/60 pt-5">
              <p className="text-[1.2rem] font-semibold tracking-[-0.03em] text-[var(--landing-text-primary)]">{activeItem.name}</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-[var(--landing-text-muted)]">{activeItem.role}</p>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {items.map((item, index) => {
                const active = index === normalizedActiveIndex;

                return (
                  <button
                    className={cn(
                      "overflow-hidden rounded-[20px] p-2 text-left transition duration-300",
                      active
                        ? "landing-glass-card bg-[#eef5ff]"
                        : "landing-glass-card",
                    )}
                    key={`${item.name}-${index}`}
                    onClick={() => setActiveIndex(index)}
                    type="button"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,#eef5ff_0%,#f8fafc_54%,#fff8e9_100%)]">
                      {item.imageUrl ? (
                        <Image
                          alt={item.imageAlt || item.name}
                          className="h-full w-full object-cover"
                          fill
                          sizes="(max-width: 640px) 33vw, 20vw"
                          src={item.imageUrl}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[#1b74df]">
                          {getInitials(item.name)}
                        </div>
                      )}
                    </div>
                    <div className="px-1 pb-1 pt-3">
                      <p className="truncate text-sm font-semibold text-[var(--landing-text-primary)]">{item.name}</p>
                      <p className="mt-1 truncate text-xs uppercase tracking-[0.14em] text-[var(--landing-text-muted)]">{item.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
