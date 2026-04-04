"use client";

import { useState } from "react";

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
}: {
  value: GeneralData;
  onChange: (val: GeneralData) => void;
}) {
  const update = (key: keyof GeneralData, val: string) => {
    onChange({ ...value, [key]: val || undefined });
  };

  return (
    <div className="space-y-4">
      {/* Site & Company */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Site Name" value={value.siteName || ""} onChange={(v) => update("siteName", v)} placeholder="My Website" />
        <Field label="Company Name" value={value.companyName || ""} onChange={(v) => update("companyName", v)} placeholder="Acme Inc." />
      </div>

      {/* Logo & Favicon */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-gray-600 font-medium block mb-1">Logo URL</label>
          {value.logo ? (
            <div className="relative mb-1.5 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
              <button
                type="button"
                onClick={() => update("logo", "")}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 text-white rounded-full text-[9px] flex items-center justify-center hover:bg-black/70"
              >
                ×
              </button>
            </div>
          ) : null}
          <input
            type="text"
            value={value.logo || ""}
            onChange={(e) => update("logo", e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="/images/logo.svg"
          />
        </div>
        <Field label="Favicon URL" value={value.favicon || ""} onChange={(v) => update("favicon", v)} placeholder="/favicon.ico" />
      </div>

      {/* Analytics */}
      <Field label="Google Analytics ID" value={value.gaCode || ""} onChange={(v) => update("gaCode", v)} placeholder="G-XXXXXXXXXX" />

      {/* Scripts */}
      <div>
        <label className="text-[11px] text-gray-600 font-medium block mb-1">Head Scripts</label>
        <textarea
          value={value.headScripts || ""}
          onChange={(e) => update("headScripts", e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400 min-h-[80px] resize-y"
          placeholder="<!-- Scripts to inject in <head> -->"
        />
      </div>
      <div>
        <label className="text-[11px] text-gray-600 font-medium block mb-1">Body Scripts</label>
        <textarea
          value={value.bodyScripts || ""}
          onChange={(e) => update("bodyScripts", e.target.value)}
          className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400 min-h-[80px] resize-y"
          placeholder="<!-- Scripts before </body> -->"
        />
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] text-gray-600 font-medium block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        placeholder={placeholder}
      />
    </div>
  );
}
