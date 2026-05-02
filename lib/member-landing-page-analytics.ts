import "server-only";

import type { AnalyticsRange } from "@/lib/admin-analytics";
import { prisma } from "@/lib/prisma";

export type MemberLandingPageDailyMetric = {
  date: string;
  uniqueVisitors: number;
  views: number;
};

export type MemberLandingPageCountryMetric = {
  countryCode: string;
  uniqueVisitors: number;
  views: number;
};

export type MemberLandingPageDeviceMetric = {
  deviceType: string;
  uniqueVisitors: number;
  views: number;
};

export type MemberLandingPageRecentVisit = {
  city: string | null;
  countryCode: string;
  createdAt: string;
  deviceType: string | null;
  id: string;
  referrer: string | null;
  region: string | null;
  sourcePath: string;
};

export type MemberLandingPageAnalyticsSnapshot = {
  countries: MemberLandingPageCountryMetric[];
  daily: MemberLandingPageDailyMetric[];
  devices: MemberLandingPageDeviceMetric[];
  recentVisits: MemberLandingPageRecentVisit[];
  summary: {
    countryCount: number;
    deviceCount: number;
    totalViews: number;
    uniqueVisitors: number;
  };
};

const emptyMemberLandingPageAnalytics: MemberLandingPageAnalyticsSnapshot = {
  countries: [],
  daily: [],
  devices: [],
  recentVisits: [],
  summary: {
    countryCount: 0,
    deviceCount: 0,
    totalViews: 0,
    uniqueVisitors: 0,
  },
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

export async function getMemberLandingPageAnalytics(input: {
  profileId: string;
  range: AnalyticsRange;
}): Promise<MemberLandingPageAnalyticsSnapshot> {
  if (!(await hasLandingPageVisitsTable())) {
    return emptyMemberLandingPageAnalytics;
  }

  const startDate = getRangeStartDate(input.range);

  const [summaryRows, dailyRows, countryRows, deviceRows, recentRows] = await Promise.all([
    prisma.$queryRaw<
      Array<{
        countryCount: bigint | number | string;
        deviceCount: bigint | number | string;
        totalViews: bigint | number | string;
        uniqueVisitors: bigint | number | string;
      }>
    >`
      SELECT
        COUNT(*) AS "totalViews",
        COUNT(DISTINCT "visitor_id_hash") AS "uniqueVisitors",
        COUNT(DISTINCT COALESCE("country_code", 'Unknown')) AS "countryCount",
        COUNT(DISTINCT COALESCE("device_type", 'unknown')) AS "deviceCount"
      FROM "public"."landing_page_visits"
      WHERE "profile_id" = ${input.profileId}::uuid
        AND "created_at" >= ${startDate}
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
      WHERE "profile_id" = ${input.profileId}::uuid
        AND "created_at" >= ${startDate}
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
      WHERE "profile_id" = ${input.profileId}::uuid
        AND "created_at" >= ${startDate}
      GROUP BY COALESCE("country_code", 'Unknown')
      ORDER BY COUNT(*) DESC, COALESCE("country_code", 'Unknown') ASC
      LIMIT 10
    `,
    prisma.$queryRaw<
      Array<{
        deviceType: string | null;
        uniqueVisitors: bigint | number | string;
        views: bigint | number | string;
      }>
    >`
      SELECT
        COALESCE("device_type", 'unknown') AS "deviceType",
        COUNT(*) AS "views",
        COUNT(DISTINCT "visitor_id_hash") AS "uniqueVisitors"
      FROM "public"."landing_page_visits"
      WHERE "profile_id" = ${input.profileId}::uuid
        AND "created_at" >= ${startDate}
      GROUP BY COALESCE("device_type", 'unknown')
      ORDER BY COUNT(*) DESC, COALESCE("device_type", 'unknown') ASC
      LIMIT 10
    `,
    prisma.$queryRaw<
      Array<{
        city: string | null;
        countryCode: string | null;
        createdAt: Date;
        deviceType: string | null;
        id: string;
        referrer: string | null;
        region: string | null;
        sourcePath: string;
      }>
    >`
      SELECT
        "id"::text AS "id",
        "city",
        COALESCE("country_code", 'Unknown') AS "countryCode",
        "created_at" AS "createdAt",
        "device_type" AS "deviceType",
        "referrer",
        "region",
        "source_path" AS "sourcePath"
      FROM "public"."landing_page_visits"
      WHERE "profile_id" = ${input.profileId}::uuid
        AND "created_at" >= ${startDate}
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
    devices: deviceRows.map((row) => ({
      deviceType: row.deviceType ?? "unknown",
      uniqueVisitors: toNumber(row.uniqueVisitors),
      views: toNumber(row.views),
    })),
    recentVisits: recentRows.map((row) => ({
      city: row.city,
      countryCode: row.countryCode ?? "Unknown",
      createdAt: row.createdAt.toISOString(),
      deviceType: row.deviceType,
      id: row.id,
      referrer: row.referrer,
      region: row.region,
      sourcePath: row.sourcePath,
    })),
    summary: {
      countryCount: toNumber(summary?.countryCount),
      deviceCount: toNumber(summary?.deviceCount),
      totalViews: toNumber(summary?.totalViews),
      uniqueVisitors: toNumber(summary?.uniqueVisitors),
    },
  };
}
