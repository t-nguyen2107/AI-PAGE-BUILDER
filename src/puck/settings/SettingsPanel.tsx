"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Tabs, TabPanels } from "@/components/ui/tabs";
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
};

type StyleGuideData = {
  colors: Record<string, string>;
  typography: {
    headingFont?: string;
    bodyFont?: string;
    monoFont?: string;
    fontSizes?: Record<string, string>;
    fontWeights?: Record<string, string>;
  };
  spacing: { values: Record<string, string> };
  cssVariables: Record<string, string>;
};

export function SettingsPanel({ open, onClose, projectId, pageId, isHomePage }: SettingsPanelProps) {
  const addToast = useToastStore((s) => s.addToast);

  // Loading / saving state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // General (project-level)
  const [general, setGeneral] = useState<GeneralData>({});

  // Style guide (project-level)
  const [styleGuide, setStyleGuide] = useState<StyleGuideData>({
    colors: {},
    typography: {},
    spacing: { values: {} },
    cssVariables: {},
  });

  // Page settings (page-level)
  const [pageData, setPageData] = useState<PageData>({ title: "", slug: "" });

  // SEO (page-level)
  const [seo, setSeo] = useState<SeoData>({});

  // Tab state
  const homeTabs = [
    { id: "general", label: "General" },
    { id: "styleguide", label: "Style Guide" },
    { id: "seo", label: "SEO" },
  ];
  const subTabs = [
    { id: "page", label: "Page Settings" },
    { id: "seo", label: "SEO" },
  ];
  const tabs = isHomePage ? homeTabs : subTabs;
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  // Reset tab when context changes
  useEffect(() => {
    setActiveTab(tabs[0].id);
  }, [isHomePage, open]);

  // Fetch data on open
  useEffect(() => {
    if (!open) return;
    setLoading(true);

    async function fetchData() {
      try {
        // Fetch project data
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

          // Fetch styleguide if project has one
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

        // Fetch page data
        const pageRes = await apiClient.getPage(projectId, pageId);
        if (pageRes.success && pageRes.data) {
          const pg = pageRes.data as unknown as {
            title: string; slug: string;
            seoTitle?: string; seoDescription?: string; seoKeywords?: string;
          };
          setPageData({ title: pg.title, slug: pg.slug });
          setSeo({
            seoTitle: pg.seoTitle,
            seoDescription: pg.seoDescription,
            seoKeywords: pg.seoKeywords,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [open, projectId, pageId]);

  // Save handler
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const promises: Promise<unknown>[] = [];

      if (isHomePage) {
        // Save project general settings
        promises.push(apiClient.updateProject(projectId, general));
        // Save style guide
        promises.push(apiClient.updateStyleguide(projectId, styleGuide as unknown as Parameters<typeof apiClient.updateStyleguide>[1]));
        // Save page SEO
        promises.push(apiClient.updatePage(projectId, pageId, { ...seo, seoKeywords: seo.seoKeywords ? seo.seoKeywords.split(',').map(k => k.trim()).filter(Boolean) : undefined }));
      } else {
        // Save page settings + SEO
        promises.push(apiClient.updatePage(projectId, pageId, { ...pageData, ...seo, seoKeywords: seo.seoKeywords ? seo.seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean) : undefined }));
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

  return (
    <Modal open={open} onClose={onClose} title={isHomePage ? "Project Settings" : "Page Settings"} maxWidth="max-w-2xl">
      <div className="space-y-4">
        {/* Subpage notice */}
        {!isHomePage && (
          <div className="text-[11px] text-gray-500 bg-gray-50 rounded-md px-3 py-2 border border-gray-100">
            Style guide is inherited from the project.{" "}
            <button
              type="button"
              className="text-indigo-500 hover:text-indigo-600 underline"
              onClick={() => {
                const homeRes = apiClient.listPages(projectId);
                // Navigate to homepage settings is complex; just show a note
                addToast("Switch to homepage to edit project settings", "info");
              }}
            >
              Edit project settings
            </button>
          </div>
        )}

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <TabPanels className="min-h-[300px] max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-xs text-gray-400">Loading...</div>
          ) : (
            <>
              {activeTab === "general" && (
                <GeneralTab value={general} onChange={setGeneral} />
              )}
              {activeTab === "styleguide" && (
                <StyleGuideTab value={styleGuide} onChange={setStyleGuide} />
              )}
              {activeTab === "page" && (
                <PageSettingsTab value={pageData} onChange={setPageData} />
              )}
              {activeTab === "seo" && (
                <SeoTab value={seo} onChange={setSeo} />
              )}
            </>
          )}
        </TabPanels>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-md transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
