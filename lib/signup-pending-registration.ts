import "server-only";

import { ensureEnvAdmin } from "@/lib/admin-bootstrap";
import { hashPassword } from "@/lib/auth";
import {
  getMemberSubscription,
  upsertMemberSubscription,
} from "@/lib/member-subscription";
import type { PaymentSubscriptionPlan } from "@/lib/payment-gateway-types";
import { prisma } from "@/lib/prisma";
import {
  createSignupPayment,
  generateSignupPaymentReferenceId,
  getSignupPayment,
  markSignupPaymentConsumed,
} from "@/lib/signup-payment";

const SIGNUP_PENDING_RETENTION_MS = 1000 * 60 * 60 * 24 * 7;

export type SignupPendingRegistrationRecord = {
  channelCode: string;
  email: string;
  expiresAt: Date;
  id: string;
  memberId: string;
  passwordHash: string;
  paymentReferenceId: string | null;
  planDescription: string;
  planDurationMonths: number;
  planId: string;
  planIsLifetime: boolean;
  planLabel: string;
  planPrice: number;
  referralLink: string;
  referredBy: string | null;
  status: string;
  username: string;
  whatsapp: string;
};

type PendingConflict = {
  email: string;
  memberId: string;
  referralLink: string;
  username: string;
};

type ProfileConflict = {
  email: string | null;
  referralLink: string | null;
  username: string;
};

function getPendingExpiresAt() {
  return new Date(Date.now() + SIGNUP_PENDING_RETENTION_MS);
}

function planFromPending(pending: SignupPendingRegistrationRecord): PaymentSubscriptionPlan {
  return {
    description: pending.planDescription,
    durationMonths: pending.planDurationMonths,
    id: pending.planId,
    isLifetime: pending.planIsLifetime,
    label: pending.planLabel,
    price: pending.planPrice,
  };
}

function isPaymentExpired(expiresAt: string | null | undefined) {
  if (!expiresAt) {
    return false;
  }

  const date = new Date(expiresAt);

  return Number.isFinite(date.getTime()) && date.getTime() <= Date.now();
}

export async function cleanupExpiredPendingRegistrations() {
  await prisma.$executeRaw`
    DELETE FROM "public"."signup_pending_registrations"
    WHERE "status" IN ('pending', 'failed', 'expired')
      AND "expires_at" <= CURRENT_TIMESTAMP
  `;
}

