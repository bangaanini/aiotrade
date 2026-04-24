import "server-only";

import type { BlogPreviewItem, HomepageContent, NavItem } from "@/components/landing/types";
import type { PublicGuidePdfPost } from "@/lib/public-guide-types";
import { type SiteLanguage } from "@/lib/site-language";
import { translateStructuredStrings } from "@/lib/translatex";

function hasPathSegment(path: Array<number | string>, segment: string) {
  return path.some((part) => String(part) === segment);
}

export async function translateLandingNavItems(navItems: NavItem[], targetLanguage: SiteLanguage) {
  return translateStructuredStrings({
    shouldTranslate: (path) => String(path[path.length - 1]) === "label",
    targetLanguage,
    value: navItems,
  });
}

export async function translateHomepageContent(content: HomepageContent, targetLanguage: SiteLanguage) {
  return translateStructuredStrings({
    shouldTranslate: (path) => {
      const last = String(path[path.length - 1] ?? "");

      if (hasPathSegment(path, "background")) {
        return false;
      }

      if (
        [
          "imageAssetId",
          "imageUrl",
          "embedUrl",
          "href",
          "customHex",
          "overlayColor",
          "whatsappNumber",
          "price",
          "number",
          "titleBlue",
          "titleWhite",
        ].includes(last)
      ) {
        return false;
      }

      return true;
    },
    targetLanguage,
    value: content,
  });
}

export async function translateBlogPreviewItems(items: BlogPreviewItem[], targetLanguage: SiteLanguage) {
  return translateStructuredStrings({
    shouldTranslate: (path) => {
      const last = String(path[path.length - 1] ?? "");

      return ["category", "excerpt", "title"].includes(last);
    },
    targetLanguage,
    value: items,
  });
}

export async function translatePublicGuidePdfPosts(posts: PublicGuidePdfPost[], targetLanguage: SiteLanguage) {
  return translateStructuredStrings({
    shouldTranslate: (path) => {
      const last = String(path[path.length - 1] ?? "");

      return ["title", "description"].includes(last);
    },
    targetLanguage,
    value: posts,
  });
}
