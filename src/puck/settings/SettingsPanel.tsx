"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { apiClient } from "@/lib/api-client";
import { useToastStore } from "@/store/toast-store";
import type { Project } from "@/types/project";
import type { Styleguide } from "@/types/styleguide";
import { GeneralTab } from "./tabs/GeneralTab";
import { StyleGuideTab } from "./tabs/StyleGuideTab";
import { PageSettingsTab } from "./tabs/PageSettingsTab";
import { SeoTab } from "./tabs/SeoTab";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  pageId: string;
  isHomePage: boolean;
}

type GeneralData = {
  siteName?: string;
  companyName?: string;
  logo?: string;
  favicon?: string;
  gaCode?: string;
  headScripts?: string;
  bodyScripts?: string;
};

type PageData = {
  title: string;
  slug: string;
};

type SeoData = {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robots?: string;
  twitterCard?: string;
  twitterImage?: string;
  structuredDataType?: string;
};

type HeadingStyle = {
  font?: string; weight?: string; size?: string; lineHeight?: string;
  letterSpacing?: string; marginTop?: string; marginBottom?: string; color?: string;
};
type BodyStyle = {
  font?: string; weight?: string; size?: string; lineHeight?: string;
  letterSpacing?: string; marginBottom?: string; color?: string;
};
type ButtonStyle = {
  bg?: string; text?: string; border?: string; borderRadius?: string;
  paddingX?: string; paddingY?: string; fontSize?: string; fontWeight?: string;
  hoverBg?: string; hoverText?: string; hoverBorder?: string;
  hoverShadow?: string; hoverScale?: string; transition?: string;
};
type StyleGuideData = {
  colors: Record<string, string>;
  typography: {
    headingFont?: string;
    bodyFont?: string;
    monoFont?: string;
    fontSizes?: Record<string, string>;
    fontWeights?: Record<string, string>;
    lineHeights?: Record<string, string>;
    letterSpacings?: Record<string, string>;
    headingStyles?: Record<string, HeadingStyle>;
    bodyStyles?: Record<string, BodyStyle>;
  };
  spacing: { values: Record<string, string> };
  cssVariables: Record<string, string>;
  buttons?: { primary?: ButtonStyle; secondary?: ButtonStyle };
};

const DEFAULT_COLORS: Record<string, string> = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  accent: "#f59e0b",
  background: "#ffffff",
  surface: "#f9fafb",
  text: "#111827",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  error: "#ef4444",
  success: "#22c55e",
  warning: "#f97316",
};

function generateCssVariables(styleGuide: StyleGuideData): Record<string, string> {
  const vars: Record<string, string> = {};
  const colors = { ...DEFAULT_COLORS, ...styleGuide.colors };

  vars["--color-primary"] = colors.primary;
  vars["--color-secondary"] = colors.secondary;
  vars["--color-accent"] = colors.accent;
  vars["--color-background"] = colors.background;
  vars["--color-surface"] = colors.surface;
  vars["--color-text"] = colors.text;
  vars["--color-text-muted"] = colors.textMuted;
  vars["--color-border"] = colors.border;
  vars["--color-error"] = colors.error;
  vars["--color-success"] = colors.success;
  vars["--color-warning"] = colors.warning;

  const typo = styleGuide.typography;
  if (typo.headingFont) vars["--font-heading"] = typo.headingFont;
  if (typo.bodyFont) vars["--font-body"] = typo.bodyFont;
  if (typo.monoFont) vars["--font-mono"] = typo.monoFont;
  if (typo.fontSizes) {
    Object.entries(typo.fontSizes).forEach(([k, v]) => {
      vars[`--text-${k}`] = v;
    });
  }
  if (typo.lineHeights) {
    Object.entries(typo.lineHeights).forEach(([k, v]) => {
      vars[`--leading-${k}`] = v;
    });
  }
  if (typo.letterSpacings) {
    Object.entries(typo.letterSpacings).forEach(([k, v]) => {
      vars[`--tracking-${k}`] = v;
    });
  }

  Object.entries(styleGuide.spacing.values).forEach(([k, v]) => {
    vars[`--spacing-${k}`] = v;
  });

  return vars;
}

type NavItem = {
  id: string;
  label: string;
  icon: string;
};

