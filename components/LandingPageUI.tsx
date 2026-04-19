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

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-emerald-700">Built for repeatable referrals</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
            One landing experience, personalized entry points for every promoter.
          </h2>
          <p className="mt-4 text-base leading-7 text-stone-600">
            Your main page stays consistent. Members get their own shareable route, and the signup flow records who referred each new account.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-stone-950">{feature.title}</h3>
                    <p className="text-sm leading-6 text-stone-600">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white" id="how-it-works">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[0.9fr,1.1fr] lg:px-10">
          <div className="space-y-4">
            <p className="text-sm font-medium text-amber-700">How it works</p>
            <h2 className="text-3xl font-semibold tracking-tight text-stone-950">
              Members sign up, activate their page, and start sharing.
            </h2>
            <p className="text-base leading-7 text-stone-600">
              The workflow stays simple for users and easy to manage for your team.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              "A visitor lands on the main page or a sponsor-specific route.",
              "Signup stores the referral username alongside the new profile.",
              "The member enables their landing page from the dashboard and shares the live link.",
            ].map((step, index) => (
              <div className="flex gap-4 rounded-lg border border-stone-200 bg-stone-50 p-5" key={step}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <p className="pt-1 text-sm leading-6 text-stone-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
