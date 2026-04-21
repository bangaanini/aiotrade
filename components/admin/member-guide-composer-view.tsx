"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  CloudUpload,
  ExternalLink,
  FileText,
  PlayCircle,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { saveMemberGuidePostAction } from "@/app/(protected)/admin/member-posts/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MemberGuideAsset, MemberGuidePost, MemberGuideType } from "@/lib/member-guide-types";
import { normalizeMemberGuideVideoUrl } from "@/lib/member-guide-utils";
import { cn } from "@/lib/utils";

type MemberGuideComposerViewProps = {
  assets: MemberGuideAsset[];
  cloudinaryEnabled: boolean;
  guides: MemberGuidePost[];
  message?: string;
  selectedGuideId?: string;
  status?: string;
};

type DraftGuide = {
  description: string;
  embedUrl: string;
  fileAssetId: string | null;
  fileUrl: string | null;
  id: string | null;
  isPublished: boolean;
  publishedAt: string;
  sortOrder: number;
  title: string;
  type: MemberGuideType;
};

const EMPTY_GUIDE: DraftGuide = {
  description: "",
  embedUrl: "",
  fileAssetId: null,
  fileUrl: null,
  id: null,
  isPublished: true,
  publishedAt: new Date().toISOString().slice(0, 16),
  sortOrder: 0,
  title: "",
  type: "video",
};

function toDraftGuide(guide: MemberGuidePost | null | undefined): DraftGuide {
  if (!guide) {
    return EMPTY_GUIDE;
  }

  return {
    description: guide.description,
    embedUrl: guide.embedUrl ?? "",
    fileAssetId: guide.fileAssetId,
    fileUrl: guide.fileUrl,
    id: guide.id,
    isPublished: guide.isPublished,
    publishedAt: guide.publishedAt.slice(0, 16),
    sortOrder: guide.sortOrder,
    title: guide.title,
    type: guide.type,
  };
}

function statusAlert(status?: string, message?: string) {
  switch (status) {
    case "saved":
      return { message: "Panduan member berhasil disimpan.", variant: "success" as const };
    case "invalid":
      return {
        message: message || "Data panduan belum lengkap. Cek lagi form-nya.",
        variant: "error" as const,
      };
    case "error":
      return {
        message: message || "Panduan belum bisa disimpan sekarang.",
        variant: "error" as const,
      };
    default:
      return null;
  }
}

