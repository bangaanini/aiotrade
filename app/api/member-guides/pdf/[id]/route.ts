import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { getPublishedMemberGuidePostById } from "@/lib/member-guides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeFilename(value: string) {
  const filename = value
    .trim()
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);

  return filename || "member-guide";
}

function getValidHttpUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const guide = await getPublishedMemberGuidePostById(id);

  if (!guide || guide.type !== "pdf") {
    return NextResponse.json({ error: "PDF tidak ditemukan." }, { status: 404 });
  }

  const fileUrl = getValidHttpUrl(guide.fileUrl);

  if (!fileUrl) {
    return NextResponse.json({ error: "URL PDF tidak valid." }, { status: 404 });
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(fileUrl, {
      cache: "no-store",
    });
  } catch (error) {
    console.error("Failed to fetch member guide PDF", error);

    return NextResponse.json(
      { error: "PDF belum bisa dibuka sekarang." },
      { status: 502 },
    );
  }

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    return NextResponse.json(
      { error: "PDF belum bisa dibuka sekarang." },
      { status: 502 },
    );
  }

  const headers = new Headers();
  const contentLength = upstreamResponse.headers.get("content-length");
  const contentType = upstreamResponse.headers.get("content-type") ?? "application/pdf";
  const filename = `${sanitizeFilename(guide.title)}.pdf`;

  headers.set("Cache-Control", "private, no-store");
  headers.set("Content-Disposition", `inline; filename="${filename}"`);
  headers.set("Content-Type", contentType);

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new Response(upstreamResponse.body, {
    headers,
    status: 200,
  });
}
