import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AdminPendingRegistrationStatusFilter =
  | "pending"
  | "failed"
  | "expired"
  | "paid"
  | "all";

export type AdminPendingRegistrationCounts = {
  all: number;
  expired: number;
  failed: number;
  paid: number;
  pending: number;
};

export type AdminPendingRegistrationRow = {
  channelCode: string;
  createdAt: Date;
  displayStatus: string;
  email: string;
  expiresAt: Date;
  id: string;
  memberId: string;
  paymentMessage: string | null;
  paymentReferenceId: string | null;
  paymentUrl: string | null;
  planDurationMonths: number;
  planIsLifetime: boolean;
  planLabel: string;
  planPrice: number;
  referredBy: string | null;
  referralLink: string;
  status: string;
  transactionConsumedAt: Date | null;
  transactionPaidAt: Date | null;
  transactionReferenceId: string | null;
  transactionStatus: string | null;
  updatedAt: Date;
  username: string;
  whatsapp: string;
};

export const ADMIN_PENDING_REGISTRATION_FILTERS: Array<{
  label: string;
  value: AdminPendingRegistrationStatusFilter;
}> = [
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Expired", value: "expired" },
  { label: "Paid", value: "paid" },
  { label: "Semua", value: "all" },
];

export function parseAdminPendingRegistrationStatusFilter(
  value: string | null | undefined,
): AdminPendingRegistrationStatusFilter {
  if (
    value === "failed" ||
    value === "expired" ||
    value === "paid" ||
    value === "all"
  ) {
    return value;
  }

  return "pending";
}

function getFilterWhereSql(filter: AdminPendingRegistrationStatusFilter): Prisma.Sql {
  if (filter === "failed") {
    return Prisma.sql`p."status" = 'failed' AND p."expires_at" > CURRENT_TIMESTAMP`;
  }

  if (filter === "expired") {
    return Prisma.sql`(
      p."status" = 'expired'
      OR (p."status" IN ('pending', 'failed') AND p."expires_at" <= CURRENT_TIMESTAMP)
    )`;
  }

  if (filter === "paid") {
    return Prisma.sql`p."status" = 'paid'`;
  }

  if (filter === "all") {
    return Prisma.sql`TRUE`;
  }

  return Prisma.sql`p."status" = 'pending' AND p."expires_at" > CURRENT_TIMESTAMP`;
}

function normalizeCounts(
  counts: Partial<AdminPendingRegistrationCounts> | null | undefined,
): AdminPendingRegistrationCounts {
  return {
    all: Number(counts?.all ?? 0),
    expired: Number(counts?.expired ?? 0),
    failed: Number(counts?.failed ?? 0),
    paid: Number(counts?.paid ?? 0),
    pending: Number(counts?.pending ?? 0),
  };
}

export async function getAdminPendingRegistrations(
  filter: AdminPendingRegistrationStatusFilter,
) {
  const whereSql = getFilterWhereSql(filter);
  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<AdminPendingRegistrationRow[]>(Prisma.sql`
      SELECT
        p."channel_code" AS "channelCode",
        p."created_at" AS "createdAt",
        CASE
          WHEN p."status" IN ('pending', 'failed') AND p."expires_at" <= CURRENT_TIMESTAMP THEN 'expired'
          ELSE p."status"
        END AS "displayStatus",
        p."email",
        p."expires_at" AS "expiresAt",
        p."id",
        p."member_id" AS "memberId",
        t."message" AS "paymentMessage",
        p."payment_reference_id" AS "paymentReferenceId",
        t."payment_url" AS "paymentUrl",
        p."plan_duration_months" AS "planDurationMonths",
        p."plan_is_lifetime" AS "planIsLifetime",
        p."plan_label" AS "planLabel",
        p."plan_price" AS "planPrice",
        p."referred_by" AS "referredBy",
        p."referral_link" AS "referralLink",
        p."status",
        t."consumed_at" AS "transactionConsumedAt",
        t."paid_at" AS "transactionPaidAt",
        t."reference_id" AS "transactionReferenceId",
        t."status" AS "transactionStatus",
        p."updated_at" AS "updatedAt",
        p."username",
        p."whatsapp"
      FROM "public"."signup_pending_registrations" p
      LEFT JOIN LATERAL (
        SELECT
          "consumed_at",
          "message",
          "paid_at",
          "payment_url",
          "reference_id",
          "status",
          "updated_at"
        FROM "public"."signup_payment_transactions" t
        WHERE
          t."pending_registration_id" = p."id"
          OR (
            p."payment_reference_id" IS NOT NULL
            AND t."reference_id" = p."payment_reference_id"
          )
        ORDER BY t."updated_at" DESC
        LIMIT 1
      ) t ON TRUE
      WHERE ${whereSql}
      ORDER BY p."updated_at" DESC, p."created_at" DESC
      LIMIT 100
    `),
    prisma.$queryRaw<AdminPendingRegistrationCounts[]>(Prisma.sql`
      SELECT
        COUNT(*)::int AS "all",
        COUNT(*) FILTER (
          WHERE "status" = 'pending' AND "expires_at" > CURRENT_TIMESTAMP
        )::int AS "pending",
        COUNT(*) FILTER (
          WHERE "status" = 'failed' AND "expires_at" > CURRENT_TIMESTAMP
        )::int AS "failed",
        COUNT(*) FILTER (
          WHERE
            "status" = 'expired'
            OR ("status" IN ('pending', 'failed') AND "expires_at" <= CURRENT_TIMESTAMP)
        )::int AS "expired",
        COUNT(*) FILTER (WHERE "status" = 'paid')::int AS "paid"
      FROM "public"."signup_pending_registrations"
    `),
  ]);

  return {
    counts: normalizeCounts(countRows[0]),
    rows,
  };
}
