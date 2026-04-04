"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProfileData {
  businessType?: string;
  businessName?: string;
  industry?: string;
  tone?: string;
  preferredStyle?: string;
  language?: string;
  totalSessions?: number;
  lastAnalysisAt?: string | null;
}

interface AIProfileSummaryProps {
  projectId: string;
  onOpenEditor: () => void;
}

// ─── Profile badge colors ───────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  food: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  wellness: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  healthcare: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  technology: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  business: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  education: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  retail: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  creative: "bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20",
  marketing: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  services: "bg-teal-500/10 text-teal-600 border-teal-500/20",
};

// ─── Component ──────────────────────────────────────────────────────────────

export function AIProfileSummary({ projectId, onOpenEditor }: AIProfileSummaryProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [memoryCount, setMemoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/ai/profile?projectId=${projectId}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setProfile(json.data.profile);
        setMemoryCount(json.data.memoryCount ?? 0);
      }
    } catch {
      /* non-fatal */
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // No profile yet and no memories — show nothing
  if (!loading && !profile && memoryCount === 0) return null;

  const industryColor = profile?.industry
    ? CATEGORY_COLORS[profile.industry] ?? "bg-primary/10 text-primary border-primary/20"
    : "bg-primary/10 text-primary border-primary/20";

  return (
    <div className="flex items-center gap-1.5">
      {/* Insights badge */}
      {memoryCount > 0 && (
        <button
          onClick={onOpenEditor}
          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border transition-all duration-200 hover:shadow-sm bg-primary/8 text-primary border-primary/20 hover:border-primary/40"
          title={`${memoryCount} AI insights learned across ${profile?.totalSessions ?? 0} sessions`}
        >
          <span className="material-symbols-outlined text-[12px]">psychology</span>
          {memoryCount}
        </button>
      )}

      {/* Industry indicator */}
      {profile?.industry && (
        <span
          className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${industryColor}`}
          title={`Industry: ${profile.industry}`}
        >
          {profile.businessType || profile.industry}
        </span>
      )}

      {/* Language indicator (non-English) */}
      {profile?.language && profile.language !== "en" && (
        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/40">
          {profile.language.toUpperCase()}
        </span>
      )}
    </div>
  );
}
