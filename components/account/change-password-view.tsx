"use client";

import { useActionState } from "react";
import { AlertCircle, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import {
  changePasswordAction,
  type ChangePasswordActionState,
} from "@/app/(protected)/account/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ChangePasswordViewProps = {
  description: string;
  title: string;
};

const initialChangePasswordState: ChangePasswordActionState = {
  fieldErrors: {},
  message: null,
  status: "idle",
};

function PasswordField({
  autoComplete,
  error,
  icon: Icon,
  id,
  label,
  name,
  placeholder,
}: {
  autoComplete: string;
  error?: string;
  icon: typeof KeyRound;
  id: string;
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="inline-flex items-center gap-2 text-sm font-medium text-stone-700" htmlFor={id}>
        <Icon className="h-4 w-4 text-emerald-600" />
        {label}
      </Label>
      <Input
        autoComplete={autoComplete}
        className={error ? "border-rose-300 focus-visible:ring-rose-400/30" : undefined}
        id={id}
        name={name}
        placeholder={placeholder}
        required
        type="password"
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

export function ChangePasswordView({ description, title }: ChangePasswordViewProps) {
  const [state, formAction] = useActionState<ChangePasswordActionState, FormData>(
    changePasswordAction,
    initialChangePasswordState,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <ShieldCheck className="h-4 w-4" />
          Account Security
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950">{title}</h1>
          <p className="mt-2 max-w-3xl text-base leading-7 text-stone-600">{description}</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Masukkan password lama Anda, lalu simpan password baru yang ingin dipakai saat login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            {state?.message ? (
              <Alert className="flex items-start gap-3" variant={state.status === "success" ? "success" : "error"}>
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{state.message}</p>
              </Alert>
            ) : null}

            <PasswordField
              autoComplete="current-password"
              error={state.fieldErrors.currentPassword}
              icon={KeyRound}
              id="currentPassword"
              label="Password Saat Ini"
              name="currentPassword"
              placeholder="Masukkan password saat ini"
            />

            <PasswordField
              autoComplete="new-password"
              error={state.fieldErrors.newPassword}
              icon={LockKeyhole}
              id="newPassword"
              label="Password Baru"
              name="newPassword"
              placeholder="Minimal 8 karakter"
            />

            <PasswordField
              autoComplete="new-password"
              error={state.fieldErrors.confirmPassword}
              icon={LockKeyhole}
              id="confirmPassword"
              label="Konfirmasi Password Baru"
              name="confirmPassword"
              placeholder="Ulangi password baru"
            />

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <p className="text-sm font-medium text-stone-800">Catatan</p>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                Setelah password diganti, login berikutnya akan memakai password baru ini.
              </p>
            </div>

            <SubmitButton className="w-full sm:w-auto" pendingText="Menyimpan password...">
              Simpan Password Baru
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
