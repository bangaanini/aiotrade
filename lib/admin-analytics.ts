import "server-only";

import { prisma } from "@/lib/prisma";

export const analyticsRangeOptions = ["7d", "30d", "90d"] as const;
export type AnalyticsRange = (typeof analyticsRangeOptions)[number];

export type ReferralAnalyticsSummary = {
  activeMembers: number;
  totalViews: number;
  uniqueVisitors: number;
};

export type ReferralDailyMetric = {
  date: string;
  uniqueVisitors: number;
  views: number;
};

export type ReferralCountryMetric = {
  countryCode: string;
  uniqueVisitors: number;
  views: number;
};

export type ReferralMemberMetric = {
  profileId: string;
  uniqueVisitors: number;
  username: string;
  views: number;
};

export type RecentReferralVisit = {
  city: string | null;
  countryCode: string;
  createdAt: string;
  deviceType: string | null;
  referrer: string | null;
  region: string | null;
  sourcePath: string;
  username: string;
};

export type ReferralAnalyticsSnapshot = {
  countries: ReferralCountryMetric[];
  daily: ReferralDailyMetric[];
  recentVisits: RecentReferralVisit[];
  summary: ReferralAnalyticsSummary;
  topMembers: ReferralMemberMetric[];
};

const emptyReferralAnalytics: ReferralAnalyticsSnapshot = {
  countries: [],
  daily: [],
  recentVisits: [],
  summary: {
    activeMembers: 0,
    totalViews: 0,
    uniqueVisitors: 0,
  },
  topMembers: [],
};

function toNumber(value: bigint | number | string | null | undefined) {
  return Number(value ?? 0);
}

function getAnalyticsRangeDays(range: AnalyticsRange) {
  if (range === "7d") {
    return 7;
  }

  if (range === "90d") {
    return 90;
  }

  return 30;
}

function getRangeStartDate(range: AnalyticsRange) {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (getAnalyticsRangeDays(range) - 1));
  return startDate;
}

async function hasLandingPageVisitsTable() {
  try {
    const tables = await prisma.$queryRaw<Array<{ tableName: string | null }>>`
      SELECT to_regclass('public.landing_page_visits')::text AS "tableName"
    `;

    return Boolean(tables[0]?.tableName);
  } catch {
    return false;
  }
}

export function parseAnalyticsRange(value: string | string[] | null | undefined): AnalyticsRange {
  const candidate = typeof value === "string" ? value : value?.[0];

  return analyticsRangeOptions.includes(candidate as AnalyticsRange)
    ? (candidate as AnalyticsRange)
    : "30d";
}

export async function getReferralAnalytics(range: AnalyticsRange): Promise<ReferralAnalyticsSnapshot> {
  if (!(await hasLandingPageVisitsTable())) {
    return emptyReferralAnalytics;
  }

  const startDate = getRangeStartDate(range);

  const [summaryRows, dailyRows, countryRows, memberRows, recentRows] = await Promise.all([
    prisma.$queryRaw<
      Array<{
        activeMembers: bigint | number | string;
        totalViews: bigint | number | string;
        uniqueVisitors: bigint | number | string;
      }>
    >`
      SELECT
        COUNT(*) AS "totalViews",
        COUNT(DISTINCT "visitor_id_hash") AS "uniqueVisitors",
        COUNT(DISTINCT "profile_id") AS "activeMembers"
      FROM "public"."landing_page_visits"
      WHERE "created_at" >= ${startDate}
    `,
    prisma.$queryRaw<
      Array<{
        date: string;
        uniqueVisitors: bigint | number | string;
        views: bigint | number | string;
      }>
    >`
      SELECT
        TO_CHAR(DATE_TRUNC('day', "created_at"), 'YYYY-MM-DD') AS "date",
        COUNT(*) AS "views",
        COUNT(DISTINCT "visitor_id_hash") AS "uniqueVisitors"
      FROM "public"."landing_page_visits"
      WHERE "created_at" >= ${startDate}
      GROUP BY DATE_TRUNC('day', "created_at")
      ORDER BY DATE_TRUNC('day', "created_at") ASC
    `,
    prisma.$queryRaw<
      Array<{
        countryCode: string | null;
        uniqueVisitors: bigint | number | string;
        views: bigint | number | string;
      }>
    >`
      SELECT
        COALESCE("country_code", 'Unknown') AS "countryCode",
        COUNT(*) AS "views",
        COUNT(DISTINCT "visitor_id_hash") AS "uniqueVisitors"
      FROM "public"."landing_page_visits"
      WHERE "created_at" >= ${startDate}
      GROUP BY COALESCE("country_code", 'Unknown')
      ORDER BY COUNT(*) DESC, COALESCE("country_code", 'Unknown') ASC
      LIMIT 12
    `,
    prisma.$queryRaw<
      Array<{
        profileId: string;
        uniqueVisitors: bigint | number | string;
        username: string;
        views: bigint | number | string;
      }>
    >`
      SELECT
        "profile_id" AS "profileId",
        "username",
        COUNT(*) AS "views",
        COUNT(DISTINCT "visitor_id_hash") AS "uniqueVisitors"
      FROM "public"."landing_page_visits"
      WHERE "created_at" >= ${startDate}
      GROUP BY "profile_id", "username"
      ORDER BY COUNT(*) DESC, COUNT(DISTINCT "visitor_id_hash") DESC, "username" ASC
      LIMIT 12
    `,
    prisma.$queryRaw<
      Array<{
        city: string | null;
        countryCode: string | null;
        createdAt: Date;
        deviceType: string | null;
        referrer: string | null;
        region: string | null;
        sourcePath: string;
        username: string;
      }>
    >`
      SELECT
        "city",
        COALESCE("country_code", 'Unknown') AS "countryCode",
        "created_at" AS "createdAt",
        "device_type" AS "deviceType",
        "referrer",
        "region",
        "source_path" AS "sourcePath",
        "username"
      FROM "public"."landing_page_visits"
      WHERE "created_at" >= ${startDate}
      ORDER BY "created_at" DESC
      LIMIT 20
    `,
  ]);

  const summary = summaryRows[0];

  return {
    countries: countryRows.map((row) => ({
      countryCode: row.countryCode ?? "Unknown",
      uniqueVisitors: toNumber(row.uniqueVisitors),
      views: toNumber(row.views),
    })),
    daily: dailyRows.map((row) => ({
      date: row.date,
      uniqueVisitors: toNumber(row.uniqueVisitors),
      views: toNumber(row.views),
    })),
    recentVisits: recentRows.map((row) => ({
      city: row.city,
      countryCode: row.countryCode ?? "Unknown",
      createdAt: row.createdAt.toISOString(),
      deviceType: row.deviceType,
      referrer: row.referrer,
      region: row.region,
      sourcePath: row.sourcePath,
      username: row.username,
    })),
    summary: {
      activeMembers: toNumber(summary?.activeMembers),
      totalViews: toNumber(summary?.totalViews),
      uniqueVisitors: toNumber(summary?.uniqueVisitors),
    },
    topMembers: memberRows.map((row) => ({
      profileId: row.profileId,
      uniqueVisitors: toNumber(row.uniqueVisitors),
      username: row.username,
      views: toNumber(row.views),
    })),
  };
}
