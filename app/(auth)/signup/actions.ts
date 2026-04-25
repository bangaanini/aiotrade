"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureEnvAdmin } from "@/lib/admin-bootstrap";
import { createUserSession, hashPassword } from "@/lib/auth";
import {
  buildMemberReferralLink,
  isValidMemberId,
  normalizeMemberId,
} from "@/lib/member-id";
import { upsertMemberSubscription } from "@/lib/member-subscription";
import { prisma } from "@/lib/prisma";
import { getPaymentGatewaySettings } from "@/lib/payment-gateway-settings";
import { parseReferralUsername } from "@/lib/referral";
import { markSignupPaymentConsumed, verifyPaidSignupPayment } from "@/lib/signup-payment";
import { isReservedUsername, normalizeUsername } from "@/lib/username-rules";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(24, "Username must be at most 24 characters.")
  .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores.")
  .transform((value) => normalizeUsername(value))
  .refine((value) => !isReservedUsername(value), "This username is reserved.");

const whatsappSchema = z
  .string()
  .trim()
  .min(9, "Enter a valid WhatsApp number.")
  .max(24, "WhatsApp number is too long.")
  .regex(/^\+?[0-9()\-\s]+$/, "WhatsApp number can only contain digits, spaces, parentheses, dashes, or +.")
  .transform((value) => value.replace(/[()\-\s]/g, ""))
  .refine((value) => /^\+?[0-9]{9,16}$/.test(value), "Enter a valid WhatsApp number.");

const referredBySchema = z.string().trim().transform((value, ctx) => {
  if (!value) {
    return null;
  }

  const normalizedValue = parseReferralUsername(value);

  if (!normalizedValue) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Referral link is no longer valid.",
    });

    return z.NEVER;
  }

  return normalizedValue;
});

const memberIdSchema = z
  .string()
  .trim()
  .min(1, "Enter a member ID.")
  .transform((value) => normalizeMemberId(value))
  .refine(
    (value) => isValidMemberId(value),
    "Member ID must be exactly 8 letters or numbers.",
  );

const signUpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  memberId: memberIdSchema,
  password: z.string().min(8, "Password must be at least 8 characters."),
  passwordConfirmation: z.string().min(1, "Repeat your password."),
  whatsapp: whatsappSchema,
  username: usernameSchema,
  referredBy: referredBySchema,
}).refine((value) => value.password === value.passwordConfirmation, {
  path: ["passwordConfirmation"],
  message: "Passwords do not match.",
});

export type SignupActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: {
    email?: string;
    memberId?: string;
    password?: string;
    passwordConfirmation?: string;
    whatsapp?: string;
    username?: string;
    referredBy?: string;
  };
  formValues?: {
    email?: string;
    memberId?: string;
    username?: string;
    whatsapp?: string;
  };
};

function isUniqueConstraintError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function isUnknownWhatsappArgumentError(error: unknown) {
  if (error instanceof Error) {
    return error.message.includes("Unknown argument `whatsapp`");
  }

  return typeof error === "string" && error.includes("Unknown argument `whatsapp`");
}

function isUnknownReferralLinkArgumentError(error: unknown) {
  if (error instanceof Error) {
    return error.message.includes("Unknown argument `referralLink`");
  }

  return typeof error === "string" && error.includes("Unknown argument `referralLink`");
}

