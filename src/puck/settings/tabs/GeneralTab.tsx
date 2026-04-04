"use client";

import { useState } from "react";
import { MediaManager } from "../../fields/MediaManager";
import { CardSection } from "@/components/ui/card-section";
import { Field, TextAreaField } from "@/components/ui/field";
import { ImagePreview } from "@/components/ui/image-preview";
import { DropZone } from "@/components/ui/dropzone";

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

interface GeneralData {
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
}

type MediaTarget = "logo" | "favicon" | "thumbnail" | "defaultOgImage" | null;

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "vi", label: "Vietnamese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italian" },
  { value: "ru", label: "Russian" },
  { value: "ar", label: "Arabic" },
  { value: "th", label: "Thai" },
  { value: "id", label: "Indonesian" },
];

const SOCIAL_FIELDS: { key: keyof SocialLinks; label: string; icon: string }[] = [
  { key: "facebook", label: "Facebook", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { key: "twitter", label: "X (Twitter)", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { key: "instagram", label: "Instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.988 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { key: "linkedIn", label: "LinkedIn", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  { key: "youtube", label: "YouTube", icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { key: "tikTok", label: "TikTok", icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
];

export function GeneralTab({
  value,
  onChange,
  projectId,
}: {
  value: GeneralData;
  onChange: (val: GeneralData) => void;
  projectId: string;
}) {
  const [mediaTarget, setMediaTarget] = useState<MediaTarget>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(["metaVerification"]));

  const update = <K extends keyof GeneralData>(key: K, val: GeneralData[K]) => {
    onChange({ ...value, [key]: val || undefined });
  };

  const updateSocial = (key: keyof SocialLinks, val: string) => {
    onChange({ ...value, socialLinks: { ...value.socialLinks, [key]: val || undefined } });
  };

  const updateContact = (key: keyof ContactInfo, val: string) => {
    onChange({ ...value, contactInfo: { ...value.contactInfo, [key]: val || undefined } });
  };

  const updateMeta = (key: keyof MetaVerification, val: string) => {
    onChange({ ...value, metaVerification: { ...value.metaVerification, [key]: val || undefined } });
  };

  const toggleCollapse = (section: string) => {
    const next = new Set(collapsedSections);
    if (next.has(section)) next.delete(section);
    else next.add(section);
    setCollapsedSections(next);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Identity */}
      <CardSection title="Identity" description="Basic site information">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Project Name" value={value.name || ""} onChange={(v) => update("name", v)} placeholder="My Project" />
            <Field label="Site Name" value={value.siteName || ""} onChange={(v) => update("siteName", v)} placeholder="My Website" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company Name" value={value.companyName || ""} onChange={(v) => update("companyName", v)} placeholder="Acme Inc." />
            <div>
              <label className="text-xs text-on-surface-variant font-medium block mb-1.5">Language</label>
              <select
                value={value.language || "en"}
                onChange={(e) => update("language", e.target.value)}
                className="w-full text-sm border border-outline-variant rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
          <TextAreaField
            label="Description"
            value={value.description || ""}
            onChange={(v) => update("description", v)}
            placeholder="A brief description of your website or project"
            minRows={3}
          />
        </div>
      </CardSection>

      {/* Brand Assets */}
      <CardSection title="Brand Assets" description="Logo, favicon, and thumbnail for your site">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-2">Logo</label>
            {value.logo ? (
              <ImagePreview src={value.logo} alt="Logo" onReplace={() => setMediaTarget("logo")} onRemove={() => update("logo", "")} />
            ) : (
              <DropZone label="Drop logo" onBrowse={() => setMediaTarget("logo")} onFileSelect={(url) => update("logo", url)} projectId={projectId} />
            )}
          </div>
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-2">Favicon</label>
            {value.favicon ? (
              <ImagePreview src={value.favicon} alt="Favicon" onReplace={() => setMediaTarget("favicon")} onRemove={() => update("favicon", "")} compact />
            ) : (
              <DropZone label="Drop favicon" onBrowse={() => setMediaTarget("favicon")} onFileSelect={(url) => update("favicon", url)} projectId={projectId} compact />
            )}
          </div>
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-2">Thumbnail</label>
            {value.thumbnailUrl ? (
              <ImagePreview src={value.thumbnailUrl} alt="Thumbnail" onReplace={() => setMediaTarget("thumbnail")} onRemove={() => update("thumbnailUrl", "")} />
            ) : (
              <DropZone label="Drop thumbnail" onBrowse={() => setMediaTarget("thumbnail")} onFileSelect={(url) => update("thumbnailUrl", url)} projectId={projectId} />
            )}
          </div>
        </div>
      </CardSection>

      {/* Contact Info */}
      <CardSection title="Contact Info" description="How visitors can reach you">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" value={value.contactInfo?.email || ""} onChange={(v) => updateContact("email", v)} placeholder="hello@example.com" />
          <Field label="Phone" value={value.contactInfo?.phone || ""} onChange={(v) => updateContact("phone", v)} placeholder="+1 (555) 000-0000" />
        </div>
        <div className="mt-4">
          <Field label="Address" value={value.contactInfo?.address || ""} onChange={(v) => updateContact("address", v)} placeholder="123 Main St, City, Country" />
        </div>
      </CardSection>

      {/* Social Media */}
      <CardSection title="Social Media" description="Links to your social profiles">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {SOCIAL_FIELDS.map(({ key, label, icon }) => (
            <div key={key} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d={icon} /></svg>
              </div>
              <input
                type="text"
                value={value.socialLinks?.[key] || ""}
                onChange={(e) => updateSocial(key, e.target.value)}
                className="flex-1 text-sm border border-outline-variant rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-surface"
                placeholder={`${label} URL`}
              />
            </div>
          ))}
        </div>
      </CardSection>

      {/* Analytics & Scripts */}
      <CardSection title="Analytics & Scripts" description="Third-party integrations">
        <div className="space-y-4">
          <Field label="Google Analytics ID" value={value.gaCode || ""} onChange={(v) => update("gaCode", v)} placeholder="G-XXXXXXXXXX" />
          <TextAreaField label="Head Scripts" value={value.headScripts || ""} onChange={(v) => update("headScripts", v)} placeholder="<!-- Scripts to inject in <head> -->" monospace minRows={6} />
          <TextAreaField label="Body Scripts" value={value.bodyScripts || ""} onChange={(v) => update("bodyScripts", v)} placeholder="<!-- Scripts before </body> -->" monospace minRows={6} />
        </div>
      </CardSection>

      {/* Meta Verification — collapsible */}
      <div className="border border-outline-variant rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => toggleCollapse("metaVerification")}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-surface-container transition-colors"
        >
          <div>
            <h3 className="text-xs font-semibold text-on-surface">Meta Verification</h3>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Search console verification codes</p>
          </div>
          <svg className={`w-4 h-4 text-on-surface-variant transition-transform ${collapsedSections.has("metaVerification") ? "" : "rotate-180"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {!collapsedSections.has("metaVerification") && (
          <div className="px-5 pb-4 border-t border-outline-variant space-y-4 pt-4">
            <Field label="Google Search Console" value={value.metaVerification?.google || ""} onChange={(v) => updateMeta("google", v)} placeholder="Verification code" />
            <Field label="Bing Webmaster" value={value.metaVerification?.bing || ""} onChange={(v) => updateMeta("bing", v)} placeholder="Verification code" />
          </div>
        )}
      </div>

      {/* Default SEO Image */}
      <CardSection title="Default SEO Image" description="Fallback OG image used when a page has no specific image set">
        <div>
          {value.defaultOgImage ? (
            <div className="relative group">
              <ImagePreview src={value.defaultOgImage} alt="Default OG" onReplace={() => setMediaTarget("defaultOgImage")} onRemove={() => update("defaultOgImage", "")} />
            </div>
          ) : (
            <DropZone label="Drop OG image" onBrowse={() => setMediaTarget("defaultOgImage")} onFileSelect={(url) => update("defaultOgImage", url)} projectId={projectId} />
          )}
          <p className="text-[11px] text-on-surface-variant mt-2">Recommended: 1200 x 630px. Used as fallback for all pages without a custom OG image.</p>
        </div>
      </CardSection>

      {/* Media Manager */}
      <MediaManager
        open={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        onSelect={(url) => {
          if (mediaTarget === "logo") update("logo", url);
          else if (mediaTarget === "favicon") update("favicon", url);
          else if (mediaTarget === "thumbnail") update("thumbnailUrl", url);
          else if (mediaTarget === "defaultOgImage") update("defaultOgImage", url);
          setMediaTarget(null);
        }}
        projectId={projectId}
        acceptTypes="image/*"
        title={mediaTarget === "logo" ? "Select Logo" : mediaTarget === "favicon" ? "Select Favicon" : mediaTarget === "thumbnail" ? "Select Thumbnail" : "Select OG Image"}
      />
    </div>
  );
}
