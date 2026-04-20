import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentProfile } from "@/lib/auth";

type SignupPageProps = {
  searchParams: Promise<{ ref?: string | string[] }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const refValue = resolvedSearchParams.ref;
  const referredBy =
    typeof refValue === "string" ? refValue.toLowerCase() : refValue?.[0]?.toLowerCase() ?? null;

  return (
    <AuthPageShell
      badge={
        <>
          <ShieldCheck className="h-4 w-4" />
          Daftar dengan aman
        </>
      }
      description="Isi data singkat di bawah untuk mulai bergabung dan lanjut ke langkah berikutnya dengan lebih nyaman."
      sideBadge="Mulai bersama AIOTrade"
      sideTitle="Buat akun baru dengan langkah yang terasa ringan."
      title="Buat akun Anda"
    >
      <SignupForm referredBy={referredBy} />
    </AuthPageShell>
  );
}
