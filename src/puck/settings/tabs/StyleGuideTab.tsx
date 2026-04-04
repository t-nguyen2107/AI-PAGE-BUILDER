"use client";

import { useState } from "react";
import { ColorPickerField } from "../../fields/ColorPickerField";

interface StyleGuideData {
  colors: Record<string, string>;
  typography: {
    headingFont?: string;
    bodyFont?: string;
    monoFont?: string;
    fontSizes?: Record<string, string>;
    fontWeights?: Record<string, string>;
  };
  spacing: { values: Record<string, string> };
  cssVariables: Record<string, string>;
}

const COLOR_KEYS = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "text", label: "Text" },
  { key: "textMuted", label: "Text Muted" },
  { key: "border", label: "Border" },
  { key: "error", label: "Error" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
] as const;

const FONT_OPTIONS = [
  { label: "Inherit", value: "" },
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "Plus Jakarta Sans", value: "'Plus Jakarta Sans', sans-serif" },
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { label: "Work Sans", value: "'Work Sans', sans-serif" },
  { label: "Geist", value: "Geist, sans-serif" },
  { label: "DM Sans", value: "'DM Sans', sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Newsreader", value: "Newsreader, serif" },
  { label: "Noto Serif", value: "'Noto Serif', serif" },
  { label: "Source Serif 4", value: "'Source Serif 4', serif" },
  { label: "Monospace", value: "ui-monospace, 'Cascadia Code', monospace" },
];

const DEFAULT_COLORS: Record<string, string> = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  accent: "#f59e0b",
  background: "#ffffff",
  surface: "#f9fafb",
  text: "#111827",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  error: "#ef4444",
  success: "#22c55e",
  warning: "#f97316",
};

export function StyleGuideTab({
  value,
  onChange,
}: {
  value: StyleGuideData;
  onChange: (val: StyleGuideData) => void;
}) {
  const colors = { ...DEFAULT_COLORS, ...value.colors };
  const typography = value.typography || {};
  const spacing = value.spacing?.values || {};
  const cssVars = value.cssVariables || {};

  // Accordion state
  const [openSection, setOpenSection] = useState<string>("colors");

  const toggle = (section: string) => setOpenSection(openSection === section ? "" : section);

  return (
    <div className="divide-y divide-gray-100">
      {/* Colors */}
      <Section title="Colors" icon="🎨" open={openSection === "colors"} onToggle={() => toggle("colors")}>
        <div className="grid grid-cols-2 gap-3">
          {COLOR_KEYS.map(({ key, label }) => (
            <ColorPickerField
              key={key}
              label={label}
              value={colors[key]}
              onChange={(val) => onChange({ ...value, colors: { ...colors, [key]: val } })}
            />
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography" icon="A" open={openSection === "typography"} onToggle={() => toggle("typography")}>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(["headingFont", "bodyFont", "monoFont"] as const).map((key) => (
              <div key={key}>
                <label className="text-[10px] text-gray-500 font-medium block mb-0.5 capitalize">
                  {key.replace("Font", "")}
                </label>
                <select
                  value={typography[key] || ""}
                  onChange={(e) => onChange({
                    ...value,
                    typography: { ...typography, [key]: e.target.value || undefined },
                  })}
                  className="w-full text-[11px] border border-gray-200 rounded-md px-1.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Spacing */}
      <Section title="Spacing Scale" icon="⬡" open={openSection === "spacing"} onToggle={() => toggle("spacing")}>
        <KeyValueEditor
          pairs={Object.entries(spacing).map(([k, v]) => ({ key: k, value: v }))}
          onChange={(pairs) => {
            const values: Record<string, string> = {};
            pairs.forEach((p) => { if (p.key) values[p.key] = p.value; });
            onChange({ ...value, spacing: { values } });
          }}
        />
      </Section>

      {/* CSS Variables */}
      <Section title="CSS Variables" icon="⚙" open={openSection === "css"} onToggle={() => toggle("css")}>
        <KeyValueEditor
          pairs={Object.entries(cssVars).map(([k, v]) => ({ key: k, value: v }))}
          onChange={(pairs) => {
            const vars: Record<string, string> = {};
            pairs.forEach((p) => { if (p.key) vars[p.key] = p.value; });
            onChange({ ...value, cssVariables: vars });
          }}
        />
      </Section>
    </div>
  );
}

function Section({ title, icon, open, onToggle, children }: {
  title: string; icon: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className={open ? "border-l-2 border-l-indigo-400 bg-indigo-50/20" : "border-l-2 border-l-transparent"}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 transition-colors"
      >
        <span className="text-xs opacity-70">{icon}</span>
        <span className="flex-1 text-left uppercase tracking-wider">{title}</span>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="px-3 pb-3 pt-1 space-y-2.5">{children}</div>}
    </div>
  );
}

function KeyValueEditor({ pairs, onChange }: {
  pairs: { key: string; value: string }[];
  onChange: (pairs: { key: string; value: string }[]) => void;
}) {
  const items = pairs.length === 0 ? [{ key: "", value: "" }] : pairs;

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <input
            type="text"
            value={item.key}
            onChange={(e) => {
              const updated = [...items];
              updated[i] = { ...updated[i], key: e.target.value };
              onChange(updated);
            }}
            className="w-24 text-[11px] border border-gray-200 rounded px-1.5 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="name"
          />
          <input
            type="text"
            value={item.value}
            onChange={(e) => {
              const updated = [...items];
              updated[i] = { ...updated[i], value: e.target.value };
              onChange(updated);
            }}
            className="flex-1 text-[11px] border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="value"
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="text-gray-400 hover:text-red-500 text-xs px-1"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { key: "", value: "" }])}
        className="text-[10px] text-indigo-500 hover:text-indigo-600 font-medium"
      >
        + Add entry
      </button>
    </div>
  );
}
