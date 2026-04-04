"use client";

import { useState } from "react";

export type BorderValue = {
  radius: { tl: string; tr: string; br: string; bl: string };
  width: string;
  style: "none" | "solid" | "dashed" | "dotted" | "double";
  color: string;
};

export function BorderField({
  value,
  onChange,
}: {
  value: BorderValue | undefined;
  onChange: (val: BorderValue) => void;
}) {
  const v: BorderValue = value || {
    radius: { tl: "0px", tr: "0px", br: "0px", bl: "0px" },
    width: "0px",
    style: "none",
    color: "#e5e7eb",
  };

  const [linked, setLinked] = useState(true);

  const updateRadius = (corner: string, val: string) => {
    if (linked) {
      onChange({ ...v, radius: { tl: val, tr: val, br: val, bl: val } });
    } else {
      onChange({ ...v, radius: { ...v.radius, [corner]: val } });
    }
  };

  return (
    <div className="space-y-3">
      {/* Radius */}
      <div className="space-y-1">
        <div className="text-[11px] text-gray-600 font-medium">Radius</div>
        <div className="grid grid-cols-4 gap-1">
          {([["tl", "↖"], ["tr", "↗"], ["br", "↘"], ["bl", "↙"]] as const).map(([key, icon]) => (
            <div key={key}>
              <label className="text-[9px] text-gray-500 block text-center">{icon}</label>
              <input
                type="text"
                value={v.radius[key]}
                onChange={(e) => updateRadius(key, e.target.value)}
                className="w-full text-center text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                placeholder="0px"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLinked(!linked)}
          className="text-[10px] text-indigo-500 hover:text-indigo-600"
        >
          {linked ? "Unlink corners" : "Link all corners"}
        </button>
      </div>

      {/* Width + Style + Color */}
      <div className="flex gap-1">
        <input
          type="text"
          value={v.width}
          onChange={(e) => onChange({ ...v, width: e.target.value })}
          className="w-16 text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-400"
          placeholder="1px"
        />
        <select
          value={v.style}
          onChange={(e) => onChange({ ...v, style: e.target.value as BorderValue["style"] })}
          className="flex-1 text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:border-indigo-400"
        >
          <option value="none">None</option>
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
        </select>
        <input
          type="color"
          value={v.color}
          onChange={(e) => onChange({ ...v, color: e.target.value })}
          className="w-8 h-7 border border-gray-200 rounded cursor-pointer"
        />
      </div>
    </div>
  );
}
