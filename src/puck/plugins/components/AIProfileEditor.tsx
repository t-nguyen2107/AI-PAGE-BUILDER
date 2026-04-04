"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ProfileData {
  businessType?: string;
  businessName?: string;
  industry?: string;
  targetAudience?: string;
  tone?: string;
  preferredStyle?: string;
  language?: string;
}

interface MemoryEntry {
  id: string;
  category: string;
  content: string;
  confidence: number | null;
  timesReferenced: number;
  createdAt: string;
}

interface AIProfileEditorProps {
  projectId: string;
  onClose: () => void;
}

// ─── Category badges ────────────────────────────────────────────────────────

const CATEGORY_BADGE: Record<string, { icon: string; color: string }> = {
  preference: { icon: "tune", color: "bg-violet-500/10 text-violet-600" },
  correction: { icon: "undo", color: "bg-amber-500/10 text-amber-600" },
  pattern: { icon: "pattern", color: "bg-blue-500/10 text-blue-600" },
  fact: { icon: "verified", color: "bg-emerald-500/10 text-emerald-600" },
  instruction: { icon: "campaign", color: "bg-sky-500/10 text-sky-600" },
};

// ─── Component ──────────────────────────────────────────────────────────────

export function AIProfileEditor({ projectId, onClose }: AIProfileEditorProps) {
  const [tab, setTab] = useState<"profile" | "memories">("profile");
  const [profile, setProfile] = useState<ProfileData>({});
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [totalMemories, setTotalMemories] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/ai/profile?projectId=${projectId}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data.profile) {
        setProfile(json.data.profile);
      }
    } catch { /* non-fatal */ }
  }, [projectId]);

  const loadMemories = useCallback(async () => {
    try {
      const res = await fetch(`/api/ai/profile/memories?projectId=${projectId}&limit=50`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setMemories(json.data.memories);
        setTotalMemories(json.data.total);
      }
    } catch { /* non-fatal */ }
  }, [projectId]);

  useEffect(() => {
    Promise.all([loadProfile(), loadMemories()]).finally(() => setLoading(false));
  }, [loadProfile, loadMemories]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/ai/profile?projectId=${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* non-fatal */ }
    setSaving(false);
  };

  const handleDeleteMemory = async (memoryId: string) => {
    try {
      await fetch(`/api/ai/profile/memories?projectId=${projectId}&memoryId=${memoryId}`, {
        method: "DELETE",
      });
      setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      setTotalMemories((prev) => prev - 1);
    } catch { /* non-fatal */ }
  };

  const handleResetAll = async () => {
    if (!confirm("Reset all AI knowledge for this project? This cannot be undone.")) return;
    try {
      await fetch(`/api/ai/profile?projectId=${projectId}`, { method: "DELETE" });
      setProfile({});
      setMemories([]);
      setTotalMemories(0);
    } catch { /* non-fatal */ }
  };

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant">
        <span className="material-symbols-outlined text-[20px] animate-spin mr-2">progress_activity</span>
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/50">
        <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
        <span className="text-[13px] font-semibold text-on-surface flex-1">AI Knowledge</span>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-7 h-7 rounded-lg text-on-surface-outline hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/50">
        <button
          onClick={() => setTab("profile")}
          className={`flex-1 px-4 py-2.5 text-[12px] font-semibold transition-colors ${
            tab === "profile"
              ? "text-primary border-b-2 border-primary"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setTab("memories")}
          className={`flex-1 px-4 py-2.5 text-[12px] font-semibold transition-colors ${
            tab === "memories"
              ? "text-primary border-b-2 border-primary"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Memories {totalMemories > 0 && `(${totalMemories})`}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "profile" ? (
          <div className="flex flex-col gap-3">
            <FieldInput label="Business Name" value={profile.businessName ?? ""} onChange={(v) => updateField("businessName", v)} placeholder="e.g. Bloom Coffee" />
            <FieldInput label="Business Type" value={profile.businessType ?? ""} onChange={(v) => updateField("businessType", v)} placeholder="e.g. Coffee Shop, SaaS, Agency" />
            <FieldInput label="Industry" value={profile.industry ?? ""} onChange={(v) => updateField("industry", v)} placeholder="e.g. food, technology, healthcare" />
            <FieldInput label="Target Audience" value={profile.targetAudience ?? ""} onChange={(v) => updateField("targetAudience", v)} placeholder="e.g. Young professionals, remote workers" />
            <FieldInput label="Tone" value={profile.tone ?? ""} onChange={(v) => updateField("tone", v)} placeholder="e.g. warm, professional, playful" />
            <FieldInput label="Preferred Style" value={profile.preferredStyle ?? ""} onChange={(v) => updateField("preferredStyle", v)} placeholder="e.g. modern, minimal, elegant" />
            <FieldInput label="Language" value={profile.language ?? ""} onChange={(v) => updateField("language", v)} placeholder="e.g. en, vi" />

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg bg-primary text-on-primary hover:shadow-md hover:shadow-primary/20 active:scale-[0.97] transition-all disabled:opacity-50"
              >
                {saving ? (
                  <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                ) : saved ? (
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                ) : (
                  <span className="material-symbols-outlined text-[14px]">save</span>
                )}
                {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
              </button>
              <button
                onClick={handleResetAll}
                className="flex items-center justify-center gap-1 px-3 py-2 text-[12px] font-semibold rounded-lg border border-error/40 text-error bg-error-container/60 hover:bg-error-container transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">delete_forever</span>
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {memories.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-on-surface-variant">
                <span className="material-symbols-outlined text-[24px] mb-2 opacity-40">psychology_alt</span>
                <p className="text-[12px]">No memories yet. AI learns as you chat.</p>
              </div>
            ) : (
              memories.map((m) => {
                const badge = CATEGORY_BADGE[m.category] ?? { icon: "info", color: "bg-slate-500/10 text-slate-600" };
                return (
                  <div
                    key={m.id}
                    className="flex items-start gap-2 p-2.5 rounded-lg border border-outline-variant/40 bg-surface-lowest"
                  >
                    <span className={`shrink-0 flex items-center justify-center w-5 h-5 rounded text-[11px] ${badge.color}`}>
                      <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-on-surface leading-snug">{m.content}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-on-surface-outline/60">
                        <span>{m.category}</span>
                        {m.confidence != null && <span>{Math.round(m.confidence * 100)}%</span>}
                        <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMemory(m.id)}
                      className="shrink-0 flex items-center justify-center w-5 h-5 rounded text-on-surface-outline/40 hover:text-error hover:bg-error/10 transition-colors"
                      title="Delete memory"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Field input helper ─────────────────────────────────────────────────────

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-on-surface-variant mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-outline-variant/60 bg-surface-lowest text-on-surface placeholder:text-on-surface-outline/40 outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all"
      />
    </div>
  );
}
