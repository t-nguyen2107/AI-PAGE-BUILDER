"use client";

const PRESETS = [
  "#000000", "#ffffff", "#f9fafb", "#f3f4f6", "#e5e7eb", "#d1d5db",
  "#9ca3af", "#6b7280", "#4b5563", "#374151", "#1f2937", "#111827",
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6",
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#0ea5e9", "#10b981",
];

export function ColorPickerField({
  value,
  onChange,
  label,
}: {
  value: string | undefined;
  onChange: (val: string) => void;
  label?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="text-[11px] text-gray-600 font-medium">{label}</div>
      )}
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
          className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-400 font-mono"
          placeholder="transparent or #hex"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform"
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>
    </div>
  );
}
