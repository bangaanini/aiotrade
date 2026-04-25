import "server-only";

import { prisma } from "@/lib/prisma";

export type MemberDashboardStats = {
  landingPageActive: boolean;
  landingPageVisitCount: number;
  publishedGuideCount: number;
  publishedPdfCount: number;
  publishedVideoCount: number;
  referralCount: number;
};

const emptyGuideStats = {
  publishedGuideCount: 0,
  publishedPdfCount: 0,
  publishedVideoCount: 0,
} satisfies Pick<
  MemberDashboardStats,
  "publishedGuideCount" | "publishedPdfCount" | "publishedVideoCount"
>;

async function getReferralCount(username: string) {
  const rows = await prisma.$queryRaw<Array<{ count: bigint | number | string }>>`
    SELECT COUNT(*) AS "count"
    FROM "public"."profiles"
    WHERE "referred_by" = ${username}
  `;

  return Number(rows[0]?.count ?? 0);
}

async function getLandingPageVisitCount(username: string) {
  try {
    const rows = await prisma.$queryRaw<Array<{ landingPageVisitCount: bigint | number | string | null }>>`
      SELECT "landing_page_visit_count" AS "landingPageVisitCount"
      FROM "public"."profiles"
      WHERE "username" = ${username}
      LIMIT 1
    `;

    return Number(rows[0]?.landingPageVisitCount ?? 0);
  } catch (error) {
    console.error("[member-dashboard-stats] Failed to load landing page visit count", error);
    return 0;
  }
}

async function getPublishedGuideStats() {
  const tables = await prisma.$queryRaw<Array<{ tableName: string | null }>>`
    SELECT to_regclass('public.member_guide_posts')::text AS "tableName"
  `;

  if (!tables[0]?.tableName) {
    return emptyGuideStats;
  }

  const rows = await prisma.$queryRaw<
    Array<{ count: bigint | number | string; type: string }>
  >`
    SELECT
      "type",
      COUNT(*) AS "count"
    FROM "public"."member_guide_posts"
    WHERE "is_published" = true
    GROUP BY "type"
  `;

  let publishedGuideCount = 0;
  let publishedVideoCount = 0;
  let publishedPdfCount = 0;

  rows.forEach((row) => {
    const count = Number(row.count ?? 0);
    publishedGuideCount += count;

    if (row.type === "video") {
      publishedVideoCount = count;
    }

    if (row.type === "pdf") {
      publishedPdfCount = count;
    }
  });

  return {
    publishedGuideCount,
    publishedPdfCount,
    publishedVideoCount,
  } satisfies Pick<
    MemberDashboardStats,
    "publishedGuideCount" | "publishedPdfCount" | "publishedVideoCount"
  >;
}

export async function getMemberDashboardStats(input: {
  isLpActive: boolean;
  username: string;
}): Promise<MemberDashboardStats> {
  const [landingPageVisitCount, referralCount, guideStats] = await Promise.all([
    getLandingPageVisitCount(input.username),
    getReferralCount(input.username),
    getPublishedGuideStats(),
  ]);

  return {
    landingPageActive: input.isLpActive,
    landingPageVisitCount,
    publishedGuideCount: guideStats.publishedGuideCount,
    publishedPdfCount: guideStats.publishedPdfCount,
    publishedVideoCount: guideStats.publishedVideoCount,
    referralCount,
  };
}
