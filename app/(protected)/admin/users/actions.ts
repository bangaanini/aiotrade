"use server";

import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword, requireAdminProfile } from "@/lib/auth";
import {
  buildMemberReferralLink,
  isValidMemberId,
  normalizeMemberId,
} from "@/lib/member-id";
import { prisma } from "@/lib/prisma";
import { cleanupExpiredPendingRegistrations } from "@/lib/signup-pending-registration";
import { HIDDEN_ADMIN_TABLE_USERNAMES, isReservedUsername, normalizeUsername } from "@/lib/username-rules";

const memberIdSchema = z
  .string()
  .trim()
  .transform((value) => normalizeMemberId(value))
  .refine(
    (value) => !value || isValidMemberId(value),
    "Member ID harus tepat 8 huruf atau angka.",
  );

const createAdminUserSchema = z.object({
  email: z.string().trim().email("Masukkan email yang valid.").transform((value) => value.toLowerCase()),
  memberId: memberIdSchema,
  password: z.string().min(8, "Password minimal 8 karakter."),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(24, "Username maksimal 24 karakter.")
    .regex(/^[a-z0-9_]+$/, "Username hanya boleh huruf kecil, angka, dan underscore.")
    .transform((value) => normalizeUsername(value))
    .refine(
      (value) => !isReservedUsername(value) && !HIDDEN_ADMIN_TABLE_USERNAMES.has(value),
      "Username ini dipakai sistem. Coba nama lain.",
    ),
});

export type CreateAdminUserState = {
  fieldErrors: {
    email?: string;
    memberId?: string;
    password?: string;
    username?: string;
  };
  formValues: {
    email: string;
    memberId: string;
    password: string;
    username: string;
  };
  message: string | null;
  status: "idle" | "error" | "success";
};

function isUniqueConstraintError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

async function findActiveMemberIdConflict(referralLink: string, userId?: string) {
  return prisma.profile.findFirst({
    where: {
      referralLink,
      id: userId
        ? {
            not: userId,
          }
        : undefined,
    },
    select: {
      id: true,
      username: true,
    },
  });
}

async function findPendingMemberIdConflict(input: {
  memberId: string;
  referralLink: string;
}) {
  await cleanupExpiredPendingRegistrations();

  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT "id"
    FROM "public"."signup_pending_registrations"
    WHERE "status" IN ('pending', 'failed')
      AND "expires_at" > CURRENT_TIMESTAMP
      AND (
        "member_id" = ${input.memberId}
        OR "referral_link" = ${input.referralLink}
      )
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function createAdminUserAction(
  _prevState: CreateAdminUserState,
  formData: FormData,
): Promise<CreateAdminUserState> {
  void _prevState;
  await requireAdminProfile();

  const parsed = createAdminUserSchema.safeParse({
    email: formData.get("email"),
    memberId: formData.get("memberId"),
    password: formData.get("password"),
    username: formData.get("username"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      fieldErrors: {
        email: fieldErrors.email?.[0],
        memberId: fieldErrors.memberId?.[0],
        password: fieldErrors.password?.[0],
        username: fieldErrors.username?.[0],
      },
      formValues: {
        email: String(formData.get("email") ?? "").trim(),
        memberId: String(formData.get("memberId") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
        username: String(formData.get("username") ?? "").trim().toLowerCase(),
      },
      message: "Periksa kembali field yang ditandai.",
      status: "error",
    };
  }

  const { email, memberId, password, username } = parsed.data;
  const referralLink = memberId ? buildMemberReferralLink(memberId) : null;
  const existingProfile = await prisma.profile.findFirst({
    where: {
      OR: [
        { email },
        { username },
        ...(referralLink ? [{ referralLink }] : []),
      ],
    },
    select: {
      email: true,
      referralLink: true,
      username: true,
    },
  });

  if (existingProfile?.username === username) {
    return {
      fieldErrors: {
        username: "Username ini sudah dipakai.",
      },
      formValues: {
        email,
        memberId,
        password,
        username,
      },
      message: "Username sudah digunakan oleh user lain.",
      status: "error",
    };
  }

  if (existingProfile?.email === email) {
    return {
      fieldErrors: {
        email: "Email ini sudah terdaftar.",
      },
      formValues: {
        email,
        memberId,
        password,
        username,
      },
      message: "Email sudah digunakan oleh user lain.",
      status: "error",
    };
  }

  if (referralLink && existingProfile?.referralLink === referralLink) {
    return {
      fieldErrors: {
        memberId: "Member ID ini sudah dipakai.",
      },
      formValues: {
        email,
        memberId,
        password,
        username,
      },
      message: "Member ID sudah digunakan oleh user lain.",
      status: "error",
    };
  }

  if (memberId && referralLink) {
    const pendingConflict = await findPendingMemberIdConflict({
      memberId,
      referralLink,
    });

    if (pendingConflict) {
      return {
        fieldErrors: {
          memberId: "Member ID ini masih dipakai pendaftaran pending.",
        },
        formValues: {
          email,
          memberId,
          password,
          username,
        },
        message: "Member ID masih tertahan oleh pembayaran signup yang pending.",
        status: "error",
      };
    }
  }

  try {
    await prisma.profile.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        referralLink,
        username,
      },
      select: {
        id: true,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        fieldErrors: {},
        formValues: {
          email,
          memberId,
          password,
          username,
        },
        message: "User tidak bisa dibuat karena email, username, atau Member ID sudah dipakai.",
        status: "error",
      };
    }

    return {
      fieldErrors: {},
      formValues: {
        email,
        memberId,
        password,
        username,
      },
      message: "User belum bisa dibuat sekarang. Coba lagi.",
      status: "error",
    };
  }

  revalidatePath("/admin/users");
  refresh();

  return {
    fieldErrors: {},
    formValues: {
      email: "",
      memberId: "",
      password: "",
      username: "",
    },
    message: `User @${username} berhasil dibuat.`,
    status: "success",
  };
}

export async function updateUserMemberIdAction(formData: FormData) {
  await requireAdminProfile();

  const userId = String(formData.get("userId") ?? "").trim();
  const memberId = normalizeMemberId(String(formData.get("memberId") ?? ""));

  if (!userId || !isValidMemberId(memberId)) {
    redirect("/admin/users?status=member-id-invalid");
  }

  const referralLink = buildMemberReferralLink(memberId);

  const user = await prisma.profile.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    redirect("/admin/users?status=member-id-error");
  }

  const activeConflict = await findActiveMemberIdConflict(referralLink, userId);

  if (activeConflict) {
    redirect("/admin/users?status=member-id-taken");
  }

  const pendingConflict = await findPendingMemberIdConflict({
    memberId,
    referralLink,
  });

  if (pendingConflict) {
    redirect("/admin/users?status=member-id-taken");
  }

  try {
    await prisma.profile.update({
      where: {
        id: userId,
      },
      data: {
        referralLink,
      },
      select: {
        id: true,
      },
    });
  } catch {
    redirect("/admin/users?status=member-id-error");
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?status=member-id-updated");
}

export async function deleteUserAction(formData: FormData) {
  const admin = await requireAdminProfile();
  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    redirect("/admin/users?status=error");
  }

  if (userId === admin.id) {
    redirect("/admin/users?status=self-delete-blocked");
  }

  try {
    await prisma.profile.delete({
      where: {
        id: userId,
      },
    });
  } catch {
    redirect("/admin/users?status=error");
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?status=deleted");
}
