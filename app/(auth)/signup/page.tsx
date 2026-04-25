import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentProfile } from "@/lib/auth";
import { getPublicSignupPaymentSettings } from "@/lib/payment-gateway-settings";
import {
  getActiveReferralOwner,
  LANDING_REFERRAL_COOKIE_NAME,
  parseReferralUsername,
} from "@/lib/referral";
import { parseSiteLanguage, SITE_LANGUAGE_COOKIE } from "@/lib/site-language";
import { getSupportedSiteLanguages, translateRecordStrings } from "@/lib/translatex";

type SignupPageProps = {
  searchParams: Promise<{ ref?: string | string[] }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
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
  const refValue = resolvedSearchParams.ref;
  const queryReferral = parseReferralUsername(
    typeof refValue === "string" ? refValue : refValue?.[0] ?? null,
  );
  const cookieReferral = parseReferralUsername(
    cookieStore.get(LANDING_REFERRAL_COOKIE_NAME)?.value ?? null,
  );
  const requestedReferral = queryReferral ?? cookieReferral ?? null;
  const referralOwner = await getActiveReferralOwner(requestedReferral);

  if (!referralOwner) {
    redirect("/login");
  }

  const referredBy = referralOwner.username;
  const [shellCopy, formCopy] = await Promise.all([
    translateRecordStrings({
      record: {
        backLabel: "Kembali ke halaman utama",
        badge: "Daftar dengan aman",
        description:
          "Isi data singkat di bawah untuk mulai bergabung dan lanjut ke langkah berikutnya dengan lebih nyaman.",
        sideBadge: "Mulai bersama AIOTrade",
        sideTitle: "Buat akun baru dengan langkah yang terasa ringan.",
        title: "Buat akun Anda",
      },
      targetLanguage: currentLanguage,
    }),
    translateRecordStrings({
      record: {
        accountReady: "Sudah punya akun?",
        backToLogin: "Masuk di sini",
        createAccount: "Buat akun",
        createPayment: "Buat pembayaran",
        createPaymentAgain: "Buat ulang pembayaran",
        createPaymentPending: "Sedang membuat akun...",
        email: "Email",
        emailPlaceholder: "you@example.com",
        invitedSaved: "Undangan sudah tersimpan",
        memberId: "Member ID",
        memberIdPlaceholder: "Masukkan member ID",
        password: "Password",
        passwordCheckDescriptionEmpty: "Mulai ketik password untuk melihat kekuatannya.",
        passwordCheckDescriptionMatch: "Password sudah cocok dan siap dipakai.",
        passwordCheckDescriptionStrong: "Tambahkan kombinasi yang lebih beragam agar password lebih kuat.",
        passwordCheckTitle: "Cek password Anda",
        passwordConfirmation: "Ulangi Password",
        passwordConfirmationPlaceholder: "Ketik ulang password",
        passwordLengthLabel: "karakter",
        passwordPlaceholder: "Minimal 8 karakter",
        payment: "Payment",
        paymentMethod: "Metode pembayaran",
        paymentStepDescription: "Lengkapi form dan buat pembayaran.",
        paymentStepTitle: "Langkah pembayaran",
        signupLocked: "Selesaikan pembayaran dulu",
        subscriptionDuration: "Pilih durasi langganan",
        username: "Username",
        usernamePlaceholder: "yourname",
        usernameStatusAvailable: "Username ini masih tersedia.",
        usernameStatusChecking: "Sedang memeriksa username...",
        usernameStatusError: "Belum bisa memeriksa username sekarang.",
        usernameStatusGuidance: "Pakai 3-24 huruf kecil, angka, atau underscore.",
        usernameStatusTaken: "Username ini sudah dipakai.",
        whatsapp: "Nomor WhatsApp",
        whatsappPlaceholder: "+6281234567890",
      },
      targetLanguage: currentLanguage,
    }),
  ]);

  return (
    <AuthPageShell
      badge={
        <>
          <ShieldCheck className="h-4 w-4" />
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
      <SignupForm
        labels={formCopy}
        paymentSettings={paymentSettings}
        referredBy={referredBy}
      />
    </AuthPageShell>
  );
}
