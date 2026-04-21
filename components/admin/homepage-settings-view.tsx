"use client";

import { useEffect, useRef, useState } from "react";
import {
  Monitor,
  Smartphone,
} from "lucide-react";
import {
  updateBenefitsSectionAction,
  updateBlogSectionAction,
  updateFaqSectionAction,
  updateFooterSectionAction,
  updateGuideSectionAction,
  updateHeroSectionAction,
  updateOverviewSectionAction,
  updatePricingSectionAction,
} from "@/app/(protected)/admin/actions";
import { HomepageBackgroundEditor } from "@/components/admin/homepage-background-editor";
import type { HomepageAsset, HomepageContent } from "@/components/landing/types";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type HomepageSettingsViewProps = {
  assets: HomepageAsset[];
  cloudinaryEnabled: boolean;
  content: HomepageContent;
  status?: string;
  section?: string;
};

type FieldProps = {
  label: string;
  name: string;
  onChange: (value: string) => void;
  rows?: number;
  value: string;
};

function TextField({ label, name, onChange, value }: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} onChange={(event) => onChange(event.target.value)} value={value} />
    </div>
  );
}

function TextAreaField({ label, name, onChange, rows = 4, value }: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <textarea
        className="min-h-28 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
        id={name}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        value={value}
      />
    </div>
  );
}

function SectionAlert({
  currentSection,
  label,
  section,
  status,
}: {
  currentSection?: string;
  label: string;
  section: string;
  status?: string;
}) {
  if (currentSection !== section || !status) {
    return null;
  }

  return status === "saved" ? (
    <Alert variant="success">{label} berhasil diperbarui.</Alert>
  ) : (
    <Alert variant="error">Ada data {label.toLowerCase()} yang belum valid. Cek lagi inputnya.</Alert>
  );
}

type PreviewViewportProps = {
  content: HomepageContent;
  preset: PreviewPresetKey;
};

const previewPresets = {
  "desktop-1366": {
    device: "desktop",
    frameAspect: "aspect-[16/10]",
    height: 768,
    label: "Laptop 1366",
    width: 1366,
  },
  "desktop-1440": {
    device: "desktop",
    frameAspect: "aspect-[16/10]",
    height: 900,
    label: "Desktop 1440",
    width: 1440,
  },
  "desktop-1920": {
    device: "desktop",
    frameAspect: "aspect-[16/10]",
    height: 1080,
    label: "Desktop 1920",
    width: 1920,
  },
  "mobile-390": {
    device: "mobile",
    frameAspect: "aspect-[390/844]",
    height: 844,
    label: "Mobile 390",
    width: 390,
  },
  "mobile-412": {
    device: "mobile",
    frameAspect: "aspect-[412/915]",
    height: 915,
    label: "Mobile 412",
    width: 412,
  },
  "tablet-820": {
    device: "mobile",
    frameAspect: "aspect-[820/1180]",
    height: 1180,
    label: "Tablet 820",
    width: 820,
  },
} as const;

type PreviewPresetKey = keyof typeof previewPresets;

const previewPresetGroups = {
  desktop: ["desktop-1366", "desktop-1440", "desktop-1920"],
  mobile: ["mobile-390", "mobile-412", "tablet-820"],
} as const satisfies Record<"desktop" | "mobile", PreviewPresetKey[]>;