function TextField({
  label,
  name,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
}

export function MemberGuideComposerView({
  assets,
  cloudinaryEnabled,
  guides,
  message,
  selectedGuideId,
  status,
}: MemberGuideComposerViewProps) {
  const selectedGuide = useMemo(
    () => (selectedGuideId ? guides.find((guide) => guide.id === selectedGuideId) ?? null : null),
    [guides, selectedGuideId],
  );
  const [draft, setDraft] = useState<DraftGuide>(() => toDraftGuide(selectedGuide));
  const [library, setLibrary] = useState(assets);
  const [assetLabel, setAssetLabel] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function updateDraft<K extends keyof DraftGuide>(key: K, value: DraftGuide[K]) {
    setDraft((current) => ({
      ...current,
      [key]: value,
      ...(key === "type" && value === "video"
        ? { fileAssetId: null, fileUrl: null }
        : key === "type" && value === "pdf"
          ? { embedUrl: "" }
          : {}),
    }));
  }

  function resetComposer() {
    setDraft(EMPTY_GUIDE);
    setUploadError(null);
    setUploadMessage(null);
  }

  async function handlePdfUpload(file: File | null) {
    if (!cloudinaryEnabled) {
      setUploadError("Cloudinary belum dikonfigurasi.");
      return;
    }

    if (!file) {
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const signatureResponse = await fetch("/api/admin/member-guide-assets/signature", {
        body: JSON.stringify({ filename: file.name }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!signatureResponse.ok) {
        const payload = (await signatureResponse.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Gagal membuat signature upload.");
      }

      const signaturePayload = (await signatureResponse.json()) as {
        apiKey: string;
        cloudName: string;
        folder: string;
        signature: string;
        timestamp: number;
      };

      const cloudinaryBody = new FormData();
      cloudinaryBody.append("file", file);
      cloudinaryBody.append("api_key", signaturePayload.apiKey);
      cloudinaryBody.append("timestamp", String(signaturePayload.timestamp));
      cloudinaryBody.append("signature", signaturePayload.signature);
      cloudinaryBody.append("folder", signaturePayload.folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signaturePayload.cloudName}/raw/upload`,
        {
          body: cloudinaryBody,
          method: "POST",
        },
      );

      if (!uploadResponse.ok) {
        const payload = (await uploadResponse.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(payload?.error?.message ?? "Upload PDF ke Cloudinary gagal.");
      }

      const uploaded = (await uploadResponse.json()) as {
        bytes?: number;
        format?: string;
        original_filename?: string;
        public_id: string;
        secure_url: string;
      };

      const persistResponse = await fetch("/api/admin/member-guide-assets", {
        body: JSON.stringify({
          bytes: uploaded.bytes ?? null,
          format: uploaded.format ?? null,
          label: assetLabel.trim() || uploaded.original_filename || file.name.replace(/\.[^.]+$/, ""),
          originalFilename: uploaded.original_filename ?? file.name,
          publicId: uploaded.public_id,
          secureUrl: uploaded.secure_url,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!persistResponse.ok) {
        const payload = (await persistResponse.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Gagal menyimpan metadata PDF.");
      }

      const payload = (await persistResponse.json()) as { asset: MemberGuideAsset };
      setLibrary([payload.asset, ...library.filter((asset) => asset.id !== payload.asset.id)]);
      setDraft((current) => ({
        ...current,
        fileAssetId: payload.asset.id,
        fileUrl: payload.asset.secureUrl,
        type: "pdf",
      }));
      setUploadMessage("PDF panduan berhasil diupload dan dipilih.");
      setAssetLabel("");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload PDF gagal.");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const activeAlert = statusAlert(status, message);
  const previewEmbedUrl = normalizeMemberGuideVideoUrl(draft.embedUrl);

  return (
    <div className="space-y-6">
      {activeAlert ? <Alert variant={activeAlert.variant}>{activeAlert.message}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.04fr)_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Post to Member</CardTitle>
                  <CardDescription>
                    Buat konten khusus member.
                  </CardDescription>
                </div>
                <Button onClick={resetComposer} variant="outline">
                  <PlusCircle className="h-4 w-4" />
                  Guide Baru
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form action={saveMemberGuidePostAction} className="space-y-6">
                <input name="guideId" type="hidden" value={draft.id ?? ""} />
                <input name="type" type="hidden" value={draft.type} />
                <input name="title" type="hidden" value={draft.title} />
                <input name="description" type="hidden" value={draft.description} />
                <input name="embedUrl" type="hidden" value={draft.embedUrl} />
                <input name="fileAssetId" type="hidden" value={draft.fileAssetId ?? ""} />
                <input name="fileUrl" type="hidden" value={draft.fileUrl ?? ""} />
                <input name="sortOrder" type="hidden" value={String(draft.sortOrder)} />
                <input name="publishedAt" type="hidden" value={draft.publishedAt} />
                <input name="isPublished" type="hidden" value={String(draft.isPublished)} />

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    className={cn(
                      "rounded-xl border px-4 py-4 text-left transition",
                      draft.type === "video"
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-stone-50 hover:bg-stone-100",
                    )}
                    onClick={() => updateDraft("type", "video")}
                    type="button"
                  >
                    <PlayCircle className="h-5 w-5" />
                    <p className="mt-3 text-sm font-semibold">Video Panduan</p>
                    <p className={cn("mt-1 text-xs leading-5", draft.type === "video" ? "text-white/72" : "text-stone-500")}>
                      Masukan link embed untuk di tampilkan di dashboard member.
                    </p>
                  </button>
                  <button
                    className={cn(
                      "rounded-xl border px-4 py-4 text-left transition",
                      draft.type === "pdf"
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-stone-50 hover:bg-stone-100",
                    )}
                    onClick={() => updateDraft("type", "pdf")}
                    type="button"
                  >
                    <FileText className="h-5 w-5" />
                    <p className="mt-3 text-sm font-semibold">PDF Panduan</p>
                    <p className={cn("mt-1 text-xs leading-5", draft.type === "pdf" ? "text-white/72" : "text-stone-500")}>
                      Upload PDF untuk di tampilkan di dashboard member.
                    </p>
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <TextField
                    label="Judul Panduan"
                    name="member-guide-title"
                    onChange={(value) => updateDraft("title", value)}
                    placeholder="Mis. Cara Aktivasi Landing Page"
                    value={draft.title}
                  />
                  <div className="grid gap-2">
                    <Label htmlFor="member-guide-order">Urutan Tampil</Label>
                    <Input
                      id="member-guide-order"
                      min={0}
                      onChange={(event) => updateDraft("sortOrder", Number(event.target.value) || 0)}
                      type="number"
                      value={String(draft.sortOrder)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="member-guide-description">Deskripsi Singkat</Label>
                  <textarea
                    className="min-h-28 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                    id="member-guide-description"
                    onChange={(event) => updateDraft("description", event.target.value)}
                    rows={4}
                    value={draft.description}
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="grid gap-2">
                    <Label htmlFor="member-guide-published-at">Tanggal Publish</Label>
                    <Input
                      id="member-guide-published-at"
                      onChange={(event) => updateDraft("publishedAt", event.target.value)}
                      type="datetime-local"
                      value={draft.publishedAt}
                    />
                  </div>
                  <label className="inline-flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-800">
                    <input
                      checked={draft.isPublished}
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      onChange={(event) => updateDraft("isPublished", event.target.checked)}
                      type="checkbox"
                    />
                    Langsung publish
                  </label>
                </div>

                {draft.type === "video" ? (
                  <TextField
                    label="Link Embed Video"
                    name="member-guide-embed"
                    onChange={(value) => updateDraft("embedUrl", value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={draft.embedUrl}
                  />
                ) : (
                  <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
                    {!cloudinaryEnabled ? <Alert variant="error">Cloudinary belum dikonfigurasi.</Alert> : null}
                    {uploadError ? <Alert variant="error">{uploadError}</Alert> : null}
                    {uploadMessage ? <Alert variant="success">{uploadMessage}</Alert> : null}

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                      <TextField
                        label="Label PDF Baru"
                        name="member-guide-asset-label"
                        onChange={setAssetLabel}
                        placeholder="Panduan API Binding"
                        value={assetLabel}
                      />
                      <div className="flex items-end">
                        <input
                          accept="application/pdf"
                          className="hidden"
                          onChange={(event) => handlePdfUpload(event.target.files?.[0] ?? null)}
                          ref={fileInputRef}
                          type="file"
                        />
                        <Button
                          disabled={!cloudinaryEnabled || uploading}
                          onClick={() => fileInputRef.current?.click()}
                          type="button"
                          variant="outline"
                        >
                          <CloudUpload className="h-4 w-4" />
                          {uploading ? "Uploading..." : "Upload PDF"}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {library.map((asset) => {
                        const isSelected = asset.id === draft.fileAssetId;

                        return (
                          <button
                            className={cn(
                              "rounded-xl border px-4 py-4 text-left transition",
                              isSelected
                                ? "border-emerald-500 bg-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]"
                                : "border-stone-200 bg-white hover:border-stone-300",
                            )}
                            key={asset.id}
                            onClick={() =>
                              setDraft((current) => ({
                                ...current,
                                fileAssetId: asset.id,
                                fileUrl: asset.secureUrl,
                                type: "pdf",
                              }))
                            }
                            type="button"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-stone-900">{asset.label}</p>
                                <p className="mt-2 text-xs text-stone-500">
                                  {asset.originalFilename ?? asset.format ?? "PDF document"}
                                </p>
                              </div>
                              {isSelected ? <Check className="h-4 w-4 text-emerald-600" /> : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit">
                    <Sparkles className="h-4 w-4" />
                    Simpan Panduan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>Preview ini meniru tampilan yang akan terlihat di dashboard member.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                  {draft.type === "video" ? <PlayCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  {draft.type === "video" ? "Video Panduan" : "PDF Panduan"}
                </div>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-stone-950">
                  {draft.title.trim() || "Judul panduan akan tampil di sini"}
                </h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  {draft.description.trim() || "Deskripsi singkat panduan akan membantu member memahami isi materi."}
                </p>
                {draft.type === "video" ? (
                  previewEmbedUrl ? (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-black">
                      <div className="aspect-video w-full">
                        <iframe
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full"
                          src={previewEmbedUrl}
                          title={draft.title || "Preview Video Panduan"}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-10 text-center text-sm text-stone-500">
                      Masukkan link YouTube atau Vimeo untuk melihat preview video.
                    </div>
                  )
                ) : draft.fileUrl ? (
                  <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-rose-100 p-3 text-rose-700">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-900">
                            {draft.title.trim() || "Dokumen panduan"}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            PDF akan dibuka di tab baru saat member mengklik dokumen ini.
                          </p>
                        </div>
                      </div>
                      <Link
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-stone-900 transition hover:bg-stone-50"
                        href={draft.fileUrl}
                        target="_blank"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Buka PDF
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-10 text-center text-sm text-stone-500">
                    Upload atau pilih PDF untuk melihat preview dokumen.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Guide</CardTitle>
              <CardDescription>Pilih guide yang sudah ada untuk diedit kembali.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {guides.map((guide) => {
                const active = draft.id === guide.id;

                return (
                  <button
                    className={cn(
                      "w-full rounded-xl border px-4 py-4 text-left transition",
                      active
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-200 bg-stone-50 hover:bg-stone-100",
                    )}
                    key={guide.id}
                    onClick={() => setDraft(toDraftGuide(guide))}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold">{guide.title}</p>
                        <p className={cn("mt-2 text-xs", active ? "text-white/70" : "text-stone-500")}>
                          {guide.type === "video" ? "Video Panduan" : "PDF Panduan"} • Urutan {guide.sortOrder}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[0.72rem] font-semibold uppercase",
                          guide.isPublished
                            ? active
                              ? "bg-white/16 text-white"
                              : "bg-emerald-100 text-emerald-700"
                            : active
                              ? "bg-white/14 text-white/78"
                              : "bg-stone-200 text-stone-700",
                        )}
                      >
                        {guide.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </button>
                );
              })}

              {!guides.length ? (
                <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                  Belum ada panduan member. Mulai dari composer di kiri.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
