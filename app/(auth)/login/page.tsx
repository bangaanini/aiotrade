import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentProfile } from "@/lib/auth";

export default async function LoginPage() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-stone-50 px-6 py-16">
      <div className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <Link
          className="mb-6 inline-flex items-center gap-2 text-sm text-stone-600 transition hover:text-stone-950"
          href="/"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to landing page
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Sign in</h1>
          <p className="text-sm leading-6 text-stone-600">
            Access your member dashboard and manage your landing page.
          </p>
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
