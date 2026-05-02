"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { parseAdminPendingRegistrationStatusFilter } from "@/lib/admin-pending-registrations";
import { requireAdminProfile } from "@/lib/auth";
import {
  approvePendingRegistrationManually,
  PendingRegistrationApprovalError,
} from "@/lib/signup-pending-registration";

const pendingRegistrationIdSchema = z.string().trim().uuid();

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function adminPendingRegistrationsRedirect(filter: string, status: string) {
  return `/admin/pending-registrations?filter=${filter}&status=${status}`;
}

export async function approvePendingRegistrationAction(formData: FormData) {
  await requireAdminProfile();

  const parsed = pendingRegistrationIdSchema.safeParse(formData.get("pendingId"));
  const filter = parseAdminPendingRegistrationStatusFilter(
    String(formData.get("filter") ?? ""),
  );

  if (!parsed.success) {
    redirect(adminPendingRegistrationsRedirect(filter, "invalid"));
  }

  let status = "approved";

  try {
    const result = await approvePendingRegistrationManually(parsed.data);
    status = result.wasAlreadyPaid ? "already-approved" : "approved";
  } catch (error) {
    if (error instanceof PendingRegistrationApprovalError) {
      redirect(adminPendingRegistrationsRedirect(filter, error.code));
    }

    if (isUniqueConstraintError(error)) {
      redirect(adminPendingRegistrationsRedirect(filter, "conflict"));
    }

    redirect(adminPendingRegistrationsRedirect(filter, "error"));
  }

  revalidatePath("/admin/pending-registrations");
  revalidatePath("/admin/users");
  redirect(adminPendingRegistrationsRedirect(filter, status));
}
