"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, PlayCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MemberGuidePost } from "@/lib/member-guide-types";

type MemberGuidesViewProps = {
  guides: MemberGuidePost[];
};

export function MemberGuidesView({ guides }: MemberGuidesViewProps) {
  const videoGuides = useMemo(() => guides.filter((guide) => guide.type === "video"), [guides]);
  const pdfGuides = useMemo(() => guides.filter((guide) => guide.type === "pdf"), [guides]);
  const [selectedVideoId, setSelectedVideoId] = useState(videoGuides[0]?.id ?? null);
  const selectedVideo = videoGuides.find((guide) => guide.id === selectedVideoId) ?? videoGuides[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
          <PlayCircle className="h-4 w-4" />
          Panduan Member
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Video & PDF Panduan</h1>
          <p className="mt-2 text-base leading-7 text-stone-600">
            Semua materi ini hanya tersedia untuk member.
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Video Panduan</h2>
          <p className="mt-1 text-sm text-stone-500">
            Pilih video di daftar kanan untuk melihat panduan langkah demi langkah.
          </p>
        </div>

        {selectedVideo ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video overflow-hidden rounded-t-lg bg-black">
                  <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                    src={selectedVideo.embedUrl ?? undefined}
                    title={selectedVideo.title}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-stone-950">{selectedVideo.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{selectedVideo.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daftar Video</CardTitle>
                <CardDescription>Pilih materi yang ingin dipelajari.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {videoGuides.map((guide) => (
                  <button
                    className={`w-full rounded-xl border px-4 py-4 text-left transition ${
                      guide.id === selectedVideo.id
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                    }`}
                    key={guide.id}
                    onClick={() => setSelectedVideoId(guide.id)}
                    type="button"
                  >
                    <div className="flex items-start gap-3">
                      <PlayCircle className="mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">{guide.title}</p>
                        <p className={`mt-2 text-xs leading-5 ${guide.id === selectedVideo.id ? "text-white/72" : "text-stone-500"}`}>
                          {guide.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="px-6 py-10 text-sm text-stone-500">
              Belum ada video panduan yang dipublish.
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950">PDF Panduan</h2>
          <p className="mt-1 text-sm text-stone-500">
            Buka dokumen untuk membaca panduan lebih lengkap.
          </p>
        </div>

        {pdfGuides.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {pdfGuides.map((guide) => (
              <Card key={guide.id}>
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-rose-100 p-3 text-rose-700">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-stone-950">{guide.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-stone-600">{guide.description}</p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Link
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium text-stone-900 transition hover:bg-stone-50"
                      href={guide.fileUrl ?? "#"}
                      target="_blank"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Buka PDF
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="px-6 py-10 text-sm text-stone-500">
              Belum ada PDF panduan yang dipublish.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
