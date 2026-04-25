"use client";

import Image from "next/image";
import { landingImages } from "@/components/landing/data";
import { cn } from "@/lib/utils";

type LandingThemeLogoProps = {
  alt?: string;
  className?: string;
  darkClassName?: string;
  lightClassName?: string;
  priority?: boolean;
  sizes: string;
};

export function LandingThemeLogo({
  alt = "AIOTrade",
  className,
  darkClassName,
  lightClassName,
  priority = false,
  sizes,
}: LandingThemeLogoProps) {
  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <Image
        alt={alt}
        className={cn("landing-theme-logo landing-theme-logo-light h-auto object-contain", lightClassName)}
        priority={priority}
        sizes={sizes}
        src={landingImages.logoLightImage}
      />
      <Image
        alt={alt}
        className={cn("landing-theme-logo landing-theme-logo-dark absolute inset-0 h-auto object-contain", darkClassName)}
        priority={priority}
        sizes={sizes}
        src={landingImages.logoDarkImage}
      />
    </span>
  );
}
