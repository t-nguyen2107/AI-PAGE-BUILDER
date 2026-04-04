"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { config } from "./puck.config";
import { apiClient } from "@/lib/api-client";
import type { Data } from "@puckeditor/core";
import { useToastStore } from "@/store/toast-store";
import { SettingsPanel } from "./settings/SettingsPanel";
import { createAIPlugin } from "./plugins/ai-plugin";

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
  const addToast = useToastStore((s) => s.addToast);

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
        <Puck
          config={config}
          data={data}
          onPublish={handlePublish}
          headerTitle="AI Page Builder"
          viewports={[
            { width: 1280, label: "Desktop" },
            { width: 768, label: "Tablet" },
            { width: 375, label: "Mobile" },
          ]}
          overrides={{
            headerActions: ({ children }) => (
              <>
                {children}
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Settings"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </>
            ),
          }}
        />
      </div>
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        projectId={projectId}
        pageId={pageId}
        isHomePage={isHomePage}
      />
    </>
  );
}
