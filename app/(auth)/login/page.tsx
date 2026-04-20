import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentProfile } from "@/lib/auth";

export default async function LoginPage() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <AuthPageShell
      badge={
        <>
          <ShieldCheck className="h-4 w-4" />
          Masuk dengan aman
        </>
      }
      description="Masuk ke akun Anda untuk melanjutkan aktivitas dan membuka halaman pribadi Anda seperti biasa."
      sideBadge="Selamat datang kembali"
      sideTitle="Masuk lagi dan lanjutkan langkah Anda."
      title="Masuk ke akun Anda"
    >
      <LoginForm />
    </AuthPageShell>
  );
}
