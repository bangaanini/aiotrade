"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureEnvAdmin } from "@/lib/admin-bootstrap";
import { createUserSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeReferralLink } from "@/lib/referral-links";
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

const referralLinkSchema = z
  .string()
  .trim()
  .min(1, "Enter your referral link.")
  .transform((value, ctx) => {
    const normalizedValue = normalizeReferralLink(value);

    if (!normalizedValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid referral link.",
      });

      return z.NEVER;
    }

    return normalizedValue;
  });

const signUpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters."),
  passwordConfirmation: z.string().min(1, "Repeat your password."),
  referralLink: referralLinkSchema,
  whatsapp: whatsappSchema,
  username: usernameSchema,
  referredBy: z
    .union([usernameSchema, z.literal("")])
    .transform((value) => value || null),
}).refine((value) => value.password === value.passwordConfirmation, {
  path: ["passwordConfirmation"],
  message: "Passwords do not match.",
});

export type SignupActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: {
    email?: string;
    password?: string;
    passwordConfirmation?: string;
    referralLink?: string;
    whatsapp?: string;
    username?: string;
    referredBy?: string;
  };
  formValues?: {
    email?: string;
    referralLink?: string;
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

export async function signUpAction(
  _prevState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  void _prevState;

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
    referralLink: formData.get("referralLink"),
    whatsapp: formData.get("whatsapp"),
    username: formData.get("username"),
    referredBy: formData.get("referredBy"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const email = formData.get("email");
    const referralLink = formData.get("referralLink");
    const username = formData.get("username");
    const whatsapp = formData.get("whatsapp");

    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        passwordConfirmation: fieldErrors.passwordConfirmation?.[0],
        referralLink: fieldErrors.referralLink?.[0],
        whatsapp: fieldErrors.whatsapp?.[0],
        username: fieldErrors.username?.[0],
        referredBy: fieldErrors.referredBy?.[0],
      },
      formValues: {
        email: typeof email === "string" ? email : "",
        referralLink: typeof referralLink === "string" ? referralLink : "",
        username: typeof username === "string" ? username : "",
        whatsapp: typeof whatsapp === "string" ? whatsapp : "",
      },
    };
  }

  const { email, password, referralLink, username, referredBy, whatsapp } = parsed.data;

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
        referralLink,
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
        referralLink,
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
          referralLink,
          username,
          whatsapp,
        },
      };
    }
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

    await ensureEnvAdmin({
      email,
      id: profile.id,
      isAdmin: false,
      username,
    });

    await createUserSession(profile.id);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: "error",
        message: "This account could not be created because one of the fields is already in use.",
        fieldErrors: {
          email: "Use a different email.",
          username: "Choose a different username.",
        },
        formValues: {
          email,
          referralLink,
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
        referralLink,
        username,
        whatsapp,
      },
    };
  }

  redirect("/dashboard");
}
