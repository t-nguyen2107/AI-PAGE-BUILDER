"use client";

import { useState, type CSSProperties } from "react";
import { SpacingField, type SpacingValue } from "./SpacingField";
import { TypographyField, type TypographyValue } from "./TypographyField";
import { BorderField, type BorderValue } from "./BorderField";
import { ShadowField, shadowToCss, type ShadowValue } from "./ShadowField";
import { ColorPickerField } from "./ColorPickerField";
import { AnimationField, animationToCss, type AnimationValue } from "./AnimationField";
import { MediaManager } from "./MediaManager";
import { Section, SliderInput } from "../inspector/components";
import { LayoutSection } from "./LayoutSection";
import { PositionSection } from "./PositionSection";
import { TransformSection } from "./TransformSection";

// ─── Types ──────────────────────────────────────────────────────────

export type TransitionValue = {
  duration: string;
  easing: string;
  properties: string;
};

export type TransformValue = {
  translateX: string;
  translateY: string;
  rotate: string;
  scaleX: string;
  scaleY: string;
  skewX: string;
  skewY: string;
};

export type StylesValue = {
  // Layout
  display?: "block" | "flex" | "grid" | "inline" | "inline-block" | "inline-flex" | "none";
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
  justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
  alignItems?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  gap?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;

  // Spacing
  padding?: SpacingValue;
  margin?: SpacingValue;

  // Size
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  aspectRatio?: string;

  // Position
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  zIndex?: string;
  inset?: { top: string; right: string; bottom: string; left: string };

  // Typography
  typography?: TypographyValue;

  // Border & Shadow
  border?: BorderValue;
  shadow?: ShadowValue;

  // Background
  backgroundColor?: string;
  gradient?: string; // kept for backward compat
  backgroundImageUrl?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;

  // Effects
  opacity?: number;
  overflow?: "visible" | "hidden" | "scroll" | "auto";
  filter?: { blur: string; brightness: string; contrast: string };

  // Transform
  transform?: TransformValue;

  // Animation & Transition
  animation?: AnimationValue;
  transition?: TransitionValue;

  // Hover state
  hover?: Partial<Omit<StylesValue, "hover" | "animation" | "cssClasses">>;
  cssClasses?: string;
};

// ─── Hover CSS types ────────────────────────────────────────────────
type HoverableKeys = Exclude<keyof StylesValue, "hover" | "animation" | "cssClasses" | "transition">;

// ─── stylesToCss ────────────────────────────────────────────────────

