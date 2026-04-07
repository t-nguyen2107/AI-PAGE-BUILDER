"use client";

import { useStyleguideColors } from "../inspector/StyleguideContext";

const SEMANTIC_LABELS: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  background: "Background",
  surface: "Surface",
  text: "Text",
  textSecondary: "Text 2nd",
  border: "Border",
  error: "Error",
  success: "Success",
  warning: "Warning",
};

export function ColorPickerField({
  value,
  onChange,
  label,
}: {
  value: string | undefined;
  onChange: (val: string) => void;
  label?: string;
}) {
  const styleguideColors = useStyleguideColors();

  // Build palette entries from styleguide
  const paletteEntries: Array<{ key: string; color: string; label: string }> = [];
  if (styleguideColors) {
    for (const [key, val] of Object.entries(styleguideColors)) {
      if (val && typeof val === "string" && val.startsWith("#")) {
        paletteEntries.push({ key, color: val, label: SEMANTIC_LABELS[key] || key });
      }
    }
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="text-[11px] text-gray-600">{label}</div>
      )}

      {/* Styleguide palette */}
      {paletteEntries.length > 0 && (
        <div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Style</div>
          <div className="flex flex-wrap gap-1">
            {paletteEntries.map(({ key, color, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => onChange(color)}
                className={`w-6 h-6 rounded-md border-2 transition-all cursor-pointer hover:scale-110 ${
                  (value || "") === color
                    ? "border-[var(--inspector-accent)] scale-110 ring-1 ring-[var(--inspector-accent)]"

                    : "border-gray-200 hover:border-gray-300"
                }`}
                style={{ backgroundColor: color }}
                title={`${label}: ${color}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Color input */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 border border-gray-200 rounded cursor-pointer p-0"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
          placeholder="#hex or transparent"
        />
      </div>
    </div>
  );
}
