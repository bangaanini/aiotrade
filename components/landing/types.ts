import type { StaticImageData } from "next/image";
import type { LucideIcon } from "lucide-react";

export type LandingPageUIProps = {
  banner?: string;
  ctaHref: string;
  ctaExternal?: boolean;
  ctaLabel?: string;
  signupCtaHref?: string;
};

export type NavItem = {
  accent: string;
  label: string;
  href: string;
};

export type StatItem = {
  label: string;
  value: string;
};

export type TickerItem = {
  symbol: string;
  price: string;
  change: string;
  positive?: boolean;
  logoUrl?: string;
  name?: string;
  rank?: number;
};

export type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type Plan = {
  name: string;
  price: string;
  description: string;
  highlight?: string;
  emphasis?: boolean;
};

export type FaqEntry = {
  question: string;
  answer: string;
};

export type Step = {
  number: string;
  title: string;
  description: string;
};

export type Article = {
  title: string;
  description: string;
  image: StaticImageData;
  label: string;
};

export type PartnerLogo = {
  src: StaticImageData;
  alt: string;
};
