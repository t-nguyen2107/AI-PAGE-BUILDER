"use client";

export type ShadowValue = {
  x: string;
  y: string;
  blur: string;
  spread: string;
  color: string;
  inset: boolean;
};

export function ShadowField({
  value,
  onChange,
}: {
  value: ShadowValue | undefined;
  onChange: (val: ShadowValue) => void;
}) {
  const v: ShadowValue = value || { x: "0px", y: "4px", blur: "12px", spread: "0px", color: "#00000020", inset: false };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-1">
        {([
          ["x", "X", "0px"],
          ["y", "Y", "4px"],
          ["blur", "Blur", "12px"],
          ["spread", "Spread", "0px"],
        ] as const).map(([key, label, placeholder]) => (
          <div key={key}>
            <label className="text-[9px] text-gray-400 block text-center">{label}</label>
            <input
              type="text"
              value={v[key as keyof ShadowValue] as string}
              onChange={(e) => onChange({ ...v, [key]: e.target.value })}
              className="w-full text-center text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={v.color.startsWith("#") && v.color.length >= 7 ? v.color.slice(0, 7) : "#000000"}
          onChange={(e) => onChange({ ...v, color: e.target.value })}
          className="w-7 h-7 border border-gray-200 rounded cursor-pointer shrink-0"
        />
        <input
          type="text"
          value={v.color}
          onChange={(e) => onChange({ ...v, color: e.target.value })}
          className="flex-1 w-10 text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          placeholder="#00000020"
        />
        <button
          type="button"
          onClick={() => onChange({ ...v, inset: !v.inset })}
          className={`px-2 py-1 text-[10px] font-medium rounded border transition-colors ${
            v.inset
              ? "bg-indigo-50 border-indigo-300 text-indigo-600"
              : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500"
          }`}
        >
          Inset
        </button>
      </div>
    </div>
  );
}

export function shadowToCss(v: ShadowValue | undefined): string | undefined {
  if (!v) return undefined;
  if (v.x === "0px" && v.y === "0px" && v.blur === "0px") return undefined;
  return `${v.inset ? "inset " : ""}${v.x} ${v.y} ${v.blur} ${v.spread} ${v.color}`;
}
