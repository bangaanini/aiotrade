"use server";

import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ActivateLandingPageState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

export async function activateLandingPageAction(
  _prevState: ActivateLandingPageState,
): Promise<ActivateLandingPageState> {
  void _prevState;

  const userId = await getSessionUserId();

  if (!userId) {
    return {
      status: "error",
      message: "You need to be signed in to activate the landing page.",
    };
  }

  try {
    await prisma.profile.update({
      where: {
        id: userId,
      },
      data: {
        isLpActive: true,
      },
    });
  } catch {
    return {
      status: "error",
      message: "Could not activate the landing page. Try again.",
    };
  }

  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Landing page activated.",
  };
}
