"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import type { WizardProjectInfo, WizardSettings, WizardStyleguide, WizardSeo, WizardGeneral } from "@/types/wizard";

interface ProjectSettingsStepProps {
  projectInfo: WizardProjectInfo;
  onSettingsReady: (settings: WizardSettings) => void;
  onBack: () => void;
}

type SettingsTab = "style" | "seo";

const FONT_OPTIONS = [
  "Inter", "Poppins", "Montserrat", "Playfair Display", "Lora",
  "Merriweather", "Roboto", "Open Sans", "Raleway", "Nunito",
  "Space Grotesk", "DM Sans", "Manrope", "Outfit", "Sora",
];

const COLOR_FIELDS = [
  { key: "primary", label: "Primary", group: "brand" },
  { key: "secondary", label: "Secondary", group: "brand" },
  { key: "accent", label: "Accent", group: "brand" },
  { key: "background", label: "Background", group: "base" },
  { key: "surface", label: "Surface", group: "base" },
  { key: "text", label: "Text", group: "base" },
  { key: "textMuted", label: "Muted", group: "base" },
  { key: "border", label: "Border", group: "base" },
];

export function ProjectSettingsStep({ projectInfo, onSettingsReady, onBack }: ProjectSettingsStepProps) {
  const [tab, setTab] = useState<SettingsTab>("style");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [styleguide, setStyleguide] = useState<WizardStyleguide>({
    colors: {},
    typography: {},
    spacing: { values: {} },
    cssVariables: {},
  });
  const [seo, setSeo] = useState<WizardSeo>({
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    ogTitle: "",
    ogDescription: "",
  });
  const [general, setGeneral] = useState<WizardGeneral>({
    siteName: projectInfo.name,
    companyName: projectInfo.name,
    language: projectInfo.language || "en",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.wizardGenerateSettings(projectInfo);
        if (res.success && res.data) {
          const d = res.data;
          if (d.styleguide) setStyleguide(d.styleguide);
          if (d.seo) setSeo(d.seo);
          if (d.general) setGeneral(d.general);
        } else {
          setError("AI couldn't generate suggestions. You can fill in manually.");
        }
      } catch {
        setError("Failed to generate AI suggestions. You can fill in manually.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    onSettingsReady({ styleguide, seo, general });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab header */}
      <div className="flex items-center gap-6 px-6 pt-5 pb-0 shrink-0">
        {(["style", "seo"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "relative pb-3 text-sm font-semibold transition-colors",
              tab === t ? "text-primary" : "text-on-surface-outline hover:text-on-surface-variant",
            )}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">
                {t === "style" ? "palette" : "search"}
              </span>
              {t === "style" ? "Style Guide" : "SEO & Metadata"}
            </span>
            {/* Active underline */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary transition-transform origin-left",
              tab === t ? "scale-x-100" : "scale-x-0",
            )} />
          </button>
        ))}

        {/* Subtitle */}
        <p className="ml-auto text-[11px] text-on-surface-outline">
          AI suggestions for <span className="font-medium text-on-surface-variant">&ldquo;{projectInfo.name}&rdquo;</span>
        </p>
      </div>

      <div className="w-full h-px bg-outline-variant/15" />

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-primary animate-pulse">auto_awesome</span>
            </div>
            <div className="absolute -inset-2 rounded-3xl bg-primary/5 blur-xl -z-10" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-on-surface">Generating suggestions...</p>
            <p className="text-xs text-on-surface-outline mt-1">AI is analyzing your project requirements</p>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mx-6 mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-warning/8 border border-warning/15">
          <span className="material-symbols-outlined text-warning text-base">info</span>
          <p className="text-xs text-warning leading-relaxed">{error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {tab === "style" && (
            <>
              {/* Color palette preview */}
              {styleguide.colors && Object.keys(styleguide.colors).length > 0 && (
                <section>
                  <SectionTitle icon="palette" title="Color Palette" />
                  <div className="rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm">
                    {/* Preview bar */}
                    <div className="flex h-14">
                      {["primary", "secondary", "accent", "background", "surface", "text"].map((key) =>
                        styleguide.colors[key] ? (
                          <div
                            key={key}
                            className="flex-1 flex items-center justify-center"
                            style={{ backgroundColor: styleguide.colors[key] }}
                          >
                            <span
                              className="text-[9px] font-bold uppercase tracking-wider"
                              style={{ color: ["background", "surface"].includes(key) ? "#333" : "#fff" }}
                            >
                              {key}
                            </span>
                          </div>
                        ) : null,
                      )}
                    </div>

                    {/* Color editors */}
                    <div className="grid grid-cols-4 gap-px bg-outline-variant/10">
                      {COLOR_FIELDS.map(({ key, label }) => (
                        <div key={key} className="bg-surface-lowest flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-container/50 transition-colors">
                          <label className="relative cursor-pointer">
                            <input
                              type="color"
                              value={styleguide.colors[key] || "#000000"}
                              onChange={(e) =>
                                setStyleguide((prev) => ({
                                  ...prev,
                                  colors: { ...prev.colors, [key]: e.target.value },
                                }))
                              }
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div
                              className="w-7 h-7 rounded-lg border border-outline-variant/20 shadow-sm ring-1 ring-black/5"
                              style={{ backgroundColor: styleguide.colors[key] || "#000000" }}
                            />
                          </label>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold text-on-surface">{label}</p>
                            <input
                              type="text"
                              value={styleguide.colors[key] || ""}
                              onChange={(e) =>
                                setStyleguide((prev) => ({
                                  ...prev,
                                  colors: { ...prev.colors, [key]: e.target.value },
                                }))
                              }
                              className="w-full text-[10px] text-on-surface-outline bg-transparent outline-none font-mono"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Typography */}
              <section>
                <SectionTitle icon="text_fields" title="Typography" />
                <div className="rounded-2xl border border-outline-variant/10 bg-surface-lowest shadow-sm overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-outline-variant/10">
                    {(["headingFont", "bodyFont"] as const).map((field) => (
                      <div key={field} className="p-4">
                        <p className="text-[10px] font-semibold text-on-surface-outline uppercase tracking-wider mb-2">
                          {field === "headingFont" ? "Headings" : "Body Text"}
                        </p>
                        <select
                          value={styleguide.typography[field] || "Inter"}
                          onChange={(e) =>
                            setStyleguide((prev) => ({
                              ...prev,
                              typography: { ...prev.typography, [field]: e.target.value },
                            }))
                          }
                          className="w-full text-sm border border-outline-variant/20 rounded-lg px-3 py-2 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-colors"
                        >
                          {FONT_OPTIONS.map((f) => (
                            <option key={f} value={`${f}, sans-serif`}>{f}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Font preview */}
                  <div className="px-4 py-3 bg-surface-container/30 border-t border-outline-variant/10">
                    <p
                      className="text-xl font-bold text-on-surface leading-tight"
                      style={{ fontFamily: styleguide.typography.headingFont || "Inter" }}
                    >
                      {projectInfo.name}
                    </p>
                    <p
                      className="text-sm text-on-surface-outline mt-1 leading-relaxed"
                      style={{ fontFamily: styleguide.typography.bodyFont || "Inter" }}
                    >
                      Your website body text will use this font for optimal readability.
                    </p>
                  </div>
                </div>
              </section>

              {/* General */}
              <section>
                <SectionTitle icon="settings" title="General Info" />
                <div className="grid grid-cols-2 gap-4">
                  <SettingsInput
                    label="Site Name"
                    value={general.siteName}
                    onChange={(v) => setGeneral((prev) => ({ ...prev, siteName: v }))}
                  />
                  <SettingsInput
                    label="Company Name"
                    value={general.companyName}
                    onChange={(v) => setGeneral((prev) => ({ ...prev, companyName: v }))}
                  />
                </div>
              </section>
            </>
          )}

          {tab === "seo" && (
            <section>
              <SectionTitle icon="search" title="SEO Metadata" />
              <div className="space-y-4">
                {([
                  { key: "seoTitle" as const, label: "SEO Title", max: 60, placeholder: "Title for search engines" },
                  { key: "seoDescription" as const, label: "Meta Description", max: 160, placeholder: "Brief description for search results" },
                  { key: "seoKeywords" as const, label: "Keywords", max: 200, placeholder: "Comma-separated keywords" },
                  { key: "ogTitle" as const, label: "Open Graph Title", max: 60, placeholder: "Title for social sharing" },
                  { key: "ogDescription" as const, label: "OG Description", max: 160, placeholder: "Description for social sharing" },
                ]).map(({ key, label, max, placeholder }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-semibold text-on-surface">{label}</label>
                      <span
                        className={cn(
                          "text-[10px] tabular-nums",
                          (seo[key]?.length ?? 0) > max ? "text-error font-semibold" : "text-on-surface-outline",
                        )}
                      >
                        {seo[key]?.length ?? 0}/{max}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={seo[key]}
                      onChange={(e) => setSeo((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className={cn(
                        "w-full text-sm border rounded-xl px-3.5 py-2.5 bg-surface-lowest text-on-surface placeholder:text-on-surface-outline/40",
                        "focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-colors",
                        (seo[key]?.length ?? 0) > max ? "border-error/40" : "border-outline-variant/20",
                      )}
                    />
                    {/* Visual progress bar */}
                    <div className="mt-1.5 h-0.5 rounded-full bg-outline-variant/10 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          (seo[key]?.length ?? 0) > max ? "bg-error" : (seo[key]?.length ?? 0) > max * 0.8 ? "bg-warning" : "bg-primary/40",
                        )}
                        style={{ width: `${Math.min(((seo[key]?.length ?? 0) / max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/10 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Chat
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
            loading
              ? "bg-surface-container text-on-surface-outline cursor-not-allowed"
              : "bg-primary text-on-primary shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98]",
          )}
        >
          Build My Website
          <span className="material-symbols-outlined text-base">rocket_launch</span>
        </button>
      </div>
    </div>
  );
}

/* ── Reusable sub-components ── */

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="material-symbols-outlined text-base text-primary">{icon}</span>
      <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">{title}</h3>
    </div>
  );
}

function SettingsInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-on-surface block mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-outline-variant/20 rounded-xl px-3.5 py-2.5 bg-surface-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-colors"
      />
    </div>
  );
}