function PreviewViewport({ content, preset }: PreviewViewportProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [frameWidth, setFrameWidth] = useState(0);
  const config = previewPresets[preset];

  const viewportWidth = config.width;
  const viewportHeight = config.height;
  const maxViewportHeight = config.device === "desktop" ? 640 : 720;
  const scaleFromWidth = frameWidth > 0 ? frameWidth / viewportWidth : 1;
  const scaleFromHeight = maxViewportHeight / viewportHeight;
  const scale = Math.min(scaleFromWidth, scaleFromHeight, 1);
  const scaledWidth = viewportWidth * scale;
  const scaledHeight = viewportHeight * scale;

  useEffect(() => {
    const node = frameRef.current;

    if (!node) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? 0;
      setFrameWidth((current) => (Math.abs(current - nextWidth) < 0.5 ? current : nextWidth));
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe?.contentWindow) {
      return;
    }

    iframe.contentWindow.postMessage(
      {
        content,
        type: "homepage-preview:update",
      },
      window.location.origin,
    );
  }, [content, preset]);

  return (
    <div
      className={cn(
        "rounded-[24px] border border-stone-200 bg-[radial-gradient(circle_at_top,#f6f6f6_0%,#efefef_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
        config.frameAspect,
      )}
      ref={frameRef}
    >
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[18px] border border-stone-300 bg-[#dfe3ea]">
        <div
          className="relative shrink-0 overflow-hidden rounded-[16px] border border-stone-300 bg-white shadow-[0_24px_48px_rgba(15,23,42,0.14)]"
          style={{
            height: `${scaledHeight}px`,
            width: `${scaledWidth}px`,
          }}
        >
          <iframe
            className="origin-top-left border-0 bg-white"
            onLoad={() => {
              if (!iframeRef.current?.contentWindow) {
                return;
              }

              iframeRef.current.contentWindow.postMessage(
                {
                  content,
                  type: "homepage-preview:update",
                },
                window.location.origin,
              );
            }}
            ref={iframeRef}
            src="/admin-preview"
            style={{
              height: `${viewportHeight}px`,
              transform: `scale(${scale})`,
              width: `${viewportWidth}px`,
            }}
            title={`Homepage preview ${config.label}`}
          />
        </div>
      </div>
    </div>
  );
}

