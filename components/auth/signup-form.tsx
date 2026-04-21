"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AtSign,
  CheckCircle2,
  Circle,
  KeyRound,
  LoaderCircle,
  Link2,
  Mail,
  MessageCircleMore,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { signUpAction, type SignupActionState } from "@/app/(auth)/signup/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { AuthFieldShell } from "@/components/auth/auth-field-shell";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getUsernameValidationMessage } from "@/lib/username-rules";

type SignupFormProps = {
  referredBy: string | null;
};

type UsernameAvailability =
  | {
      status: "idle";
      value: string;
      message: string | null;
    }
  | {
      status: "checking" | "available" | "taken" | "error";
      value: string;
      message: string;
    };

const initialSignupState: SignupActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

function ChecklistItem({
  done,
  label,
}: {
  done: boolean;
  label: string;
}) {
  const Icon = done ? CheckCircle2 : Circle;

  return (
    <div className={cn("flex items-center gap-2 text-sm", done ? "text-emerald-700" : "text-slate-500")}>
      <Icon className={cn("h-4 w-4 shrink-0", done ? "fill-emerald-100" : "")} />
      <span>{label}</span>
    </div>
  );
}

export function SignupForm({ referredBy }: SignupFormProps) {
  const [state, formAction] = useActionState(signUpAction, initialSignupState);
  const fieldErrors = state?.fieldErrors ?? {};
  const [username, setUsername] = useState(state.formValues?.username ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [usernameAvailability, setUsernameAvailability] = useState<UsernameAvailability>({
    status: "idle",
    value: "",
    message: null,
  });

  const normalizedUsername = username.trim().toLowerCase();

  const usernameLocalIssue = useMemo(() => {
    if (!normalizedUsername) {
      return null;
    }

    return getUsernameValidationMessage(normalizedUsername);
  }, [normalizedUsername]);

  useEffect(() => {
    if (!normalizedUsername || usernameLocalIssue) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setUsernameAvailability({
        status: "checking",
        value: normalizedUsername,
        message: "Sedang memeriksa username...",
      });

      try {
        const response = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(normalizedUsername)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const payload = (await response.json()) as {
          available?: boolean;
          message?: string;
        };

        if (!response.ok) {
          setUsernameAvailability({
            status: "error",
            value: normalizedUsername,
            message: payload.message ?? "Belum bisa memeriksa username sekarang.",
          });

          return;
        }

        setUsernameAvailability({
          status: payload.available ? "available" : "taken",
          value: normalizedUsername,
          message:
            payload.message ??
            (payload.available ? "Username ini masih tersedia." : "Username ini sudah dipakai."),
        });
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setUsernameAvailability({
          status: "error",
          value: normalizedUsername,
          message: "Belum bisa memeriksa username sekarang.",
        });
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [normalizedUsername, usernameLocalIssue]);

  const usernameStatus = useMemo(() => {
    if (!normalizedUsername) {
      return {
        tone: "neutral" as const,
        message: "Pakai 3-24 huruf kecil, angka, atau underscore.",
      };
    }

    if (usernameLocalIssue) {
      return {
        tone: "invalid" as const,
        message: usernameLocalIssue,
      };
    }

    if (usernameAvailability.value !== normalizedUsername) {
      return {
        tone: "checking" as const,
        message: "Sedang memeriksa username...",
      };
    }

    if (usernameAvailability.status === "available") {
      return {
        tone: "available" as const,
        message: usernameAvailability.message,
      };
    }

    if (usernameAvailability.status === "taken") {
      return {
        tone: "taken" as const,
        message: usernameAvailability.message,
      };
    }

    if (usernameAvailability.status === "error") {
      return {
        tone: "error" as const,
        message: usernameAvailability.message,
      };
    }

    return {
      tone: "checking" as const,
      message: "Sedang memeriksa username...",
    };
  }, [normalizedUsername, usernameAvailability, usernameLocalIssue]);

  const passwordMetrics = useMemo(() => {
    const length = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const variety = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
    const matches = length > 0 && password === passwordConfirmation;

    let score = 0;
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (variety >= 2) score += 1;
    if (variety >= 3) score += 1;
    if (variety >= 4) score += 1;

    const levels = [
      { label: "Belum aman", tone: "bg-slate-300 text-slate-500", accent: "bg-slate-300" },
      { label: "Lemah", tone: "bg-rose-100 text-rose-700", accent: "bg-rose-500" },
      { label: "Cukup", tone: "bg-amber-100 text-amber-700", accent: "bg-amber-500" },
      { label: "Lumayan kuat", tone: "bg-sky-100 text-sky-700", accent: "bg-sky-500" },
      { label: "Kuat", tone: "bg-emerald-100 text-emerald-700", accent: "bg-emerald-500" },
      { label: "Sangat kuat", tone: "bg-emerald-100 text-emerald-700", accent: "bg-emerald-600" },
    ] as const;

    const level = levels[score];

    return {
      length,
      level,
      matches,
      score,
      checks: [
        { label: "Minimal 8 karakter", done: length >= 8 },
        { label: "Ada huruf kecil dan besar", done: hasLower && hasUpper },
        { label: "Ada angka", done: hasNumber },
        { label: "Ada simbol", done: hasSymbol },
        { label: "Password sama", done: matches },
      ],
    };
  }, [password, passwordConfirmation]);

  const isUsernameBlocked =
    usernameStatus.tone === "invalid" ||
    usernameStatus.tone === "taken" ||
    usernameStatus.tone === "checking";

  return (
    <form action={formAction} className="space-y-5">
      <input name="referredBy" type="hidden" value={referredBy ?? ""} />

      {referredBy ? (
        <Alert className="flex items-start gap-3 border-sky-200 bg-sky-50/90 text-sky-800">
          <UserRound className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium text-sky-950">Undangan sudah tersimpan</p>
            <p className="text-sm text-sky-700">Akun ini akan terhubung ke @{referredBy}.</p>
          </div>
        </Alert>
      ) : null}

      {state?.message ? (
        <Alert
          className="flex items-start gap-3"
          variant={state.status === "error" ? "error" : "success"}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{state.message}</p>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <AuthFieldShell error={fieldErrors.username}>
            <Label className="mb-2 inline-flex items-center gap-2 text-slate-700" htmlFor="username">
              <AtSign className="h-4 w-4 text-sky-500" />
              Username
            </Label>
            <Input
              autoCapitalize="none"
              autoComplete="username"
              className="border-0 bg-transparent px-0 text-base shadow-none focus:ring-0"
              id="username"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="yourname"
              required
              spellCheck={false}
              type="text"
              value={username}
            />
            <div
              className={cn(
                "mt-2 inline-flex items-center gap-2 text-xs",
                usernameStatus.tone === "available" && "text-emerald-700",
                usernameStatus.tone === "checking" && "text-sky-700",
                (usernameStatus.tone === "taken" ||
                  usernameStatus.tone === "invalid" ||
                  usernameStatus.tone === "error") &&
                  "text-rose-600",
                usernameStatus.tone === "neutral" && "text-slate-500",
              )}
            >
              {usernameStatus.tone === "available" ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              ) : null}
              {usernameStatus.tone === "checking" ? (
                <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin" />
              ) : null}
              {(usernameStatus.tone === "taken" ||
                usernameStatus.tone === "invalid" ||
                usernameStatus.tone === "error") ? (
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              ) : null}
              {usernameStatus.tone === "neutral" ? (
                <Circle className="h-3.5 w-3.5 shrink-0" />
              ) : null}
              <span>{usernameStatus.message}</span>
            </div>
          </AuthFieldShell>
          {fieldErrors.username && usernameStatus.tone !== "taken" ? (
            <p className="text-sm text-rose-600">{fieldErrors.username}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <AuthFieldShell error={fieldErrors.email}>
            <Label className="mb-2 inline-flex items-center gap-2 text-slate-700" htmlFor="email">
              <Mail className="h-4 w-4 text-sky-500" />
              Email
            </Label>
            <Input
              autoComplete="email"
              className="border-0 bg-transparent px-0 text-base shadow-none focus:ring-0"
              defaultValue={state.formValues?.email ?? ""}
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </AuthFieldShell>
          {fieldErrors.email ? <p className="text-sm text-rose-600">{fieldErrors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <AuthFieldShell error={fieldErrors.whatsapp}>
            <Label className="mb-2 inline-flex items-center gap-2 text-slate-700" htmlFor="whatsapp">
              <MessageCircleMore className="h-4 w-4 text-sky-500" />
              Nomor WhatsApp
            </Label>
            <Input
              autoComplete="tel"
              className="border-0 bg-transparent px-0 text-base shadow-none focus:ring-0"
              defaultValue={state.formValues?.whatsapp ?? ""}
              id="whatsapp"
              name="whatsapp"
              placeholder="+6281234567890"
              required
              type="tel"
            />
          </AuthFieldShell>
          {fieldErrors.whatsapp ? <p className="text-sm text-rose-600">{fieldErrors.whatsapp}</p> : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <AuthFieldShell error={fieldErrors.referralLink}>
            <Label className="mb-2 inline-flex items-center gap-2 text-slate-700" htmlFor="referralLink">
              <Link2 className="h-4 w-4 text-sky-500" />
              Link Referral
            </Label>
            <Input
              autoCapitalize="none"
              autoComplete="url"
              className="border-0 bg-transparent px-0 text-base shadow-none focus:ring-0"
              defaultValue={state.formValues?.referralLink ?? ""}
              id="referralLink"
              name="referralLink"
              placeholder="https://partner.com/ref/username"
              required
              spellCheck={false}
              type="url"
            />
            <p className="mt-2 text-xs text-slate-500">
              Link ini akan dipakai untuk tombol Daftar Sekarang di landing page Anda.
            </p>
          </AuthFieldShell>
          {fieldErrors.referralLink ? (
            <p className="text-sm text-rose-600">{fieldErrors.referralLink}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <AuthFieldShell error={fieldErrors.password}>
            <Label className="mb-2 inline-flex items-center gap-2 text-slate-700" htmlFor="password">
              <KeyRound className="h-4 w-4 text-sky-500" />
              Password
            </Label>
            <Input
              autoComplete="new-password"
              className="border-0 bg-transparent px-0 text-base shadow-none focus:ring-0"
              id="password"
              minLength={8}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
              required
              type="password"
              value={password}
            />
          </AuthFieldShell>
          {fieldErrors.password ? <p className="text-sm text-rose-600">{fieldErrors.password}</p> : null}
        </div>

        <div className="space-y-2">
          <AuthFieldShell error={fieldErrors.passwordConfirmation}>
            <Label
              className="mb-2 inline-flex items-center gap-2 text-slate-700"
              htmlFor="passwordConfirmation"
            >
              <ShieldCheck className="h-4 w-4 text-sky-500" />
              Ulangi Password
            </Label>
            <Input
              autoComplete="new-password"
              className="border-0 bg-transparent px-0 text-base shadow-none focus:ring-0"
              id="passwordConfirmation"
              name="passwordConfirmation"
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              placeholder="Ketik ulang password"
              required
              type="password"
              value={passwordConfirmation}
            />
          </AuthFieldShell>
          {fieldErrors.passwordConfirmation ? (
            <p className="text-sm text-rose-600">{fieldErrors.passwordConfirmation}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-700">Cek password Anda</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">{passwordMetrics.length} karakter</span>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", passwordMetrics.level.tone)}>
              {passwordMetrics.level.label}
            </span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index < passwordMetrics.score ? passwordMetrics.level.accent : "bg-slate-200",
              )}
              key={index}
            />
          ))}
        </div>
        <div className="mt-3 text-sm text-slate-500">
          {passwordMetrics.length === 0
            ? "Mulai ketik password untuk melihat kekuatannya."
            : passwordMetrics.matches
              ? "Password sudah cocok dan siap dipakai."
              : "Tambahkan kombinasi yang lebih beragam agar password lebih kuat."}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {passwordMetrics.checks.map((item) => (
            <ChecklistItem done={item.done} key={item.label} label={item.label} />
          ))}
        </div>
      </div>

      <SubmitButton
        className="h-12 w-full rounded-lg bg-sky-500 text-base font-semibold text-white shadow-[0_16px_30px_rgba(14,165,233,0.22)] hover:bg-sky-600"
        disabled={isUsernameBlocked}
        pendingText="Sedang membuat akun..."
      >
        Buat akun
      </SubmitButton>

      <p className="text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link
          className="font-medium text-slate-950 underline decoration-slate-300 underline-offset-4"
          href="/login"
        >
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
