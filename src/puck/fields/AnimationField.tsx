"use client";

import { useState } from "react";

export type AnimationValue = {
  name: string;
  duration: string;
  delay: string;
  easing: string;
  iteration: string;
  fillMode: string;
};

const PRESETS = [
  { label: "None", value: "none", icon: "⊘" },
  { label: "Fade In", value: "fadeIn", icon: "◐" },
  { label: "Fade Up", value: "fadeInUp", icon: "↗" },
  { label: "Fade Down", value: "fadeInDown", icon: "↘" },
  { label: "Slide L", value: "slideInLeft", icon: "←" },
  { label: "Slide R", value: "slideInRight", icon: "→" },
  { label: "Scale", value: "scaleIn", icon: "⊞" },
  { label: "Bounce", value: "bounce", icon: "⤴" },
  { label: "Pulse", value: "pulse", icon: "◉" },
  { label: "Spin", value: "spin", icon: "↻" },
  { label: "Ping", value: "ping", icon: "⊙" },
  { label: "Shimmer", value: "shimmer", icon: "≋" },
];

const EASINGS = [
  { label: "Ease", value: "ease" },
  { label: "Linear", value: "linear" },
  { label: "Ease In", value: "ease-in" },
  { label: "Ease Out", value: "ease-out" },
  { label: "Ease In-Out", value: "ease-in-out" },
];

export function AnimationField({
  value,
  onChange,
}: {
  value: AnimationValue | undefined;
  onChange: (val: AnimationValue) => void;
}) {
  const [previewKey, setPreviewKey] = useState(0);

  const v: AnimationValue = value || {
    name: "none",
    duration: "0.5s",
    delay: "0s",
    easing: "ease-out",
    iteration: "1",
    fillMode: "both",
  };

  const update = (key: keyof AnimationValue, val: string) => {
    onChange({ ...v, [key]: val });
  };

  const cssValue = animationToCss(v);

  const triggerPreview = () => {
    setPreviewKey((k) => k + 1);
  };

  return (
    <div className="space-y-2.5">
      {/* Preset grid */}
      <div className="grid grid-cols-4 gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => update("name", p.value)}
            className={`flex flex-col items-center gap-0.5 py-1.5 rounded-md text-[10px] font-medium transition-all ${
              v.name === p.value
                ? "bg-[var(--puck-color-azure-01)] text-[var(--puck-color-azure-05)] ring-1 ring-[var(--puck-color-azure-03)]"
                : "bg-[var(--puck-color-grey-01)] text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
            title={p.label}
          >
            <span className="text-sm leading-none">{p.icon}</span>
            <span className="truncate w-full text-center leading-tight">{p.label}</span>
          </button>
        ))}
      </div>

      {/* Controls (only when animation selected) */}
      {v.name !== "none" && (
        <div className="space-y-2 pt-1 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-0.5">Duration</label>
              <input
                type="text"
                value={v.duration}
                onChange={(e) => update("duration", e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow"
                placeholder="0.5s"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-0.5">Delay</label>
              <input
                type="text"
                value={v.delay}
                onChange={(e) => update("delay", e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow"
                placeholder="0s"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-0.5">Easing</label>
              <select
                value={v.easing}
                onChange={(e) => update("easing", e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-md px-1.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-shadow"
              >
                {EASINGS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-0.5">Repeat</label>
              <select
                value={v.iteration}
                onChange={(e) => update("iteration", e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-md px-1.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-shadow"
              >
                <option value="1">Once</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option value="infinite">∞</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider block mb-0.5">Fill</label>
              <select
                value={v.fillMode}
                onChange={(e) => update("fillMode", e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-md px-1.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-shadow"
              >
                <option value="none">None</option>
                <option value="forwards">Fwd</option>
                <option value="backwards">Bwd</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-center pt-1">
            <button
              type="button"
              onClick={triggerPreview}
              className="text-[11px] text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Preview
            </button>
            {previewKey > 0 && cssValue && (
              <div
                key={previewKey}
                className="ml-3 w-8 h-8 bg-[var(--puck-color-azure-03)] rounded-md"
                style={{ animation: cssValue }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function animationToCss(v: AnimationValue | undefined): string | undefined {
  if (!v || !v.name || v.name === "none") return undefined;
  return `${v.name} ${v.duration} ${v.easing} ${v.delay} ${v.iteration} ${v.fillMode}`;
}
