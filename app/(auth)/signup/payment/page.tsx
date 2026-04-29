import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AlertCircle, CreditCard } from "lucide-react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupPaymentView } from "@/components/auth/signup-payment-view";
import { Alert } from "@/components/ui/alert";
import { getCurrentProfile } from "@/lib/auth";
import { getPublicSignupPaymentSettings } from "@/lib/payment-gateway-settings";
import { parseSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";
import { getSignupPaymentPublicState } from "@/lib/signup-payment";
import { getSupportedSiteLanguages, translateRecordStrings } from "@/lib/translatex";

type SignupPaymentPageProps = {
  searchParams: Promise<{ referenceId?: string | string[] }>;
};

export default async function SignupPaymentPage({
  searchParams,
}: SignupPaymentPageProps) {
  const cookieStore = await cookies();
  const currentLanguage = parseSiteLanguage(cookieStore.get(SITE_LANGUAGE_COOKIE)?.value);
  const [profile, paymentSettings, languageOptions] = await Promise.all([
    getCurrentProfile(),
    getPublicSignupPaymentSettings(),
    getSupportedSiteLanguages(),
  ]);

  if (profile) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const referenceValue = resolvedSearchParams.referenceId;
  const referenceId = String(
    typeof referenceValue === "string" ? referenceValue : referenceValue?.[0] ?? "",
  ).trim();

  const [shellCopy, emptyCopy] = await Promise.all([
    translateRecordStrings({
      record: {
        backLabel: "Kembali ke halaman utama",
        badge: "Pembayaran signup",
        description:
          "Selesaikan pembayaran pendaftaran. Setelah status paid, akun akan aktif dan bisa dipakai untuk login.",
        sideBadge: "Pembayaran AIOTrade",
        sideTitle: "Satu langkah lagi untuk mengaktifkan akun Anda.",
        title: "Selesaikan pembayaran",
      },
      targetLanguage: currentLanguage,
    }),
    translateRecordStrings({
      record: {
        emptyAction: "Kembali ke signup",
        emptyMessage: "Reference pembayaran tidak ditemukan atau sudah tidak tersedia.",
      },
      targetLanguage: currentLanguage,
    }),
  ]);

  const payment = referenceId ? await getSignupPaymentPublicState(referenceId) : null;

  return (
    <AuthPageShell
      badge={
        <>
          <CreditCard className="h-4 w-4" />
          {shellCopy.badge}
        </>
      }
      backLabel={shellCopy.backLabel}
      currentLanguage={currentLanguage}
      description={shellCopy.description}
      languageOptions={languageOptions}
      sideBadge={shellCopy.sideBadge}
      sideTitle={shellCopy.sideTitle}
      title={shellCopy.title}
    >
      {payment ? (
        <SignupPaymentView
          initialPayment={payment}
          paymentSettings={paymentSettings}
        />
      ) : (
        <div className="space-y-5">
          <Alert className="flex items-start gap-3" variant="error">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{emptyCopy.emptyMessage}</p>
          </Alert>
          <Link
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(14,165,233,0.22)] transition-colors hover:bg-sky-600 sm:w-auto"
            href="/signup"
          >
            {emptyCopy.emptyAction}
          </Link>
        </div>
      )}
    </AuthPageShell>
  );
}
