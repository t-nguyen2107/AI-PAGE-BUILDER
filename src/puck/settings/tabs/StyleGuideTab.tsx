"use client";

import { useState } from "react";
import { DEFAULT_COLORS } from "@/lib/constants";
import { CardSection } from "@/components/ui/card-section";

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
  shadows?: ShadowTokens;
  borderRadius?: BorderRadiusTokens;
  links?: LinkStyle;
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

interface ShadowTokens {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}

interface BorderRadiusTokens {
  sm?: string;
  md?: string;
  lg?: string;
  full?: string;
}

interface LinkStyle {
  color?: string;
  hoverColor?: string;
  underline?: boolean;
  fontWeight?: string;
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

const DEFAULT_SHADOWS: ShadowTokens = {
  sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

const DEFAULT_RADIUS: BorderRadiusTokens = {
  sm: "0.25rem",
  md: "0.375rem",
  lg: "0.75rem",
  full: "9999px",
};

const DEFAULT_LINKS: LinkStyle = {
  color: "#4f46e5",
  hoverColor: "#3730a3",
  underline: true,
  fontWeight: "500",
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
  const shadows = { ...DEFAULT_SHADOWS, ...value.shadows };
  const borderRadius = { ...DEFAULT_RADIUS, ...value.borderRadius };
  const links = { ...DEFAULT_LINKS, ...value.links };

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

  const updateShadow = (key: keyof ShadowTokens, val: string) => {
    onChange({ ...value, shadows: { ...shadows, [key]: val || undefined } });
  };

  const updateRadius = (key: keyof BorderRadiusTokens, val: string) => {
    onChange({ ...value, borderRadius: { ...borderRadius, [key]: val || undefined } });
  };

  const updateLinks = (field: keyof LinkStyle, val: string | boolean) => {
    onChange({ ...value, links: { ...links, [field]: val || undefined } });
  };

  const filteredFonts = fontSearch
    ? GOOGLE_FONTS.filter((f) => f.toLowerCase().includes(fontSearch.toLowerCase()))
    : GOOGLE_FONTS;

  const headingFont = typography.headingFont || "inherit";
  const bodyFont = typography.bodyFont || "inherit";

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Style Preview Bar */}
      <div className="bg-surface-lowest rounded-lg border border-outline-variant shadow-sm p-5">
        <div className="text-[11px] font-semibold text-on-surface-outline uppercase tracking-wider mb-4">Live Preview</div>
        <div className="space-y-3">
          {/* Color Palette */}
          <div>
            <div className="text-[10px] font-medium text-on-surface-outline uppercase tracking-wider mb-2">Color Palette</div>
            <div className="flex items-center gap-1.5">
              {(["primary", "secondary", "accent", "background", "surface", "text", "textMuted", "border", "error", "success", "warning"] as const).map((key) => (
                <div key={key} className="group relative">
                  <div
                    className="w-7 h-7 rounded border border-outline-variant cursor-pointer transition-transform hover:scale-125 hover:z-10 hover:shadow-lg"
                    style={{ backgroundColor: colors[key] }}
                    title={`${key}: ${colors[key]}`}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-on-surface text-surface-lowest text-[9px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    {key}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-outline-variant/50 pt-3 space-y-2">
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

          <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/50">
            <HoverableButton type="primary" btn={primaryBtn} colors={colors} />
            <HoverableButton type="secondary" btn={secondaryBtn} colors={colors} />
          </div>
        </div>
      </div>

      {/* Colors */}
      <CollapsibleCardSection title="Colors" description="Define your brand and UI color palette" open={openSection === "colors"} onToggle={() => toggle("colors")}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {COLOR_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="text-[10px] font-semibold text-on-surface-outline uppercase tracking-wider mb-2">{group.label}</div>
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
                    <span className="text-sm text-on-surface-variant w-16 shrink-0">{label}</span>
                    <input
                      type="text"
                      value={colors[key] || ""}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="flex-1 text-sm border border-outline-variant rounded px-2.5 py-1 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-surface-lowest"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleCardSection>

      {/* Typography — Headings & Body */}
      <CollapsibleCardSection title="Typography" description="Fonts, heading levels, and body text styles" open={openSection === "typography"} onToggle={() => toggle("typography")}>
        <div className="space-y-6">
          {/* Font Families */}
          <div>
            <div className="text-[10px] font-semibold text-on-surface-outline uppercase tracking-wider mb-2">Font Families</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-on-surface-variant block mb-1">Heading Font</label>
                <FontPicker value={typography.headingFont || ""} onChange={(v) => updateTypography("headingFont", v)} search={fontSearch} onSearchChange={setFontSearch} filteredFonts={filteredFonts} />
              </div>
              <div>
                <label className="text-sm text-on-surface-variant block mb-1">Body Font</label>
                <FontPicker value={typography.bodyFont || ""} onChange={(v) => updateTypography("bodyFont", v)} search={fontSearch} onSearchChange={setFontSearch} filteredFonts={filteredFonts} />
              </div>
            </div>
            <div>
              <label className="text-sm text-on-surface-variant block mb-1 mt-3">Mono Font</label>
              <input
                type="text"
                value={typography.monoFont || ""}
                onChange={(e) => updateTypography("monoFont", e.target.value)}
                className="w-full text-sm border border-outline-variant rounded px-2.5 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-surface-lowest"
                placeholder="ui-monospace, 'Cascadia Code', monospace"
              />
            </div>
          </div>

          {/* Heading Styles H1-H6 */}
          <div>
            <div className="text-[10px] font-semibold text-on-surface-outline uppercase tracking-wider mb-2">Heading Styles</div>
            <div className="space-y-3">
              {(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((level) => {
                const s = headingStyles[level] || {};
                return (
                  <div key={level} className="border border-outline-variant/50 rounded p-3 bg-surface-low/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-on-surface-variant uppercase w-8">{level}</span>
                      <span className="text-xs text-on-surface-outline" style={{ fontFamily: headingFont, fontSize: s.size, fontWeight: s.weight }}>
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
            <div className="text-[10px] font-semibold text-on-surface-outline uppercase tracking-wider mb-2">Body Text Styles</div>
            <div className="space-y-3">
              {(["p", "lead", "small", "caption"] as const).map((el) => {
                const s = bodyStyles[el] || {};
                return (
                  <div key={el} className="border border-outline-variant/50 rounded p-3 bg-surface-low/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-on-surface-variant w-14">&lt;{el}&gt;</span>
                      <span className="text-xs text-on-surface-outline" style={{ fontFamily: bodyFont, fontSize: s.size }}>
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
      </CollapsibleCardSection>

      {/* Buttons */}
      <CollapsibleCardSection title="Buttons" description="Primary and secondary button styles" open={openSection === "buttons"} onToggle={() => toggle("buttons")}>
        <div className="grid grid-cols-2 gap-6">
          {/* Primary */}
          <div>
            <div className="text-[10px] font-semibold text-on-surface-outline uppercase tracking-wider mb-2">Primary Button</div>
            <div className="space-y-2">
              <div className="text-[9px] font-semibold text-on-surface-outline uppercase tracking-wider mt-1">Default State</div>
              <ColorField label="Background" value={primaryBtn.bg || colors.primary} onChange={(v) => updateButton("primary", "bg", v)} />
              <ColorField label="Text Color" value={primaryBtn.text || "#ffffff"} onChange={(v) => updateButton("primary", "text", v)} />
              <InlineField label="Radius" value={primaryBtn.borderRadius || "0.375rem"} onChange={(v) => updateButton("primary", "borderRadius", v)} />
              <InlineField label="Padding X" value={primaryBtn.paddingX || "1rem"} onChange={(v) => updateButton("primary", "paddingX", v)} />
              <InlineField label="Padding Y" value={primaryBtn.paddingY || "0.5rem"} onChange={(v) => updateButton("primary", "paddingY", v)} />
              <InlineField label="Font Size" value={primaryBtn.fontSize || "0.875rem"} onChange={(v) => updateButton("primary", "fontSize", v)} />
              <div className="text-[9px] font-semibold text-primary/60 uppercase tracking-wider mt-3">Hover State</div>
              <ColorField label="Hover BG" value={primaryBtn.hoverBg || ""} onChange={(v) => updateButton("primary", "hoverBg", v)} />
              <ColorField label="Hover Text" value={primaryBtn.hoverText || ""} onChange={(v) => updateButton("primary", "hoverText", v)} />
              <InlineField label="Shadow" value={primaryBtn.hoverShadow || ""} onChange={(v) => updateButton("primary", "hoverShadow", v)} placeholder="0 4px 14px rgba(99,102,241,0.4)" />
              <InlineField label="Scale" value={primaryBtn.hoverScale || ""} onChange={(v) => updateButton("primary", "hoverScale", v)} placeholder="1.03" />
            </div>
            <div className="mt-3 p-3 bg-surface-low rounded flex items-center justify-center">
              <HoverableButton type="primary" btn={primaryBtn} colors={colors} />
            </div>
          </div>

          {/* Secondary */}
          <div>
            <div className="text-[10px] font-semibold text-on-surface-outline uppercase tracking-wider mb-2">Secondary Button</div>
            <div className="space-y-2">
              <div className="text-[9px] font-semibold text-on-surface-outline uppercase tracking-wider mt-1">Default State</div>
              <ColorField label="Background" value={secondaryBtn.bg || "transparent"} onChange={(v) => updateButton("secondary", "bg", v)} />
              <ColorField label="Text Color" value={secondaryBtn.text || colors.primary} onChange={(v) => updateButton("secondary", "text", v)} />
              <ColorField label="Border" value={secondaryBtn.border || colors.primary} onChange={(v) => updateButton("secondary", "border", v)} />
              <InlineField label="Radius" value={secondaryBtn.borderRadius || "0.375rem"} onChange={(v) => updateButton("secondary", "borderRadius", v)} />
              <InlineField label="Padding X" value={secondaryBtn.paddingX || "1rem"} onChange={(v) => updateButton("secondary", "paddingX", v)} />
              <InlineField label="Padding Y" value={secondaryBtn.paddingY || "0.5rem"} onChange={(v) => updateButton("secondary", "paddingY", v)} />
              <div className="text-[9px] font-semibold text-primary/60 uppercase tracking-wider mt-3">Hover State</div>
              <ColorField label="Hover BG" value={secondaryBtn.hoverBg || ""} onChange={(v) => updateButton("secondary", "hoverBg", v)} />
              <ColorField label="Hover Text" value={secondaryBtn.hoverText || ""} onChange={(v) => updateButton("secondary", "hoverText", v)} />
              <ColorField label="Hover Border" value={secondaryBtn.hoverBorder || ""} onChange={(v) => updateButton("secondary", "hoverBorder", v)} />
              <InlineField label="Shadow" value={secondaryBtn.hoverShadow || ""} onChange={(v) => updateButton("secondary", "hoverShadow", v)} placeholder="0 4px 14px rgba(99,102,241,0.2)" />
              <InlineField label="Scale" value={secondaryBtn.hoverScale || ""} onChange={(v) => updateButton("secondary", "hoverScale", v)} placeholder="1.03" />
            </div>
            <div className="mt-3 p-3 bg-surface-low rounded flex items-center justify-center">
              <HoverableButton type="secondary" btn={secondaryBtn} colors={colors} />
            </div>
          </div>
        </div>
      </CollapsibleCardSection>

      {/* Spacing Scale */}
      <CollapsibleCardSection title="Spacing Scale" description="Used for margins, paddings, and gaps in generated pages (e.g. p-4 → 1rem)" open={openSection === "spacing"} onToggle={() => toggle("spacing")}>
        <div className="space-y-1.5">
          {Object.entries(spacing).map(([key, val]) => {
            const remNum = parseFloat(val);
            const barWidth = Math.min(remNum * 16, 100);
            return (
              <div key={key} className="flex items-center gap-2.5">
                <span className="text-sm font-mono text-on-surface-outline w-6 text-right shrink-0">{key}</span>
                <input
                  type="text"
                  value={val}
                  onChange={(e) => updateSpacing(key, e.target.value)}
                  className="w-20 text-sm border border-outline-variant rounded px-2 py-1 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-surface-lowest shrink-0"
                />
                <div className="flex-1 h-3 bg-surface-low rounded-full overflow-hidden">
                  <div className="h-full bg-primary/30 rounded-full transition-all" style={{ width: `${barWidth}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleCardSection>

      {/* Shadows */}
      <CollapsibleCardSection title="Shadows" description="Box-shadow tokens used by cards, dropdowns, and overlays" open={openSection === "shadows"} onToggle={() => toggle("shadows")}>
        <div className="grid grid-cols-2 gap-4">
          {(["sm", "md", "lg", "xl"] as const).map((key) => {
            const shadowVal = shadows[key] || "";
            return (
              <div key={key} className="border border-outline-variant/50 rounded-lg p-3 bg-surface-low/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-on-surface-variant uppercase">{key}</span>
                </div>
                <div className="flex items-center justify-center h-16 mb-2">
                  <div
                    className="w-20 h-10 bg-surface-lowest rounded border border-outline-variant/30"
                    style={{ boxShadow: shadowVal }}
                  />
                </div>
                <input
                  type="text"
                  value={shadowVal}
                  onChange={(e) => updateShadow(key, e.target.value)}
                  className="w-full text-xs border border-outline-variant rounded px-2 py-1.5 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-surface-lowest"
                />
              </div>
            );
          })}
        </div>
      </CollapsibleCardSection>

      {/* Border Radius */}
      <CollapsibleCardSection title="Border Radius" description="Rounding tokens for buttons, cards, inputs, and containers" open={openSection === "radius"} onToggle={() => toggle("radius")}>
        <div className="grid grid-cols-4 gap-4">
          {(["sm", "md", "lg", "full"] as const).map((key) => {
            const radiusVal = borderRadius[key] || "0";
            return (
              <div key={key} className="border border-outline-variant/50 rounded-lg p-3 bg-surface-low/50 text-center">
                <span className="text-sm font-semibold text-on-surface-variant uppercase block mb-2">{key}</span>
                <div className="flex items-center justify-center h-16 mb-2">
                  <div
                    className="w-12 h-12 bg-primary/20 border-2 border-primary/40"
                    style={{ borderRadius: radiusVal }}
                  />
                </div>
                <input
                  type="text"
                  value={radiusVal}
                  onChange={(e) => updateRadius(key, e.target.value)}
                  className="w-full text-xs border border-outline-variant rounded px-2 py-1.5 font-mono text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-surface-lowest"
                />
              </div>
            );
          })}
        </div>
      </CollapsibleCardSection>

      {/* Link Styles */}
      <CollapsibleCardSection title="Link Styles" description="Default appearance for text links across the site" open={openSection === "links"} onToggle={() => toggle("links")}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Color" value={links.color || ""} onChange={(v) => updateLinks("color", v)} />
            <ColorField label="Hover Color" value={links.hoverColor || ""} onChange={(v) => updateLinks("hoverColor", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InlineField label="Font Weight" value={links.fontWeight || ""} onChange={(v) => updateLinks("fontWeight", v)} placeholder="500" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-outline w-20 shrink-0">Underline</span>
              <button
                type="button"
                onClick={() => updateLinks("underline", !links.underline)}
                className={`relative w-9 h-5 rounded-full transition-colors ${links.underline !== false ? "bg-primary" : "bg-outline-variant"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${links.underline !== false ? "left-4.5" : "left-0.5"}`} />
              </button>
            </div>
          </div>
          <div className="mt-2 p-3 bg-surface-low rounded flex items-center gap-4">
            <span className="text-sm" style={{ color: links.color, fontWeight: links.fontWeight, textDecoration: links.underline !== false ? "underline" : "none" }}>
              This is a sample link
            </span>
            <span className="text-sm" style={{ color: links.hoverColor, fontWeight: links.fontWeight, textDecoration: links.underline !== false ? "underline" : "none" }}>
              Hovered link
            </span>
          </div>
        </div>
      </CollapsibleCardSection>
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
        className="w-full text-sm border border-outline-variant rounded px-2.5 py-2 text-left bg-surface-lowest hover:border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:outline-none flex items-center justify-between"
      >
        <span style={{ fontFamily: value || "inherit" }}>{value ? value.split(",")[0].replace(/'/g, "") : "Inherit"}</span>
        <svg className="w-3.5 h-3.5 text-on-surface-outline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-surface-lowest border border-outline-variant rounded shadow-lg max-h-48 overflow-hidden">
          <div className="p-2 border-b border-outline-variant/50">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-sm border border-outline-variant rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/40 bg-surface-lowest"
              placeholder="Search Google Fonts..."
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-36">
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-primary/5 ${!value ? "bg-primary/5 text-primary" : "text-on-surface-variant"}`}
            >
              Inherit (default)
            </button>
            {filteredFonts.map((font) => (
              <button
                key={font}
                type="button"
                onClick={() => { onChange(`'${font}', sans-serif`); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-primary/5 ${value.includes(font) ? "bg-primary/5 text-primary" : "text-on-surface-variant"}`}
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
      <label className="text-[10px] text-on-surface-outline block mb-0.5">{label}</label>
      {type === "select" && options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs border border-outline-variant rounded px-1.5 py-1 bg-surface-lowest focus:outline-none focus:ring-1 focus:ring-primary/40"
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs border border-outline-variant rounded px-1.5 py-1 font-mono bg-surface-lowest focus:outline-none focus:ring-1 focus:ring-primary/40"
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
      <span className="text-sm text-on-surface-outline w-20 shrink-0">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-6 h-6 rounded cursor-pointer shrink-0 border-0 p-0" style={{ appearance: "auto" }} />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 text-sm border border-outline-variant rounded px-2 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-primary/40 bg-surface-lowest" />
    </div>
  );
}

/* ── Inline Field ── */
function InlineField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-on-surface-outline w-20 shrink-0">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 text-sm border border-outline-variant rounded px-2 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-primary/40 bg-surface-lowest" placeholder={placeholder} />
    </div>
  );
}

/* ── Collapsible Card Section ── */
function CollapsibleCardSection({ title, description, open, onToggle, children }: {
  title: string; description?: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className={`bg-surface-lowest rounded-lg border shadow-sm transition-all ${open ? "border-primary/40 shadow-primary/10" : "border-outline-variant"}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
          {description && <p className="text-xs text-on-surface-outline mt-0.5">{description}</p>}
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${open ? "bg-primary/10 text-primary" : "bg-surface-low text-on-surface-outline"}`}>
          <svg className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>
      {open && <div className="px-5 pb-4 pt-1 border-t border-outline-variant/50">{children}</div>}
    </div>
  );
}
