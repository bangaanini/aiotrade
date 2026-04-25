"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCurrentProfile } from "@/lib/auth";
import { buildMemberReferralLink, isValidMemberId, normalizeMemberId } from "@/lib/member-id";
import { prisma } from "@/lib/prisma";

const whatsappSchema = z
  .string()
  .trim()
  .min(9, "Masukkan nomor WhatsApp yang valid.")
  .max(24, "Nomor WhatsApp terlalu panjang.")
  .regex(/^\+?[0-9()\-\s]+$/, "Nomor WhatsApp hanya boleh berisi angka, spasi, tanda kurung, strip, atau +.")
  .transform((value) => value.replace(/[()\-\s]/g, ""))
  .refine((value) => /^\+?[0-9]{9,16}$/.test(value), "Masukkan nomor WhatsApp yang valid.");

const memberIdSchema = z
  .string()
  .trim()
  .min(1, "Masukkan member ID.")
  .transform((value) => normalizeMemberId(value))
  .refine((value) => isValidMemberId(value), "Member ID harus tepat 8 karakter huruf atau angka.");

const updateMemberProfileSchema = z.object({
  language: z.string().optional(),
  memberId: memberIdSchema,
  whatsapp: whatsappSchema,
});

type UpdateMemberProfileCopy = {
  conflictMessage: string;
  conflictMemberId: string;
  fixFields: string;
  saveFailed: string;
  saveSuccess: string;
  signInRequired: string;
};

function getActionCopy(language: string | null | undefined): UpdateMemberProfileCopy {
  const normalized = String(language ?? "").trim().toLowerCase();

  if (normalized.startsWith("en")) {
    return {
      conflictMessage: "That member ID is already in use.",
      conflictMemberId: "Choose a different member ID.",
      fixFields: "Please fix the highlighted fields.",
      saveFailed: "Your profile could not be updated right now.",
      saveSuccess: "Your account information has been updated.",
      signInRequired: "You need to sign in first.",
    };
  }

  return {
    conflictMessage: "Member ID tersebut sudah dipakai.",
    conflictMemberId: "Pakai member ID lain.",
    fixFields: "Periksa lagi field yang masih bermasalah.",
    saveFailed: "Profil Anda belum bisa diperbarui sekarang.",
    saveSuccess: "Informasi akun berhasil diperbarui.",
    signInRequired: "Anda harus login terlebih dahulu.",
  };
}

export type UpdateMemberProfileState = {
  fieldErrors: {
    memberId?: string;
    whatsapp?: string;
  };
  formValues: {
    memberId: string;
    whatsapp: string;
  };
  message: string | null;
  status: "idle" | "error" | "success";
};

type ReferralLinkOwner = {
  id: string;
};

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

function isUnknownFieldSelectError(error: unknown, fieldName: string) {
  return error instanceof Error && error.message.includes(`Unknown field \`${fieldName}\``);
}

async function findProfileByReferralLink(referralLink: string) {
  try {
    return await prisma.profile.findFirst({
      where: {
        referralLink,
      },
      select: {
        id: true,
      },
    });
  } catch (error) {
    if (!isUnknownFieldSelectError(error, "referralLink")) {
      throw error;
    }

    const rows = await prisma.$queryRaw<ReferralLinkOwner[]>`
      SELECT
        "id"
      FROM "public"."profiles"
      WHERE "referral_link" = ${referralLink}
      LIMIT 1
    `;

    return rows[0] ?? null;
  }
}

async function updateProfileContact(input: {
  id: string;
  referralLink: string;
  whatsapp: string;
}) {
  try {
    await prisma.profile.update({
      where: {
        id: input.id,
      },
      data: {
        referralLink: input.referralLink,
        whatsapp: input.whatsapp,
      },
    });
  } catch (error) {
    if (!isUnknownWhatsappArgumentError(error) && !isUnknownReferralLinkArgumentError(error)) {
      throw error;
    }

    await prisma.$executeRaw`
      UPDATE "public"."profiles"
      SET
        "referral_link" = ${input.referralLink},
        "whatsapp" = ${input.whatsapp}
      WHERE "id" = ${input.id}
    `;
  }
}

export async function updateMemberProfileAction(
  _prevState: UpdateMemberProfileState,
  formData: FormData,
): Promise<UpdateMemberProfileState> {
  void _prevState;

  const copy = getActionCopy(formData.get("language") as string | null | undefined);
  let profile;

  try {
    profile = await requireCurrentProfile();
  } catch {
    return {
      fieldErrors: {},
      formValues: {
        memberId: normalizeMemberId(formData.get("memberId") as string | null | undefined),
        whatsapp: String(formData.get("whatsapp") ?? "").trim(),
      },
      message: copy.signInRequired,
      status: "error",
    };
  }

  const parsed = updateMemberProfileSchema.safeParse({
    language: formData.get("language"),
    memberId: formData.get("memberId"),
    whatsapp: formData.get("whatsapp"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      fieldErrors: {
        memberId: fieldErrors.memberId?.[0],
        whatsapp: fieldErrors.whatsapp?.[0],
      },
      formValues: {
        memberId: normalizeMemberId(formData.get("memberId") as string | null | undefined),
        whatsapp: String(formData.get("whatsapp") ?? "").trim(),
      },
      message: copy.fixFields,
      status: "error",
    };
  }

  const memberId = parsed.data.memberId;
  const whatsapp = parsed.data.whatsapp;
  const referralLink = buildMemberReferralLink(memberId);
  const existingProfile = await findProfileByReferralLink(referralLink);

  if (existingProfile && existingProfile.id !== profile.id) {
    return {
      fieldErrors: {
        memberId: copy.conflictMemberId,
      },
      formValues: {
        memberId,
        whatsapp,
      },
      message: copy.conflictMessage,
      status: "error",
    };
  }

  try {
    await updateProfileContact({
      id: profile.id,
      referralLink,
      whatsapp,
    });
  } catch (error) {
    console.error("Failed to update member profile", error);

    return {
      fieldErrors: {},
      formValues: {
        memberId,
        whatsapp,
      },
      message: copy.saveFailed,
      status: "error",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/account/profile");
  revalidatePath("/dashboard/account/landing-page");

  return {
    fieldErrors: {},
    formValues: {
      memberId,
      whatsapp,
    },
    message: copy.saveSuccess,
    status: "success",
  };
}
