"use client";

import { useState } from "react";
import { MediaManager } from "../../fields/MediaManager";

interface SeoData {
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
}

export function SeoTab({
  value,
  onChange,
  projectId,
}: {
  value: SeoData;
  onChange: (val: SeoData) => void;
  projectId: string;
}) {
  const [mediaTarget, setMediaTarget] = useState<"og" | "twitter" | null>(null);
  const [aiOptimizing, setAiOptimizing] = useState(false);

  const update = (key: keyof SeoData, val: string) => {
    onChange({ ...value, [key]: val || undefined });
  };

  const titleLen = (value.seoTitle || "").length;
  const descLen = (value.seoDescription || "").length;

  const robotsStr = value.robots || "index, follow";
  const isNoindex = robotsStr.includes("noindex");
  const isNofollow = robotsStr.includes("nofollow");

  const updateRobots = (noindex: boolean, nofollow: boolean) => {
    update("robots", `${noindex ? "noindex" : "index"}, ${nofollow ? "nofollow" : "follow"}`);
  };

  const titleColor = titleLen === 0 ? "text-gray-300" : titleLen <= 50 ? "text-emerald-500" : titleLen <= 60 ? "text-amber-500" : "text-red-500";
  const descColor = descLen === 0 ? "text-gray-300" : descLen <= 140 ? "text-emerald-500" : descLen <= 160 ? "text-amber-500" : "text-red-500";

  const checks = [
    !!value.seoTitle,
    !!value.seoDescription,
    !!value.ogImage,
    !!value.canonicalUrl,
    titleLen > 0 && titleLen <= 60,
    descLen > 0 && descLen <= 160,
  ];
  const score = checks.filter(Boolean).length;

  const handleAiOptimize = async () => {
    setAiOptimizing(true);
    // TODO: Call AI endpoint to generate optimized SEO metadata
    // For now, placeholder
    setTimeout(() => setAiOptimizing(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* AI Optimize Banner */}
      <div className="bg-linear-to-r from-indigo-50 to-violet-50 rounded-lg border border-indigo-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">AI SEO Optimizer</div>
            <div className="text-xs text-gray-500">Automatically generate meta title, description, keywords & OG tags</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAiOptimize}
          disabled={aiOptimizing}
          className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          {aiOptimizing ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Optimizing...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              AI Optimize
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Left: Form (3 cols) */}
        <div className="col-span-3 space-y-4">
          {/* Basic SEO */}
          <Card title="Basic SEO">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 font-medium block mb-1.5">Meta Title</label>
                <input
                  type="text"
                  value={value.seoTitle || ""}
                  onChange={(e) => update("seoTitle", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                  placeholder="Page title for search engines"
                  maxLength={100}
                />
                <div className={`text-xs mt-1 font-medium ${titleColor}`}>
                  {titleLen}/60 {titleLen > 60 ? "— too long" : titleLen > 50 ? "— approaching limit" : ""}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 font-medium block mb-1.5">Meta Description</label>
                <textarea
                  value={value.seoDescription || ""}
                  onChange={(e) => update("seoDescription", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 min-h-24 resize-y bg-white"
                  placeholder="Brief description for search results"
                  maxLength={300}
                />
                <div className={`text-xs mt-1 font-medium ${descColor}`}>
                  {descLen}/160 {descLen > 160 ? "— too long" : descLen > 140 ? "— approaching limit" : ""}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 font-medium block mb-1.5">Keywords</label>
                <input
                  type="text"
                  value={value.seoKeywords || ""}
                  onChange={(e) => update("seoKeywords", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                  placeholder="keyword1, keyword2, keyword3"
                />
                <div className="text-xs mt-1 text-gray-400">Comma-separated keywords</div>
              </div>
            </div>
          </Card>

          {/* Open Graph */}
          <Card title="Open Graph">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm text-gray-600 font-medium">OG Title</label>
                  {value.seoTitle && !value.ogTitle && (
                    <button type="button" onClick={() => update("ogTitle", value.seoTitle!)} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">
                      Copy from Meta Title
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={value.ogTitle || ""}
                  onChange={(e) => update("ogTitle", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                  placeholder={value.seoTitle || "Falls back to Meta Title"}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm text-gray-600 font-medium">OG Description</label>
                  {value.seoDescription && !value.ogDescription && (
                    <button type="button" onClick={() => update("ogDescription", value.seoDescription!)} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">
                      Copy from Meta Description
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={value.ogDescription || ""}
                  onChange={(e) => update("ogDescription", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                  placeholder={value.seoDescription || "Falls back to Meta Description"}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 font-medium block mb-1.5">OG Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={value.ogImage || ""}
                    onChange={(e) => update("ogImage", e.target.value)}
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button type="button" onClick={() => setMediaTarget("og")} className="px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors shrink-0">
                    Browse
                  </button>
                </div>
                {value.ogImage && (
                  <div className="mt-2 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value.ogImage} alt="OG preview" className="max-h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Twitter Card */}
          <Card title="Twitter Card">
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 font-medium block mb-1.5">Card Type</label>
                <select
                  value={value.twitterCard || "summary"}
                  onChange={(e) => update("twitterCard", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium block mb-1.5">Twitter Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={value.twitterImage || ""}
                    onChange={(e) => update("twitterImage", e.target.value)}
                    className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                    placeholder="Image URL"
                  />
                  <button type="button" onClick={() => setMediaTarget("twitter")} className="px-3 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors shrink-0">
                    Browse
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Advanced */}
          <Card title="Advanced">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 font-medium block mb-1.5">Canonical URL</label>
                <input
                  type="text"
                  value={value.canonicalUrl || ""}
                  onChange={(e) => update("canonicalUrl", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                  placeholder="https://example.com/page"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 font-medium block mb-1.5">Structured Data</label>
                <select
                  value={value.structuredDataType || ""}
                  onChange={(e) => update("structuredDataType", e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                >
                  <option value="">None</option>
                  <option value="WebPage">WebPage</option>
                  <option value="Article">Article</option>
                  <option value="Product">Product</option>
                  <option value="FAQPage">FAQPage</option>
                  <option value="LocalBusiness">LocalBusiness</option>
                  <option value="BreadcrumbList">BreadcrumbList</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-sm text-gray-600 font-medium block mb-2">Robots</label>
              <div className="flex gap-2">
                <ToggleChip label={isNoindex ? "Noindex" : "Index"} active={!isNoindex} onClick={() => updateRobots(!isNoindex, isNofollow)} />
                <ToggleChip label={isNofollow ? "Nofollow" : "Follow"} active={!isNofollow} onClick={() => updateRobots(isNoindex, !isNofollow)} />
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Live Preview (2 cols) */}
        <div className="col-span-2">
          <div className="sticky top-0 space-y-4">
            {/* Score Ring */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-center gap-4">
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={score >= 5 ? "#22c55e" : score >= 3 ? "#f59e0b" : "#ef4444"} strokeWidth="3" strokeDasharray={`${(score / 6) * 100}, 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">{score}/6</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">SEO Score</div>
                <div className="text-xs text-gray-400">{score >= 5 ? "Excellent" : score >= 3 ? "Good — some improvements" : "Needs attention"}</div>
              </div>
            </div>

            {/* Google Search Preview */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <span className="text-xs text-gray-400 font-medium">Google Preview</span>
              </div>
              <div className="px-4 py-3">
                <div className="text-[15px] text-[#1a0dab] font-normal leading-tight truncate">{value.seoTitle || "Page Title"}</div>
                <div className="text-xs text-[#006621] truncate mt-1">example.com{value.canonicalUrl ? (() => { try { return new URL(value.canonicalUrl).pathname; } catch { return ""; } })() : ""}</div>
                <div className="text-xs text-[#545454] line-clamp-2 mt-1 leading-relaxed">{value.seoDescription || "A brief description of the page content will appear here."}</div>
              </div>
            </div>

            {/* Social Preview */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span className="text-xs text-gray-400 font-medium">Social Preview</span>
              </div>
              {(value.ogImage || value.twitterImage) ? (
                <div className="h-28 bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={value.ogImage || value.twitterImage} alt="Social preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-28 bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-400">No social image set</span>
                </div>
              )}
              <div className="px-4 py-2.5 bg-[#f0f2f5]">
                <div className="text-[10px] text-[#65676b] uppercase">example.com</div>
                <div className="text-xs text-[#050505] font-semibold truncate mt-0.5">{value.ogTitle || value.seoTitle || "Page Title"}</div>
                <div className="text-xs text-[#65676b] line-clamp-2 mt-0.5">{value.ogDescription || value.seoDescription || "Page description"}</div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">SEO Checklist</div>
              <div className="space-y-1">
                <CheckItem done={!!value.seoTitle} label="Meta title is set" />
                <CheckItem done={!!value.seoDescription} label="Meta description is set" />
                <CheckItem done={!!value.ogImage} label="OG image is set" />
                <CheckItem done={!!value.canonicalUrl} label="Canonical URL is set" />
                <CheckItem done={titleLen > 0 && titleLen <= 60} label="Title length is optimal" />
                <CheckItem done={descLen > 0 && descLen <= 160} label="Description length is optimal" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Manager */}
      <MediaManager
        open={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        onSelect={(url) => {
          if (mediaTarget === "og") update("ogImage", url);
          else if (mediaTarget === "twitter") update("twitterImage", url);
          setMediaTarget(null);
        }}
        projectId={projectId}
        acceptTypes="image/*"
        title="Select Image"
      />
    </div>
  );
}

/* ── Card ── */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="px-4 py-3.5">{children}</div>
    </div>
  );
}

/* ── Toggle Chip ── */
function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${active ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}
    >
      {label}
    </button>
  );
}

/* ── Check Item ── */
function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-emerald-100" : "bg-gray-100"}`}>
        {done ? (
          <svg className="w-2.5 h-2.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        )}
      </div>
      <span className={`text-xs ${done ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
    </div>
  );
}
