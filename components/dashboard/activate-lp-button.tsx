"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  activateLandingPageAction,
  type ActivateLandingPageState,
} from "@/app/(protected)/dashboard/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert } from "@/components/ui/alert";

const initialActivateLandingPageState: ActivateLandingPageState = {
  status: "idle",
  message: null,
};

export function ActivateLandingPageButton() {
  const [state, formAction] = useActionState(
    activateLandingPageAction,
    initialActivateLandingPageState,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="space-y-3">
      <SubmitButton pendingText="Activating...">Activate My Landing Page</SubmitButton>
      {state.message ? (
        <Alert variant={state.status === "error" ? "error" : "success"}>{state.message}</Alert>
      ) : null}
    </form>
  );
}
