import Link from "next/link";
import { ArrowUpRight, ExternalLink, Link2, WalletCards } from "lucide-react";
import type { requireCurrentProfile } from "@/lib/auth";
import { ActivateLandingPageButton } from "@/components/dashboard/activate-lp-button";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import {
  memberGlassPanelClass,
  memberGlassRowClass,
  memberIconSurfaceClass,
  MemberPageHeader,
  memberSoftButtonClass,
  memberTextMutedClass,
  memberTextPrimaryClass,
  memberTextSecondaryClass,
} from "@/components/dashboard/member-ui";

type CurrentProfile = Awaited<ReturnType<typeof requireCurrentProfile>>;

type MemberLandingPagePanelProps = {
  labels?: {
    activateButton: string;
    activatePending: string;
    activeStatus: string;
    badge: string;
    copiedLink: string;
    copyLink: string;
    description: string;
    generateDescription: string;
    inactiveHint: string;
    inactiveStatus: string;
    landingLinkDescription: string;
    landingLinkLabel: string;
    openEntryLink: string;
    pageTitle: string;
    sectionTitle: string;
    statusLabel: string;
  };
  landingPageUrl: string;
  profile: CurrentProfile;
};

const defaultLabels = {
  activateButton: "Activate My Landing Page",
  activatePending: "Activating...",
  activeStatus: "Active and Shareable",
  badge: "Landing Page",
  copiedLink: "Copied",
  copyLink: "Copy Link",
  description:
    "Generate halaman referral pribadi Anda, cek statusnya, lalu bagikan link yang sudah siap dipakai untuk entry member baru.",
  generateDescription:
    "Visitor akan masuk ke homepage utama dengan referral Anda tetap menempel. Praktis dan lebih rapi untuk dibagikan.",
  inactiveHint:
    "Landing page Anda belum aktif. Setelah diaktifkan, sistem akan membuat link shareable berbasis username member.",
  inactiveStatus: "Belum diaktifkan",
  landingLinkDescription:
    "Tombol daftar di landing page Anda akan mengikuti referral link yang tersimpan pada profil member.",
  landingLinkLabel: "Link landing page Anda",
  openEntryLink: "Open Entry Link",
  pageTitle: "Landing page referral",
  sectionTitle: "Generate landing page",
  statusLabel: "Status",
};

export function MemberLandingPagePanel({
  labels = defaultLabels,
  landingPageUrl,
  profile,
}: MemberLandingPagePanelProps) {
  return (
    <div className="space-y-6 px-4 py-6 sm:px-5 lg:px-6 lg:py-8">
      <MemberPageHeader
        badge={labels.badge}
        description={labels.description}
        icon={WalletCards}
        title={labels.pageTitle}
        toneClassName="bg-[linear-gradient(135deg,rgba(16,185,129,0.12)_0%,rgba(255,255,255,0)_44%,rgba(59,130,246,0.09)_100%)]"
      />

      <section className={`px-6 py-6 sm:px-7 sm:py-7 ${memberGlassPanelClass}`}>
        <div className="flex items-start gap-3">
          <span className={memberIconSurfaceClass}>
            <WalletCards className="h-5 w-5" />
          </span>
          <div>
            <h2 className={`text-[1.6rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>{labels.sectionTitle}</h2>
            <p className={`mt-1 text-sm leading-7 ${memberTextSecondaryClass}`}>
              {labels.generateDescription}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className={memberGlassRowClass}>
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-800">
                <Link2 className="h-5 w-5" />
              </span>
              <div>
                <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextMutedClass}`}>{labels.statusLabel}</p>
                <p className={`mt-2 text-[1.35rem] font-semibold ${memberTextPrimaryClass}`}>
                  {profile.isLpActive ? labels.activeStatus : labels.inactiveStatus}
                </p>
              </div>
            </div>
          </div>

          {profile.isLpActive ? (
            <>
              <div className="rounded-[24px] border border-[var(--member-row-border)] bg-[linear-gradient(135deg,rgba(16,185,129,0.14)_0%,rgba(255,255,255,0.16)_54%,rgba(14,165,233,0.12)_100%)] px-5 py-5 shadow-[var(--member-row-shadow)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-emerald-900/72">
                      {labels.landingLinkLabel}
                    </p>
                    <p className={`mt-2 break-all text-lg font-semibold ${memberTextPrimaryClass}`}>{landingPageUrl}</p>
                  </div>
                  <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-emerald-900/70" />
                </div>
                <p className={`mt-4 text-sm leading-7 ${memberTextSecondaryClass}`}>
                  {labels.landingLinkDescription}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <CopyLinkButton copiedLabel={labels.copiedLink} copyLabel={labels.copyLink} link={landingPageUrl} />
                <Link
                  className={memberSoftButtonClass}
                  href={`/${profile.username}`}
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4" />
                  {labels.openEntryLink}
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className={`rounded-[24px] px-5 py-5 text-sm leading-7 ${memberGlassRowClass} ${memberTextSecondaryClass}`}>
                {labels.inactiveHint}
              </div>
              <ActivateLandingPageButton
                buttonLabel={labels.activateButton}
                pendingLabel={labels.activatePending}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
