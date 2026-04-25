const MEMBER_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MEMBER_ID_VALIDATION_PATTERN = /^[A-Z0-9]{8}$/;
const MEMBER_ID_LENGTH = 8;

export const MEMBER_REFERRAL_LINK_PREFIX = "https://aiotrade.co/?r=";

export function normalizeMemberId(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

export function isValidMemberId(value: string | null | undefined) {
  const normalizedValue = normalizeMemberId(value);

  return MEMBER_ID_VALIDATION_PATTERN.test(normalizedValue);
}

export function generateMemberId() {
  const bytes = crypto.getRandomValues(new Uint8Array(MEMBER_ID_LENGTH));

  return Array.from(bytes, (value) => MEMBER_ID_ALPHABET[value % MEMBER_ID_ALPHABET.length]).join("");
}

export function buildMemberReferralLink(memberId: string) {
  return `${MEMBER_REFERRAL_LINK_PREFIX}${normalizeMemberId(memberId)}`;
}

export function extractMemberIdFromReferralLink(referralLink: string | null | undefined) {
  const normalizedLink = String(referralLink ?? "").trim();

  if (!normalizedLink) {
    return null;
  }

  try {
    const url = new URL(normalizedLink);
    const memberId = normalizeMemberId(url.searchParams.get("r"));

    return isValidMemberId(memberId) ? memberId : null;
  } catch {
    return null;
  }
}
