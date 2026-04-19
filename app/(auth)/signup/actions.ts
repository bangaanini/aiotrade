"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createUserSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(24, "Username must be at most 24 characters.")
  .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores.")
  .transform((value) => value.toLowerCase());

const signUpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters."),
  username: usernameSchema,
  referredBy: z
    .union([usernameSchema, z.literal("")])
    .transform((value) => value || null),
});

export type SignupActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: {
    email?: string;
    password?: string;
    username?: string;
    referredBy?: string;
  };
};

function isUniqueConstraintError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function signUpAction(
  _prevState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  void _prevState;

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
    referredBy: formData.get("referredBy"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        username: fieldErrors.username?.[0],
        referredBy: fieldErrors.referredBy?.[0],
      },
    };
  }

  const { email, password, username, referredBy } = parsed.data;

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
    };
  }

  if (existingProfile?.email === email) {
    return {
      status: "error",
      message: "That email is already registered.",
      fieldErrors: {
        email: "Use a different email or sign in.",
      },
    };
  }

  if (referredBy) {
    const sponsor = await prisma.profile.findUnique({
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
      };
    }
  }

  try {
    const profile = await prisma.profile.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        referredBy,
        username,
      },
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
      };
    }

    return {
      status: "error",
      message: "Unable to create the account right now.",
      fieldErrors: {},
    };
  }

  redirect("/dashboard");
}
