"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Puck, createUsePuck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { config } from "./puck.config";
import { apiClient } from "@/lib/api-client";
import type { Data } from "@puckeditor/core";
import { useToastStore } from "@/store/toast-store";
import { SettingsPanel } from "./settings/SettingsPanel";
import { PreviewPanel } from "./PreviewPanel";
import { createAIPlugin } from "./plugins/ai-plugin";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import "./puck-dark.css";
import { UnifiedInspector } from "./inspector/UnifiedInspector";
import { StyleguideProvider, useStyleguideCssVars, type StyleguideColors } from "./inspector/StyleguideContext";

// Puck data sync hook — reads live data from Puck context
const usePuckData = createUsePuck();

function DataSync({ onSync }: { onSync: (d: Data) => void }) {
  const appState = usePuckData((s) => s.appState);

  useEffect(() => {
    const d = appState?.data as Data | undefined;
    if (d) onSync(d);
  }, [appState, onSync]);

  return null;
}

interface PuckEditorProps {
  projectId: string;
  pageId: string;
}

export function PuckEditor({ projectId, pageId }: PuckEditorProps) {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHomePage, setIsHomePage] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [styleguideId, setStyleguideId] = useState("");
  const [styleguideColors, setStyleguideColors] = useState<StyleguideColors | null>(null);
  const [previewData, setPreviewData] = useState<Data | null>(null);
  const addToast = useToastStore((s) => s.addToast);

  const aiPlugin = useMemo(
    () => createAIPlugin({ projectId, pageId, styleguideId }),
    [projectId, pageId, styleguideId]
  );

  const handleDataSync = useCallback((d: Data) => {
    setPreviewData(d);
  }, []);

  // Inject styleguide CSS variables into editor DOM so components render with project colors
  useStyleguideCssVars(styleguideColors);

  // Load page data
  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      try {
        const res = await apiClient.getPage(projectId, pageId);
        if (!res.success || !res.data) {
          setError(res.error?.message ?? "Failed to load page");
          return;
        }

        if (cancelled) return;

        const page = res.data;
        setIsHomePage(page.isHomePage ?? false);

        // Fetch project styleguideId for AI plugin
        apiClient.getProject(projectId).then((pRes) => {
          if (pRes.data?.styleguideId) {
            setStyleguideId(pRes.data.styleguideId);
            // Fetch styleguide colors for inspector context
            apiClient.getStyleguide(projectId).then((sgRes) => {
              if (sgRes.data?.colors) {
                const c = sgRes.data.colors;
                setStyleguideColors({
                  primary: c.primary,
                  secondary: c.secondary,
                  accent: c.accent,
                  background: c.background,
                  surface: c.surface,
                  text: c.text,
                  textSecondary: c.textMuted,
                  border: c.border,
                  error: c.error,
                  success: c.success,
                  warning: c.warning,
                  ...c.custom,
                });
              }
            }).catch(() => {});
          }
        }).catch(() => {});

        const rawTreeData = page.treeData as unknown;

        // Convert treeData to Puck format if needed
        let puckData: Data;
        if (rawTreeData && typeof rawTreeData === "object") {
          const td = rawTreeData as Record<string, unknown>;
          // Already Puck format (has root + content)
          if ("root" in td && "content" in td) {
            puckData = td as unknown as Data;
          } else {
            // Old DOM format — start with empty data
            puckData = {
              root: { props: { title: page.title || "Untitled" } },
              content: [],
            };
          }
        } else {
          puckData = {
            root: { props: { title: page.title || "Untitled" } },
            content: [],
          };
        }

        setData(puckData);
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPage();
    return () => { cancelled = true; };
  }, [projectId, pageId]);

  // Save handler
  const handlePublish = useCallback(
    async (puckData: Data) => {
      try {
        const res = await apiClient.savePage(
          projectId,
          pageId,
          puckData
        );
        if (res.success) {
          addToast("Page saved!", "success");
        } else {
          addToast("Save failed", "error");
        }
      } catch {
        addToast("Save failed", "error");
      }
    },
    [projectId, pageId, addToast]
  );

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-on-surface-variant">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-error text-[24px]">error</span>
          </div>
          <p className="text-sm text-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <div className="h-screen w-screen">
        <StyleguideProvider colors={styleguideColors}>
        <Puck
          config={config}
          data={data}
          onPublish={handlePublish}
          headerTitle="LoomWeave"
          viewports={[
            { width: 1280, label: "Desktop" },
            { width: 768, label: "Tablet" },
            { width: 375, label: "Mobile" },
          ]}
          plugins={[aiPlugin]}
          iframe={{ enabled: false }}
          overrides={{
            headerActions: ({ children }) => (
              <>
                {children}
                <DataSync onSync={handleDataSync} />
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                  title="Preview"
                  aria-label="Preview page"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                </button>
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                  title="Settings"
                  aria-label="Open settings"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                </button>
              </>
            ),
            fields: ({ children, isLoading, itemSelector }) => (
              <UnifiedInspector
                children={children}
                isLoading={isLoading}
                itemSelector={itemSelector}
              />
            ),
          }}
        />
        </StyleguideProvider>
      </div>
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        projectId={projectId}
        pageId={pageId}
        isHomePage={isHomePage}
      />
      <PreviewPanel
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={previewData || data}
        projectId={projectId}
        pageId={pageId}
      />
    </>
  );
}
