"use client";

import { useEffect } from "react";

const FONT_FAMILIES = [
  { label: "System Default", value: "system-ui, -apple-system, sans-serif" },
  { label: "Inter", value: "Inter, system-ui, sans-serif", google: "Inter" },
  { label: "Plus Jakarta Sans", value: "'Plus Jakarta Sans', sans-serif", google: "Plus+Jakarta+Sans" },
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif", google: "Space+Grotesk" },
  { label: "Work Sans", value: "'Work Sans', sans-serif", google: "Work+Sans" },
  { label: "Geist", value: "Geist, sans-serif", google: "Geist" },
  { label: "DM Sans", value: "'DM Sans', sans-serif", google: "DM+Sans" },
  { label: "IBM Plex Sans", value: "'IBM Plex Sans', sans-serif", google: "IBM+Plex+Sans" },
  { label: "Montserrat", value: "Montserrat, sans-serif", google: "Montserrat" },
  { label: "Lexend", value: "Lexend, sans-serif", google: "Lexend" },
  { label: "Manrope", value: "Manrope, sans-serif", google: "Manrope" },
  { label: "Newsreader", value: "Newsreader, serif", google: "Newsreader" },
  { label: "Noto Serif", value: "'Noto Serif', serif", google: "Noto+Serif" },
  { label: "Source Serif 4", value: "'Source Serif 4', serif", google: "Source+Serif+4" },
  { label: "EB Garamond", value: "'EB Garamond', serif", google: "EB+Garamond" },
  { label: "Monospace", value: "ui-monospace, 'Cascadia Code', monospace" },
];

const loadedFonts = new Set<string>();

function loadGoogleFont(cssValue: string) {
  const f = FONT_FAMILIES.find((f) => f.value === cssValue);
  if (!f?.google || loadedFonts.has(f.google)) return;
  loadedFonts.add(f.google);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${f.google}:ital,wght@0,100..900;1,100..900&display=swap`;
  document.head.appendChild(link);
}

export type TypographyValue = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  color: string;
  textAlign: "left" | "center" | "right" | "justify";
  textDecoration: "none" | "underline" | "line-through" | "overline";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  fontStyle: "normal" | "italic";
};

export function TypographyField({
  value,
  onChange,
}: {
  value: TypographyValue | undefined;
  onChange: (val: TypographyValue) => void;
}) {
  const v: TypographyValue = value || {
    fontFamily: "",
    fontSize: "",
    fontWeight: "",
    lineHeight: "",
    letterSpacing: "",
    color: "",
    textAlign: "left",
    textDecoration: "none",
    textTransform: "none",
    fontStyle: "normal",
  };

  const update = (key: keyof TypographyValue, val: string) => {
    onChange({ ...v, [key]: val });
  };

  useEffect(() => {
    if (v.fontFamily) loadGoogleFont(v.fontFamily);
  }, [v.fontFamily]);

  return (
    <div className="space-y-2">
      {/* Font Family */}
      <select
        value={v.fontFamily}
        onChange={(e) => update("fontFamily", e.target.value)}
        className="w-full text-xs border border-gray-200 rounded px-1.5 py-1.5 focus:outline-none focus:border-indigo-400"
      >
        <option value="">Inherit</option>
        {FONT_FAMILIES.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      {/* Size + Weight + Line-height */}
      <div className="grid grid-cols-3 gap-1">
        <div>
          <label className="text-[10px] text-gray-500 block">Size</label>
          <input
            type="text"
            value={v.fontSize}
            onChange={(e) => update("fontSize", e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:border-indigo-400"
            placeholder="16px"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block">Weight</label>
          <select
            value={v.fontWeight}
            onChange={(e) => update("fontWeight", e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none"
          >
            <option value="">Inherit</option>
            <option value="100">100 Thin</option>
            <option value="200">200 Extra Light</option>
            <option value="300">300 Light</option>
            <option value="400">400 Regular</option>
            <option value="500">500 Medium</option>
            <option value="600">600 Semi Bold</option>
            <option value="700">700 Bold</option>
            <option value="800">800 Extra Bold</option>
            <option value="900">900 Black</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-500 block">Line H.</label>
          <input
            type="text"
            value={v.lineHeight}
            onChange={(e) => update("lineHeight", e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:border-indigo-400"
            placeholder="1.5"
          />
        </div>
      </div>

      {/* Letter spacing + Color */}
      <div className="flex gap-1">
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 block">Letter Spacing</label>
          <input
            type="text"
            value={v.letterSpacing}
            onChange={(e) => update("letterSpacing", e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none focus:border-indigo-400"
            placeholder="0em"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 block">Color</label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={v.color || "#000000"}
              onChange={(e) => update("color", e.target.value)}
              className="w-6 h-6 border border-gray-200 rounded cursor-pointer p-0"
            />
            <input
              type="text"
              value={v.color}
              onChange={(e) => update("color", e.target.value)}
              className="flex-1 w-10 text-xs border border-gray-200 rounded px-1 py-1 font-mono"
              placeholder="#000"
            />
          </div>
        </div>
      </div>

      {/* Align + Style toggles */}
      <div className="flex gap-1">
        {(["left", "center", "right", "justify"] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => update("textAlign", a)}
            className={`flex-1 flex items-center justify-center py-1.5 rounded border ${
              v.textAlign === a ? "border-indigo-400 bg-[var(--puck-color-azure-01)] text-indigo-600" : "border-gray-200 text-gray-500"
            }`}
          >
            <span className="flex flex-col gap-[2px] w-3.5">
              <span className="h-[1.5px] bg-current rounded-full w-full" />
              <span className={`h-[1.5px] bg-current rounded-full ${
                a === "left" ? "w-2/3 self-start" :
                a === "center" ? "w-4/5 self-center" :
                a === "right" ? "w-2/3 self-end" :
                "w-full"
              }`} />
              <span className="h-[1.5px] bg-current rounded-full w-full" />
            </span>
          </button>
        ))}
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => update("fontStyle", v.fontStyle === "italic" ? "normal" : "italic")}
          className={`flex-1 flex items-center justify-center py-1 rounded border text-xs ${
            v.fontStyle === "italic" ? "border-indigo-400 bg-[var(--puck-color-azure-01)] text-indigo-600" : "border-gray-200 text-gray-500"
          }`}
        >
          <span className="italic font-serif">I</span>
        </button>
        <button
          type="button"
          onClick={() => update("textDecoration", v.textDecoration === "underline" ? "none" : "underline")}
          className={`flex-1 flex items-center justify-center py-1 rounded border text-xs ${
            v.textDecoration === "underline" ? "border-indigo-400 bg-[var(--puck-color-azure-01)] text-indigo-600" : "border-gray-200 text-gray-500"
          }`}
        >
          <span className="underline">U</span>
        </button>
        <button
          type="button"
          onClick={() => update("textTransform", v.textTransform === "uppercase" ? "none" : "uppercase")}
          className={`flex-1 flex items-center justify-center py-1 rounded border text-xs ${
            v.textTransform === "uppercase" ? "border-indigo-400 bg-[var(--puck-color-azure-01)] text-indigo-600" : "border-gray-200 text-gray-500"
          }`}
        >
          <span className="text-[10px] tracking-wider font-semibold">AA</span>
        </button>
      </div>
    </div>
  );
}
