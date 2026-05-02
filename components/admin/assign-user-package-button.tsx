"use client";

import { useState } from "react";
import { PackagePlus, Save, X } from "lucide-react";
import { useFormStatus } from "react-dom";
import { assignUserPackageAction } from "@/app/(protected)/admin/users/actions";
import { Button } from "@/components/ui/button";
import { formatIdrCurrency } from "@/lib/payment-gateway-config";
import type { PaymentSubscriptionPlan } from "@/lib/payment-gateway-types";

type AssignUserPackageButtonProps = {
  currentPlanLabel: string | null;
  plans: PaymentSubscriptionPlan[];
  searchQuery: string;
  userId: string;
  username: string;
};

function formatPlanDuration(plan: PaymentSubscriptionPlan) {
  if (plan.isLifetime) {
    return "Lifetime";
  }

  return `${plan.durationMonths} bulan`;
}

function SavePackageButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="admin-solid-button" disabled={pending} type="submit">
      <Save className="h-4 w-4" />
      {pending ? "Menyimpan..." : "Simpan Paket"}
    </Button>
  );
}

export function AssignUserPackageButton({
  currentPlanLabel,
  plans,
  searchQuery,
  userId,
  username,
}: AssignUserPackageButtonProps) {
  const [open, setOpen] = useState(false);
  const firstPlan = plans[0] ?? null;

  return (
    <>
      <Button
        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        disabled={!plans.length}
        onClick={() => setOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        <PackagePlus className="h-4 w-4" />
        Paket
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-[2px]">
          <div
            aria-labelledby={`assign-package-title-${userId}`}
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Paket Manual
                </p>
                <h3
                  className="mt-2 text-xl font-semibold tracking-tight text-stone-950"
                  id={`assign-package-title-${userId}`}
                >
                  Tambah paket untuk @{username}
                </h3>
              </div>
              <button
                aria-label="Tutup"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-stone-600">
              Pilih salah satu paket dari Payment Settings. Jika user sudah punya paket,
              paket aktifnya akan diperbarui mulai hari ini.
            </p>

            <form action={assignUserPackageAction} className="mt-6 space-y-5">
              <input name="q" type="hidden" value={searchQuery} />
              <input name="userId" type="hidden" value={userId} />
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-stone-700"
                  htmlFor={`assign-package-select-${userId}`}
                >
                  Paket
                </label>
                <select
                  className="flex h-11 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-950 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                  defaultValue={firstPlan?.id}
                  id={`assign-package-select-${userId}`}
                  name="planId"
                  required
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.label} - {formatPlanDuration(plan)} - {formatIdrCurrency(plan.price)}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-5 text-stone-500">
                  Paket saat ini: {currentPlanLabel ?? "Belum ada paket aktif"}.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                Approval ini tidak membuat transaksi Paymenku baru. Gunakan hanya untuk koreksi
                manual atau pembayaran yang sudah Anda verifikasi di luar sistem.
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button onClick={() => setOpen(false)} type="button" variant="outline">
                  Batal
                </Button>
                <SavePackageButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
