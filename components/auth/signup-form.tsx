"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, UserRound } from "lucide-react";
import { signUpAction, type SignupActionState } from "@/app/(auth)/signup/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignupFormProps = {
  referredBy: string | null;
};

const initialSignupState: SignupActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export function SignupForm({ referredBy }: SignupFormProps) {
  const [state, formAction] = useActionState(signUpAction, initialSignupState);
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <input name="referredBy" type="hidden" value={referredBy ?? ""} />

      {referredBy ? (
        <Alert className="flex items-start gap-3">
          <UserRound className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium text-stone-900">Referral locked in</p>
            <p className="text-sm text-stone-600">This account will be linked to @{referredBy}.</p>
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

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input autoComplete="email" id="email" name="email" placeholder="you@example.com" required type="email" />
        {fieldErrors.email ? <p className="text-sm text-rose-600">{fieldErrors.email}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          autoComplete="new-password"
          id="password"
          minLength={8}
          name="password"
          placeholder="At least 8 characters"
          required
          type="password"
        />
        {fieldErrors.password ? <p className="text-sm text-rose-600">{fieldErrors.password}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          autoCapitalize="none"
          autoComplete="username"
          id="username"
          name="username"
          placeholder="yourname"
          required
          type="text"
        />
        <p className="text-xs text-stone-500">Use 3-24 lowercase letters, numbers, or underscores.</p>
        {fieldErrors.username ? <p className="text-sm text-rose-600">{fieldErrors.username}</p> : null}
      </div>

      <SubmitButton className="w-full" pendingText="Creating account...">
        Create account
      </SubmitButton>

      <p className="text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link className="font-medium text-stone-950 underline decoration-stone-300 underline-offset-4" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
