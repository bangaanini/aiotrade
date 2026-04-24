"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, PlayCircle } from "lucide-react";
import type { MemberGuidePost } from "@/lib/member-guide-types";
import {
  memberGlassPanelClass,
  MemberPageHeader,
  memberSoftButtonClass,
  memberTextMutedClass,
  memberTextPrimaryClass,
  memberTextSecondaryClass,
} from "@/components/dashboard/member-ui";

type MemberVideoGuideSectionProps = {
  badge: string;
  description: string;
  emptyMessage: string;
  guides: MemberGuidePost[];
  labels?: {
    listDescription: string;
    listTitle: string;
    nowPlaying: string;
    sectionDescription: string;
    videoTitle: string;
  };
  title: string;
};

type MemberPdfGuideSectionProps = {
  badge: string;
  description: string;
  emptyMessage: string;
  guides: MemberGuidePost[];
  labels?: {
    openPdf: string;
    sectionDescription: string;
    sectionTitle: string;
  };
  title: string;
};

export function MemberVideoGuideSection({
  badge,
  description,
  emptyMessage,
  guides,
  labels = {
    listDescription: "Semua materi yang masuk kategori ini akan muncul di sini.",
    listTitle: "Daftar video",
    nowPlaying: "Sedang diputar",
    sectionDescription: "Pilih materi di samping untuk melihat preview utama dan mulai belajar lebih cepat.",
    videoTitle: "Video panduan",
  },
  title,
}: MemberVideoGuideSectionProps) {
  const videoGuides = useMemo(() => guides.filter((guide) => guide.type === "video"), [guides]);
  const [selectedVideoId, setSelectedVideoId] = useState(videoGuides[0]?.id ?? null);
  const selectedVideo = videoGuides.find((guide) => guide.id === selectedVideoId) ?? videoGuides[0] ?? null;

  return (
    <div className="space-y-6 px-4 py-6 sm:px-5 lg:px-6 lg:py-8">
      <MemberPageHeader
        badge={badge}
        description={description}
        icon={PlayCircle}
        title={title}
        toneClassName="bg-[linear-gradient(135deg,rgba(59,130,246,0.12)_0%,rgba(255,255,255,0)_44%,rgba(16,185,129,0.1)_100%)]"
      />

      <section className="space-y-4">
        <div className="px-1">
          <h2 className={`text-[1.7rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>{labels.videoTitle}</h2>
          <p className={`mt-1 text-sm leading-7 ${memberTextSecondaryClass}`}>
            {labels.sectionDescription}
          </p>
        </div>

        {selectedVideo ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
            <div className={`overflow-hidden ${memberGlassPanelClass}`}>
              <div className="aspect-video overflow-hidden bg-[var(--member-video-frame-bg)]">
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                  src={selectedVideo.embedUrl ?? undefined}
                  title={selectedVideo.title}
                />
              </div>
              <div className="px-6 py-6 sm:px-7">
                <p className={`text-[0.72rem] font-semibold uppercase tracking-[0.24em] ${memberTextMutedClass}`}>{labels.nowPlaying}</p>
                <h3 className={`mt-3 text-[1.6rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>{selectedVideo.title}</h3>
                <p className={`mt-3 text-sm leading-7 ${memberTextSecondaryClass}`}>{selectedVideo.description}</p>
              </div>
            </div>

            <div className={`px-5 py-5 ${memberGlassPanelClass}`}>
              <div className="px-1">
                <h3 className={`text-[1.35rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>{labels.listTitle}</h3>
                <p className={`mt-1 text-sm leading-7 ${memberTextSecondaryClass}`}>{labels.listDescription}</p>
              </div>

              <div className="mt-5 space-y-3">
                {videoGuides.map((guide) => {
                  const active = guide.id === selectedVideo.id;

                  return (
                    <button
                      className={`w-full rounded-[24px] px-4 py-4 text-left transition duration-300 ${
                        active
                          ? "text-[var(--member-sidebar-active-text)]"
                          : "member-row-surface text-[var(--member-text-primary)]"
                      }`}
                      key={guide.id}
                      onClick={() => setSelectedVideoId(guide.id)}
                      style={active ? { background: "var(--member-sidebar-active-bg)", boxShadow: "var(--member-sidebar-active-shadow)" } : undefined}
                      type="button"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                            active ? "bg-white/18 text-[var(--member-sidebar-active-text)]" : "member-icon-surface"
                          }`}
                        >
                          <PlayCircle className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{guide.title}</p>
                          <p className={`mt-2 text-xs leading-6 ${active ? "text-white/68" : "text-[var(--member-text-muted)]"}`}>
                            {guide.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className={`px-6 py-8 text-sm ${memberTextSecondaryClass} ${memberGlassPanelClass}`}>{emptyMessage}</div>
        )}
      </section>
    </div>
  );
}

export function MemberPdfGuideSection({
  badge,
  description,
  emptyMessage,
  guides,
  labels = {
    openPdf: "Buka PDF",
    sectionDescription: "Buka dokumen untuk membaca materi lebih lengkap, lebih tenang, dan bisa diulang kapan saja.",
    sectionTitle: "File PDF",
  },
  title,
}: MemberPdfGuideSectionProps) {
  const pdfGuides = useMemo(() => guides.filter((guide) => guide.type === "pdf"), [guides]);

  return (
    <div className="space-y-6 px-4 py-6 sm:px-5 lg:px-6 lg:py-8">
      <MemberPageHeader
        badge={badge}
        description={description}
        icon={FileText}
        title={title}
        toneClassName="bg-[linear-gradient(135deg,rgba(244,63,94,0.12)_0%,rgba(255,255,255,0)_44%,rgba(168,85,247,0.09)_100%)]"
      />

      <section className="space-y-4">
        <div className="px-1">
          <h2 className={`text-[1.7rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>{labels.sectionTitle}</h2>
          <p className={`mt-1 text-sm leading-7 ${memberTextSecondaryClass}`}>
            {labels.sectionDescription}
          </p>
        </div>

        {pdfGuides.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {pdfGuides.map((guide) => (
              <div className={`flex h-full flex-col gap-5 px-6 py-6 ${memberGlassPanelClass}`} key={guide.id}>
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/12 text-rose-800">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className={`text-[1.35rem] font-semibold tracking-tight ${memberTextPrimaryClass}`}>{guide.title}</h3>
                    <p className={`mt-3 text-sm leading-7 ${memberTextSecondaryClass}`}>{guide.description}</p>
                  </div>
                </div>

                <div className="mt-auto">
                  <Link
                    className={memberSoftButtonClass}
                    href={guide.fileUrl ?? "#"}
                    target="_blank"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {labels.openPdf}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`px-6 py-8 text-sm ${memberTextSecondaryClass} ${memberGlassPanelClass}`}>{emptyMessage}</div>
        )}
      </section>
    </div>
  );
}
