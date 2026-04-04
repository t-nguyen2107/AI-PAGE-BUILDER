"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MediaManager } from "../../fields/MediaManager";
import { CardSection } from "@/components/ui/card-section";

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

  const titleColor = titleLen === 0 ? "text-on-surface-outline/40" : titleLen <= 50 ? "text-success" : titleLen <= 60 ? "text-warning" : "text-error";
  const descColor = descLen === 0 ? "text-on-surface-outline/40" : descLen <= 140 ? "text-success" : descLen <= 160 ? "text-warning" : "text-error";

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
    setTimeout(() => setAiOptimizing(false), 2000);
  };

  const inputCls = cn(
    'w-full text-sm rounded-lg px-3 py-2',
    'bg-surface-lowest border border-outline-variant',
    'text-on-surface placeholder:text-on-surface-outline',
    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60',
    'transition-colors'
  );

  const labelCls = "text-xs font-medium text-on-surface-variant block mb-1.5";

  return (
    <div className="space-y-5">
      {/* AI Optimize Banner */}
      <div className={cn(
        'rounded-xl border p-4 flex items-center justify-between',
        'bg-primary/5 border-primary/15'
      )}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg text-on-primary">auto_awesome</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-on-surface">AI SEO Optimizer</div>
            <div className="text-xs text-on-surface-variant">Automatically generate meta title, description, keywords & OG tags</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAiOptimize}
          disabled={aiOptimizing}
          className={cn(
            'px-4 py-2 text-xs font-medium rounded-lg transition-colors',
            'bg-primary text-on-primary shadow-sm',
            'hover:opacity-90 active:scale-[0.98]',
            'disabled:opacity-50 flex items-center gap-1.5 shrink-0'
          )}
        >
          {aiOptimizing ? (
            <>
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              Optimizing...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">bolt</span>
              AI Optimize
            </>
          )}
        </button>
      </div>

      <div className="grid max-lg:grid-cols-1 grid-cols-5 gap-5">
        {/* Left: Form (3 cols) */}
        <div className="col-span-3 max-lg:col-span-1 space-y-4">
          {/* Basic SEO */}
          <CardSection title="Basic SEO">
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Meta Title</label>
                <input
                  type="text"
                  value={value.seoTitle || ""}
                  onChange={(e) => update("seoTitle", e.target.value)}
                  className={inputCls}
                  placeholder="Page title for search engines"
                  maxLength={100}
                />
                <div className={cn('text-xs mt-1 font-medium', titleColor)}>
                  {titleLen}/60 {titleLen > 60 ? "— too long" : titleLen > 50 ? "— approaching limit" : ""}
                </div>
              </div>

              <div>
                <label className={labelCls}>Meta Description</label>
                <textarea
                  value={value.seoDescription || ""}
                  onChange={(e) => update("seoDescription", e.target.value)}
                  className={cn(inputCls, 'min-h-24 resize-y')}
                  placeholder="Brief description for search results"
                  maxLength={300}
                />
                <div className={cn('text-xs mt-1 font-medium', descColor)}>
                  {descLen}/160 {descLen > 160 ? "— too long" : descLen > 140 ? "— approaching limit" : ""}
                </div>
              </div>

              <div>
                <label className={labelCls}>Keywords</label>
                <input
                  type="text"
                  value={value.seoKeywords || ""}
                  onChange={(e) => update("seoKeywords", e.target.value)}
                  className={inputCls}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <div className="text-xs mt-1 text-on-surface-outline">Comma-separated keywords</div>
              </div>
            </div>
          </CardSection>

          {/* Open Graph */}
          <CardSection title="Open Graph">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={cn(labelCls, 'mb-0')}>OG Title</label>
                  {value.seoTitle && !value.ogTitle && (
                    <button type="button" onClick={() => update("ogTitle", value.seoTitle!)} className="text-xs text-primary hover:text-primary/80 font-medium">
                      Copy from Meta Title
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={value.ogTitle || ""}
                  onChange={(e) => update("ogTitle", e.target.value)}
                  className={inputCls}
                  placeholder={value.seoTitle || "Falls back to Meta Title"}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={cn(labelCls, 'mb-0')}>OG Description</label>
                  {value.seoDescription && !value.ogDescription && (
                    <button type="button" onClick={() => update("ogDescription", value.seoDescription!)} className="text-xs text-primary hover:text-primary/80 font-medium">
                      Copy from Meta Description
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={value.ogDescription || ""}
                  onChange={(e) => update("ogDescription", e.target.value)}
                  className={inputCls}
                  placeholder={value.seoDescription || "Falls back to Meta Description"}
                />
              </div>

              <div>
                <label className={labelCls}>OG Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={value.ogImage || ""}
                    onChange={(e) => update("ogImage", e.target.value)}
                    className={cn(inputCls, 'flex-1')}
                    placeholder="https://example.com/image.jpg"
                  />
                  <button type="button" onClick={() => setMediaTarget("og")} className={cn(
                    'px-3 py-2 text-xs font-medium rounded-lg transition-colors shrink-0',
                    'text-primary bg-primary/10 hover:bg-primary/15'
                  )}>
                    Browse
                  </button>
                </div>
                {value.ogImage && (
                  <div className="mt-2 h-16 rounded-lg border border-outline-variant overflow-hidden bg-surface-container flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value.ogImage} alt="OG preview" className="max-h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </CardSection>

          {/* Twitter Card */}
          <CardSection title="Twitter Card">
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Card Type</label>
                <select
                  value={value.twitterCard || "summary"}
                  onChange={(e) => update("twitterCard", e.target.value)}
                  className={inputCls}
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary Large Image</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Twitter Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={value.twitterImage || ""}
                    onChange={(e) => update("twitterImage", e.target.value)}
                    className={cn(inputCls, 'flex-1 min-w-0')}
                    placeholder="Image URL"
                  />
                  <button type="button" onClick={() => setMediaTarget("twitter")} className={cn(
                    'px-3 py-2 text-xs font-medium rounded-lg transition-colors shrink-0',
                    'text-primary bg-primary/10 hover:bg-primary/15'
                  )}>
                    Browse
                  </button>
                </div>
              </div>
            </div>
          </CardSection>

          {/* Advanced */}
          <CardSection title="Advanced">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Canonical URL</label>
                <input
                  type="text"
                  value={value.canonicalUrl || ""}
                  onChange={(e) => update("canonicalUrl", e.target.value)}
                  className={inputCls}
                  placeholder="https://example.com/page"
                />
              </div>

              <div>
                <label className={labelCls}>Structured Data</label>
                <select
                  value={value.structuredDataType || ""}
                  onChange={(e) => update("structuredDataType", e.target.value)}
                  className={inputCls}
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
              <label className={cn(labelCls, 'mb-2')}>Robots</label>
              <div className="flex gap-2">
                <ToggleChip label={isNoindex ? "Noindex" : "Index"} active={!isNoindex} onClick={() => updateRobots(!isNoindex, isNofollow)} />
                <ToggleChip label={isNofollow ? "Nofollow" : "Follow"} active={!isNofollow} onClick={() => updateRobots(isNoindex, !isNofollow)} />
              </div>
            </div>
          </CardSection>
        </div>

        {/* Right: Live Preview (2 cols) */}
        <div className="col-span-2 max-lg:col-span-1">
          <div className="sticky top-0 space-y-4">
            {/* Score Ring */}
            <div className="bg-surface-lowest rounded-xl border border-outline-variant shadow-sm p-4 flex items-center gap-4">
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--outline-variant)" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={score >= 5 ? "var(--success)" : score >= 3 ? "var(--warning)" : "var(--error)"} strokeWidth="3" strokeDasharray={`${(score / 6) * 100}, 100`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-on-surface">{score}/6</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-on-surface">SEO Score</div>
                <div className="text-xs text-on-surface-outline">{score >= 5 ? "Excellent" : score >= 3 ? "Good — some improvements" : "Needs attention"}</div>
              </div>
            </div>

            {/* Google Search Preview */}
            <div className="bg-surface-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="px-4 pt-3 pb-2 border-b border-outline-variant/50 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-on-surface-outline">language</span>
                <span className="text-xs text-on-surface-outline font-medium">Google Preview</span>
              </div>
              <div className="px-4 py-3">
                <div className="text-[15px] text-[#1a0dab] font-normal leading-tight truncate">{value.seoTitle || "Page Title"}</div>
                <div className="text-xs text-[#006621] truncate mt-1">example.com{value.canonicalUrl ? (() => { try { return new URL(value.canonicalUrl).pathname; } catch { return ""; } })() : ""}</div>
                <div className="text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">{value.seoDescription || "A brief description of the page content will appear here."}</div>
              </div>
            </div>

            {/* Social Preview */}
            <div className="bg-surface-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="px-4 pt-3 pb-2 border-b border-outline-variant/50 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-on-surface-outline">share</span>
                <span className="text-xs text-on-surface-outline font-medium">Social Preview</span>
              </div>
              {(value.ogImage || value.twitterImage) ? (
                <div className="h-28 bg-surface-container overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={value.ogImage || value.twitterImage} alt="Social preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-28 bg-surface-container flex items-center justify-center">
                  <span className="text-xs text-on-surface-outline">No social image set</span>
                </div>
              )}
              <div className="px-4 py-2.5 bg-surface-container/80">
                <div className="text-[10px] text-on-surface-outline uppercase">example.com</div>
                <div className="text-xs text-on-surface font-semibold truncate mt-0.5">{value.ogTitle || value.seoTitle || "Page Title"}</div>
                <div className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">{value.ogDescription || value.seoDescription || "Page description"}</div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-surface-lowest rounded-xl border border-outline-variant shadow-sm p-4">
              <div className="text-xs font-semibold text-on-surface mb-2">SEO Checklist</div>
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

/* ── Toggle Chip ── */
function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-xs font-medium rounded-full border transition-colors',
        active
          ? 'bg-success/10 border-success/30 text-success'
          : 'bg-error/10 border-error/30 text-error'
      )}
    >
      {label}
    </button>
  );
}

/* ── Check Item ── */
function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className={cn(
        'w-4 h-4 rounded-full flex items-center justify-center shrink-0',
        done ? 'bg-success/15' : 'bg-surface-container'
      )}>
        {done ? (
          <span className="material-symbols-outlined text-[10px] text-success">check</span>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-on-surface-outline/30" />
        )}
      </div>
      <span className={cn('text-xs', done ? 'text-on-surface' : 'text-on-surface-outline')}>{label}</span>
    </div>
  );
}
