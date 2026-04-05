"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { Modal } from "@/components/ui/modal";
import { WinnieAvatar } from "./WinnieAvatar";
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
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "text", label: "Text" },
  { key: "textMuted", label: "Muted" },
  { key: "border", label: "Border" },
];

/** Get contrasting text color based on luminance */
function getContrastColor(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length < 6) return "#333";
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1a1a2e" : "#ffffff";
}

export function ProjectSettingsStep({ projectInfo, onSettingsReady, onBack }: ProjectSettingsStepProps) {
  const [tab, setTab] = useState<SettingsTab>("style");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasEdits, setHasEdits] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

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

  const markEdited = () => { if (!hasEdits) setHasEdits(true); };

  const handleBack = () => {
    if (hasEdits) {
      setShowDiscardConfirm(true);
      return;
    }
    onBack();
  };

  const handleDiscardConfirm = () => {
    setShowDiscardConfirm(false);
    onBack();
  };

  const handleNext = () => {
    onSettingsReady({ styleguide, seo, general });
  };

  const updateColor = (key: string, value: string) => {
    setStyleguide((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
    markEdited();
  };

  const updateFont = (field: "headingFont" | "bodyFont", value: string) => {
    setStyleguide((prev) => ({ ...prev, typography: { ...prev.typography, [field]: value } }));
    markEdited();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab header */}
      <div className="flex items-center gap-6 px-5 sm:px-6 pt-5 pb-0 shrink-0">
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
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary transition-transform origin-center duration-300",
              tab === t ? "scale-x-100" : "scale-x-0",
            )} />
          </button>
        ))}

        <p className="ml-auto text-[11px] text-on-surface-outline hidden sm:block">
          AI suggestions for <span className="font-medium text-on-surface-variant">&ldquo;{projectInfo.name}&rdquo;</span>
        </p>
      </div>

      <div className="w-full h-px bg-outline-variant/15" />

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <WinnieAvatar size="lg" animated />
          <div className="text-center">
            <p className="text-sm font-medium text-on-surface">Generating suggestions...</p>
            <p className="text-xs text-on-surface-outline mt-1">AI is analyzing your project requirements</p>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-primary/60 animate-dot-wave"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mx-5 sm:mx-6 mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-warning/8 border border-warning/15">
          <span className="material-symbols-outlined text-warning text-base">info</span>
          <p className="text-xs text-warning leading-relaxed">{error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
          {tab === "style" && (
            <>
              {/* Color palette */}
              {styleguide.colors && Object.keys(styleguide.colors).length > 0 && (
                <section>
                  <SectionTitle icon="palette" title="Color Palette" />
                  <div className="rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm">
                    {/* Preview bar */}
                    <div className="flex h-12">
                      {["primary", "secondary", "accent", "background", "surface", "text"].map((key) =>
                        styleguide.colors[key] ? (
                          <div
                            key={key}
                            className="flex-1 flex items-center justify-center"
                            style={{ backgroundColor: styleguide.colors[key] }}
                          >
                            <span
                              className="text-[9px] font-bold uppercase tracking-wider"
                              style={{ color: getContrastColor(styleguide.colors[key]) }}
                            >
                              {key}
                            </span>
                          </div>
                        ) : null,
                      )}
                    </div>

                    {/* Color editors */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-outline-variant/10">
                      {COLOR_FIELDS.map(({ key, label }) => (
                        <div key={key} className="bg-surface-lowest flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-container/50 transition-colors">
                          <label className="relative cursor-pointer">
                            <input
                              type="color"
                              value={styleguide.colors[key] || "#000000"}
                              onChange={(e) => updateColor(key, e.target.value)}
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
                              onChange={(e) => updateColor(key, e.target.value)}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-outline-variant/10">
                    {(["headingFont", "bodyFont"] as const).map((field) => {
                      // Strip fallback from value for matching
                      const currentValue = (styleguide.typography[field] || "Inter").split(",")[0].trim();
                      return (
                        <div key={field} className="p-4">
                          <p className="text-[10px] font-semibold text-on-surface-outline uppercase tracking-wider mb-2">
                            {field === "headingFont" ? "Headings" : "Body Text"}
                          </p>
                          <select
                            value={currentValue}
                            onChange={(e) => updateFont(field, `${e.target.value}, sans-serif`)}
                            className="w-full text-sm border border-outline-variant/20 rounded-xl px-3 py-2.5 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-colors"
                          >
                            {FONT_OPTIONS.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SettingsInput
                    label="Site Name"
                    value={general.siteName}
                    onChange={(v) => { setGeneral((prev) => ({ ...prev, siteName: v })); markEdited(); }}
                  />
                  <SettingsInput
                    label="Company Name"
                    value={general.companyName}
                    onChange={(v) => { setGeneral((prev) => ({ ...prev, companyName: v })); markEdited(); }}
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
                      onChange={(e) => { setSeo((prev) => ({ ...prev, [key]: e.target.value })); markEdited(); }}
                      placeholder={placeholder}
                      className={cn(
                        "w-full text-sm border rounded-xl px-3.5 py-2.5 bg-surface-lowest text-on-surface placeholder:text-on-surface-outline/40",
                        "focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30 transition-colors",
                        (seo[key]?.length ?? 0) > max ? "border-error/40" : "border-outline-variant/20",
                      )}
                    />
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
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-outline-variant/10 shrink-0">
        <button
          type="button"
          onClick={handleBack}
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

      {/* Discard changes confirmation */}
      <Modal open={showDiscardConfirm} onClose={() => setShowDiscardConfirm(false)} title="Discard changes?">
        <p className="text-sm text-on-surface-variant mb-5">You have unsaved changes. Going back will discard them.</p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowDiscardConfirm(false)}
            className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDiscardConfirm}
            className="px-4 py-2 text-sm font-semibold bg-error text-on-primary rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Discard & Go Back
          </button>
        </div>
      </Modal>
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
