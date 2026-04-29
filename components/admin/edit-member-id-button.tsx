"use client";

import { useState } from "react";
import { PencilLine, Save, X } from "lucide-react";
import { useFormStatus } from "react-dom";
import { updateUserMemberIdAction } from "@/app/(protected)/admin/users/actions";
import { Button } from "@/components/ui/button";

type EditMemberIdButtonProps = {
  memberId: string | null;
  userId: string;
  username: string;
};

function SaveMemberIdButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="admin-solid-button" disabled={pending} type="submit">
      <Save className="h-4 w-4" />
      {pending ? "Menyimpan..." : "Simpan Member ID"}
    </Button>
  );
}

export function EditMemberIdButton({
  memberId,
  userId,
  username,
}: EditMemberIdButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="border-sky-200 text-sky-700 hover:bg-sky-50"
        onClick={() => setOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        <PencilLine className="h-4 w-4" />
        Edit ID
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-[2px]">
          <div
            aria-labelledby={`edit-member-id-title-${userId}`}
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                  Edit Member ID
                </p>
                <h3
                  className="mt-2 text-xl font-semibold tracking-tight text-stone-950"
                  id={`edit-member-id-title-${userId}`}
                >
                  Ubah Member ID @{username}
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

            <form action={updateUserMemberIdAction} className="mt-6 space-y-5">
              <input name="userId" type="hidden" value={userId} />
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-stone-700"
                  htmlFor={`edit-member-id-input-${userId}`}
                >
                  Member ID
                </label>
                <input
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="flex h-11 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-base text-stone-950 shadow-sm outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                  defaultValue={memberId ?? ""}
                  id={`edit-member-id-input-${userId}`}
                  maxLength={8}
                  name="memberId"
                  pattern="[A-Za-z0-9]{8}"
                  placeholder="ABC12345"
                  required
                  spellCheck={false}
                />
                <p className="text-xs leading-5 text-stone-500">
                  Gunakan tepat 8 huruf atau angka. Link referral akan mengikuti Member ID ini.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button onClick={() => setOpen(false)} type="button" variant="outline">
                  Batal
                </Button>
                <SaveMemberIdButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
