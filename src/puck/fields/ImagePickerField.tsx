"use client";

import { useState, useRef } from "react";

export type ImageValue = {
  url: string;
  alt: string;
  objectFit: "cover" | "contain" | "fill" | "none";
};

const SUGGESTED_IMAGES = [
  "/stock/hero/hero-1.jpg",
  "/stock/hero/hero-2.jpg",
  "/stock/hero/hero-3.jpg",
  "/stock/hero/hero-4.jpg",
  "/stock/hero/hero-5.jpg",
  "/stock/bg/bg-1.jpg",
  "/stock/bg/bg-2.jpg",
  "/stock/bg/bg-3.jpg",
  "/stock/team/team-1.jpg",
  "/stock/team/team-2.jpg",
  "/stock/team/team-3.jpg",
  "/stock/team/team-4.jpg",
  "/stock/testimonial/testimonial-1.jpg",
  "/stock/testimonial/testimonial-2.jpg",
];

export function ImagePickerField({
  value,
  onChange,
  label,
}: {
  value: ImageValue | undefined;
  onChange: (val: ImageValue) => void;
  label?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"url" | "library">("url");

  const v: ImageValue = value || {
    url: "",
    alt: "",
    objectFit: "cover",
  };

  const update = (key: keyof ImageValue, val: string) => {
    onChange({ ...v, [key]: val });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...v, url: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      )}

      {/* Preview */}
      {v.url && (
        <div className="relative w-full h-24 rounded border border-gray-200 overflow-hidden bg-[var(--inspector-surface)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={v.url}
            alt={v.alt || "Preview"}
            className="w-full h-full"
            style={{ objectFit: v.objectFit }}
          />
          <button
            type="button"
            onClick={() => onChange({ ...v, url: "" })}
            className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/70"
          >
            ×
          </button>
        </div>
      )}

      {/* Tab switch */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`flex-1 text-[11px] py-1 rounded border ${
            tab === "url" ? "border-indigo-400 bg-[var(--inspector-accent-surface)] text-indigo-600" : "border-gray-200 text-gray-500"
          }`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setTab("library")}
          className={`flex-1 text-[11px] py-1 rounded border ${
            tab === "library" ? "border-indigo-400 bg-[var(--inspector-accent-surface)] text-indigo-600" : "border-gray-200 text-gray-500"
          }`}
        >
          Library
        </button>
      </div>

      {tab === "url" && (
        <>
          <input
            type="text"
            value={v.url}
            onChange={(e) => update("url", e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-400"
            placeholder="https://example.com/image.jpg"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full text-[11px] py-1.5 rounded border border-dashed border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-500"
          >
            Upload from device
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </>
      )}

      {tab === "library" && (
        <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
          {SUGGESTED_IMAGES.map((img) => (
            <button
              key={img}
              type="button"
              onClick={() => onChange({ ...v, url: img })}
              className={`w-full aspect-square rounded border overflow-hidden ${
                v.url === img ? "border-indigo-400 ring-1 ring-indigo-400" : "border-gray-200"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Alt text */}
      <input
        type="text"
        value={v.alt}
        onChange={(e) => update("alt", e.target.value)}
        className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-400"
        placeholder="Alt text (accessibility)"
      />

      {/* Object fit */}
      <div className="flex gap-1">
        {(["cover", "contain", "fill", "none"] as const).map((fit) => (
          <button
            key={fit}
            type="button"
            onClick={() => update("objectFit", fit)}
            className={`flex-1 text-[10px] py-1 rounded border ${
              v.objectFit === fit ? "border-indigo-400 bg-[var(--inspector-accent-surface)] text-indigo-600" : "border-gray-200 text-gray-500"
            }`}
          >
            {fit.charAt(0).toUpperCase() + fit.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
