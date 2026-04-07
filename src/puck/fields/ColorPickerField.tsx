"use client";

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
    </div>
  );
}
