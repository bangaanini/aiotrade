import Link from "next/link";
import { ArrowUp, MessageCircle } from "lucide-react";
import { navItems } from "@/components/landing/data";
import { Reveal } from "@/components/ui/reveal";

type FooterSectionProps = {
  ctaHref: string;
};

const guideLinks = [
  { label: "Daftar", href: null as string | null },
  { label: "API Binding", href: "#fitur" },
  { label: "Trading Otomatis", href: "#fitur" },
  { label: "Setting Custom", href: "#panduan" },
];

export function FooterSection({ ctaHref }: FooterSectionProps) {
  return (
    <footer className="relative overflow-hidden bg-[#121a2d] py-18 text-white sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(17,167,255,0.1)_0%,rgba(17,167,255,0)_34%)]" />
      <div className="pointer-events-none absolute bottom-[-5rem] left-[-3rem] h-64 w-64 rounded-full bg-[#0ea5ff]/10 blur-[110px]" />
      <div className="pointer-events-none absolute right-[-4rem] top-[-2rem] h-56 w-56 rounded-full bg-[#f4c85b]/8 blur-[105px]" />

      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.45fr_0.72fr_0.52fr] lg:gap-14">
          <Reveal className="max-w-[36rem]">
            <Link className="inline-flex items-center" href="#top">
              <span className="inline-flex items-baseline text-[2.1rem] font-semibold tracking-[-0.06em] sm:text-[2.35rem]">
                <span className="text-[#10a7ff]">AIO</span>
                <span className="text-white">TRADE</span>
              </span>
            </Link>
            <p className="mt-5 max-w-[35rem] text-[1.02rem] leading-[1.72] text-white/72 sm:text-[1.06rem]">
              Alat bantu (bot trading) berbasis Artificial Intelligence (AI) yang dirancang
              untuk membantu pengguna melakukan perdagangan aset kripto secara otomatis di pasar
              spot. AioTrade dapat diintegrasikan dengan exchange global seperti Binance dan
              Bitget melalui sistem API yang aman, sehingga pengguna dapat menjalankan strategi
              trading secara efisien dan konsisten.
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
              {guideLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    className="transition duration-300 hover:text-white"
                    href={item.href ?? ctaHref}
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
          <p>© 2026 All Rights Reserved.</p>
        </Reveal>
      </div>

      <Reveal className="fixed bottom-5 right-5 z-30" delay={0.16}>
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
