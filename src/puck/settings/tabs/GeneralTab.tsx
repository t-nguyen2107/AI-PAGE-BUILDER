"use client";

import { useState } from "react";
import { MediaManager } from "../../fields/MediaManager";
import { CardSection } from "@/components/ui/card-section";
import { Field, TextAreaField } from "@/components/ui/field";
import { ImagePreview } from "@/components/ui/image-preview";
import { DropZone } from "@/components/ui/dropzone";

interface GeneralData {
  siteName?: string;
  companyName?: string;
  logo?: string;
  favicon?: string;
  gaCode?: string;
  headScripts?: string;
  bodyScripts?: string;
}

export function GeneralTab({
  value,
  onChange,
  projectId,
}: {
  value: GeneralData;
  onChange: (val: GeneralData) => void;
  projectId: string;
}) {
  const [mediaTarget, setMediaTarget] = useState<"logo" | "favicon" | null>(null);

  const update = (key: keyof GeneralData, val: string) => {
    onChange({ ...value, [key]: val || undefined });
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Identity */}
      <CardSection title="Identity" description="Basic site information">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Site Name" value={value.siteName || ""} onChange={(v) => update("siteName", v)} placeholder="My Website" />
          <Field label="Company Name" value={value.companyName || ""} onChange={(v) => update("companyName", v)} placeholder="Acme Inc." />
        </div>
      </CardSection>

      {/* Brand Assets */}
      <CardSection title="Brand Assets" description="Logo and favicon for your site">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-2">Logo</label>
            {value.logo ? (
              <ImagePreview
                src={value.logo}
                alt="Logo"
                onReplace={() => setMediaTarget("logo")}
                onRemove={() => update("logo", "")}
              />
            ) : (
              <DropZone
                label="Drop logo here"
                onBrowse={() => setMediaTarget("logo")}
                onFileSelect={(url) => update("logo", url)}
                projectId={projectId}
              />
            )}
          </div>
          <div>
            <label className="text-xs text-on-surface-variant font-medium block mb-2">Favicon</label>
            {value.favicon ? (
              <ImagePreview
                src={value.favicon}
                alt="Favicon"
                onReplace={() => setMediaTarget("favicon")}
                onRemove={() => update("favicon", "")}
                compact
              />
            ) : (
              <DropZone
                label="Drop favicon here"
                onBrowse={() => setMediaTarget("favicon")}
                onFileSelect={(url) => update("favicon", url)}
                projectId={projectId}
                compact
              />
            )}
          </div>
        </div>
      </CardSection>

      {/* Analytics & Scripts */}
      <CardSection title="Analytics & Scripts" description="Third-party integrations">
        <div className="space-y-4">
          <Field label="Google Analytics ID" value={value.gaCode || ""} onChange={(v) => update("gaCode", v)} placeholder="G-XXXXXXXXXX" />

          <TextAreaField
            label="Head Scripts"
            value={value.headScripts || ""}
            onChange={(v) => update("headScripts", v)}
            placeholder="<!-- Scripts to inject in <head> -->"
            monospace
            minRows={6}
          />

          <TextAreaField
            label="Body Scripts"
            value={value.bodyScripts || ""}
            onChange={(v) => update("bodyScripts", v)}
            placeholder="<!-- Scripts before </body> -->"
            monospace
            minRows={6}
          />
        </div>
      </CardSection>

      {/* Media Manager */}
      <MediaManager
        open={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        onSelect={(url) => {
          if (mediaTarget === "logo") update("logo", url);
          else if (mediaTarget === "favicon") update("favicon", url);
          setMediaTarget(null);
        }}
        projectId={projectId}
        acceptTypes="image/*"
        title={mediaTarget === "logo" ? "Select Logo" : "Select Favicon"}
      />
    </div>
  );
}