async function createProfileRecord(input: {
  email: string;
  password: string;
  referralLink: string;
  referredBy: string | null;
  username: string;
  whatsapp: string;
}) {
  const passwordHash = hashPassword(input.password);

  try {
    return await prisma.profile.create({
      data: {
        email: input.email,
        passwordHash,
        referralLink: input.referralLink,
        referredBy: input.referredBy,
        whatsapp: input.whatsapp,
        username: input.username,
      },
      select: {
        id: true,
      },
    });
  } catch (error) {
    if (!isUnknownWhatsappArgumentError(error) && !isUnknownReferralLinkArgumentError(error)) {
      throw error;
    }

    const insertedProfiles = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO "public"."profiles" (
        "email",
        "referral_link",
        "whatsapp",
        "username",
        "password_hash",
        "referred_by"
      )
      VALUES (
        ${input.email},
        ${input.referralLink},
        ${input.whatsapp},
        ${input.username},
        ${passwordHash},
        ${input.referredBy}
      )
      RETURNING "id"
    `;

    const [profile] = insertedProfiles;

    if (!profile) {
      throw error;
    }

    return profile;
  }
}

async function referralLinkExists(referralLink: string) {
  const existingProfile = await prisma.profile.findFirst({
    where: {
      referralLink,
    },
    select: {
      id: true,
    },
  });

  return Boolean(existingProfile);
}

export async function signUpAction(
  _prevState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  void _prevState;

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    memberId: formData.get("memberId"),
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
    whatsapp: formData.get("whatsapp"),
    username: formData.get("username"),
    referredBy: formData.get("referredBy"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const email = formData.get("email");
    const memberId = formData.get("memberId");
    const username = formData.get("username");
    const whatsapp = formData.get("whatsapp");

    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: {
        email: fieldErrors.email?.[0],
        memberId: fieldErrors.memberId?.[0],
        password: fieldErrors.password?.[0],
        passwordConfirmation: fieldErrors.passwordConfirmation?.[0],
        whatsapp: fieldErrors.whatsapp?.[0],
        username: fieldErrors.username?.[0],
        referredBy: fieldErrors.referredBy?.[0],
      },
      formValues: {
        email: typeof email === "string" ? email : "",
        memberId: typeof memberId === "string" ? normalizeMemberId(memberId) : "",
        username: typeof username === "string" ? username : "",
        whatsapp: typeof whatsapp === "string" ? whatsapp : "",
      },
    };
  }

  const { email, memberId, password, username, referredBy, whatsapp } = parsed.data;
  const referralLink = buildMemberReferralLink(memberId);
  const paymentSettings = await getPaymentGatewaySettings();
  const paymentReferenceId = String(formData.get("paymentReferenceId") ?? "").trim();
  const selectedPlanId = String(formData.get("selectedPlanId") ?? "").trim();
  let selectedPlan =
    paymentSettings.subscriptionPlans.find((plan) => plan.id === selectedPlanId) ??
    paymentSettings.subscriptionPlans.find((plan) => plan.id === paymentSettings.defaultPlanId) ??
    paymentSettings.subscriptionPlans[0];
  let verifiedPayment: Awaited<ReturnType<typeof verifyPaidSignupPayment>> | null = null;

  const existingProfile = await prisma.profile.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
    select: {
      email: true,
      username: true,
    },
  });

  if (existingProfile?.username === username) {
    return {
      status: "error",
      message: "That username is already taken.",
      fieldErrors: {
        username: "Choose a different username.",
      },
      formValues: {
        email,
        memberId,
        username,
        whatsapp,
      },
    };
  }

  if (existingProfile?.email === email) {
    return {
      status: "error",
      message: "That email is already registered.",
      fieldErrors: {
        email: "Use a different email or sign in.",
      },
      formValues: {
        email,
        memberId,
        username,
        whatsapp,
      },
    };
  }

  if (await referralLinkExists(referralLink)) {
    return {
      status: "error",
      message: "That member ID is already taken.",
      fieldErrors: {
        memberId: "Choose a different member ID.",
      },
      formValues: {
        email,
        memberId,
        username,
        whatsapp,
      },
    };
  }

  if (referredBy) {
    const sponsor = await prisma.profile.findFirst({
      where: {
        username: referredBy,
      },
      select: {
        username: true,
      },
    });

    if (!sponsor) {
      return {
        status: "error",
        message: "Referral link is no longer valid.",
        fieldErrors: {},
        formValues: {
          email,
          memberId,
          username,
          whatsapp,
        },
      };
    }
  }

  if (paymentSettings.isEnabled) {
    if (!paymentReferenceId) {
      return {
        status: "error",
        message: "Selesaikan pembayaran pendaftaran terlebih dahulu.",
        fieldErrors: {},
        formValues: {
          email,
          memberId,
          username,
          whatsapp,
        },
      };
    }

    verifiedPayment = await verifyPaidSignupPayment(paymentReferenceId);

    if (!verifiedPayment) {
      return {
        status: "error",
        message: "Pembayaran belum terverifikasi. Selesaikan pembayaran lalu cek statusnya lagi.",
        fieldErrors: {},
        formValues: {
          email,
          memberId,
          username,
          whatsapp,
        },
      };
    }

    if (
      !selectedPlan ||
      verifiedPayment.amount !== selectedPlan.price ||
      verifiedPayment.customerEmail.toLowerCase() !== email.toLowerCase() ||
      verifiedPayment.customerName !== username
    ) {
      return {
        status: "error",
        message: "Data pembayaran tidak cocok dengan form pendaftaran yang sedang Anda kirim.",
        fieldErrors: {},
        formValues: {
          email,
          memberId,
          username,
          whatsapp,
        },
      };
    }

    selectedPlan =
      paymentSettings.subscriptionPlans.find((plan) => plan.id === verifiedPayment?.planId) ??
      selectedPlan;
  }

  try {
    const profile = await createProfileRecord({
      email,
      password,
      referralLink,
      referredBy,
      username,
      whatsapp,
    });

    if (selectedPlan) {
      await upsertMemberSubscription({
        paymentReferenceId: verifiedPayment?.referenceId ?? paymentReferenceId ?? null,
        plan: selectedPlan,
        profileId: profile.id,
      });
    }

    await ensureEnvAdmin({
      email,
      id: profile.id,
      isAdmin: false,
      username,
    });

    if (paymentSettings.isEnabled && paymentReferenceId) {
      await markSignupPaymentConsumed(paymentReferenceId);
    }

    await createUserSession(profile.id);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const conflictingProfile = await prisma.profile.findFirst({
        where: {
          OR: [{ email }, { username }, { referralLink }],
        },
        select: {
          email: true,
          referralLink: true,
          username: true,
        },
      });

      return {
        status: "error",
        message: "This account could not be created because one of the fields is already in use.",
        fieldErrors: {
          email: conflictingProfile?.email === email ? "Use a different email." : undefined,
          memberId:
            conflictingProfile?.referralLink === referralLink ? "Choose a different member ID." : undefined,
          username: conflictingProfile?.username === username ? "Choose a different username." : undefined,
        },
        formValues: {
          email,
          memberId,
          username,
          whatsapp,
        },
      };
    }

    return {
      status: "error",
      message: "Unable to create the account right now.",
      fieldErrors: {},
      formValues: {
        email,
        memberId,
        username,
        whatsapp,
      },
    };
  }

  redirect("/dashboard");
}