export async function getPendingRegistrationConflict(input: {
  email: string;
  memberId: string;
  referralLink: string;
  username: string;
}) {
  await cleanupExpiredPendingRegistrations();

  const rows = await prisma.$queryRaw<PendingConflict[]>`
    SELECT
      "email",
      "member_id" AS "memberId",
      "referral_link" AS "referralLink",
      "username"
    FROM "public"."signup_pending_registrations"
    WHERE "status" IN ('pending', 'failed')
      AND "expires_at" > CURRENT_TIMESTAMP
      AND (
        "email" = ${input.email}
        OR "username" = ${input.username}
        OR "member_id" = ${input.memberId}
        OR "referral_link" = ${input.referralLink}
      )
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function getActiveProfileConflict(input: {
  email: string;
  referralLink: string;
  username: string;
}) {
  return prisma.profile.findFirst({
    where: {
      OR: [
        { email: input.email },
        { username: input.username },
        { referralLink: input.referralLink },
      ],
    },
    select: {
      email: true,
      referralLink: true,
      username: true,
    },
  }) as Promise<ProfileConflict | null>;
}

async function insertPendingRegistration(input: {
  channelCode: string;
  email: string;
  memberId: string;
  password: string;
  paymentReferenceId: string;
  plan: PaymentSubscriptionPlan;
  referralLink: string;
  referredBy: string | null;
  username: string;
  whatsapp: string;
}) {
  const expiresAt = getPendingExpiresAt();
  const passwordHash = hashPassword(input.password);
  const rows = await prisma.$queryRaw<SignupPendingRegistrationRecord[]>`
    INSERT INTO "public"."signup_pending_registrations" (
      "email",
      "username",
      "whatsapp",
      "member_id",
      "referral_link",
      "password_hash",
      "referred_by",
      "plan_id",
      "plan_label",
      "plan_description",
      "plan_price",
      "plan_duration_months",
      "plan_is_lifetime",
      "channel_code",
      "payment_reference_id",
      "status",
      "expires_at"
    )
    VALUES (
      ${input.email},
      ${input.username},
      ${input.whatsapp},
      ${input.memberId},
      ${input.referralLink},
      ${passwordHash},
      ${input.referredBy},
      ${input.plan.id},
      ${input.plan.label},
      ${input.plan.description},
      ${input.plan.price},
      ${input.plan.isLifetime ? 0 : Math.max(1, input.plan.durationMonths)},
      ${input.plan.isLifetime},
      ${input.channelCode},
      ${input.paymentReferenceId},
      'pending',
      ${expiresAt}
    )
    RETURNING
      "channel_code" AS "channelCode",
      "email",
      "expires_at" AS "expiresAt",
      "id",
      "member_id" AS "memberId",
      "password_hash" AS "passwordHash",
      "payment_reference_id" AS "paymentReferenceId",
      "plan_description" AS "planDescription",
      "plan_duration_months" AS "planDurationMonths",
      "plan_id" AS "planId",
      "plan_is_lifetime" AS "planIsLifetime",
      "plan_label" AS "planLabel",
      "plan_price" AS "planPrice",
      "referral_link" AS "referralLink",
      "referred_by" AS "referredBy",
      "status",
      "username",
      "whatsapp"
  `;

  const pending = rows[0];

  if (!pending) {
    throw new Error("Pending signup belum bisa dibuat.");
  }

  return pending;
}

async function updatePendingPaymentReference(
  pendingId: string,
  referenceId: string,
  status = "pending",
) {
  const rows = await prisma.$queryRaw<SignupPendingRegistrationRecord[]>`
    UPDATE "public"."signup_pending_registrations"
    SET
      "payment_reference_id" = ${referenceId},
      "status" = ${status},
      "expires_at" = ${getPendingExpiresAt()},
      "updated_at" = CURRENT_TIMESTAMP
    WHERE "id" = ${pendingId}::uuid
    RETURNING
      "channel_code" AS "channelCode",
      "email",
      "expires_at" AS "expiresAt",
      "id",
      "member_id" AS "memberId",
      "password_hash" AS "passwordHash",
      "payment_reference_id" AS "paymentReferenceId",
      "plan_description" AS "planDescription",
      "plan_duration_months" AS "planDurationMonths",
      "plan_id" AS "planId",
      "plan_is_lifetime" AS "planIsLifetime",
      "plan_label" AS "planLabel",
      "plan_price" AS "planPrice",
      "referral_link" AS "referralLink",
      "referred_by" AS "referredBy",
      "status",
      "username",
      "whatsapp"
  `;

  return rows[0] ?? null;
}

async function createPaymentForPending(pending: SignupPendingRegistrationRecord) {
  const referenceId = pending.paymentReferenceId ?? generateSignupPaymentReferenceId();
  const payment = await createSignupPayment({
    channelCode: pending.channelCode,
    customerEmail: pending.email,
    customerName: pending.username,
    customerPhone: pending.whatsapp,
    pendingRegistrationId: pending.id,
    planId: pending.planId,
    referenceId,
  });

  if (!payment) {
    throw new Error("Pembayaran belum bisa dibuat sekarang.");
  }

  await updatePendingPaymentReference(
    pending.id,
    payment.referenceId,
    payment.status === "failed" ? "failed" : "pending",
  );

  return payment;
}

export async function createPendingSignupAndPayment(input: {
  channelCode: string;
  email: string;
  memberId: string;
  password: string;
  plan: PaymentSubscriptionPlan;
  referralLink: string;
  referredBy: string | null;
  username: string;
  whatsapp: string;
}) {
  const referenceId = generateSignupPaymentReferenceId();
  const pending = await insertPendingRegistration({
    ...input,
    paymentReferenceId: referenceId,
  });

  return createPaymentForPending(pending);
}

export async function getPendingRegistrationByReference(referenceId: string) {
  const rows = await prisma.$queryRaw<SignupPendingRegistrationRecord[]>`
    SELECT DISTINCT
      p."channel_code" AS "channelCode",
      p."email",
      p."expires_at" AS "expiresAt",
      p."id",
      p."member_id" AS "memberId",
      p."password_hash" AS "passwordHash",
      p."payment_reference_id" AS "paymentReferenceId",
      p."plan_description" AS "planDescription",
      p."plan_duration_months" AS "planDurationMonths",
      p."plan_id" AS "planId",
      p."plan_is_lifetime" AS "planIsLifetime",
      p."plan_label" AS "planLabel",
      p."plan_price" AS "planPrice",
      p."referral_link" AS "referralLink",
      p."referred_by" AS "referredBy",
      p."status",
      p."username",
      p."whatsapp"
    FROM "public"."signup_pending_registrations" p
    LEFT JOIN "public"."signup_payment_transactions" t
      ON t."pending_registration_id" = p."id"
    WHERE p."payment_reference_id" = ${referenceId}
      OR t."reference_id" = ${referenceId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function resumePendingSignupPayment(input: {
  email: string;
  whatsapp: string;
}) {
  await cleanupExpiredPendingRegistrations();

  const rows = await prisma.$queryRaw<SignupPendingRegistrationRecord[]>`
    SELECT
      "channel_code" AS "channelCode",
      "email",
      "expires_at" AS "expiresAt",
      "id",
      "member_id" AS "memberId",
      "password_hash" AS "passwordHash",
      "payment_reference_id" AS "paymentReferenceId",
      "plan_description" AS "planDescription",
      "plan_duration_months" AS "planDurationMonths",
      "plan_id" AS "planId",
      "plan_is_lifetime" AS "planIsLifetime",
      "plan_label" AS "planLabel",
      "plan_price" AS "planPrice",
      "referral_link" AS "referralLink",
      "referred_by" AS "referredBy",
      "status",
      "username",
      "whatsapp"
    FROM "public"."signup_pending_registrations"
    WHERE "email" = ${input.email}
      AND "whatsapp" = ${input.whatsapp}
      AND "status" IN ('pending', 'failed')
      AND "expires_at" > CURRENT_TIMESTAMP
    ORDER BY "updated_at" DESC
    LIMIT 1
  `;
  let pending = rows[0] ?? null;

  if (!pending) {
    return null;
  }

  const currentPayment = pending.paymentReferenceId
    ? await getSignupPayment(pending.paymentReferenceId)
    : null;

  if (currentPayment?.status === "paid") {
    await finalizePaidPendingSignup(currentPayment.referenceId);
    return {
      payment: currentPayment,
      referenceId: currentPayment.referenceId,
    };
  }

  if (
    currentPayment &&
    currentPayment.status !== "failed" &&
    !isPaymentExpired(currentPayment.expiresAt)
  ) {
    return {
      payment: currentPayment,
      referenceId: currentPayment.referenceId,
    };
  }

  pending = await updatePendingPaymentReference(
    pending.id,
    generateSignupPaymentReferenceId(),
  );

  if (!pending) {
    return null;
  }

  const payment = await createPaymentForPending(pending);

  return {
    payment,
    referenceId: payment.referenceId,
  };
}

async function createProfileFromPending(pending: SignupPendingRegistrationRecord) {
  try {
    return await prisma.profile.create({
      data: {
        email: pending.email,
        passwordHash: pending.passwordHash,
        referralLink: pending.referralLink,
        referredBy: pending.referredBy,
        username: pending.username,
        whatsapp: pending.whatsapp,
      },
      select: {
        email: true,
        id: true,
        isAdmin: true,
        username: true,
      },
    });
  } catch (error) {
    const existing = await prisma.profile.findFirst({
      where: {
        OR: [
          { email: pending.email },
          { username: pending.username },
          { referralLink: pending.referralLink },
        ],
      },
      select: {
        email: true,
        id: true,
        isAdmin: true,
        referralLink: true,
        username: true,
      },
    });

    if (
      existing?.email === pending.email &&
      existing.username === pending.username &&
      existing.referralLink === pending.referralLink
    ) {
      return existing;
    }

    throw error;
  }
}

export async function finalizePaidPendingSignup(referenceId: string) {
  const payment = await getSignupPayment(referenceId);

  if (!payment || payment.status !== "paid") {
    return {
      accountReady: false,
      profileId: null,
    };
  }

  const pending = await getPendingRegistrationByReference(referenceId);

  if (!pending) {
    return {
      accountReady: false,
      profileId: null,
    };
  }

  const profile = await createProfileFromPending(pending);
  const adminProfile = await ensureEnvAdmin({
    email: profile.email,
    id: profile.id,
    isAdmin: profile.isAdmin,
    username: profile.username,
  });

  const existingSubscription = await getMemberSubscription(adminProfile.id);

  if (!existingSubscription) {
    await upsertMemberSubscription({
      paymentReferenceId: payment.referenceId,
      plan: planFromPending(pending),
      profileId: adminProfile.id,
    });
  }

  await markSignupPaymentConsumed(payment.referenceId);
  await prisma.$executeRaw`
    UPDATE "public"."signup_pending_registrations"
    SET
      "status" = 'paid',
      "updated_at" = CURRENT_TIMESTAMP
    WHERE "id" = ${pending.id}::uuid
  `;

  return {
    accountReady: true,
    profileId: adminProfile.id,
  };
}
