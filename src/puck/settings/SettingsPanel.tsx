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
import { cn } from "@/lib/utils";
import { generateCssVariables, type StyleGuideData } from "@/lib/css-variables";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  pageId: string;
  isHomePage: boolean;
}

type SocialLinks = {
  facebook?: string; twitter?: string; instagram?: string;
  linkedIn?: string; youtube?: string; tikTok?: string;
};

type ContactInfo = {
  email?: string; phone?: string; address?: string;
};

type MetaVerification = {
  google?: string; bing?: string;
};

type GeneralData = {
  name?: string;
  description?: string;
  siteName?: string;
  companyName?: string;
  logo?: string;
  favicon?: string;
  thumbnailUrl?: string;
  language?: string;
  gaCode?: string;
  headScripts?: string;
  bodyScripts?: string;
  socialLinks?: SocialLinks;
  contactInfo?: ContactInfo;
  metaVerification?: MetaVerification;
  defaultOgImage?: string;
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

type NavItem = {
  id: string;
  label: string;
  icon: string;
};

function safeJsonParse<T>(val: string | undefined | null): T | undefined {
  if (!val || val === "{}" || val === "null") return undefined;
  try { return JSON.parse(val) as T; } catch { return undefined; }
}

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
          const p = projectRes.data as unknown as Record<string, unknown>;
          setGeneral({
            name: p.name as string | undefined,
            description: p.description as string | undefined,
            siteName: p.siteName as string | undefined,
            companyName: p.companyName as string | undefined,
            logo: p.logo as string | undefined,
            favicon: p.favicon as string | undefined,
            thumbnailUrl: p.thumbnailUrl as string | undefined,
            language: p.language as string | undefined,
            gaCode: p.gaCode as string | undefined,
            headScripts: p.headScripts as string | undefined,
            bodyScripts: p.bodyScripts as string | undefined,
            socialLinks: safeJsonParse<SocialLinks>(p.socialLinks as string | undefined),
            contactInfo: safeJsonParse<ContactInfo>(p.contactInfo as string | undefined),
            metaVerification: safeJsonParse<MetaVerification>(p.metaVerification as string | undefined),
            defaultOgImage: p.defaultOgImage as string | undefined,
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
        const projectPayload = {
          ...general,
          socialLinks: general.socialLinks ? JSON.stringify(general.socialLinks) : undefined,
          contactInfo: general.contactInfo ? JSON.stringify(general.contactInfo) : undefined,
          metaVerification: general.metaVerification ? JSON.stringify(general.metaVerification) : undefined,
        };
        promises.push(apiClient.updateProject(projectId, projectPayload));
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
    <div className="fixed inset-0 z-100 flex items-center justify-center max-sm:p-0 p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Panel — full-screen on mobile */}
      <div className="relative w-full max-w-5xl max-sm:h-full max-sm:rounded-none bg-surface-lowest rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn" style={{ maxHeight: "88vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-lowest border-b border-outline-variant/50">
          <div>
            <h2 className="text-sm font-semibold text-on-surface">{isHomePage ? "Project Settings" : "Page Settings"}</h2>
            <p className="text-[11px] text-on-surface-outline mt-0.5">Configure your {isHomePage ? "project" : "page"} settings</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-1.5 text-xs font-medium text-on-primary bg-primary hover:opacity-90 rounded-lg transition-colors disabled:opacity-50 shadow-sm active:scale-[0.98]"
            >
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Saving...
                </span>
              ) : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Body: Sidebar + Content */}
        <div className="flex flex-1 min-h-0 max-sm:flex-col">
          {/* Left Sidebar — horizontal scroll on mobile */}
          <nav className="max-sm:w-full max-sm:border-b max-sm:border-r-0 w-52 border-r border-outline-variant/50 bg-surface-container/80 py-2 shrink-0">
            {!isHomePage && (
              <div className="px-4 pb-2 mb-1 mx-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-[10px] text-warning leading-relaxed">
                  Style guide is inherited from the project homepage.
                </p>
              </div>
            )}
            <div className="max-sm:flex max-sm:overflow-x-auto max-sm:gap-1 px-2 space-y-0.5 max-sm:space-y-0">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium rounded-lg transition-all max-sm:w-auto max-sm:shrink-0',
                    activeTab === item.id
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  )}
                >
                  <NavIcon name={item.icon} active={activeTab === item.id} />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content Area — subtle bg so cards pop */}
          <div className="flex-1 bg-surface-container/40 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-on-surface-outline">Loading settings...</span>
              </div>
            ) : (
              <div className="p-5 max-sm:p-4">
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
  return <span className={`material-symbols-outlined text-lg ${active ? "text-on-primary" : "text-on-surface-outline"}`}>{name}</span>;
}
