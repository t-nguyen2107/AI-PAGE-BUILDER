"use client";

import { useState } from "react";

interface StyleGuideData {
  colors: Record<string, string>;
  typography: {
    headingFont?: string;
    bodyFont?: string;
    monoFont?: string;
    fontSizes?: Record<string, string>;
    fontWeights?: Record<string, string>;
    lineHeights?: Record<string, string>;
    letterSpacings?: Record<string, string>;
    // Per-element overrides
    headingStyles?: Record<string, HeadingStyle>;
    bodyStyles?: Record<string, BodyStyle>;
  };
  spacing: { values: Record<string, string> };
  cssVariables: Record<string, string>;
  buttons?: {
    primary?: ButtonStyle;
    secondary?: ButtonStyle;
  };
}

interface HeadingStyle {
  font?: string;
  weight?: string;
  size?: string;
  lineHeight?: string;
  letterSpacing?: string;
  marginTop?: string;
  marginBottom?: string;
  color?: string;
}

interface BodyStyle {
  font?: string;
  weight?: string;
  size?: string;
  lineHeight?: string;
  letterSpacing?: string;
  marginBottom?: string;
  color?: string;
}

interface ButtonStyle {
  bg?: string;
  text?: string;
  border?: string;
  borderRadius?: string;
  paddingX?: string;
  paddingY?: string;
  fontSize?: string;
  fontWeight?: string;
  // Hover state
  hoverBg?: string;
  hoverText?: string;
  hoverBorder?: string;
  hoverShadow?: string;
  hoverScale?: string;
  transition?: string;
}

