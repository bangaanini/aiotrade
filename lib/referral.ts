import { prisma } from "@/lib/prisma";
import { normalizeReferralLink } from "@/lib/referral-links";
import { buildWhatsAppUrl } from "@/lib/site";
import { parsePublicUsernameCandidate } from "@/lib/username-rules";

export const LANDING_REFERRAL_COOKIE_NAME = "landing_referral";
export const LANDING_REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type ReferralOwner = {
  referralLink: string | null;
  username: string;
  whatsapp: string | null;
};

export type ReferralLandingState = {
  owner: ReferralOwner | null;
  ctaExternal: boolean;
  ctaHref: string;
  signupExternal: boolean;
  signupHref: string;
};

export function buildReferralSignupUrl(username: string) {
  return `/signup?ref=${encodeURIComponent(username)}`;
}

export function parseReferralUsername(value: string | null | undefined) {
  return parsePublicUsernameCandidate(value);
}

export async function getActiveReferralOwner(username: string | null | undefined) {
  const normalizedUsername = parseReferralUsername(username);

  if (!normalizedUsername) {
    return null;
  }

  try {
    const profiles = await prisma.$queryRaw<ReferralOwner[]>`
      SELECT
        "referral_link" AS "referralLink",
        "username",
        "whatsapp"
      FROM "public"."profiles"
      WHERE "username" = ${normalizedUsername}
        AND "is_lp_active" = true
      LIMIT 1
    `;

    return profiles[0] ?? null;
  } catch (error) {
    console.error("[referral] Failed to load referral owner, using default CTA.", error);
    return null;
  }
}

export async function resolveHomepageReferralState(cookieReferralUsername: string | null | undefined) {
  const owner = await getActiveReferralOwner(cookieReferralUsername);

  if (!owner) {
    return {
      owner: null,
      ctaExternal: false,
      ctaHref: "/login",
      signupExternal: false,
      signupHref: "/login",
    } satisfies ReferralLandingState;
  }

  const externalSignupHref = normalizeReferralLink(owner.referralLink);
  const signupHref = externalSignupHref ?? buildReferralSignupUrl(owner.username);
  const whatsappUrl = owner.whatsapp
    ? buildWhatsAppUrl(owner.whatsapp, owner.username)
    : null;

  return {
    owner,
    ctaExternal: Boolean(whatsappUrl ?? externalSignupHref),
    ctaHref: whatsappUrl ?? signupHref,
    signupExternal: Boolean(externalSignupHref),
    signupHref,
  } satisfies ReferralLandingState;
}
