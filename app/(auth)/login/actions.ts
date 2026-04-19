"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createUserSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Enter your password."),
});

export type LoginActionState = {
  status: "idle" | "error";
  message: string | null;
  fieldErrors: {
    email?: string;
    password?: string;
  };
};

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

    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  const { email, password } = parsed.data;

  const profile = await prisma.profile.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!profile || !verifyPassword(password, profile.passwordHash)) {
    return {
      status: "error",
      message: "Email or password is incorrect.",
      fieldErrors: {},
    };
  }

  await createUserSession(profile.id);

  redirect("/dashboard");
}
