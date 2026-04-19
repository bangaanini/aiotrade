import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Link2, ShieldCheck, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LandingPageUIProps = {
  banner?: string;
  ctaHref: string;
};

const features = [
  {
    title: "Launch once, share everywhere",
    description:
      "Keep one polished signup experience while every member gets a personal link that stays on-brand.",
    icon: Link2,
  },
  {
    title: "Track sponsor relationships",
    description:
      "Capture referral attribution at signup so every new member is connected to the right sponsor from day one.",
    icon: Users,
  },
  {
    title: "Turn pages on instantly",
    description:
      "Members activate their own landing page from the dashboard without waiting on a manual setup step.",
    icon: ShieldCheck,
  },
];

const stats = [
  { label: "Referral links", value: "Unlimited" },
  { label: "Landing pages", value: "1 per member" },
  { label: "Activation time", value: "< 10 sec" },
];

export default function LandingPageUI({
  banner,
  ctaHref,
}: LandingPageUIProps) {
  return (
    <main className="flex-1 bg-stone-50">
      <section className="relative isolate overflow-hidden border-b border-stone-200 bg-stone-950 text-white">
        <Image
          alt="Team reviewing growth metrics and referral performance."
          className="absolute inset-0 object-cover opacity-30"
          fill
          priority
          sizes="100vw"
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/90 to-stone-900/70" />

        <div className="relative mx-auto flex min-h-[76vh] max-w-6xl flex-col justify-center px-6 py-20 sm:px-8 lg:px-10">
          {banner ? (
            <div className="mb-6 inline-flex w-fit rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-stone-100 backdrop-blur-sm">
              {banner}
            </div>
          ) : null}

          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              <BarChart3 className="h-4 w-4" />
              Referral-driven growth without duplicated page work
            </div>

            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Give every member a personal landing page that converts like the main site.
            </h1>

            <p className="max-w-2xl text-base leading-7 text-stone-200 sm:text-lg">
              Build once, replicate everywhere, and keep referral attribution tied to the exact link that brought each new signup in.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
                href={ctaHref}
              >
                Sign Up Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "w-full border-white/20 bg-white/10 text-white hover:bg-white/15 sm:w-auto",
                )}
                href="#how-it-works"
              >
                See the flow
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                className="rounded-lg border border-white/15 bg-white/10 px-4 py-5 backdrop-blur-sm"
                key={stat.label}
              >
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="mt-1 text-sm text-stone-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



    </main>
  );
}
