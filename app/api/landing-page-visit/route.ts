import { NextResponse } from "next/server";
import { LANDING_PAGE_VISIT_SECRET_HEADER, getLandingPageVisitSecret } from "@/lib/landing-page-visits";
import { prisma } from "@/lib/prisma";
import { parseReferralUsername } from "@/lib/referral";

type LandingPageVisitPayload = {
  username?: string;
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

  if (!username) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }

  try {
    await prisma.$executeRaw`
      UPDATE "public"."profiles"
      SET "landing_page_visit_count" = COALESCE("landing_page_visit_count", 0) + 1
      WHERE "username" = ${username}
        AND "is_lp_active" = true
    `;
  } catch (error) {
    console.error("[landing-page-visit] Failed to increment visit count", error);
  }

  return NextResponse.json({ ok: true });
}
