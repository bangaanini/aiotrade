"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useFormStatus } from "react-dom";
import { approvePendingRegistrationAction } from "@/app/(protected)/admin/pending-registrations/actions";
import { Button } from "@/components/ui/button";

type ApprovePendingRegistrationButtonProps = {
  filter: string;
  pendingId: string;
  username: string;
};

function ConfirmApproveButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="bg-emerald-600 text-white hover:bg-emerald-700"
      disabled={pending}
      type="submit"
    >
      <CheckCircle2 className="h-4 w-4" />
      {pending ? "Memproses..." : "Approve Manual"}
    </Button>
  );
}

export function ApprovePendingRegistrationButton({
  filter,
  pendingId,
  username,
}: ApprovePendingRegistrationButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        onClick={() => setOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        <CheckCircle2 className="h-4 w-4" />
        Approve
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-[2px]">
          <div
            aria-labelledby={`approve-pending-title-${pendingId}`}
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  Konfirmasi Approval
                </p>
                <h3
                  className="mt-2 text-xl font-semibold tracking-tight text-stone-950"
                  id={`approve-pending-title-${pendingId}`}
                >
                  Approve pendaftaran @{username}?
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
              Sistem akan membuat akun member dan subscription dari data pending ini. Gunakan approve
              manual hanya setelah pembayaran atau alasan approval sudah Anda verifikasi.
            </p>

            <form
              action={approvePendingRegistrationAction}
              className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
            >
              <input name="filter" type="hidden" value={filter} />
              <input name="pendingId" type="hidden" value={pendingId} />
              <Button onClick={() => setOpen(false)} type="button" variant="outline">
                Batal
              </Button>
              <ConfirmApproveButton />
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