export function stylesToCss(s: StylesValue | undefined): CSSProperties {
  if (!s) return {};
  const css: CSSProperties = {};

  // Layout
  if (s.display && s.display !== "block") css.display = s.display;
  if (s.flexDirection) css.flexDirection = s.flexDirection;
  if (s.flexWrap && s.flexWrap !== "nowrap") css.flexWrap = s.flexWrap;
  if (s.justifyContent) css.justifyContent = s.justifyContent;
  if (s.alignItems) css.alignItems = s.alignItems;
  if (s.gap && s.gap !== "0px") css.gap = s.gap;
  if (s.gridTemplateColumns) css.gridTemplateColumns = s.gridTemplateColumns;
  if (s.gridTemplateRows) css.gridTemplateRows = s.gridTemplateRows;

  // Position
  if (s.position && s.position !== "static") css.position = s.position;
  if (s.zIndex) css.zIndex = s.zIndex;
  if (s.inset) {
    const { top, right, bottom, left } = s.inset;
    if (top === right && right === bottom && bottom === left && top && top !== "auto") {
      css.inset = top;
    } else {
      if (top && top !== "auto") css.top = top;
      if (right && right !== "auto") css.right = right;
      if (bottom && bottom !== "auto") css.bottom = bottom;
      if (left && left !== "auto") css.left = left;
    }
  }

  // Spacing
  if (s.padding) {
    const { top, right, bottom, left } = s.padding;
    if (top === right && right === bottom && bottom === left && top && top !== "0px") {
      css.padding = top;
    } else {
      if (top && top !== "0px") css.paddingTop = top;
      if (right && right !== "0px") css.paddingRight = right;
      if (bottom && bottom !== "0px") css.paddingBottom = bottom;
      if (left && left !== "0px") css.paddingLeft = left;
    }
  }

  if (s.margin) {
    const { top, right, bottom, left } = s.margin;
    if (top === right && right === bottom && bottom === left && top && top !== "0px") {
      css.margin = top;
    } else {
      if (top && top !== "0px") css.marginTop = top;
      if (right && right !== "0px") css.marginRight = right;
      if (bottom && bottom !== "0px") css.marginBottom = bottom;
      if (left && left !== "0px") css.marginLeft = left;
    }
  }

  if (s.width) css.width = s.width;
  if (s.height) css.height = s.height;
  if (s.minWidth) css.minWidth = s.minWidth;
  if (s.maxWidth) css.maxWidth = s.maxWidth;
  if (s.minHeight) css.minHeight = s.minHeight;
  if (s.maxHeight) css.maxHeight = s.maxHeight;

  if (s.typography) {
    const t = s.typography;
    if (t.fontFamily) css.fontFamily = t.fontFamily;
    if (t.fontSize) css.fontSize = t.fontSize;
    if (t.fontWeight) css.fontWeight = t.fontWeight;
    if (t.lineHeight) css.lineHeight = t.lineHeight;
    if (t.letterSpacing) css.letterSpacing = t.letterSpacing;
    if (t.color) css.color = t.color;
    if (t.textAlign && t.textAlign !== "left") css.textAlign = t.textAlign;
    if (t.textDecoration && t.textDecoration !== "none") css.textDecoration = t.textDecoration;
    if (t.textTransform && t.textTransform !== "none") css.textTransform = t.textTransform;
    if (t.fontStyle && t.fontStyle !== "normal") css.fontStyle = t.fontStyle;
  }

  if (s.border) {
    const b = s.border;
    if (b.radius) {
      const { tl, tr, br, bl } = b.radius;
      if (tl === tr && tr === br && br === bl && tl && tl !== "0px") {
        css.borderRadius = tl;
      } else {
        if (tl && tl !== "0px") css.borderTopLeftRadius = tl;
        if (tr && tr !== "0px") css.borderTopRightRadius = tr;
        if (br && br !== "0px") css.borderBottomRightRadius = br;
        if (bl && bl !== "0px") css.borderBottomLeftRadius = bl;
      }
    }
    if (b.width && b.style && b.style !== "none") {
      css.borderWidth = b.width;
      css.borderStyle = b.style;
      css.borderColor = b.color;
    }
  }

  const shadow = shadowToCss(s.shadow);
  if (shadow) css.boxShadow = shadow;

  if (s.backgroundColor) css.backgroundColor = s.backgroundColor;

  // Background image takes priority over gradient
  if (s.backgroundImageUrl) {
    css.backgroundImage = `url(${s.backgroundImageUrl})`;
    if (s.backgroundSize) css.backgroundSize = s.backgroundSize;
    if (s.backgroundPosition) css.backgroundPosition = s.backgroundPosition;
    if (s.backgroundRepeat) css.backgroundRepeat = s.backgroundRepeat;
  }

  if (s.opacity !== undefined && s.opacity !== 100) {
    css.opacity = s.opacity / 100;
  }
  if (s.overflow && s.overflow !== "visible") css.overflow = s.overflow;

  if (s.filter) {
    const filters: string[] = [];
    if (s.filter.blur && s.filter.blur !== "0px") filters.push(`blur(${s.filter.blur})`);
    if (s.filter.brightness && s.filter.brightness !== "100%") filters.push(`brightness(${s.filter.brightness})`);
    if (s.filter.contrast && s.filter.contrast !== "100%") filters.push(`contrast(${s.filter.contrast})`);
    if (filters.length) css.filter = filters.join(" ");
  }

  // Transform
  if (s.transform) {
    const t = s.transform;
    const parts: string[] = [];
    const tx = parseFloat(t.translateX) || 0;
    const ty = parseFloat(t.translateY) || 0;
    if (tx !== 0 || ty !== 0) parts.push(`translate(${t.translateX}, ${t.translateY})`);
    const rot = parseFloat(t.rotate) || 0;
    if (rot !== 0) parts.push(`rotate(${t.rotate})`);
    const sx = parseFloat(t.scaleX) || 1;
    const sy = parseFloat(t.scaleY) || 1;
    if (sx !== 1 || sy !== 1) parts.push(`scale(${t.scaleX}, ${t.scaleY})`);
    const skx = parseFloat(t.skewX) || 0;
    const sky = parseFloat(t.skewY) || 0;
    if (skx !== 0 || sky !== 0) parts.push(`skew(${t.skewX}, ${t.skewY})`);
    if (parts.length) css.transform = parts.join(" ");
  }

  // Aspect ratio
  if (s.aspectRatio) css.aspectRatio = s.aspectRatio;

  const anim = animationToCss(s.animation);
  if (anim) css.animation = anim;

  if (s.transition) {
    const t = s.transition;
    if (t.duration) {
      css.transition = `${t.properties || "all"} ${t.duration} ${t.easing || "ease"}`;
    }
  }

  return css;
}

