"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, KeyRound, Mail, ShieldCheck } from "lucide-react";
import {
  forgotPasswordAction,
  loginAction,
  type ForgotPasswordActionState,
  type LoginActionState,
} from "@/app/(auth)/login/actions";
import { AuthFieldShell } from "@/components/auth/auth-field-shell";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialLoginState: LoginActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

const initialForgotPasswordState: ForgotPasswordActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

type LoginFormProps = {
  labels?: {
    email: string;
    emailPlaceholder: string;
    forgotEmail: string;
    forgotEmailPlaceholder: string;
    forgotPassword: string;
    forgotPasswordBack: string;
    forgotPasswordDescription: string;
    forgotPasswordTitle: string;
    helperBody: string;
    helperTitle: string;
    loginButton: string;
    loginPending: string;
    newPassword: string;
    newPasswordPlaceholder: string;
    noAccount: string;
    password: string;
    passwordConfirmation: string;
    passwordConfirmationPlaceholder: string;
    passwordPlaceholder: string;
    resetPasswordButton: string;
    resetPasswordPending: string;
    signupLink: string;
  };
  showSignupLink?: boolean;
  signupHref?: string;
};

const defaultLabels = {
  email: "Email",
  emailPlaceholder: "you@example.com",
  forgotEmail: "Email akun",
  forgotEmailPlaceholder: "email-terdaftar@example.com",
  forgotPassword: "Lupa password?",
  forgotPasswordBack: "Tutup reset password",
  forgotPasswordDescription:
    "Masukkan email yang sudah terdaftar, lalu buat password baru.",
  forgotPasswordTitle: "Reset password",
  helperBody: "Pakai email yang sama seperti saat daftar agar Anda bisa masuk tanpa repot.",
  helperTitle: "Siap lanjut",
  loginButton: "Masuk",
  loginPending: "Sedang masuk...",
  newPassword: "Password baru",
  newPasswordPlaceholder: "Minimal 8 karakter",
  noAccount: "Belum punya akun?",
  password: "Password",
  passwordConfirmation: "Ulangi password baru",
  passwordConfirmationPlaceholder: "Ketik ulang password baru",
  passwordPlaceholder: "Masukkan password Anda",
  resetPasswordButton: "Ubah password",
  resetPasswordPending: "Mengubah password...",
  signupLink: "Daftar di sini",
};

