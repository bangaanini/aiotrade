import "server-only";

import { randomUUID } from "node:crypto";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REGISTER_USERNAME = "register";

export async function getRegisterReferralWhatsapp() {
  const profile = await prisma.profile.findUnique({
    where: {
      username: REGISTER_USERNAME,
    },
    select: {
      whatsapp: true,
    },
  });

  return profile?.whatsapp ?? "";
}

export async function upsertRegisterReferralWhatsapp(whatsapp: string) {
  const normalizedWhatsapp = whatsapp.trim() || null;

  await prisma.profile.upsert({
    where: {
      username: REGISTER_USERNAME,
    },
    update: {
      isAdmin: false,
      isLpActive: true,
      referredBy: null,
      referralLink: null,
      whatsapp: normalizedWhatsapp,
    },
    create: {
      email: null,
      isAdmin: false,
      isLpActive: true,
      passwordHash: hashPassword(randomUUID()),
      referredBy: null,
      referralLink: null,
      username: REGISTER_USERNAME,
      whatsapp: normalizedWhatsapp,
    },
  });
}