export function SettingsPanel({ open, onClose, projectId, pageId, isHomePage }: SettingsPanelProps) {
  const addToast = useToastStore((s) => s.addToast);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [general, setGeneral] = useState<GeneralData>({});

  const [styleGuide, setStyleGuide] = useState<StyleGuideData>({
    colors: {},
    typography: {},
    spacing: { values: {} },
    cssVariables: {},
  });

  const [pageData, setPageData] = useState<PageData>({ title: "", slug: "" });
  const [seo, setSeo] = useState<SeoData>({});

  const homeNav: NavItem[] = [
    { id: "general", label: "General", icon: "settings" },
    { id: "styleguide", label: "Style Guide", icon: "palette" },
    { id: "seo", label: "SEO", icon: "search" },
  ];
  const subNav: NavItem[] = [
    { id: "page", label: "Page Settings", icon: "description" },
    { id: "seo", label: "SEO", icon: "search" },
  ];
  const navItems = isHomePage ? homeNav : subNav;
  const [activeTab, setActiveTab] = useState(navItems[0].id);

  useEffect(() => {
    setActiveTab(navItems[0].id);
  }, [isHomePage, open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    async function fetchData() {
      try {
        const projectRes = await apiClient.getProject(projectId);
        if (projectRes.success && projectRes.data) {
          const p = projectRes.data as unknown as Project;
          setGeneral({
            siteName: p.siteName,
            companyName: p.companyName,
            logo: p.logo,
            favicon: p.favicon,
            gaCode: p.gaCode,
            headScripts: p.headScripts,
            bodyScripts: p.bodyScripts,
          });

          const sgRes = await apiClient.getStyleguide(projectId);
          if (sgRes.success && sgRes.data) {
            const sg = sgRes.data as unknown as Styleguide;
            setStyleGuide({
              colors: (sg.colors as unknown as Record<string, string>) || {},
              typography: (sg.typography as unknown as StyleGuideData["typography"]) || {},
              spacing: (sg.spacing as unknown as { values: Record<string, string> }) || { values: {} },
              cssVariables: (sg.cssVariables as unknown as Record<string, string>) || {},
            });
          }
        }

        const pageRes = await apiClient.getPage(projectId, pageId);
        if (pageRes.success && pageRes.data) {
          const pg = pageRes.data as unknown as {
            title: string; slug: string;
            seoTitle?: string; seoDescription?: string; seoKeywords?: string[];
            ogTitle?: string; ogDescription?: string; ogImage?: string;
            canonicalUrl?: string; robots?: string;
            twitterCard?: string; twitterImage?: string;
            structuredData?: string;
          };
          setPageData({ title: pg.title, slug: pg.slug });
          setSeo({
            seoTitle: pg.seoTitle,
            seoDescription: pg.seoDescription,
            seoKeywords: Array.isArray(pg.seoKeywords) ? pg.seoKeywords.join(", ") : pg.seoKeywords,
            ogTitle: pg.ogTitle,
            ogDescription: pg.ogDescription,
            ogImage: pg.ogImage,
            canonicalUrl: pg.canonicalUrl,
            robots: pg.robots,
            twitterCard: pg.twitterCard,
            twitterImage: pg.twitterImage,
            structuredDataType: pg.structuredData,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [open, projectId, pageId]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const promises: Promise<unknown>[] = [];

      if (isHomePage) {
        promises.push(apiClient.updateProject(projectId, general));
        const sgWithVars = {
          ...styleGuide,
          cssVariables: generateCssVariables(styleGuide),
        };
        promises.push(apiClient.updateStyleguide(projectId, sgWithVars as unknown as Parameters<typeof apiClient.updateStyleguide>[1]));
        promises.push(apiClient.updatePage(projectId, pageId, {
          ...seo,
          seoKeywords: seo.seoKeywords ? seo.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean) : undefined,
        }));
      } else {
        promises.push(apiClient.updatePage(projectId, pageId, {
          ...pageData,
          ...seo,
          seoKeywords: seo.seoKeywords ? seo.seoKeywords.split(",").map((k: string) => k.trim()).filter(Boolean) : undefined,
        }));
      }

      await Promise.all(promises);
      addToast("Settings saved!", "success");
      onClose();
    } catch {
      addToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  }, [isHomePage, projectId, pageId, general, styleGuide, pageData, seo, addToast, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: "88vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{isHomePage ? "Project Settings" : "Page Settings"}</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Configure your {isHomePage ? "project" : "page"} settings</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Saving...
                </span>
              ) : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Body: Sidebar + Content */}
        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar */}
          <nav className="w-52 border-r border-gray-200 bg-gray-50/80 py-2 shrink-0">
            {!isHomePage && (
              <div className="px-4 pb-2 mb-1 mx-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-[10px] text-amber-600 leading-relaxed">
                  Style guide is inherited from the project homepage.
                </p>
              </div>
            )}
            <div className="px-2 space-y-0.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium rounded-lg transition-all ${
                    activeTab === item.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white"
                  }`}
                >
                  <NavIcon name={item.icon} active={activeTab === item.id} />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content Area — subtle bg so cards pop */}
          <div className="flex-1 bg-gray-50/40 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <svg className="w-6 h-6 text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs text-gray-400">Loading settings...</span>
              </div>
            ) : (
              <div className="p-5">
                {activeTab === "general" && (
                  <GeneralTab value={general} onChange={setGeneral} projectId={projectId} />
                )}
                {activeTab === "styleguide" && (
                  <StyleGuideTab value={styleGuide} onChange={setStyleGuide} />
                )}
                {activeTab === "page" && (
                  <PageSettingsTab value={pageData} onChange={setPageData} />
                )}
                {activeTab === "seo" && (
                  <SeoTab value={seo} onChange={setSeo} projectId={projectId} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const cls = `w-4 h-4 ${active ? "text-white" : "text-gray-400"}`;
  switch (name) {
    case "settings":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
    case "palette":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" /><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" /><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" /><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>;
    case "search":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>;
    case "description":
      return <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10,9 9,9 8,9" /></svg>;
    default:
      return null;
  }
}
