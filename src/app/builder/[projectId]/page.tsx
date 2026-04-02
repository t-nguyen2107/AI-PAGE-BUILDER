"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function BuilderProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = React.use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAndRedirect() {
      try {
        const pagesRes = await apiClient.listPages(projectId);
        if (!pagesRes.success || !pagesRes.data || pagesRes.data.length === 0) {
          setError("No pages found for this project");
          return;
        }

        if (cancelled) return;

        const pages = pagesRes.data;
        const homePage = pages.find((p) => p.isHomePage) ?? pages[0];
        router.replace(`/builder/${projectId}/pages/${homePage.id}`);
      } catch (err) {
        if (!cancelled) setError(String(err));
      }
    }

    loadAndRedirect();
    return () => { cancelled = true; };
  }, [projectId, router]);

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

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-surface">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
