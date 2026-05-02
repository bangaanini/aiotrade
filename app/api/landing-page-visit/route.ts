import { NextResponse } from "next/server";
import {
  LANDING_PAGE_VISIT_SECRET_HEADER,
  getLandingPageVisitSecret,
  recordLandingPageVisit,
} from "@/lib/landing-page-visits";
import { parseReferralUsername } from "@/lib/referral";

type LandingPageVisitPayload = {
  city?: string | null;
  countryCode?: string | null;
  deviceType?: string | null;
  profileId?: string;
  referrer?: string | null;
  region?: string | null;
  sourcePath?: string;
  username?: string;
  visitorIdHash?: string | null;
};

export async function POST(request: Request) {
  const secret = request.headers.get(LANDING_PAGE_VISIT_SECRET_HEADER);

  if (secret !== getLandingPageVisitSecret()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: LandingPageVisitPayload;

  try {
    payload = (await request.json()) as LandingPageVisitPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const username = parseReferralUsername(payload.username);
  const profileId = String(payload.profileId ?? "").trim();

  if (!username || !profileId) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  try {
    await recordLandingPageVisit({
      city: payload.city ?? null,
      countryCode: payload.countryCode ?? null,
      deviceType: payload.deviceType ?? null,
      profileId,
      referrer: payload.referrer ?? null,
      region: payload.region ?? null,
      sourcePath: payload.sourcePath ?? "/",
      username,
      visitorIdHash: payload.visitorIdHash ?? null,
    });
  } catch (error) {
    console.error("[landing-page-visit] Failed to increment visit count", error);
  }

  return NextResponse.json({ ok: true });
}
