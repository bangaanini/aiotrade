"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureEnvAdmin } from "@/lib/admin-bootstrap";
import { createUserSession, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Enter your password."),
});

const forgotPasswordSchema = z
  .object({
    email: z.string().trim().email("Masukkan email yang valid.").transform((value) => value.toLowerCase()),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter."),
    passwordConfirmation: z.string().min(1, "Ulangi password baru Anda."),
  })
  .refine((value) => value.newPassword === value.passwordConfirmation, {
    message: "Konfirmasi password baru tidak sama.",
    path: ["passwordConfirmation"],
  });

export type LoginActionState = {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: {
    email?: string;
    password?: string;
  };
  formValues?: {
    email?: string;
  };
};

export type ForgotPasswordActionState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: {
    email?: string;
    newPassword?: string;
    passwordConfirmation?: string;
  };
  formValues?: {
    email?: string;
  };
};

type LoginProfile = {
  email: string | null;
  id: string;
  isAdmin: boolean;
  passwordHash: string;
  username: string;
};

async function getLoginProfileByEmail(email: string) {
  try {
    return await prisma.profile.findFirst({
      where: {
        email,
      },
      select: {
        email: true,
        id: true,
        isAdmin: true,
        passwordHash: true,
        username: true,
      },
    });
  } catch (error) {
    const isStaleIsAdminSelect =
      error instanceof Error &&
      error.message.includes("Unknown field `isAdmin` for select statement on model `Profile`");

    if (!isStaleIsAdminSelect) {
      throw error;
    }

    const profiles = await prisma.$queryRaw<LoginProfile[]>`
      SELECT
        "email",
        "id",
        "is_admin" AS "isAdmin",
        "password_hash" AS "passwordHash",
        "username"
      FROM "public"."profiles"
      WHERE "email" = ${email}
      LIMIT 1
    `;

    return profiles[0] ?? null;
  }
}

function isUnknownPasswordHashArgumentError(error: unknown) {
  if (error instanceof Error) {
    return error.message.includes("Unknown argument `passwordHash`");
  }

  return typeof error === "string" && error.includes("Unknown argument `passwordHash`");
}

async function updatePasswordHash(profileId: string, passwordHash: string) {
  try {
    await prisma.profile.update({
      where: {
        id: profileId,
      },
      data: {
        passwordHash,
      },
    });
  } catch (error) {
    if (!isUnknownPasswordHashArgumentError(error)) {
      throw error;
    }

    await prisma.$executeRaw`
      UPDATE "public"."profiles"
      SET "password_hash" = ${passwordHash}
      WHERE "id" = ${profileId}
    `;
  }
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  void _prevState;

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const email = formData.get("email");

    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
      formValues: {
        email: typeof email === "string" ? email : "",
      },
    };
  }

  const { email, password } = parsed.data;

  const profile = await getLoginProfileByEmail(email);

  if (!profile || !verifyPassword(password, profile.passwordHash)) {
    return {
      status: "error",
      message: "Email or password is incorrect.",
      fieldErrors: {},
      formValues: {
        email,
      },
    };
  }

  await ensureEnvAdmin({
    email: profile.email,
    id: profile.id,
    isAdmin: profile.isAdmin,
    username: profile.username,
  });

  await createUserSession(profile.id);

  redirect("/dashboard");
}

export async function forgotPasswordAction(
  _prevState: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> {
  void _prevState;

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("forgotEmail"),
    newPassword: formData.get("newPassword"),
    passwordConfirmation: formData.get("passwordConfirmation"),
  });
  const email = formData.get("forgotEmail");
  const emailValue = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Periksa kembali field yang ditandai.",
      fieldErrors: {
        email: fieldErrors.email?.[0],
        newPassword: fieldErrors.newPassword?.[0],
        passwordConfirmation: fieldErrors.passwordConfirmation?.[0],
      },
      formValues: {
        email: emailValue,
      },
    };
  }

  const profile = await prisma.profile.findFirst({
    where: {
      email: parsed.data.email,
    },
    select: {
      id: true,
    },
  });

  if (!profile) {
    return {
      status: "error",
      message: "Email ini belum terdaftar di database.",
      fieldErrors: {
        email: "Email tidak ditemukan.",
      },
      formValues: {
        email: parsed.data.email,
      },
    };
  }

  try {
    await updatePasswordHash(profile.id, hashPassword(parsed.data.newPassword));
  } catch (error) {
    console.error("Failed to reset password from login page", error);

    return {
      status: "error",
      message: "Password belum bisa diperbarui sekarang.",
      fieldErrors: {},
      formValues: {
        email: parsed.data.email,
      },
    };
  }

  return {
    status: "success",
    message: "Password berhasil diperbarui. Silakan masuk memakai password baru.",
    fieldErrors: {},
    formValues: {
      email: parsed.data.email,
    },
  };
}
