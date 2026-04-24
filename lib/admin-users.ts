import "server-only";

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
  username: string;
  whatsapp: string | null;
};

export async function getAdminUsers() {
  const rows = await prisma.$queryRaw<
    Array<{
      email: string | null;
      id: string;
      isAdmin: boolean;
      isLpActive: boolean;
      referralCount: bigint | number | string;
      referralLink: string | null;
      referredBy: string | null;
      username: string;
      whatsapp: string | null;
    }>
  >`
    SELECT
      p."id",
      p."email",
      p."username",
      p."whatsapp",
      p."is_admin" AS "isAdmin",
      p."is_lp_active" AS "isLpActive",
      p."referral_link" AS "referralLink",
      p."referred_by" AS "referredBy",
      COUNT(r."id") AS "referralCount"
    FROM "public"."profiles" p
    LEFT JOIN "public"."profiles" r
      ON r."referred_by" = p."username"
    GROUP BY
      p."id",
      p."email",
      p."username",
      p."whatsapp",
      p."is_admin",
      p."is_lp_active",
      p."referral_link",
      p."referred_by"
    ORDER BY p."username" ASC
  `;

  return rows
    .filter((row) => !HIDDEN_ADMIN_TABLE_USERNAMES.has(row.username))
    .map((row) => ({
      ...row,
      referralCount: Number(row.referralCount),
    })) satisfies AdminUserRow[];
}
