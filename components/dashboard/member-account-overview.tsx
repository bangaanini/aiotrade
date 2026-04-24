import { Link2, Mail, MessageCircle, UserRound, Users } from "lucide-react";
import { requireCurrentProfile } from "@/lib/auth";
import { extractMemberIdFromReferralLink } from "@/lib/member-id";
import { SPECIAL_REFERRAL_USERNAMES } from "@/lib/username-rules";
import {
  memberGlassPanelClass,
  memberGlassRowClass,
  memberIconSurfaceClass,
  MemberPageHeader,
  memberTextMutedClass,
  memberTextPrimaryClass,
  memberTextSecondaryClass,
} from "@/components/dashboard/member-ui";

type CurrentProfile = Awaited<ReturnType<typeof requireCurrentProfile>>;

export function MemberAccountOverview({ profile }: { profile: CurrentProfile }) {
  const memberId = extractMemberIdFromReferralLink(profile.referralLink);
  const normalizedReferredBy = profile.referredBy?.trim().toLowerCase() ?? null;
  const referredByLabel =
    normalizedReferredBy && !SPECIAL_REFERRAL_USERNAMES.has(normalizedReferredBy)
      ? `@${profile.referredBy}`
      : normalizedReferredBy
        ? "-"
        : "Direct signup";

  return (
    <div className="space-y-6 px-4 py-6 sm:px-5 lg:px-6 lg:py-8">
      <MemberPageHeader
        badge="Akun Member"
        description="Informasi utama akun Anda."
        icon={UserRound}
        title="Profil akun"
        toneClassName="bg-[linear-gradient(135deg,rgba(59,130,246,0.12)_0%,rgba(255,255,255,0)_44%,rgba(16,185,129,0.1)_100%)]"
      />

      <section className={`px-6 py-6 sm:px-7 sm:py-7 ${memberGlassPanelClass}`}>
        <div className="flex items-start gap-3">
          <span className={memberIconSurfaceClass}>
            <UserRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className={`text-[1.55rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>Info akun</h2>
            <p className={`mt-1 text-sm leading-7 ${memberTextSecondaryClass}`}>
              Detail profil, kontak, dan informasi referral yang tersimpan pada akun member Anda.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className={memberGlassRowClass}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-800">
                <UserRound className="h-4 w-4" />
              </span>
              <div>
                <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextMutedClass}`}>Username</p>
                <p className={`mt-2 text-lg font-semibold ${memberTextPrimaryClass}`}>@{profile.username}</p>
              </div>
            </div>
          </div>

          <div className={memberGlassRowClass}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-800">
                <Mail className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextMutedClass}`}>Email</p>
                <p className={`mt-2 break-all text-lg font-semibold ${memberTextPrimaryClass}`}>{profile.email ?? "-"}</p>
              </div>
            </div>
          </div>

          <div className={memberGlassRowClass}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-800">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div>
                <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextMutedClass}`}>WhatsApp</p>
                <p className={`mt-2 text-lg font-semibold ${memberTextPrimaryClass}`}>{profile.whatsapp ?? "-"}</p>
              </div>
            </div>
          </div>

          <div className={memberGlassRowClass}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/12 text-amber-800">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextMutedClass}`}>Referred By</p>
                <p className={`mt-2 text-lg font-semibold ${memberTextPrimaryClass}`}>
                  {referredByLabel}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-4 ${memberGlassRowClass}`}>
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/12 text-violet-800">
              <Link2 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextMutedClass}`}>Member ID</p>
              <p className={`mt-2 font-mono text-lg font-semibold ${memberTextPrimaryClass}`}>{memberId ?? "-"}</p>
              <p className={`mt-2 break-all text-sm ${memberTextSecondaryClass}`}>{profile.referralLink ?? "-"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