const COLOR_GROUPS = [
  {
    label: "Brand",
    colors: [
      { key: "primary", label: "Primary" },
      { key: "secondary", label: "Secondary" },
      { key: "accent", label: "Accent" },
    ],
  },
  {
    label: "Surface",
    colors: [
      { key: "background", label: "Background" },
      { key: "surface", label: "Surface" },
      { key: "border", label: "Border" },
    ],
  },
  {
    label: "Text",
    colors: [
      { key: "text", label: "Text" },
      { key: "textMuted", label: "Muted" },
    ],
  },
  {
    label: "Utility",
    colors: [
      { key: "error", label: "Error" },
      { key: "success", label: "Success" },
      { key: "warning", label: "Warning" },
    ],
  },
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

const GOOGLE_FONTS = [
  "Inter", "Plus Jakarta Sans", "Space Grotesk", "Work Sans", "Geist",
  "DM Sans", "Montserrat", "Poppins", "Lato", "Open Sans",
  "Raleway", "Nunito", "Rubik", "Manrope", "Outfit",
  "Newsreader", "Noto Serif", "Source Serif 4", "Playfair Display",
  "EB Garamond", "Literata", "Merriweather", "Lora", "Crimson Text",
  "Fira Code", "JetBrains Mono", "Source Code Pro", "IBM Plex Mono",
];

const HEADING_DEFAULTS: Record<string, HeadingStyle> = {
  h1: { size: "2.25rem", weight: "700", lineHeight: "1.2", letterSpacing: "-0.025em", marginBottom: "1rem" },
  h2: { size: "1.875rem", weight: "700", lineHeight: "1.25", letterSpacing: "-0.02em", marginBottom: "0.75rem" },
  h3: { size: "1.5rem", weight: "600", lineHeight: "1.3", letterSpacing: "0em", marginBottom: "0.5rem" },
  h4: { size: "1.25rem", weight: "600", lineHeight: "1.35", letterSpacing: "0em", marginBottom: "0.5rem" },
  h5: { size: "1.125rem", weight: "600", lineHeight: "1.4", letterSpacing: "0em", marginBottom: "0.5rem" },
  h6: { size: "1rem", weight: "600", lineHeight: "1.4", letterSpacing: "0em", marginBottom: "0.5rem" },
};

const BODY_DEFAULTS: Record<string, BodyStyle> = {
  p: { size: "1rem", weight: "400", lineHeight: "1.6", letterSpacing: "0em", marginBottom: "1rem" },
  lead: { size: "1.125rem", weight: "400", lineHeight: "1.7", letterSpacing: "0em", marginBottom: "1rem" },
  small: { size: "0.875rem", weight: "400", lineHeight: "1.5", letterSpacing: "0em", marginBottom: "0.5rem" },
  caption: { size: "0.75rem", weight: "400", lineHeight: "1.4", letterSpacing: "0.01em", marginBottom: "0.25rem" },
};

const WEIGHT_OPTIONS = [
  { label: "Light (300)", value: "300" },
  { label: "Regular (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Semibold (600)", value: "600" },
  { label: "Bold (700)", value: "700" },
  { label: "Extrabold (800)", value: "800" },
];

const DEFAULT_SPACING: Record<string, string> = {
  "0": "0rem", "0.5": "0.125rem", "1": "0.25rem", "1.5": "0.375rem",
  "2": "0.5rem", "3": "0.75rem", "4": "1rem", "5": "1.25rem",
  "6": "1.5rem", "8": "2rem", "10": "2.5rem", "12": "3rem",
  "16": "4rem", "20": "5rem", "24": "6rem",
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
  const headingStyles = { ...HEADING_DEFAULTS, ...typography.headingStyles };
  const bodyStyles = { ...BODY_DEFAULTS, ...typography.bodyStyles };
  const spacing = { ...DEFAULT_SPACING, ...value.spacing?.values };
  const buttons = value.buttons || {};
  const primaryBtn = buttons.primary || {};
  const secondaryBtn = buttons.secondary || {};

  const [openSection, setOpenSection] = useState<string>("colors");
  const [fontSearch, setFontSearch] = useState("");
  const toggle = (section: string) => setOpenSection(openSection === section ? "" : section);

  const updateColor = (key: string, val: string) => {
    onChange({ ...value, colors: { ...colors, [key]: val } });
  };

  const updateTypography = (key: string, val: string | undefined) => {
    onChange({ ...value, typography: { ...typography, [key]: val || undefined } });
  };

  const updateHeadingStyle = (level: string, field: keyof HeadingStyle, val: string) => {
    const current = headingStyles[level] || {};
    const updated = { ...current, [field]: val || undefined };
    onChange({ ...value, typography: { ...typography, headingStyles: { ...headingStyles, [level]: updated } } });
  };

  const updateBodyStyle = (element: string, field: keyof BodyStyle, val: string) => {
    const current = bodyStyles[element] || {};
    const updated = { ...current, [field]: val || undefined };
    onChange({ ...value, typography: { ...typography, bodyStyles: { ...bodyStyles, [element]: updated } } });
  };

  const updateButton = (type: "primary" | "secondary", field: keyof ButtonStyle, val: string) => {
    const current = type === "primary" ? primaryBtn : secondaryBtn;
    const updated = { ...current, [field]: val || undefined };
    onChange({ ...value, buttons: { ...buttons, [type]: updated } });
  };

  const updateSpacing = (key: string, val: string) => {
    onChange({ ...value, spacing: { values: { ...spacing, [key]: val } } });
  };

  const filteredFonts = fontSearch
    ? GOOGLE_FONTS.filter((f) => f.toLowerCase().includes(fontSearch.toLowerCase()))
    : GOOGLE_FONTS;

  const headingFont = typography.headingFont || "inherit";
  const bodyFont = typography.bodyFont || "inherit";

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Style Preview Bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Live Preview</div>
        <div className="space-y-3">
          {/* Color Palette */}
          <div>
            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Color Palette</div>
            <div className="flex items-center gap-1.5">
              {(["primary", "secondary", "accent", "background", "surface", "text", "textMuted", "border", "error", "success", "warning"] as const).map((key) => (
                <div key={key} className="group relative">
                  <div
                    className="w-7 h-7 rounded border border-gray-200 cursor-pointer transition-transform hover:scale-125 hover:z-10 hover:shadow-lg"
                    style={{ backgroundColor: colors[key] }}
                    title={`${key}: ${colors[key]}`}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-gray-800 text-white text-[9px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    {key}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <h1 className="text-2xl font-bold leading-tight" style={{ fontFamily: headingFont, color: colors.text }}>
              Heading 1 — The quick brown fox
            </h1>
            <h2 className="text-xl font-bold leading-snug" style={{ fontFamily: headingFont, color: colors.text }}>
              Heading 2 — Jumps over the lazy dog
            </h2>
            <h3 className="text-lg font-semibold" style={{ fontFamily: headingFont, color: colors.text }}>
              Heading 3 — Pack my box with five dozen liquor jugs
            </h3>
            <p className="text-sm leading-relaxed" style={{ fontFamily: bodyFont, color: colors.textMuted }}>
              Body text — Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-gray-100 pt-3">
            <HoverableButton type="primary" btn={primaryBtn} colors={colors} />
            <HoverableButton type="secondary" btn={secondaryBtn} colors={colors} />
          </div>
        </div>
      </div>

      {/* Colors */}
      <Card title="Colors" description="Define your brand and UI color palette" open={openSection === "colors"} onToggle={() => toggle("colors")}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {COLOR_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{group.label}</div>
              <div className="space-y-2">
                {group.colors.map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2.5">
                    <input
                      type="color"
                      value={colors[key] || "#000000"}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer shrink-0 border-0 p-0"
                      style={{ appearance: "auto" }}
                    />
                    <span className="text-sm text-gray-600 w-16 shrink-0">{label}</span>
                    <input
                      type="text"
                      value={colors[key] || ""}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="flex-1 text-sm border border-gray-200 rounded px-2.5 py-1 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Typography — Headings & Body */}
      <Card title="Typography" description="Fonts, heading levels, and body text styles" open={openSection === "typography"} onToggle={() => toggle("typography")}>
        <div className="space-y-6">
          {/* Font Families */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Font Families</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Heading Font</label>
                <FontPicker value={typography.headingFont || ""} onChange={(v) => updateTypography("headingFont", v)} search={fontSearch} onSearchChange={setFontSearch} filteredFonts={filteredFonts} />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Body Font</label>
                <FontPicker value={typography.bodyFont || ""} onChange={(v) => updateTypography("bodyFont", v)} search={fontSearch} onSearchChange={setFontSearch} filteredFonts={filteredFonts} />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1 mt-3">Mono Font</label>
              <input
                type="text"
                value={typography.monoFont || ""}
                onChange={(e) => updateTypography("monoFont", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded px-2.5 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white"
                placeholder="ui-monospace, 'Cascadia Code', monospace"
              />
            </div>
          </div>

          {/* Heading Styles H1-H6 */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Heading Styles</div>
            <div className="space-y-3">
              {(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((level) => {
                const s = headingStyles[level] || {};
                return (
                  <div key={level} className="border border-gray-100 rounded p-3 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-gray-700 uppercase w-8">{level}</span>
                      <span className="text-xs text-gray-400" style={{ fontFamily: headingFont, fontSize: s.size, fontWeight: s.weight }}>
                        Preview {level.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <MiniField label="Size" value={s.size || ""} onChange={(v) => updateHeadingStyle(level, "size", v)} placeholder="1rem" />
                      <MiniField label="Weight" value={s.weight || ""} onChange={(v) => updateHeadingStyle(level, "weight", v)} placeholder="700" type="select" options={WEIGHT_OPTIONS} />
                      <MiniField label="Line H" value={s.lineHeight || ""} onChange={(v) => updateHeadingStyle(level, "lineHeight", v)} placeholder="1.3" />
                      <MiniField label="Spacing" value={s.letterSpacing || ""} onChange={(v) => updateHeadingStyle(level, "letterSpacing", v)} placeholder="0em" />
                      <MiniField label="Margin B" value={s.marginBottom || ""} onChange={(v) => updateHeadingStyle(level, "marginBottom", v)} placeholder="0.5rem" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Body Text Styles */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Body Text Styles</div>
            <div className="space-y-3">
              {(["p", "lead", "small", "caption"] as const).map((el) => {
                const s = bodyStyles[el] || {};
                return (
                  <div key={el} className="border border-gray-100 rounded p-3 bg-gray-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-gray-700 w-14">&lt;{el}&gt;</span>
                      <span className="text-xs text-gray-400" style={{ fontFamily: bodyFont, fontSize: s.size }}>
                        Body text preview
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <MiniField label="Size" value={s.size || ""} onChange={(v) => updateBodyStyle(el, "size", v)} placeholder="1rem" />
                      <MiniField label="Weight" value={s.weight || ""} onChange={(v) => updateBodyStyle(el, "weight", v)} placeholder="400" type="select" options={WEIGHT_OPTIONS} />
                      <MiniField label="Line H" value={s.lineHeight || ""} onChange={(v) => updateBodyStyle(el, "lineHeight", v)} placeholder="1.6" />
                      <MiniField label="Spacing" value={s.letterSpacing || ""} onChange={(v) => updateBodyStyle(el, "letterSpacing", v)} placeholder="0em" />
                      <MiniField label="Margin B" value={s.marginBottom || ""} onChange={(v) => updateBodyStyle(el, "marginBottom", v)} placeholder="1rem" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Buttons */}
      <Card title="Buttons" description="Primary and secondary button styles" open={openSection === "buttons"} onToggle={() => toggle("buttons")}>
        <div className="grid grid-cols-2 gap-6">
          {/* Primary */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Primary Button</div>
            <div className="space-y-2">
              <div className="text-[9px] font-semibold text-gray-300 uppercase tracking-wider mt-1">Default State</div>
              <ColorField label="Background" value={primaryBtn.bg || colors.primary} onChange={(v) => updateButton("primary", "bg", v)} />
              <ColorField label="Text Color" value={primaryBtn.text || "#ffffff"} onChange={(v) => updateButton("primary", "text", v)} />
              <InlineField label="Radius" value={primaryBtn.borderRadius || "0.375rem"} onChange={(v) => updateButton("primary", "borderRadius", v)} />
              <InlineField label="Padding X" value={primaryBtn.paddingX || "1rem"} onChange={(v) => updateButton("primary", "paddingX", v)} />
              <InlineField label="Padding Y" value={primaryBtn.paddingY || "0.5rem"} onChange={(v) => updateButton("primary", "paddingY", v)} />
              <InlineField label="Font Size" value={primaryBtn.fontSize || "0.875rem"} onChange={(v) => updateButton("primary", "fontSize", v)} />
              <div className="text-[9px] font-semibold text-indigo-400 uppercase tracking-wider mt-3">Hover State</div>
              <ColorField label="Hover BG" value={primaryBtn.hoverBg || ""} onChange={(v) => updateButton("primary", "hoverBg", v)} />
              <ColorField label="Hover Text" value={primaryBtn.hoverText || ""} onChange={(v) => updateButton("primary", "hoverText", v)} />
              <InlineField label="Shadow" value={primaryBtn.hoverShadow || ""} onChange={(v) => updateButton("primary", "hoverShadow", v)} placeholder="0 4px 14px rgba(99,102,241,0.4)" />
              <InlineField label="Scale" value={primaryBtn.hoverScale || ""} onChange={(v) => updateButton("primary", "hoverScale", v)} placeholder="1.03" />
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded flex items-center justify-center">
              <HoverableButton type="primary" btn={primaryBtn} colors={colors} />
            </div>
          </div>

          {/* Secondary */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Secondary Button</div>
            <div className="space-y-2">
              <div className="text-[9px] font-semibold text-gray-300 uppercase tracking-wider mt-1">Default State</div>
              <ColorField label="Background" value={secondaryBtn.bg || "transparent"} onChange={(v) => updateButton("secondary", "bg", v)} />
              <ColorField label="Text Color" value={secondaryBtn.text || colors.primary} onChange={(v) => updateButton("secondary", "text", v)} />
              <ColorField label="Border" value={secondaryBtn.border || colors.primary} onChange={(v) => updateButton("secondary", "border", v)} />
              <InlineField label="Radius" value={secondaryBtn.borderRadius || "0.375rem"} onChange={(v) => updateButton("secondary", "borderRadius", v)} />
              <InlineField label="Padding X" value={secondaryBtn.paddingX || "1rem"} onChange={(v) => updateButton("secondary", "paddingX", v)} />
              <InlineField label="Padding Y" value={secondaryBtn.paddingY || "0.5rem"} onChange={(v) => updateButton("secondary", "paddingY", v)} />
              <div className="text-[9px] font-semibold text-indigo-400 uppercase tracking-wider mt-3">Hover State</div>
              <ColorField label="Hover BG" value={secondaryBtn.hoverBg || ""} onChange={(v) => updateButton("secondary", "hoverBg", v)} />
              <ColorField label="Hover Text" value={secondaryBtn.hoverText || ""} onChange={(v) => updateButton("secondary", "hoverText", v)} />
              <ColorField label="Hover Border" value={secondaryBtn.hoverBorder || ""} onChange={(v) => updateButton("secondary", "hoverBorder", v)} />
              <InlineField label="Shadow" value={secondaryBtn.hoverShadow || ""} onChange={(v) => updateButton("secondary", "hoverShadow", v)} placeholder="0 4px 14px rgba(99,102,241,0.2)" />
              <InlineField label="Scale" value={secondaryBtn.hoverScale || ""} onChange={(v) => updateButton("secondary", "hoverScale", v)} placeholder="1.03" />
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded flex items-center justify-center">
              <HoverableButton type="secondary" btn={secondaryBtn} colors={colors} />
            </div>
          </div>
        </div>
      </Card>

      {/* Spacing Scale */}
      <Card title="Spacing Scale" description="Used for margins, paddings, and gaps in generated pages (e.g. p-4 → 1rem)" open={openSection === "spacing"} onToggle={() => toggle("spacing")}>
        <div className="space-y-1.5">
          {Object.entries(spacing).map(([key, val]) => {
            const remNum = parseFloat(val);
            const barWidth = Math.min(remNum * 16, 100);
            return (
              <div key={key} className="flex items-center gap-2.5">
                <span className="text-sm font-mono text-gray-400 w-6 text-right shrink-0">{key}</span>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => updateSpacing(key, e.target.value)}
                  className="w-20 text-sm border border-gray-200 rounded px-2 py-1 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white shrink-0"
                />
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400/30 rounded-full transition-all" style={{ width: `${barWidth}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ── Hoverable Button Preview ── */
function HoverableButton({ type, btn, colors }: { type: "primary" | "secondary"; btn: ButtonStyle; colors: Record<string, string> }) {
  const [hovered, setHovered] = useState(false);

  const isPrimary = type === "primary";
  const baseBg = isPrimary ? (btn.bg || colors.primary) : (btn.bg || "transparent");
  const baseText = isPrimary ? (btn.text || "#fff") : (btn.text || colors.primary);
  const baseBorder = isPrimary ? undefined : (btn.border || colors.primary);
  const scale = hovered ? (btn.hoverScale || "1") : "1";
  const shadow = hovered ? (btn.hoverShadow || "none") : "none";
  const bg = hovered ? (btn.hoverBg || baseBg) : baseBg;
  const text = hovered ? (btn.hoverText || baseText) : baseText;
  const border = hovered ? (btn.hoverBorder || baseBorder) : baseBorder;

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="inline-flex items-center justify-center text-sm font-medium cursor-default select-none"
      style={{
        backgroundColor: bg,
        color: text,
        borderColor: border,
        border: isPrimary ? "none" : `1px solid ${border}`,
        borderRadius: btn.borderRadius || "0.375rem",
        padding: `${btn.paddingY || "0.5rem"} ${btn.paddingX || "1rem"}`,
        fontSize: btn.fontSize || "0.875rem",
        fontWeight: btn.fontWeight || "500",
        boxShadow: shadow === "none" ? undefined : shadow,
        transform: `scale(${scale})`,
        transition: btn.transition || "all 0.2s ease",
      }}
    >
      {isPrimary ? "Primary Button" : "Secondary Button"}
    </span>
  );
}

/* ── Font Picker with Search ── */
function FontPicker({ value, onChange, search, onSearchChange, filteredFonts }: {
  value: string;
  onChange: (v: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  filteredFonts: string[];
}) {
  const [open, setOpen] = useState(false);
  const selected = value || "Inherit";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-sm border border-gray-200 rounded px-2.5 py-2 text-left bg-white hover:border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none flex items-center justify-between"
      >
        <span style={{ fontFamily: value || "inherit" }}>{value ? value.split(",")[0].replace(/'/g, "") : "Inherit"}</span>
        <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
              placeholder="Search Google Fonts..."
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-36">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-indigo-50 ${!value ? "bg-indigo-50 text-indigo-700" : "text-gray-700"}`}
            >
              Inherit (default)
            </button>
            {filteredFonts.map((font) => (
              <button
                key={font}
                type="button"
                onClick={() => { onChange(`'${font}', sans-serif`); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-indigo-50 ${value.includes(font) ? "bg-indigo-50 text-indigo-700" : "text-gray-700"}`}
                style={{ fontFamily: `'${font}', sans-serif` }}
              >
                {font}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mini Field (for heading/body grids) ── */
function MiniField({ label, value, onChange, placeholder, type, options }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  type?: "text" | "select"; options?: { label: string; value: string }[];
}) {
  return (
    <div>
      <label className="text-[10px] text-gray-400 block mb-0.5">{label}</label>
      {type === "select" && options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 font-mono bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

/* ── Color + Text Field ── */
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 w-20 shrink-0">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-6 h-6 rounded cursor-pointer shrink-0 border-0 p-0" style={{ appearance: "auto" }} />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white" />
    </div>
  );
}

/* ── Inline Field ── */
function InlineField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 w-20 shrink-0">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white" placeholder={placeholder} />
    </div>
  );
}

/* ── Collapsible Card ── */
function Card({ title, description, open, onToggle, children }: {
  title: string; description?: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-lg border shadow-sm transition-all ${open ? "border-indigo-200 shadow-indigo-100/50" : "border-gray-200"}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${open ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>
          <svg className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>
      {open && <div className="px-5 pb-4 pt-1 border-t border-gray-100">{children}</div>}
    </div>
  );
}
