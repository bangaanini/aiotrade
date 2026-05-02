import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HIDDEN_ADMIN_TABLE_USERNAMES } from "@/lib/username-rules";

export type AdminUserRow = {
  email: string | null;
  id: string;
  isAdmin: boolean;
  isLpActive: boolean;
  referralCount: number;
  referralLink: string | null;
  referredBy: string | null;
  subscriptionDurationMonths: number | null;
  subscriptionExpiresAt: Date | null;
  subscriptionIsLifetime: boolean | null;
  subscriptionPlanId: string | null;
  subscriptionPlanLabel: string | null;
  subscriptionStartedAt: Date | null;
  subscriptionStatus: string | null;
  username: string;
  whatsapp: string | null;
};

export function normalizeAdminUserSearchQuery(value: string | null | undefined) {
  return String(value ?? "").trim().slice(0, 80);
}

function getSearchWhereSql(searchQuery: string) {
  if (!searchQuery) {
    return Prisma.sql`TRUE`;
  }

  const pattern = `%${searchQuery}%`;

  return Prisma.sql`(
    p."username" ILIKE ${pattern}
    OR p."email" ILIKE ${pattern}
    OR p."whatsapp" ILIKE ${pattern}
    OR p."referral_link" ILIKE ${pattern}
    OR p."referred_by" ILIKE ${pattern}
  )`;
}

export async function getAdminUsers(searchQueryInput?: string | null) {
  const searchQuery = normalizeAdminUserSearchQuery(searchQueryInput);
  const searchWhereSql = getSearchWhereSql(searchQuery);
  const rows = await prisma.$queryRaw<
    Array<{
      email: string | null;
      id: string;
      isAdmin: boolean;
      isLpActive: boolean;
      referralCount: bigint | number | string;
      referralLink: string | null;
      referredBy: string | null;
      subscriptionDurationMonths: number | null;
      subscriptionExpiresAt: Date | null;
      subscriptionIsLifetime: boolean | null;
      subscriptionPlanId: string | null;
      subscriptionPlanLabel: string | null;
      subscriptionStartedAt: Date | null;
      subscriptionStatus: string | null;
      username: string;
      whatsapp: string | null;
    }>
  >(Prisma.sql`
    SELECT
      p."id",
      p."email",
      p."username",
      p."whatsapp",
      p."is_admin" AS "isAdmin",
      p."is_lp_active" AS "isLpActive",
      p."referral_link" AS "referralLink",
      p."referred_by" AS "referredBy",
      s."duration_months" AS "subscriptionDurationMonths",
      s."expires_at" AS "subscriptionExpiresAt",
      s."is_lifetime" AS "subscriptionIsLifetime",
      s."plan_id" AS "subscriptionPlanId",
      s."plan_label" AS "subscriptionPlanLabel",
      s."started_at" AS "subscriptionStartedAt",
      s."status" AS "subscriptionStatus",
      COUNT(r."id") AS "referralCount"
    FROM "public"."profiles" p
    LEFT JOIN "public"."member_subscriptions" s
      ON s."profile_id" = p."id"
    LEFT JOIN "public"."profiles" r
      ON r."referred_by" = p."username"
    WHERE ${searchWhereSql}
    GROUP BY
      p."id",
      p."email",
      p."username",
      p."whatsapp",
      p."is_admin",
      p."is_lp_active",
      p."referral_link",
      p."referred_by",
      s."duration_months",
      s."expires_at",
      s."is_lifetime",
      s."plan_id",
      s."plan_label",
      s."started_at",
      s."status"
    ORDER BY p."username" ASC
  `);

  return rows
    .filter((row) => !HIDDEN_ADMIN_TABLE_USERNAMES.has(row.username))
    .map((row) => ({
      ...row,
      referralCount: Number(row.referralCount),
    })) satisfies AdminUserRow[];
}
