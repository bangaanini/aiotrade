import { CalendarRange, CheckCircle2, CreditCard, Infinity, Sparkles } from "lucide-react";
import {
  memberGlassPanelClass,
  memberGlassRowClass,
  memberIconSurfaceClass,
  MemberPageHeader,
  memberTextPrimaryClass,
  memberTextSecondaryClass,
} from "@/components/dashboard/member-ui";
import { requireCurrentProfile } from "@/lib/auth";
import { getMemberSubscription } from "@/lib/member-subscription";

import { getPublicSignupPaymentSettings } from "@/lib/payment-gateway-settings";

function formatMembershipDate(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(value);
}

function formatPlanDuration(durationMonths: number, isLifetime: boolean) {
  if (isLifetime) {
    return "Lifetime";
  }

  return `${durationMonths} bulan`;
}

export default async function DashboardSubscriptionPage() {
  const profile = await requireCurrentProfile();
  const [paymentSettings, membership] = await Promise.all([
    getPublicSignupPaymentSettings(),
    getMemberSubscription(profile.id),
  ]);

  const activePlan =
    membership
      ? paymentSettings.plans.find((plan) => plan.id === membership.planId) ??
        ({
          description: "Paket aktif yang tercatat pada akun Anda.",
          durationMonths: membership.durationMonths,
          id: membership.planId,
          isLifetime: membership.isLifetime,
          label: membership.planLabel,
          price: 0,
        } as const)
      : null;

  return (
    <div className="space-y-6 px-4 py-6 sm:px-5 lg:px-6 lg:py-8">
      <MemberPageHeader
        badge="Subscrption"
        description="Lihat status subscription anda."
        icon={CreditCard}
        title="Member Subscription"
        toneClassName="bg-[linear-gradient(135deg,rgba(245,158,11,0.12)_0%,rgba(255,255,255,0)_44%,rgba(168,85,247,0.09)_100%)]"
      />

      <section className={`px-6 py-6 sm:px-7 sm:py-7 ${memberGlassPanelClass}`}>
        <div className="flex items-start gap-3">
          <span className={memberIconSurfaceClass}>
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className={`text-[1.55rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>Paket akun Anda</h2>
            
          </div>
        </div>

        {membership && activePlan ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
            <article className={`${memberGlassRowClass} rounded-[24px] px-5 py-5 sm:px-6`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className={`text-lg font-semibold ${memberTextPrimaryClass}`}>{membership.planLabel}</p>
                  <p className={`mt-2 text-sm leading-7 ${memberTextSecondaryClass}`}>{activePlan.description}</p>
                </div>
                <span className="rounded-full bg-[rgba(227,244,253,0.96)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">
                  Aktif
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/55 p-4">
                  <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextSecondaryClass}`}>Durasi</p>
                  <div className={`mt-3 inline-flex items-center gap-2 text-lg font-semibold ${memberTextPrimaryClass}`}>
                    {membership.isLifetime ? <Infinity className="h-4 w-4" /> : <CalendarRange className="h-4 w-4" />}
                    {formatPlanDuration(membership.durationMonths, membership.isLifetime)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/55 p-4">
                  <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextSecondaryClass}`}>Mulai aktif</p>
                  <p className={`mt-3 text-lg font-semibold ${memberTextPrimaryClass}`}>{formatMembershipDate(membership.startedAt)}</p>
                </div>
                <div className="rounded-2xl bg-white/55 p-4">
                  <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextSecondaryClass}`}>
                    {membership.isLifetime ? "Status akses" : "Berlaku sampai"}
                  </p>
                  <p className={`mt-3 text-lg font-semibold ${memberTextPrimaryClass}`}>
                    {membership.isLifetime ? "Seumur hidup" : formatMembershipDate(membership.expiresAt)}
                  </p>
                </div>
              </div>
            </article>

            <article className={`${memberGlassRowClass} rounded-[24px] px-5 py-5 sm:px-6`}>
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <p className={`text-lg font-semibold ${memberTextPrimaryClass}`}>Status langganan</p>
                  <p className={`mt-2 text-sm leading-7 ${memberTextSecondaryClass}`}>
                    {membership.isLifetime
                      ? "Akun Anda memakai paket lifetime, jadi akses member tidak memiliki batas akhir."
                      : "Akun Anda memakai paket dengan masa aktif terbatas. Pastikan tanggal berlaku tetap sesuai kebutuhan akses Anda."}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl bg-white/55 p-4">
                  <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextSecondaryClass}`}>ID paket</p>
                  <p className={`mt-3 font-mono text-lg font-semibold ${memberTextPrimaryClass}`}>{membership.planId}</p>
                </div>
                <div className="rounded-2xl bg-white/55 p-4">
                  <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextSecondaryClass}`}>Referensi payment</p>
                  <p className={`mt-3 break-all font-mono text-sm font-semibold ${memberTextPrimaryClass}`}>
                    {membership.paymentReferenceId ?? "-"}
                  </p>
                </div>
              </div>
            </article>
          </div>
        ) : (
          <div className={`mt-6 ${memberGlassRowClass}`}>
            <p className={`text-lg font-semibold ${memberTextPrimaryClass}`}>Belum ada langganan tercatat</p>
            <p className={`mt-2 text-sm leading-7 ${memberTextSecondaryClass}`}>
              Saat ini akun Anda belum memiliki data langganan yang tersimpan. Membership baru akan tercatat otomatis setelah signup berhasil dengan paket yang dipilih.
            </p>
          </div>
        )}

        
      </section>
    </div>
  );
}
