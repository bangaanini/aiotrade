import { createHash, randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const LANDING_PAGE_VISIT_SECRET_HEADER = "x-landing-page-visit-secret";
export const LANDING_VISITOR_COOKIE_NAME = "landing_visitor_id";
export const LANDING_VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type LandingPageVisitMetadata = {
  city: string | null;
  countryCode: string | null;
  deviceType: string | null;
  referrer: string | null;
  region: string | null;
};

export type RecordLandingPageVisitInput = LandingPageVisitMetadata & {
  profileId: string;
  sourcePath: string;
  username: string;
  visitorIdHash: string | null;
};

export function getLandingPageVisitSecret() {
  return (
    process.env.AUTH_SECRET ??
    process.env.SESSION_SECRET ??
    process.env.DATABASE_URL ??
    "local-dev-secret"
  );
}

function cleanHeaderValue(value: string | null) {
  const trimmedValue = value?.trim();

  if (!trimmedValue || trimmedValue === "XX" || trimmedValue === "-") {
    return null;
  }

  try {
    return decodeURIComponent(trimmedValue);
  } catch {
    return trimmedValue;
  }
}

function getFirstHeader(headers: Headers, names: string[]) {
  for (const name of names) {
    const value = cleanHeaderValue(headers.get(name));

    if (value) {
      return value;
    }
  }

  return null;
}

export function getOrCreateLandingVisitorId(value: string | null | undefined) {
  const normalizedValue = String(value ?? "").trim();

  if (/^[a-f0-9-]{20,80}$/i.test(normalizedValue)) {
    return normalizedValue;
  }

  return randomUUID();
}

export function hashLandingVisitorId(visitorId: string | null | undefined) {
  const normalizedValue = String(visitorId ?? "").trim();

  if (!normalizedValue) {
    return null;
  }

  return createHash("sha256")
    .update(`${normalizedValue}:${getLandingPageVisitSecret()}`)
    .digest("hex");
}

export function getLandingPageVisitMetadata(headers: Headers): LandingPageVisitMetadata {
  const userAgent = headers.get("user-agent") ?? "";
  const lowerUserAgent = userAgent.toLowerCase();
  const countryCode = getFirstHeader(headers, [
    "cf-ipcountry",
    "x-vercel-ip-country",
    "cloudfront-viewer-country",
    "x-country-code",
  ]);

  return {
    city: getFirstHeader(headers, ["x-vercel-ip-city", "x-city"]),
    countryCode: countryCode ? countryCode.toUpperCase() : "Unknown",
    deviceType: lowerUserAgent.includes("bot")
      ? "bot"
      : /tablet|ipad/.test(lowerUserAgent)
        ? "tablet"
        : /mobile|android|iphone|ipod/.test(lowerUserAgent)
          ? "mobile"
          : userAgent
            ? "desktop"
            : null,
    referrer: getFirstHeader(headers, ["referer", "referrer"]),
    region: getFirstHeader(headers, [
      "x-vercel-ip-country-region",
      "x-vercel-ip-region",
      "x-region-code",
    ]),
  };
}

export async function recordLandingPageVisit(input: RecordLandingPageVisitInput) {
  await prisma.$executeRaw`
    UPDATE "public"."profiles"
    SET "landing_page_visit_count" = COALESCE("landing_page_visit_count", 0) + 1
    WHERE "id" = ${input.profileId}::uuid
      AND "username" = ${input.username}
      AND "is_lp_active" = true
  `;

  try {
    await prisma.$executeRaw`
      INSERT INTO "public"."landing_page_visits" (
        "profile_id",
        "username",
        "visitor_id_hash",
        "country_code",
        "region",
        "city",
        "source_path",
        "referrer",
        "device_type"
      )
      VALUES (
        ${input.profileId}::uuid,
        ${input.username},
        ${input.visitorIdHash},
        ${input.countryCode},
        ${input.region},
        ${input.city},
        ${input.sourcePath || "/"},
        ${input.referrer},
        ${input.deviceType}
      )
    `;
  } catch (error) {
    console.error("[landing-page-visits] Failed to store detailed visit row", error);
  }
}
