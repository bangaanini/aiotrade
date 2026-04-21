import type { CSSProperties } from "react";
import type { BackgroundPaletteKey, SectionBackgroundConfig } from "@/components/landing/types";
import {
  hexToRgba,
  resolveImageUrl,
  resolveOverlayColor,
  resolveOverlayOpacity,
  resolvePaletteBaseColor,
} from "@/lib/homepage-backgrounds";

type SectionBackgroundLayerProps = {
  config: SectionBackgroundConfig;
  fallbackImageUrl?: string;
  fallbackOverlayColor?: string;
  fallbackOverlayOpacity?: number;
  fallbackPreset: BackgroundPaletteKey;
  imageClassName?: string;
  overlayClassName?: string;
  paletteClassName?: string;
};

export function SectionBackgroundLayer({
  config,
  fallbackImageUrl,
  fallbackOverlayColor,
  fallbackOverlayOpacity = 58,
  fallbackPreset,
  imageClassName,
  overlayClassName,
  paletteClassName,
}: SectionBackgroundLayerProps) {
  const resolvedImageUrl = resolveImageUrl(config, fallbackImageUrl);
  const resolvedBaseColor = resolvePaletteBaseColor(config, fallbackPreset);
  const resolvedOverlay = hexToRgba(
    resolveOverlayColor(config, fallbackPreset, fallbackOverlayColor),
    resolveOverlayOpacity(config, fallbackOverlayOpacity),
  );

  return (
    <>
      {config.mode === "image" && resolvedImageUrl ? (
        <>
          <div
            className={imageClassName ?? "absolute inset-0 bg-cover bg-center bg-no-repeat"}
            style={
              {
                backgroundImage: `url("${resolvedImageUrl}")`,
              } as CSSProperties
            }
          />
          <div
            className={overlayClassName ?? "absolute inset-0"}
            style={{ backgroundColor: resolvedOverlay }}
          />
        </>
      ) : (
        <div
          className={paletteClassName ?? "absolute inset-0"}
          style={{ backgroundColor: resolvedBaseColor }}
        />
      )}
    </>
  );
}