export function LoginForm({
  labels = defaultLabels,
  showSignupLink = true,
  signupHref = "/signup",
}: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialLoginState);
  const [forgotState, forgotFormAction] = useActionState(
    forgotPasswordAction,
    initialForgotPasswordState,
  );
  const [forgotOpen, setForgotOpen] = useState(false);
  const fieldErrors = state?.fieldErrors ?? {};
  const forgotFieldErrors = forgotState?.fieldErrors ?? {};

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-5">
        {state?.message ? (
          <Alert
            className="flex items-start gap-3"
            variant={state.status === "error" ? "error" : "success"}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{state.message}</p>
          </Alert>
        ) : null}

        <div className="space-y-4">
          <div className="space-y-2">
            <AuthFieldShell error={fieldErrors.email}>
              <Label className="mb-2 inline-flex items-center gap-2 text-slate-700" htmlFor="email">
                <Mail className="h-4 w-4 text-sky-500" />
                {labels.email}
              </Label>
              <Input
                autoComplete="email"
                className="border-0 bg-transparent px-0 text-base shadow-none focus:ring-0"
                defaultValue={state.formValues?.email ?? forgotState.formValues?.email ?? ""}
                id="email"
                name="email"
                placeholder={labels.emailPlaceholder}
                required
                type="email"
              />
            </AuthFieldShell>
            {fieldErrors.email ? <p className="text-sm text-rose-600">{fieldErrors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <AuthFieldShell error={fieldErrors.password}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <Label className="inline-flex items-center gap-2 text-slate-700" htmlFor="password">
                  <KeyRound className="h-4 w-4 text-sky-500" />
                  {labels.password}
                </Label>
                <button
                  className="text-xs font-semibold text-sky-700 underline decoration-sky-200 underline-offset-4 transition hover:text-sky-900"
                  onClick={() => setForgotOpen((current) => !current)}
                  type="button"
                >
                  {forgotOpen ? labels.forgotPasswordBack : labels.forgotPassword}
                </button>
              </div>
              <Input
                autoComplete="current-password"
                className="border-0 bg-transparent px-0 text-base shadow-none focus:ring-0"
                id="password"
                name="password"
                placeholder={labels.passwordPlaceholder}
                required
                type="password"
              />
            </AuthFieldShell>
            {fieldErrors.password ? (
              <p className="text-sm text-rose-600">{fieldErrors.password}</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm font-medium text-slate-700">{labels.helperTitle}</p>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            {labels.helperBody}
          </p>
        </div>

        <SubmitButton
          className="h-12 w-full rounded-lg bg-sky-500 text-base font-semibold text-white shadow-[0_16px_30px_rgba(14,165,233,0.22)] hover:bg-sky-600"
          pendingText={labels.loginPending}
        >
          {labels.loginButton}
        </SubmitButton>
      </form>

      {forgotOpen ? (
        <form
          action={forgotFormAction}
          className="space-y-4 rounded-lg border border-sky-100 bg-sky-50/80 p-4"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{labels.forgotPasswordTitle}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {labels.forgotPasswordDescription}
              </p>
            </div>
          </div>

          {forgotState?.message ? (
            <Alert
              className="flex items-start gap-3"
              variant={forgotState.status === "success" ? "success" : "error"}
            >
              {forgotState.status === "success" ? (
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <p>{forgotState.message}</p>
            </Alert>
          ) : null}

          <div className="space-y-4">
            <div className="space-y-2">
              <AuthFieldShell error={forgotFieldErrors.email}>
                <Label className="mb-2 inline-flex items-center gap-2 text-slate-700" htmlFor="forgotEmail">
                  <Mail className="h-4 w-4 text-sky-500" />
                  {labels.forgotEmail}
                </Label>
                <Input
                  autoComplete="email"
                  className="border-0 bg-transparent px-0 text-base shadow-none focus:ring-0"
                  defaultValue={forgotState.formValues?.email ?? state.formValues?.email ?? ""}
                  id="forgotEmail"
                  name="forgotEmail"
                  placeholder={labels.forgotEmailPlaceholder}
                  required
                  type="email"
                />
              </AuthFieldShell>
              {forgotFieldErrors.email ? (
                <p className="text-sm text-rose-600">{forgotFieldErrors.email}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <AuthFieldShell error={forgotFieldErrors.newPassword}>
                  <Label className="mb-2 inline-flex items-center gap-2 text-slate-700" htmlFor="newPassword">
                    <KeyRound className="h-4 w-4 text-sky-500" />
                    {labels.newPassword}
                  </Label>
                  <Input
                    autoComplete="new-password"
                    className="border-0 bg-transparent px-0 text-base shadow-none focus:ring-0"
                    id="newPassword"
                    minLength={8}
                    name="newPassword"
                    placeholder={labels.newPasswordPlaceholder}
                    required
                    type="password"
                  />
                </AuthFieldShell>
                {forgotFieldErrors.newPassword ? (
                  <p className="text-sm text-rose-600">{forgotFieldErrors.newPassword}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <AuthFieldShell error={forgotFieldErrors.passwordConfirmation}>
                  <Label
                    className="mb-2 inline-flex items-center gap-2 text-slate-700"
                    htmlFor="passwordConfirmation"
                  >
                    <ShieldCheck className="h-4 w-4 text-sky-500" />
                    {labels.passwordConfirmation}
                  </Label>
                  <Input
                    autoComplete="new-password"
                    className="border-0 bg-transparent px-0 text-base shadow-none focus:ring-0"
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    placeholder={labels.passwordConfirmationPlaceholder}
                    required
                    type="password"
                  />
                </AuthFieldShell>
                {forgotFieldErrors.passwordConfirmation ? (
                  <p className="text-sm text-rose-600">{forgotFieldErrors.passwordConfirmation}</p>
                ) : null}
              </div>
            </div>
          </div>

          <SubmitButton
            className="h-11 w-full rounded-lg bg-slate-950 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)] hover:bg-slate-800"
            pendingText={labels.resetPasswordPending}
          >
            {labels.resetPasswordButton}
          </SubmitButton>
        </form>
      ) : null}

      {showSignupLink ? (
        <p className="text-center text-sm text-slate-600">
          {labels.noAccount}{" "}
          <Link
            className="font-medium text-slate-950 underline decoration-slate-300 underline-offset-4"
            href={signupHref}
          >
            {labels.signupLink}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
