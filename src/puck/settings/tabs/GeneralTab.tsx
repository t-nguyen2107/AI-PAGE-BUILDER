"use client";

import { useState, useRef } from "react";
import { MediaManager } from "../../fields/MediaManager";

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
      <Card title="Identity" description="Basic site information">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Site Name" value={value.siteName || ""} onChange={(v) => update("siteName", v)} placeholder="My Website" />
          <Field label="Company Name" value={value.companyName || ""} onChange={(v) => update("companyName", v)} placeholder="Acme Inc." />
        </div>
      </Card>

      {/* Brand Assets */}
      <Card title="Brand Assets" description="Logo and favicon for your site">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-2">Logo</label>
            {value.logo ? (
              <ImagePreview src={value.logo} onRemove={() => update("logo", "")} onBrowse={() => setMediaTarget("logo")} />
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
            <label className="text-xs text-gray-600 font-medium block mb-2">Favicon</label>
            {value.favicon ? (
              <FaviconPreview src={value.favicon} onRemove={() => update("favicon", "")} onBrowse={() => setMediaTarget("favicon")} />
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
      </Card>

      {/* Analytics & Scripts */}
      <Card title="Analytics & Scripts" description="Third-party integrations">
        <div className="space-y-4">
          <Field label="Google Analytics ID" value={value.gaCode || ""} onChange={(v) => update("gaCode", v)} placeholder="G-XXXXXXXXXX" />

          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1.5">Head Scripts</label>
            <textarea
              value={value.headScripts || ""}
              onChange={(e) => update("headScripts", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 min-h-24 resize-y bg-white"
              placeholder="<!-- Scripts to inject in <head> -->"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1.5">Body Scripts</label>
            <textarea
              value={value.bodyScripts || ""}
              onChange={(e) => update("bodyScripts", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 min-h-24 resize-y bg-white"
              placeholder="<!-- Scripts before </body> -->"
            />
          </div>
        </div>
      </Card>

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

/* ── Section Card ── */
function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

/* ── Text Field ── */
function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-gray-600 font-medium block mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
        placeholder={placeholder}
      />
    </div>
  );
}

/* ── Drop Zone ── */
function DropZone({ label, onBrowse, onFileSelect, projectId, compact }: {
  label: string;
  onBrowse: () => void;
  onFileSelect: (url: string) => void;
  projectId: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId);
    try {
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.data?.url) {
        onFileSelect(data.data.url);
      }
    } catch {
      // Silent fail — user can use Browse instead
    }
  };

  const h = "h-28";

  return (
    <div
      className={`${h} rounded-xl border-2 border-dashed ${dragging ? "border-indigo-400 bg-indigo-50/50" : "border-gray-300 bg-gray-50"} flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:border-indigo-300 hover:bg-indigo-50/30`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
    >
      <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <span className="text-xs text-gray-400">{label}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onBrowse(); }}
        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
      >
        or browse files
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

/* ── Logo Preview ── */
function ImagePreview({ src, onRemove, onBrowse }: { src: string; onRemove: () => void; onBrowse: () => void }) {
  return (
    <div className="relative h-28 rounded-lg border border-gray-200 bg-white overflow-hidden flex items-center justify-center p-4 group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Logo" className="max-h-full max-w-full object-contain" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button
          type="button"
          onClick={onBrowse}
          className="px-3 py-1.5 text-[11px] font-medium text-white bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 border border-white/30"
        >
          Replace
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="px-3 py-1.5 text-[11px] font-medium text-white bg-red-500/60 backdrop-blur rounded-lg hover:bg-red-500/80 border border-red-400/30"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

/* ── Favicon Preview ── */
function FaviconPreview({ src, onRemove, onBrowse }: { src: string; onRemove: () => void; onBrowse: () => void }) {
  return (
    <div className="h-28 rounded-lg border border-gray-200 bg-white overflow-hidden flex items-center justify-center group relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="w-10 h-10 object-contain" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button
          type="button"
          onClick={onBrowse}
          className="px-3 py-1.5 text-[11px] font-medium text-white bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 border border-white/30"
        >
          Replace
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="px-3 py-1.5 text-[11px] font-medium text-white bg-red-500/60 backdrop-blur rounded-lg hover:bg-red-500/80 border border-red-400/30"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
