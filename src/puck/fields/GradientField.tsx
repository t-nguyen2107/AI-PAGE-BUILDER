"use client";

export type GradientValue = {
  type: "linear" | "radial" | "conic";
  angle: string;
  stops: { color: string; position: string }[];
};

export function GradientField({
  value,
  onChange,
}: {
  value: GradientValue | undefined;
  onChange: (val: GradientValue) => void;
}) {
  const v: GradientValue = value || {
    type: "linear",
    angle: "135deg",
    stops: [
      { color: "#6366f1", position: "0%" },
      { color: "#8b5cf6", position: "100%" },
    ],
  };

  const updateStop = (idx: number, field: keyof GradientValue["stops"][0], val: string) => {
    const stops = [...v.stops];
    stops[idx] = { ...stops[idx], [field]: val };
    onChange({ ...v, stops });
  };

  const addStop = () => {
    onChange({ ...v, stops: [...v.stops, { color: "#ffffff", position: "50%" }] });
  };

  const removeStop = (idx: number) => {
    if (v.stops.length <= 2) return;
    onChange({ ...v, stops: v.stops.filter((_, i) => i !== idx) });
  };

  const preview = gradientToCss(v);

  return (
    <div className="space-y-2">
      {/* Preview */}
      {preview && (
        <div
          className="w-full h-8 rounded border border-gray-200"
          style={{ background: preview }}
        />
      )}

      {/* Type + Angle */}
      <div className="flex gap-1">
        <select
          value={v.type}
          onChange={(e) => onChange({ ...v, type: e.target.value as GradientValue["type"] })}
          className="text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none"
        >
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
          <option value="conic">Conic</option>
        </select>
        {v.type === "linear" && (
          <input
            type="text"
            value={v.angle}
            onChange={(e) => onChange({ ...v, angle: e.target.value })}
            className="w-16 text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none"
            placeholder="135deg"
          />
        )}
      </div>

      {/* Color stops */}
      <div className="space-y-1">
        {v.stops.map((stop, i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              type="color"
              value={stop.color}
              onChange={(e) => updateStop(i, "color", e.target.value)}
              className="w-6 h-6 border border-gray-200 rounded cursor-pointer p-0"
            />
            <input
              type="text"
              value={stop.color}
              onChange={(e) => updateStop(i, "color", e.target.value)}
              className="w-20 text-xs border border-gray-200 rounded px-1 py-0.5 font-mono"
            />
            <input
              type="text"
              value={stop.position}
              onChange={(e) => updateStop(i, "position", e.target.value)}
              className="w-12 text-xs border border-gray-200 rounded px-1 py-0.5"
              placeholder="50%"
            />
            {v.stops.length > 2 && (
              <button
                type="button"
                onClick={() => removeStop(i)}
                className="text-gray-400 hover:text-red-500 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addStop}
          className="text-[11px] text-indigo-500 hover:text-indigo-600"
        >
          + Add color stop
        </button>
      </div>
    </div>
  );
}

export function gradientToCss(v: GradientValue | undefined): string | undefined {
  if (!v || v.stops.length < 2) return undefined;
  const stops = v.stops.map((s) => `${s.color} ${s.position}`).join(", ");
  if (v.type === "linear") return `linear-gradient(${v.angle}, ${stops})`;
  if (v.type === "radial") return `radial-gradient(circle, ${stops})`;
  return `conic-gradient(from ${v.angle}, ${stops})`;
}
