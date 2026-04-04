"use client";

import { useState } from "react";

export type SpacingValue = {
  top: string;
  right: string;
  bottom: string;
  left: string;
};

const UNITS = ["px", "rem", "em", "%", "vw", "vh"];

function parseValue(val: string): { num: string; unit: string } {
  const m = val.match(/^(-?[\d.]+)(px|rem|em|%|vw|vh)?$/);
  if (m) return { num: m[1], unit: m[2] || "px" };
  return { num: val, unit: "px" };
}

export function SpacingField({
  value,
  onChange,
  label,
}: {
  value: SpacingValue | undefined;
  onChange: (val: SpacingValue) => void;
  label?: string;
}) {
  const [locked, setLocked] = useState(true);
  const v: SpacingValue = value || { top: "0px", right: "0px", bottom: "0px", left: "0px" };

  const handleChange = (dir: keyof SpacingValue, val: string) => {
    if (locked) {
      onChange({ top: val, right: val, bottom: val, left: val });
    } else {
      onChange({ ...v, [dir]: val });
    }
  };

  const dirs: { key: keyof SpacingValue; label: string }[] = [
    { key: "top", label: "T" },
    { key: "right", label: "R" },
    { key: "bottom", label: "B" },
    { key: "left", label: "L" },
  ];

  return (
    <div className="space-y-2">
      {label && (
        <div className="text-[11px] text-gray-600 font-medium">{label}</div>
      )}
      <div className="flex items-center gap-1">
        {dirs.map(({ key, label: l }) => (
          <div key={key} className="flex-1">
            <label className="text-[10px] text-gray-500 block text-center mb-0.5">{l}</label>
            <input
              type="text"
              value={v[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full text-center text-xs border border-gray-200 rounded px-1 py-1.5 focus:outline-none focus:border-indigo-400"
              placeholder="0px"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLocked(!locked)}
          className="p-1.5 text-gray-400 hover:text-indigo-500 mt-3"
          title={locked ? "Unlink sides" : "Link all sides"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {locked ? (
              <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>
            ) : (
              <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 5-5 5 5 0 0 1 5 5" /></>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