/** Generate hover CSS string for injection */
export function hoverToCss(className: string, hover: StylesValue["hover"]): string | undefined {
  if (!hover) return undefined;
  const cssProps = stylesToCss(hover as StylesValue);
  if (!Object.keys(cssProps).length) return undefined;

  const rules = Object.entries(cssProps)
    .map(([key, val]) => {
      const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `  ${kebab}: ${val};`;
    })
    .join("\n");

  return `.${className}:hover {\n${rules}\n}`;
}

// ─── StylesFieldOptions ─────────────────────────────────────────────

export type StylesFieldOptions = {
  disableTypography?: boolean;
  disableBackground?: boolean;
  disableEffects?: boolean;
  disableSpacing?: boolean;
  disableBorder?: boolean;
  disableShadow?: boolean;
  disableSize?: boolean;
  disableAnimation?: boolean;
};

// ─── StylesField ────────────────────────────────────────────────────

export function StylesField({
  value,
  onChange,
  options,
}: {
  value: StylesValue | undefined;
  onChange: (val: StylesValue) => void;
  options?: StylesFieldOptions;
}) {
  const v: StylesValue = value || {};
  const opts = options || {};
  const defaultFilter = { blur: "0px", brightness: "100%", contrast: "100%" };

  // State mode toggle
  const [stateMode, setStateMode] = useState<"default" | "hover">("default");
  const isHover = stateMode === "hover";

  // Media manager
  const [mediaOpen, setMediaOpen] = useState(false);

  // Read/write helpers that respect hover mode
  const target = isHover ? (v.hover || {}) : v;
  const setField = <K extends HoverableKeys>(key: K, val: StylesValue[K]) => {
    if (isHover) {
      onChange({ ...v, hover: { ...(v.hover || {}), [key]: val } });
    } else {
      onChange({ ...v, [key]: val });
    }
  };

  // Transition is always on default mode
  const setTransition = (t: TransitionValue) => onChange({ ...v, transition: t });

  return (
    <div>
      {/* ── State Toggle ── */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setStateMode("default")}
          className={`flex-1 py-2 text-[11px] transition-colors ${
            !isHover ? "text-indigo-600 border-b-2 border-indigo-500" : "text-gray-500 hover:text-gray-600"
          }`}
        >
          Default
        </button>
        <button
          type="button"
          onClick={() => setStateMode("hover")}
          className={`flex-1 py-2 text-[11px] transition-colors ${
            isHover ? "text-amber-600 border-b-2 border-amber-500" : "text-gray-500 hover:text-gray-600"
          }`}
        >
          Hover
        </button>
      </div>

      {/* ── Section Sections ── */}
      <div className="divide-y divide-gray-100">

        {/* ── Spacing (most used — always open) ── */}
        {!opts.disableSpacing && (
          <Section title="Spacing" icon="▤" defaultOpen>
            <SpacingField label="Padding" value={target.padding} onChange={(val) => setField("padding", val)} />
            <SpacingField label="Margin" value={target.margin} onChange={(val) => setField("margin", val)} />
          </Section>
        )}

        {/* ── Typography ── */}
        {!opts.disableTypography && (
          <Section title="Typography" icon="A" defaultOpen>
            <TypographyField value={target.typography} onChange={(val) => setField("typography", val)} />
          </Section>
        )}

        {/* ── Size ── */}
        {!opts.disableSize && !isHover && (
          <Section title="Size" icon="⤡">
            <div className="grid grid-cols-2 gap-2">
              {([
                ["width", "Width", "auto"],
                ["height", "Height", "auto"],
                ["minWidth", "Min Width", "0"],
                ["maxWidth", "Max Width", "none"],
                ["minHeight", "Min Height", "0"],
                ["maxHeight", "Max Height", "none"],
              ] as const).map(([key, label, ph]) => (
                <div key={key}>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">{label}</label>
                  <input
                    type="text"
                    value={(target[key] as string) || ""}
                    onChange={(e) => setField(key, (e.target.value || undefined) as StylesValue[typeof key])}
                    className="w-full text-[11px] border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow"
                    placeholder={ph}
                  />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Layout (collapsed — advanced) ── */}
        {!isHover && (
          <Section title="Layout" icon="⊞">
            <LayoutSection value={v} onChange={onChange} />
          </Section>
        )}

        {/* ── Position ── */}
        {!isHover && (
          <Section title="Position" icon="⊕">
            <PositionSection value={v} onChange={onChange} />
          </Section>
        )}

        {/* ── Border ── */}
        {!opts.disableBorder && (
          <Section title="Border" icon="▢">
            <BorderField value={target.border} onChange={(val) => setField("border", val)} />
          </Section>
        )}

        {/* ── Shadow ── */}
        {!opts.disableShadow && (
          <Section title="Shadow" icon="▪">
            <ShadowField value={target.shadow} onChange={(val) => setField("shadow", val)} />
          </Section>
        )}

        {/* ── Background ── */}
        {!opts.disableBackground && (
          <Section title="Background" icon="◨">
            <ColorPickerField label="Color" value={target.backgroundColor} onChange={(val) => setField("backgroundColor", val)} />

            {/* Background Image (default mode only) */}
            {!isHover && (
              <div className="space-y-2">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Image</div>
                {v.backgroundImageUrl ? (
                  <div className="relative w-full h-20 rounded-lg border border-gray-200 overflow-hidden bg-[var(--inspector-surface)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.backgroundImageUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => onChange({ ...v, backgroundImageUrl: undefined })}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => setMediaOpen(true)}
                  className="w-full text-[11px] py-2 rounded-md border border-dashed border-gray-300 text-gray-500 hover:border-[var(--inspector-accent)] hover:text-[var(--inspector-accent-text)] hover:bg-[var(--inspector-accent-surface)] transition-all"
                >
                  {v.backgroundImageUrl ? "Change Image" : "Select Image"}
                </button>

                {v.backgroundImageUrl && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Size</label>
                      <select
                        value={v.backgroundSize || "cover"}
                        onChange={(e) => onChange({ ...v, backgroundSize: e.target.value })}
                        className="w-full text-[11px] border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-shadow"
                      >
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Position</label>
                      <select
                        value={v.backgroundPosition || "center"}
                        onChange={(e) => onChange({ ...v, backgroundPosition: e.target.value })}
                        className="w-full text-[11px] border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-shadow"
                      >
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Repeat</label>
                      <select
                        value={v.backgroundRepeat || "no-repeat"}
                        onChange={(e) => onChange({ ...v, backgroundRepeat: e.target.value })}
                        className="w-full text-[11px] border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-shadow"
                      >
                        <option value="no-repeat">No Repeat</option>
                        <option value="repeat">Repeat</option>
                        <option value="repeat-x">Repeat X</option>
                        <option value="repeat-y">Repeat Y</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

          </Section>
        )}

        {/* ── Animation ── */}
        {!opts.disableAnimation && !isHover && (
          <Section title="Animation" icon="✦">
            <AnimationField value={v.animation} onChange={(val) => onChange({ ...v, animation: val })} />
          </Section>
        )}

        {/* ── Transform ── */}
        {!isHover && (
          <Section title="Transform" icon="⟲">
            <TransformSection value={v} onChange={onChange} />
          </Section>
        )}

        {/* ── Effects ── */}
        {!opts.disableEffects && (
          <Section title="Effects" icon="◈">
            <SliderInput
              label="Opacity"
              value={target.opacity !== undefined ? String(target.opacity) : "100"}
              onChange={(val) => {
                const n = parseInt(val);
                setField("opacity", isNaN(n) ? undefined : Math.min(100, Math.max(0, n)));
              }}
              min={0} max={100}
            />
            {!isHover && (
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Overflow</label>
                <select
                  value={target.overflow || "visible"}
                  onChange={(e) => setField("overflow", e.target.value as StylesValue["overflow"])}
                  className="w-full text-[11px] border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-shadow"
                >
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                  <option value="scroll">Scroll</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            )}
            {!isHover && (
              <div className="space-y-2 pt-1">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Filters</div>
                <SliderInput label="Blur" value={v.filter?.blur || "0px"}
                  onChange={(val) => onChange({ ...v, filter: { ...(v.filter || defaultFilter), blur: val } })}
                  min={0} max={20} step={0.5}
                />
                <SliderInput label="Brightness" value={v.filter?.brightness || "100%"}
                  onChange={(val) => onChange({ ...v, filter: { ...(v.filter || defaultFilter), brightness: val } })}
                  min={0} max={200}
                />
                <SliderInput label="Contrast" value={v.filter?.contrast || "100%"}
                  onChange={(val) => onChange({ ...v, filter: { ...(v.filter || defaultFilter), contrast: val } })}
                  min={0} max={200}
                />
              </div>
            )}
          </Section>
        )}

        {/* ── Transition ── */}
        {isHover && (
          <Section title="Transition" icon="↝" defaultOpen>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Duration</label>
                <select
                  value={v.transition?.duration || "0.2s"}
                  onChange={(e) => setTransition({ ...(v.transition || { duration: "0.2s", easing: "ease", properties: "all" }), duration: e.target.value })}
                  className="w-full text-[11px] border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-shadow"
                >
                  <option value="0.1s">0.1s</option>
                  <option value="0.2s">0.2s</option>
                  <option value="0.3s">0.3s</option>
                  <option value="0.5s">0.5s</option>
                  <option value="0.7s">0.7s</option>
                  <option value="1s">1s</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Easing</label>
                <select
                  value={v.transition?.easing || "ease"}
                  onChange={(e) => setTransition({ ...(v.transition || { duration: "0.2s", easing: "ease", properties: "all" }), easing: e.target.value })}
                  className="w-full text-[11px] border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-shadow"
                >
                  <option value="ease">Ease</option>
                  <option value="linear">Linear</option>
                  <option value="ease-in">Ease In</option>
                  <option value="ease-out">Ease Out</option>
                  <option value="ease-in-out">Ease In Out</option>
                </select>
              </div>
            </div>
          </Section>
        )}

        {/* ── Advanced ── */}
        {!isHover && (
          <Section title="Advanced" icon="⚙">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">CSS Classes</label>
              <input
                type="text" value={v.cssClasses || ""}
                onChange={(e) => onChange({ ...v, cssClasses: e.target.value || undefined })}
                className="w-full text-[11px] border border-gray-200 rounded-md px-2 py-1.5 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow"
                placeholder="class1 class2 ..."
              />
            </div>
          </Section>
        )}
      </div>

      {/* ── Media Manager Modal ── */}
      <MediaManager
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => onChange({ ...v, backgroundImageUrl: url, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" })}
      />
    </div>
  );
}