export function HomepageSettingsView({
  assets,
  cloudinaryEnabled,
  content,
  section,
  status,
}: HomepageSettingsViewProps) {
  const [draft, setDraft] = useState(content);
  const [library, setLibrary] = useState(assets);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewPreset, setPreviewPreset] = useState<PreviewPresetKey>("desktop-1440");

  function updateSection<K extends keyof HomepageContent>(
    key: K,
    updates: Partial<HomepageContent[K]>,
  ) {
    setDraft((current) => ({
      ...current,
      [key]: {
        ...current[key],
        ...updates,
      },
    }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(360px,0.86fr)]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Homepage Content Manager</CardTitle>
            <CardDescription>
              Atur background, copy, dan asset visual homepage dari satu composer. Preview di kanan
              akan mengikuti perubahan draft secara langsung sebelum kamu simpan.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="scroll-mt-24" id="hero-section">
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>Atur hero utama, CTA, dan background section pembuka.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionAlert currentSection={section} label="Hero section" section="hero" status={status} />
            <form action={updateHeroSectionAction} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Eyebrow"
                  name="eyebrow"
                  onChange={(value) => updateSection("hero", { eyebrow: value })}
                  value={draft.hero.eyebrow}
                />
                <TextField
                  label="Label Tombol"
                  name="ctaLabel"
                  onChange={(value) => updateSection("hero", { ctaLabel: value })}
                  value={draft.hero.ctaLabel}
                />
                <TextField
                  label="Title Biru"
                  name="titleBlue"
                  onChange={(value) => updateSection("hero", { titleBlue: value })}
                  value={draft.hero.titleBlue}
                />
                <TextField
                  label="Title Putih"
                  name="titleWhite"
                  onChange={(value) => updateSection("hero", { titleWhite: value })}
                  value={draft.hero.titleWhite}
                />
              </div>
              <TextAreaField
                label="Subtitle"
                name="subtitle"
                onChange={(value) => updateSection("hero", { subtitle: value })}
                rows={3}
                value={draft.hero.subtitle}
              />
              <HomepageBackgroundEditor
                assets={library}
                cloudinaryEnabled={cloudinaryEnabled}
                onAssetsChange={setLibrary}
                onChange={(background) => updateSection("hero", { background })}
                value={draft.hero.background}
              />
              <Button type="submit">Simpan Hero Section</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="scroll-mt-24" id="overview-section">
          <CardHeader>
            <CardTitle>Overview Section</CardTitle>
            <CardDescription>Atur headline overview, deskripsi, CTA, dan background.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionAlert currentSection={section} label="Overview section" section="overview" status={status} />
            <form action={updateOverviewSectionAction} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Title Biru"
                  name="titleBlue"
                  onChange={(value) => updateSection("overview", { titleBlue: value })}
                  value={draft.overview.titleBlue}
                />
                <TextField
                  label="Title Putih"
                  name="titleWhite"
                  onChange={(value) => updateSection("overview", { titleWhite: value })}
                  value={draft.overview.titleWhite}
                />
              </div>
              <TextAreaField
                label="Deskripsi"
                name="description"
                onChange={(value) => updateSection("overview", { description: value })}
                rows={5}
                value={draft.overview.description}
              />
              <TextField
                label="Label Tombol"
                name="ctaLabel"
                onChange={(value) => updateSection("overview", { ctaLabel: value })}
                value={draft.overview.ctaLabel}
              />
              <HomepageBackgroundEditor
                assets={library}
                cloudinaryEnabled={cloudinaryEnabled}
                onAssetsChange={setLibrary}
                onChange={(background) => updateSection("overview", { background })}
                value={draft.overview.background}
              />
              <Button type="submit">Simpan Overview Section</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="scroll-mt-24" id="benefits-section">
          <CardHeader>
            <CardTitle>Benefit Section</CardTitle>
            <CardDescription>Atur heading, card benefit, dan background section manfaat.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionAlert currentSection={section} label="Benefit section" section="benefits" status={status} />
            <form action={updateBenefitsSectionAction} className="space-y-5">
              <input name="itemCount" type="hidden" value={draft.benefits.items.length} />
              <TextField
                label="Heading"
                name="heading"
                onChange={(value) => updateSection("benefits", { heading: value })}
                value={draft.benefits.heading}
              />
              <TextAreaField
                label="Subheading"
                name="description"
                onChange={(value) => updateSection("benefits", { description: value })}
                rows={3}
                value={draft.benefits.description}
              />
              <HomepageBackgroundEditor
                assets={library}
                cloudinaryEnabled={cloudinaryEnabled}
                onAssetsChange={setLibrary}
                onChange={(background) => updateSection("benefits", { background })}
                value={draft.benefits.background}
              />
              <div className="space-y-4">
                {draft.benefits.items.map((item, index) => (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4" key={`${item.title}-${index}`}>
                    <p className="text-sm font-semibold text-stone-900">Benefit Card {index + 1}</p>
                    <div className="mt-3 grid gap-4">
                      <TextField
                        label="Judul"
                        name={`item-${index}-title`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            benefits: {
                              ...current.benefits,
                              items: current.benefits.items.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, title: value } : entry,
                              ),
                            },
                          }))
                        }
                        value={item.title}
                      />
                      <TextAreaField
                        label="Deskripsi"
                        name={`item-${index}-description`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            benefits: {
                              ...current.benefits,
                              items: current.benefits.items.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, description: value } : entry,
                              ),
                            },
                          }))
                        }
                        rows={3}
                        value={item.description}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="submit">Simpan Benefit Section</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="scroll-mt-24" id="pricing-section">
          <CardHeader>
            <CardTitle>Pricing Section</CardTitle>
            <CardDescription>Atur judul harga, paket, dan background section pricing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionAlert currentSection={section} label="Pricing section" section="pricing" status={status} />
            <form action={updatePricingSectionAction} className="space-y-5">
              <input name="planCount" type="hidden" value={draft.pricing.plans.length} />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Eyebrow"
                  name="eyebrow"
                  onChange={(value) => updateSection("pricing", { eyebrow: value })}
                  value={draft.pricing.eyebrow}
                />
                <TextField
                  label="Judul"
                  name="title"
                  onChange={(value) => updateSection("pricing", { title: value })}
                  value={draft.pricing.title}
                />
              </div>
              <TextField
                label="Label Tombol"
                name="buttonLabel"
                onChange={(value) => updateSection("pricing", { buttonLabel: value })}
                value={draft.pricing.buttonLabel}
              />
              <HomepageBackgroundEditor
                assets={library}
                cloudinaryEnabled={cloudinaryEnabled}
                onAssetsChange={setLibrary}
                onChange={(background) => updateSection("pricing", { background })}
                value={draft.pricing.background}
              />
              <div className="space-y-4">
                {draft.pricing.plans.map((plan, index) => (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4" key={`${plan.name}-${index}`}>
                    <input name={`plan-${index}-emphasis`} type="hidden" value={String(Boolean(plan.emphasis))} />
                    <p className="text-sm font-semibold text-stone-900">Plan {index + 1}</p>
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      <TextField
                        label="Nama Plan"
                        name={`plan-${index}-name`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            pricing: {
                              ...current.pricing,
                              plans: current.pricing.plans.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, name: value } : entry,
                              ),
                            },
                          }))
                        }
                        value={plan.name}
                      />
                      <TextField
                        label="Harga"
                        name={`plan-${index}-price`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            pricing: {
                              ...current.pricing,
                              plans: current.pricing.plans.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, price: value } : entry,
                              ),
                            },
                          }))
                        }
                        value={plan.price}
                      />
                    </div>
                    <div className="mt-4 grid gap-4">
                      <TextField
                        label="Badge Highlight"
                        name={`plan-${index}-highlight`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            pricing: {
                              ...current.pricing,
                              plans: current.pricing.plans.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, highlight: value || undefined } : entry,
                              ),
                            },
                          }))
                        }
                        value={plan.highlight ?? ""}
                      />
                      <TextAreaField
                        label="Deskripsi"
                        name={`plan-${index}-description`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            pricing: {
                              ...current.pricing,
                              plans: current.pricing.plans.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, description: value } : entry,
                              ),
                            },
                          }))
                        }
                        rows={4}
                        value={plan.description}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="submit">Simpan Pricing Section</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="scroll-mt-24" id="faq-section">
          <CardHeader>
            <CardTitle>FAQ Section</CardTitle>
            <CardDescription>Atur judul FAQ, item pertanyaan, dan background.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionAlert currentSection={section} label="FAQ section" section="faq" status={status} />
            <form action={updateFaqSectionAction} className="space-y-5">
              <input name="itemCount" type="hidden" value={draft.faq.items.length} />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Judul"
                  name="title"
                  onChange={(value) => updateSection("faq", { title: value })}
                  value={draft.faq.title}
                />
                <TextField
                  label="Subjudul"
                  name="subtitle"
                  onChange={(value) => updateSection("faq", { subtitle: value })}
                  value={draft.faq.subtitle}
                />
              </div>
              <HomepageBackgroundEditor
                assets={library}
                cloudinaryEnabled={cloudinaryEnabled}
                onAssetsChange={setLibrary}
                onChange={(background) => updateSection("faq", { background })}
                value={draft.faq.background}
              />
              <div className="space-y-4">
                {draft.faq.items.map((item, index) => (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4" key={`${item.question}-${index}`}>
                    <p className="text-sm font-semibold text-stone-900">FAQ Item {index + 1}</p>
                    <div className="mt-3 grid gap-4">
                      <TextField
                        label="Pertanyaan"
                        name={`item-${index}-question`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            faq: {
                              ...current.faq,
                              items: current.faq.items.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, question: value } : entry,
                              ),
                            },
                          }))
                        }
                        value={item.question}
                      />
                      <TextAreaField
                        label="Jawaban"
                        name={`item-${index}-answer`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            faq: {
                              ...current.faq,
                              items: current.faq.items.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, answer: value } : entry,
                              ),
                            },
                          }))
                        }
                        rows={4}
                        value={item.answer}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="submit">Simpan FAQ Section</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="scroll-mt-24" id="guide-section">
          <CardHeader>
            <CardTitle>Guide Section</CardTitle>
            <CardDescription>Atur panduan langkah dan background section user guide.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionAlert currentSection={section} label="Guide section" section="guide" status={status} />
            <form action={updateGuideSectionAction} className="space-y-5">
              <input name="stepCount" type="hidden" value={draft.guide.steps.length} />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Eyebrow"
                  name="eyebrow"
                  onChange={(value) => updateSection("guide", { eyebrow: value })}
                  value={draft.guide.eyebrow}
                />
                <TextField
                  label="Judul"
                  name="title"
                  onChange={(value) => updateSection("guide", { title: value })}
                  value={draft.guide.title}
                />
              </div>
              <TextField
                label="Label Tombol"
                name="buttonLabel"
                onChange={(value) => updateSection("guide", { buttonLabel: value })}
                value={draft.guide.buttonLabel}
              />
              <HomepageBackgroundEditor
                assets={library}
                cloudinaryEnabled={cloudinaryEnabled}
                onAssetsChange={setLibrary}
                onChange={(background) => updateSection("guide", { background })}
                value={draft.guide.background}
              />
              <div className="space-y-4">
                {draft.guide.steps.map((step, index) => (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4" key={`${step.number}-${index}`}>
                    <p className="text-sm font-semibold text-stone-900">Langkah {index + 1}</p>
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      <TextField
                        label="Nomor"
                        name={`step-${index}-number`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            guide: {
                              ...current.guide,
                              steps: current.guide.steps.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, number: value } : entry,
                              ),
                            },
                          }))
                        }
                        value={step.number}
                      />
                      <TextField
                        label="Judul"
                        name={`step-${index}-title`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            guide: {
                              ...current.guide,
                              steps: current.guide.steps.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, title: value } : entry,
                              ),
                            },
                          }))
                        }
                        value={step.title}
                      />
                    </div>
                    <div className="mt-4">
                      <TextAreaField
                        label="Deskripsi"
                        name={`step-${index}-description`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            guide: {
                              ...current.guide,
                              steps: current.guide.steps.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, description: value } : entry,
                              ),
                            },
                          }))
                        }
                        rows={4}
                        value={step.description}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="submit">Simpan Guide Section</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="scroll-mt-24" id="blog-section">
          <CardHeader>
            <CardTitle>Blog Section</CardTitle>
            <CardDescription>Atur judul blog card, item artikel, dan background.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionAlert currentSection={section} label="Blog section" section="blog" status={status} />
            <form action={updateBlogSectionAction} className="space-y-5">
              <input name="itemCount" type="hidden" value={draft.blog.items.length} />
              <TextField
                label="Judul"
                name="title"
                onChange={(value) => updateSection("blog", { title: value })}
                value={draft.blog.title}
              />
              <HomepageBackgroundEditor
                assets={library}
                cloudinaryEnabled={cloudinaryEnabled}
                onAssetsChange={setLibrary}
                onChange={(background) => updateSection("blog", { background })}
                value={draft.blog.background}
              />
              <div className="space-y-4">
                {draft.blog.items.map((item, index) => (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4" key={`${item.title}-${index}`}>
                    <p className="text-sm font-semibold text-stone-900">Artikel {index + 1}</p>
                    <div className="mt-3 grid gap-4">
                      <TextField
                        label="Judul Artikel"
                        name={`item-${index}-title`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            blog: {
                              ...current.blog,
                              items: current.blog.items.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, title: value } : entry,
                              ),
                            },
                          }))
                        }
                        value={item.title}
                      />
                      <TextAreaField
                        label="Deskripsi Pendek"
                        name={`item-${index}-description`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            blog: {
                              ...current.blog,
                              items: current.blog.items.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, description: value } : entry,
                              ),
                            },
                          }))
                        }
                        rows={3}
                        value={item.description}
                      />
                      <TextField
                        label="Label Badge"
                        name={`item-${index}-label`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            blog: {
                              ...current.blog,
                              items: current.blog.items.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, label: value } : entry,
                              ),
                            },
                          }))
                        }
                        value={item.label}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="submit">Simpan Blog Section</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="scroll-mt-24" id="footer-section">
          <CardHeader>
            <CardTitle>Footer Section</CardTitle>
            <CardDescription>Atur footer, link, dan background penutup homepage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionAlert currentSection={section} label="Footer section" section="footer" status={status} />
            <form action={updateFooterSectionAction} className="space-y-5">
              <input name="linkCount" type="hidden" value={draft.footer.guideLinks.length} />
              <TextAreaField
                label="Deskripsi Footer"
                name="description"
                onChange={(value) => updateSection("footer", { description: value })}
                rows={5}
                value={draft.footer.description}
              />
              <TextField
                label="Copyright"
                name="copyright"
                onChange={(value) => updateSection("footer", { copyright: value })}
                value={draft.footer.copyright}
              />
              <HomepageBackgroundEditor
                assets={library}
                cloudinaryEnabled={cloudinaryEnabled}
                onAssetsChange={setLibrary}
                onChange={(background) => updateSection("footer", { background })}
                value={draft.footer.background}
              />
              <div className="space-y-4">
                {draft.footer.guideLinks.map((link, index) => (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-4" key={`${link.label}-${index}`}>
                    <p className="text-sm font-semibold text-stone-900">Footer Link {index + 1}</p>
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                      <TextField
                        label="Label"
                        name={`link-${index}-label`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            footer: {
                              ...current.footer,
                              guideLinks: current.footer.guideLinks.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, label: value } : entry,
                              ),
                            },
                          }))
                        }
                        value={link.label}
                      />
                      <TextField
                        label="Href"
                        name={`link-${index}-href`}
                        onChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            footer: {
                              ...current.footer,
                              guideLinks: current.footer.guideLinks.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, href: value } : entry,
                              ),
                            },
                          }))
                        }
                        value={link.href}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button type="submit">Simpan Footer Section</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-stone-200">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  Draft di form kiri akan langsung muncul di preview ini sebelum disimpan.
                </CardDescription>
              </div>
              <div className="inline-flex rounded-xl border border-stone-200 bg-stone-50 p-1">
                <Button
                  className={cn(previewDevice === "desktop" ? "shadow-sm" : "shadow-none")}
                  onClick={() => {
                    setPreviewDevice("desktop");
                    setPreviewPreset("desktop-1440");
                  }}
                  size="sm"
                  type="button"
                  variant={previewDevice === "desktop" ? "secondary" : "ghost"}
                >
                  <Monitor className="h-4 w-4" />
                  Desktop
                </Button>
                <Button
                  className={cn(previewDevice === "mobile" ? "shadow-sm" : "shadow-none")}
                  onClick={() => {
                    setPreviewDevice("mobile");
                    setPreviewPreset("mobile-390");
                  }}
                  size="sm"
                  type="button"
                  variant={previewDevice === "mobile" ? "secondary" : "ghost"}
                >
                  <Smartphone className="h-4 w-4" />
                  Mobile
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-stone-100 p-4">
            <div className="space-y-3">
              <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white px-3 py-3 text-xs font-medium text-stone-500 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span>
                    {previewDevice === "desktop" ? "Desktop Landscape" : "Mobile Portrait"}
                  </span>
                  <select
                    className="h-9 rounded-lg border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
                    onChange={(event) => setPreviewPreset(event.target.value as PreviewPresetKey)}
                    value={previewPreset}
                  >
                    {previewPresetGroups[previewDevice].map((presetKey) => (
                      <option key={presetKey} value={presetKey}>
                        {previewPresets[presetKey].label}
                      </option>
                    ))}
                  </select>
                </div>
                <span>
                  {previewPresets[previewPreset].width} x {previewPresets[previewPreset].height}
                </span>
              </div>
              <div className="max-h-[84vh] overflow-auto rounded-2xl border border-stone-200 bg-white p-3 shadow-[0_20px_46px_rgba(15,23,42,0.08)]">
                <PreviewViewport content={draft} preset={previewPreset} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
