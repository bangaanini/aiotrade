"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { loginAction, type LoginActionState } from "@/app/(auth)/login/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialLoginState: LoginActionState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialLoginState);
  const fieldErrors = state?.fieldErrors ?? {};

  return (
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

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input autoComplete="email" id="email" name="email" placeholder="you@example.com" required type="email" />
        {fieldErrors.email ? <p className="text-sm text-rose-600">{fieldErrors.email}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input autoComplete="current-password" id="password" name="password" required type="password" />
        {fieldErrors.password ? (
          <p className="text-sm text-rose-600">{fieldErrors.password}</p>
        ) : null}
      </div>

      <SubmitButton className="w-full" pendingText="Signing in...">
        Sign in
      </SubmitButton>

      <p className="text-center text-sm text-stone-600">
        Need an account?{" "}
        <Link className="font-medium text-stone-950 underline decoration-stone-300 underline-offset-4" href="/signup">
          Create one
        </Link>
      </p>
    </form>
  );
}
