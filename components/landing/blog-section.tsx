import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { articles, landingImages } from "@/components/landing/data";
import { Reveal } from "@/components/ui/reveal";

export function BlogSection() {
  return (
    <section className="relative overflow-hidden bg-[#f8f6f0] py-20" id="blog">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(246,190,79,0.08)_0%,rgba(246,190,79,0)_100%)]" />
      <div className="pointer-events-none absolute left-[-8%] top-14 h-56 w-56 rounded-full bg-[#f4cf73]/14 blur-[95px]" />
      <div className="pointer-events-none absolute bottom-0 right-[-5%] h-60 w-60 rounded-full bg-[#75b9ff]/8 blur-[105px]" />
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <Reveal className="text-center lg:text-left">
          <h2 className="text-[3rem] font-semibold leading-none tracking-[-0.05em] text-[#ffc84a] sm:text-[4.3rem]">
            Blog - Crypto News
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {articles.map((article, index) => (
            <Reveal
              className="overflow-hidden rounded-none border border-[#ece7dc] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
              delay={index * 0.08}
              hover
              key={article.title}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#0d1728]">
                <Image
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover opacity-35"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  src={landingImages.chartImage}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,22,0.2)_0%,rgba(6,12,22,0.48)_46%,rgba(6,12,22,0.82)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(17,167,255,0.18)_0%,rgba(17,167,255,0)_34%)]" />
                <span className="absolute right-5 top-5 rounded-full bg-[#58d56f] px-4 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.04em] text-white">
                  {article.label}
                </span>
                <div className="absolute inset-x-0 bottom-0 flex h-full flex-col justify-end p-5">
                  <div className="mb-4 max-w-[10rem]">
                    <Image
                      alt={article.title}
                      className="h-auto max-h-14 w-auto max-w-full object-contain"
                      sizes="180px"
                      src={article.image}
                    />
                  </div>
                  <p className="max-w-[16rem] text-[1rem] font-medium leading-[1.35] text-white sm:text-[1.05rem]">
                    {article.description}
                  </p>
                </div>
              </div>
              <div className="px-7 pb-7 pt-5">
                <h3 className="text-[2rem] font-semibold leading-[1.18] tracking-[-0.035em] text-[#151b28]">
                  {article.title}
                </h3>
                <Link
                  className="mt-7 inline-flex items-center gap-1 text-[0.98rem] font-medium uppercase tracking-[0.01em] text-[#5d6777] transition duration-300 hover:text-[#1b74df]"
                  href="#fitur"
                >
                  Read More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
