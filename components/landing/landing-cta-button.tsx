import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type LandingCtaButtonProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  className?: string;
  external?: boolean;
  size?: "default" | "compact";
};

export function LandingCtaButton({
  href,
  label,
  icon: Icon,
  className,
  external = false,
  size = "default",
}: LandingCtaButtonProps) {
  return (
    <Link
      className={cn(
        "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-[18px] border border-white/38 bg-[rgba(15,20,31,0.48)] text-white shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-[10px] transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-[#f6be4f] hover:bg-[#f6be4f] hover:text-[#101726] hover:shadow-[0_24px_56px_rgba(246,190,79,0.34)]",
        size === "default"
          ? "min-h-12 px-6 py-3 text-base font-semibold sm:min-h-14 sm:px-8 sm:py-4 sm:text-lg"
          : "min-h-11 px-5 py-2.5 text-[0.98rem] font-semibold sm:min-h-12 sm:px-6 sm:text-base",
        className,
      )}
      href={href}
      rel={external ? "noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      <span className="absolute inset-0 rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.01)_100%)] opacity-100 transition duration-300 group-hover:opacity-0" />
      <span className="absolute inset-0 rounded-[18px] bg-[linear-gradient(115deg,transparent_16%,rgba(255,255,255,0.18)_48%,transparent_82%)] opacity-0 transition duration-500 group-hover:opacity-100" />
      <span className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.44)_50%,rgba(255,255,255,0)_100%)] transition duration-300 group-hover:opacity-0" />
      <span className="relative z-10 inline-flex items-center gap-3">
        <Icon className="h-5 w-5 transition duration-300 group-hover:scale-110" />
        {label}
      </span>
    </Link>
  );
}
