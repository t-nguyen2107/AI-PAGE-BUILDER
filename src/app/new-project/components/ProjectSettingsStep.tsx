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

  const colorFields = [
    { key: "primary", label: "Primary" },
    { key: "secondary", label: "Secondary" },
    { key: "accent", label: "Accent" },
    { key: "background", label: "Background" },
    { key: "surface", label: "Surface" },
    { key: "text", label: "Text" },
    { key: "textMuted", label: "Text Muted" },
    { key: "border", label: "Border" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-outline-variant/30">
        <h2 className="text-sm font-semibold text-on-surface">Project Settings</h2>
        <p className="text-[11px] text-on-surface-outline mt-0.5">
          AI-suggested settings for &ldquo;{projectInfo.name}&rdquo; — edit any field to customize
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-on-surface-outline">Generating styleguide & SEO suggestions...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mx-6 mt-4 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning">
          {error}
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {/* Tab nav */}
          <div className="flex gap-1 px-6 pt-3">
            <button
              type="button"
              onClick={() => setTab("style")}
              className={cn(
                "px-4 py-1.5 text-xs font-medium rounded-lg transition-all",
                tab === "style"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container",
              )}
            >
              Style
            </button>
            <button
              type="button"
              onClick={() => setTab("seo")}
              className={cn(
                "px-4 py-1.5 text-xs font-medium rounded-lg transition-all",
                tab === "seo"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container",
              )}
            >
              SEO
            </button>
          </div>

          {/* Color Preview Bar */}
          {tab === "style" && styleguide.colors && Object.keys(styleguide.colors).length > 0 && (
            <div className="mx-6 mt-3 flex gap-1 rounded-lg overflow-hidden h-8 border border-outline-variant/20">
              {["primary", "secondary", "accent", "background", "surface", "text"].map((key) =>
                styleguide.colors[key] ? (
                  <div
                    key={key}
                    className="flex-1 flex items-center justify-center text-[9px] font-medium"
                    style={{
                      backgroundColor: styleguide.colors[key],
                      color: ["background", "surface"].includes(key) ? "#333" : "#fff",
                    }}
                  >
                    {key}
                  </div>
                ) : null,
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {tab === "style" && (
              <>
                {/* Colors */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider">Colors</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {colorFields.map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={styleguide.colors[key] || "#000000"}
                          onChange={(e) =>
                            setStyleguide((prev) => ({
                              ...prev,
                              colors: { ...prev.colors, [key]: e.target.value },
                            }))
                          }
                          className="w-8 h-8 rounded-lg border border-outline-variant/30 cursor-pointer"
                        />
                        <div className="flex-1">
                          <label className="text-[10px] text-on-surface-outline">{label}</label>
                          <input
                            type="text"
                            value={styleguide.colors[key] || ""}
                            onChange={(e) =>
                              setStyleguide((prev) => ({
                                ...prev,
                                colors: { ...prev.colors, [key]: e.target.value },
                              }))
                            }
                            className="w-full text-xs text-on-surface bg-transparent border-b border-outline-variant/30 focus:border-primary/40 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider">Typography</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-on-surface-outline">Heading Font</label>
                      <select
                        value={styleguide.typography.headingFont || "Inter"}
                        onChange={(e) =>
                          setStyleguide((prev) => ({
                            ...prev,
                            typography: { ...prev.typography, headingFont: e.target.value },
                          }))
                        }
                        className="w-full text-xs border border-outline-variant/30 rounded-lg px-2 py-1.5 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {["Inter", "Poppins", "Montserrat", "Playfair Display", "Lora", "Merriweather", "Roboto", "Open Sans", "Raleway", "Nunito", "Space Grotesk", "DM Sans", "Manrope", "Outfit", "Sora"].map(
                          (f) => (
                            <option key={f} value={`${f}, sans-serif`}>{f}</option>
                          ),
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-on-surface-outline">Body Font</label>
                      <select
                        value={styleguide.typography.bodyFont || "Inter"}
                        onChange={(e) =>
                          setStyleguide((prev) => ({
                            ...prev,
                            typography: { ...prev.typography, bodyFont: e.target.value },
                          }))
                        }
                        className="w-full text-xs border border-outline-variant/30 rounded-lg px-2 py-1.5 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {["Inter", "Poppins", "Montserrat", "Playfair Display", "Lora", "Merriweather", "Roboto", "Open Sans", "Raleway", "Nunito", "Space Grotesk", "DM Sans", "Manrope", "Outfit", "Sora"].map(
                          (f) => (
                            <option key={f} value={`${f}, sans-serif`}>{f}</option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Font preview */}
                  <div className="p-3 rounded-lg bg-surface-container/50 border border-outline-variant/20">
                    <p
                      className="text-lg font-bold text-on-surface mb-1"
                      style={{ fontFamily: styleguide.typography.headingFont || "Inter" }}
                    >
                      Heading Preview
                    </p>
                    <p
                      className="text-sm text-on-surface-outline"
                      style={{ fontFamily: styleguide.typography.bodyFont || "Inter" }}
                    >
                      Body text preview for {projectInfo.name}
                    </p>
                  </div>
                </div>

                {/* General */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider">General</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-on-surface-outline">Site Name</label>
                      <input
                        type="text"
                        value={general.siteName}
                        onChange={(e) => setGeneral((prev) => ({ ...prev, siteName: e.target.value }))}
                        className="w-full text-xs border border-outline-variant/30 rounded-lg px-2 py-1.5 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-on-surface-outline">Company Name</label>
                      <input
                        type="text"
                        value={general.companyName}
                        onChange={(e) => setGeneral((prev) => ({ ...prev, companyName: e.target.value }))}
                        className="w-full text-xs border border-outline-variant/30 rounded-lg px-2 py-1.5 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === "seo" && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider">SEO Metadata</h3>
                {[
                  { key: "seoTitle" as const, label: "SEO Title", max: 60 },
                  { key: "seoDescription" as const, label: "SEO Description", max: 160 },
                  { key: "seoKeywords" as const, label: "Keywords (comma-separated)", max: 200 },
                  { key: "ogTitle" as const, label: "OG Title", max: 60 },
                  { key: "ogDescription" as const, label: "OG Description", max: 160 },
                ].map(({ key, label, max }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-on-surface-outline">{label}</label>
                      <span
                        className={cn(
                          "text-[10px]",
                          (seo[key]?.length ?? 0) > max ? "text-error" : "text-on-surface-outline",
                        )}
                      >
                        {seo[key]?.length ?? 0}/{max}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={seo[key]}
                      onChange={(e) => setSeo((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full text-xs border border-outline-variant/30 rounded-lg px-2 py-1.5 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/30">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-sm align-middle mr-1">arrow_back</span>
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className={cn(
            "px-5 py-2 rounded-lg text-xs font-medium transition-all",
            loading
              ? "bg-surface-container text-on-surface-outline cursor-not-allowed"
              : "bg-primary text-on-primary shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98]",
          )}
        >
          Build My Website
          <span className="material-symbols-outlined text-sm align-middle ml-1">rocket_launch</span>
        </button>
      </div>
    </div>
  );
}
