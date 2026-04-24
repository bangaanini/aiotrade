"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  activateLandingPageAction,
  type ActivateLandingPageState,
} from "@/app/(protected)/dashboard/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { memberSolidButtonClass } from "@/components/dashboard/member-ui";
import { Alert } from "@/components/ui/alert";

const initialActivateLandingPageState: ActivateLandingPageState = {
  status: "idle",
  message: null,
};

type ActivateLandingPageButtonProps = {
  buttonLabel?: string;
  pendingLabel?: string;
};

export function ActivateLandingPageButton({
  buttonLabel = "Activate My Landing Page",
  pendingLabel = "Activating...",
}: ActivateLandingPageButtonProps) {
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
      <SubmitButton
        className={`min-w-[250px] ${memberSolidButtonClass}`}
        pendingText={pendingLabel}
      >
        {buttonLabel}
      </SubmitButton>
      {state.message ? (
        <Alert variant={state.status === "error" ? "error" : "success"}>{state.message}</Alert>
      ) : null}
    </form>
  );
}
