"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, Link2, MessageCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  updateMemberProfileAction,
  type UpdateMemberProfileState,
} from "@/app/(protected)/dashboard/account/profile/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import {
  memberGlassRowClass,
  memberSolidButtonClass,
  memberTextMutedClass,
  memberTextPrimaryClass,
  memberTextSecondaryClass,
} from "@/components/dashboard/member-ui";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MemberAccountProfileFormProps = {
  currentLanguage: string;
  initialMemberId: string;
  initialWhatsapp: string;
  labels: {
    editDescription: string;
    editNote: string;
    editTitle: string;
    memberId: string;
    memberIdPlaceholder: string;
    saveChanges: string;
    savePending: string;
    whatsapp: string;
    whatsappPlaceholder: string;
  };
};

const initialUpdateMemberProfileState: UpdateMemberProfileState = {
  fieldErrors: {},
  formValues: {
    memberId: "",
    whatsapp: "",
  },
  message: null,
  status: "idle",
};

function ProfileField({
  children,
  error,
  htmlFor,
  icon: Icon,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  htmlFor: string;
  icon: typeof Link2;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label className={`inline-flex items-center gap-2 text-sm font-medium ${memberTextSecondaryClass}`} htmlFor={htmlFor}>
        <Icon className="h-4 w-4 text-emerald-600" />
        {label}
      </Label>
      {children}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

export function MemberAccountProfileForm({
  currentLanguage,
  initialMemberId,
  initialWhatsapp,
  labels,
}: MemberAccountProfileFormProps) {
  const [state, formAction] = useActionState<UpdateMemberProfileState, FormData>(
    updateMemberProfileAction,
    initialUpdateMemberProfileState,
  );
  const router = useRouter();
  const [memberId, setMemberId] = useState(initialMemberId);
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp);

  useEffect(() => {
    if (state.formValues.memberId || state.formValues.whatsapp) {
      setMemberId(state.formValues.memberId || initialMemberId);
      setWhatsapp(state.formValues.whatsapp || initialWhatsapp);
    }
  }, [initialMemberId, initialWhatsapp, state.formValues.memberId, state.formValues.whatsapp]);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className={`mt-6 space-y-5 p-5 sm:p-6 ${memberGlassRowClass}`}>
      <input name="language" type="hidden" value={currentLanguage} />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
            <Save className="h-4 w-4" />
          </span>
          <div>
            <h3 className={`text-lg font-semibold ${memberTextPrimaryClass}`}>{labels.editTitle}</h3>
            <p className={`text-sm leading-7 ${memberTextSecondaryClass}`}>{labels.editDescription}</p>
          </div>
        </div>
        <p className={`text-sm leading-7 ${memberTextMutedClass}`}>{labels.editNote}</p>
      </div>

      {state.message ? (
        <Alert className="flex items-start gap-3" variant={state.status === "success" ? "success" : "error"}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{state.message}</p>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <ProfileField
          error={state.fieldErrors.whatsapp}
          htmlFor="profileWhatsapp"
          icon={MessageCircle}
          label={labels.whatsapp}
        >
          <Input
            autoComplete="tel"
            className="member-row-surface text-[var(--member-text-primary)] placeholder:text-[var(--member-text-muted)]"
            id="profileWhatsapp"
            name="whatsapp"
            onChange={(event) => setWhatsapp(event.target.value)}
            placeholder={labels.whatsappPlaceholder}
            required
            type="tel"
            value={whatsapp}
          />
        </ProfileField>

        <ProfileField
          error={state.fieldErrors.memberId}
          htmlFor="profileMemberId"
          icon={Link2}
          label={labels.memberId}
        >
          <Input
            autoCapitalize="characters"
            className="member-row-surface font-mono text-[var(--member-text-primary)] placeholder:text-[var(--member-text-muted)]"
            id="profileMemberId"
            maxLength={8}
            name="memberId"
            onChange={(event) => setMemberId(event.target.value.replace(/\s+/g, "").toUpperCase())}
            placeholder={labels.memberIdPlaceholder}
            required
            spellCheck={false}
            type="text"
            value={memberId}
          />
        </ProfileField>
      </div>

      <SubmitButton className={`w-full sm:w-auto ${memberSolidButtonClass}`} pendingText={labels.savePending}>
        {labels.saveChanges}
      </SubmitButton>
    </form>
  );
}
