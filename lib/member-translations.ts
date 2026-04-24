import "server-only";

import type { MemberGuidePost } from "@/lib/member-guide-types";
import { defaultMemberShellLabels } from "@/lib/member-shell-labels";
import type { SiteLanguage } from "@/lib/site-language";
import { translateRecordStrings, translateStructuredStrings } from "@/lib/translatex";

export async function getTranslatedMemberShellLabels(targetLanguage: SiteLanguage) {
  if (targetLanguage === "id") {
    return defaultMemberShellLabels;
  }

  return translateStructuredStrings({
    shouldTranslate: (_path, value) => Boolean(value.trim()),
    targetLanguage,
    value: defaultMemberShellLabels,
  });
}

export async function translateMemberGuidePosts(posts: MemberGuidePost[], targetLanguage: SiteLanguage) {
  return translateStructuredStrings({
    shouldTranslate: (path) => {
      const last = String(path[path.length - 1] ?? "");

      return ["title", "description"].includes(last);
    },
    targetLanguage,
    value: posts,
  });
}

export async function translateSimpleMemberCopy<T extends Record<string, string>>(
  record: T,
  targetLanguage: SiteLanguage,
) {
  if (targetLanguage === "id") {
    return record;
  }

  return translateRecordStrings({ record, targetLanguage });
}
