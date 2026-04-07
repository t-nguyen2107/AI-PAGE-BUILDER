"use client";

import { useState, type ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════════════
 * Shared Inspector UI Primitives
 *
 * All components use --inspector-* CSS tokens from inspector-tokens.css
 * for light/dark mode consistency. Do NOT use hardcoded Tailwind colors.
 * ═══════════════════════════════════════════════════════════════════════ */

// ─── PropertyLabel ───────────────────────────────────────────────────

export function PropertyLabel({
  children,
  htmlFor,
  onReset,
  dimmed = false,
}: {
  children: ReactNode;
  htmlFor?: string;
  onReset?: () => void;
  dimmed?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 mb-[2px]">
      {typeof children === "string" && htmlFor ? (
        <label
          htmlFor={htmlFor}
          className="text-[var(--inspector-font-size-xs)] font-normal uppercase tracking-wider text-[var(--inspector-text-secondary)]"
        >
          {children}
        </label>
      ) : (
        <span className="text-[var(--inspector-font-size-xs)] font-normal uppercase tracking-wider text-[var(--inspector-text-secondary)]">
          {children}
        </span>
      )}
      {dimmed && (
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--inspector-accent)] shrink-0" />
      )}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="ml-auto text-[var(--inspector-text-dim)] hover:text-[var(--inspector-danger)] transition-colors"
          title="Reset to default"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── PropertyRow ─────────────────────────────────────────────────────

export function PropertyRow({
  label,
  children,
  htmlFor,
  onReset,
}: {
  label: string;
  children: ReactNode;
  htmlFor?: string;
  onReset?: () => void;
}) {
  return (
    <div>
      <PropertyLabel htmlFor={htmlFor} onReset={onReset}>{label}</PropertyLabel>
      {children}
    </div>
  );
}

// ─── SectionHeader + SectionPanel (Accordion) ────────────────────────

export function Section({
  title,
  icon,
  defaultOpen = false,
  indicator,
  children,
}: {
  title?: string;
  icon?: string;
  defaultOpen?: boolean;
  /** Colored dot to show a value is set (e.g. "has shadow", "has animation") */
  indicator?: "accent" | "success" | "warning" | "danger";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const indicatorColor = {
    accent: "bg-[var(--inspector-accent)]",
    success: "bg-[var(--inspector-success)]",
    warning: "bg-[var(--inspector-warning)]",
    danger: "bg-[var(--inspector-danger)]",
  }[indicator ?? "accent"];

  return (
    <div
      className="group border-l-2 transition-colors"
      style={{
        borderLeftColor: open ? "var(--inspector-accent)" : "transparent",
        backgroundColor: open ? "var(--inspector-bg)" : "transparent",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-1.5 transition-colors"
        style={{
          padding: "7px 16px",
          fontSize: "var(--inspector-font-size, 11px)",
          fontWeight: 400,
          color: "var(--inspector-text)",
        }}
      >
        {icon && <span className="text-xs opacity-70 shrink-0">{icon}</span>}
        <span className="flex-1 text-left uppercase tracking-wider">
          {title}
        </span>
        {indicator && !open && (
          <span className={`w-1.5 h-1.5 rounded-full ${indicatorColor} shrink-0`} />
        )}
        <svg
          className="w-3 h-3 shrink-0"
          style={{
            color: "var(--inspector-text-dim)",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform var(--inspector-transition-fast, 120ms)",
          }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: "6px 16px 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--inspector-gap-xl, 12px)" }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PresetButton ────────────────────────────────────────────────────

export function PresetButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[var(--inspector-control-height)] min-w-[32px] px-[var(--inspector-gap-sm)] text-[var(--inspector-font-size-xs)] font-normal rounded-[var(--inspector-radius-sm)] border transition-colors"
      style={{
        borderColor: active ? "var(--inspector-accent)" : "var(--inspector-border)",
        backgroundColor: active ? "var(--inspector-accent-surface)" : "var(--inspector-surface)",
        color: active ? "var(--inspector-accent-text)" : "var(--inspector-text-secondary)",
      }}
    >
      {label}
    </button>
  );
}

// ─── PresetRow ───────────────────────────────────────────────────────

export function PresetRow({
  options,
  activeValue,
  onSelect,
}: {
  options: string[];
  activeValue?: string;
  onSelect: (val: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[var(--inspector-gap-xs)]">
      {options.map((opt) => (
        <PresetButton
          key={opt}
          label={opt}
          active={activeValue === opt}
          onClick={() => onSelect(opt)}
        />
      ))}
    </div>
  );
}

// ─── ValueInput ──────────────────────────────────────────────────────

export function ValueInput({
  value,
  onChange,
  placeholder,
  units,
  className = "",
  id,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  /** If provided, shows a unit selector dropdown */
  units?: string[];
  className?: string;
  id?: string;
}) {
  // Extract current unit
  const currentNum = value.replace(/^-?[\d.]+/, "") ? value.match(/^-?([\d.]+)/)?.[1] ?? "" : value;
  const currentUnit = value.replace(/^-?[\d.]+/, "") || (units?.[0] ?? "");

  if (units && units.length > 1) {
    return (
      <div className="flex items-stretch rounded-[var(--inspector-radius-sm)] border border-[var(--inspector-border)] overflow-hidden focus-within:border-[var(--inspector-border-focus)] focus-within:ring-1 focus-within:ring-[var(--inspector-accent)] transition-colors">
        <input
          id={id}
          type="text"
          value={currentNum}
          onChange={(e) => {
            const raw = e.target.value;
            onChange(raw + currentUnit);
          }}
          placeholder={placeholder}
          className={`flex-1 min-w-0 px-[var(--inspector-gap-sm)] py-[3px] text-[var(--inspector-font-size)] font-mono bg-[var(--inspector-surface)] text-[var(--inspector-text)] outline-none ${className}`}
        />
        <select
          value={currentUnit}
          onChange={(e) => {
            onChange(currentNum + e.target.value);
          }}
          className="px-[var(--inspector-gap-xs)] py-0 text-[var(--inspector-font-size-xs)] bg-[var(--inspector-surface)] text-[var(--inspector-text-secondary)] border-l border-[var(--inspector-border)] outline-none cursor-pointer"
        >
          {units.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-[var(--inspector-control-height)] px-[var(--inspector-gap-sm)] text-[var(--inspector-font-size)] font-mono bg-[var(--inspector-surface)] text-[var(--inspector-text)] border border-[var(--inspector-border)] rounded-[var(--inspector-radius-sm)] outline-none focus:border-[var(--inspector-border-focus)] focus:ring-1 focus:ring-[var(--inspector-accent)] transition-colors ${className}`}
    />
  );
}

// ─── SegmentedControl ────────────────────────────────────────────────

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "sm",
}: {
  options: Array<{ label: string; value: T; icon?: ReactNode }>;
  value: T | undefined;
  onChange: (val: T) => void;
  size?: "sm" | "md";
}) {
  const height = size === "md" ? "var(--inspector-control-height-lg)" : "var(--inspector-control-height)";

  return (
    <div
      className="flex rounded-[var(--inspector-radius-sm)] border border-[var(--inspector-border)] overflow-hidden"
      style={{ height }}
    >
      {options.map((opt, i) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="flex items-center justify-center gap-1 px-[var(--inspector-gap-sm)] text-[var(--inspector-font-size-xs)] font-normal transition-colors outline-none"
          style={{
            backgroundColor: value === opt.value ? "var(--inspector-accent-surface)" : "var(--inspector-surface)",
            color: value === opt.value ? "var(--inspector-accent-text)" : "var(--inspector-text-secondary)",
            borderRight: i < options.length - 1 ? "1px solid var(--inspector-border)" : "none",
          }}
          title={opt.label}
        >
          {opt.icon && <span className="shrink-0">{opt.icon}</span>}
          <span className="truncate">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── ToggleButton ────────────────────────────────────────────────────

export function ToggleButton({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1 h-[var(--inspector-control-height)] px-[var(--inspector-gap-sm)] rounded-[var(--inspector-radius-sm)] border text-[var(--inspector-font-size-xs)] font-normal transition-colors"
      style={{
        borderColor: active ? "var(--inspector-accent)" : "var(--inspector-border)",
        backgroundColor: active ? "var(--inspector-accent-surface)" : "var(--inspector-surface)",
        color: active ? "var(--inspector-accent-text)" : "var(--inspector-text-secondary)",
      }}
      title={label}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
}

// ─── LinkedControl (TRBL) ────────────────────────────────────────────

export function LinkedControl({
  values,
  onChange,
  linked,
  onToggleLink,
}: {
  values: [string, string, string, string];
  onChange: (index: 0 | 1 | 2 | 3, val: string) => void;
  linked: boolean;
  onToggleLink: () => void;
}) {
  const handleLinkedChange = (index: 0 | 1 | 2 | 3, val: string) => {
    if (linked) {
      // When linked, set all sides to the same value
      for (const i of [0, 1, 2, 3] as const) {
        onChange(i, val);
      }
    } else {
      onChange(index, val);
    }
  };

  return (
    <div className="flex items-center gap-[var(--inspector-gap-xs)]">
      <div className="grid grid-cols-2 gap-[var(--inspector-gap-xs)] flex-1">
        {values.map((val, i) => (
          <input
            key={i}
            type="text"
            value={val}
            onChange={(e) => handleLinkedChange(i as 0 | 1 | 2 | 3, e.target.value)}
            placeholder="0"
            className="w-full h-[var(--inspector-control-height)] text-center text-[var(--inspector-font-size)] font-mono bg-[var(--inspector-surface)] text-[var(--inspector-text)] border border-[var(--inspector-border)] rounded-[var(--inspector-radius-sm)] outline-none focus:border-[var(--inspector-border-focus)] focus:ring-1 focus:ring-[var(--inspector-accent)] transition-colors"
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onToggleLink}
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-[var(--inspector-radius-sm)] border transition-colors"
        style={{
          borderColor: linked ? "var(--inspector-accent)" : "var(--inspector-border)",
          color: linked ? "var(--inspector-accent)" : "var(--inspector-text-dim)",
          backgroundColor: linked ? "var(--inspector-accent-surface)" : "transparent",
        }}
        title={linked ? "Unlink sides" : "Link sides"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {linked ? (
            <>
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </>
          ) : (
            <>
              <path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M5.16 11.75l-1.72 1.71a5 5 0 0 0 7.07 7.07l1.72-1.71" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}

// ─── InlineSelect ────────────────────────────────────────────────────

export function InlineSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: T | "" | undefined;
  onChange: (val: T) => void;
  options: Array<{ label: string; value: T }>;
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="w-full h-[var(--inspector-control-height)] px-[var(--inspector-gap-sm)] text-[var(--inspector-font-size)] bg-[var(--inspector-surface)] text-[var(--inspector-text)] border border-[var(--inspector-border)] rounded-[var(--inspector-radius-sm)] outline-none focus:border-[var(--inspector-border-focus)] focus:ring-1 focus:ring-[var(--inspector-accent)] transition-colors cursor-pointer"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

// ─── InlineInput ─────────────────────────────────────────────────────

export function InlineInput({
  value,
  onChange,
  placeholder,
  mono = false,
  center = false,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  mono?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-[var(--inspector-control-height)] px-[var(--inspector-gap-sm)] text-[var(--inspector-font-size)] bg-[var(--inspector-surface)] text-[var(--inspector-text)] border border-[var(--inspector-border)] rounded-[var(--inspector-radius-sm)] outline-none focus:border-[var(--inspector-border-focus)] focus:ring-1 focus:ring-[var(--inspector-accent)] transition-colors ${mono ? "font-mono" : ""} ${center ? "text-center" : ""} ${className}`}
    />
  );
}

// ─── SliderInput ─────────────────────────────────────────────────────

export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  min: number;
  max: number;
  step?: number;
  /** Display unit (e.g. "px", "%") appended to the number display */
  unit?: string;
}) {
  const num = parseFloat(value) || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-[2px]">
        <PropertyLabel>{label}</PropertyLabel>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-14 h-5 text-[var(--inspector-font-size-xs)] font-mono text-center bg-[var(--inspector-surface)] text-[var(--inspector-text)] border border-[var(--inspector-border)] rounded-[var(--inspector-radius-sm)] outline-none focus:border-[var(--inspector-border-focus)] transition-colors"
        />
      </div>
      <input
        type="range"
        value={Math.min(Math.max(num, min), max)}
        onChange={(e) => {
          const raw = e.target.value;
          const existingUnit = value.replace(/^-?[\d.]+/, "") || unit;
          onChange(raw + existingUnit);
        }}
        min={min}
        max={max}
        step={step}
        className="w-full h-1 cursor-pointer accent-[var(--inspector-accent)]"
      />
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────

export function Divider() {
  return <div className="border-t border-[var(--inspector-border)] my-[var(--inspector-gap-xs)]" />;
}

// ─── Icon helpers for SegmentedControl ───────────────────────────────

export const LayoutIcons = {
  /** Display: block icon */
  block: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  /** Display: flex icon */
  flex: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="18" rx="1" />
      <rect x="14" y="3" width="7" height="18" rx="1" />
    </svg>
  ),
  /** Display: grid icon */
  grid: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  /** Display: inline icon */
  inline: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="8" height="10" rx="1" />
      <rect x="14" y="7" width="8" height="10" rx="1" />
    </svg>
  ),
  /** Display: none icon */
  none: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="4" y1="4" x2="20" y2="20" />
    </svg>
  ),
  /** Flex direction: row */
  row: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="6" width="6" height="12" rx="1" />
      <rect x="9" y="6" width="6" height="12" rx="1" opacity="0.6" />
      <rect x="16" y="6" width="6" height="12" rx="1" opacity="0.3" />
    </svg>
  ),
  /** Flex direction: column */
  col: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="2" width="12" height="6" rx="1" />
      <rect x="6" y="9" width="12" height="6" rx="1" opacity="0.6" />
      <rect x="6" y="16" width="12" height="6" rx="1" opacity="0.3" />
    </svg>
  ),
  /** Align: start */
  alignStart: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="4" width="18" height="3" rx="0.5" />
      <rect x="3" y="9" width="10" height="3" rx="0.5" opacity="0.5" />
      <rect x="3" y="14" width="14" height="3" rx="0.5" opacity="0.3" />
    </svg>
  ),
  /** Align: center */
  alignCenter: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="4" width="18" height="3" rx="0.5" />
      <rect x="5" y="9" width="14" height="3" rx="0.5" opacity="0.5" />
      <rect x="7" y="14" width="10" height="3" rx="0.5" opacity="0.3" />
    </svg>
  ),
  /** Align: end */
  alignEnd: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="4" width="18" height="3" rx="0.5" />
      <rect x="11" y="9" width="10" height="3" rx="0.5" opacity="0.5" />
      <rect x="7" y="14" width="14" height="3" rx="0.5" opacity="0.3" />
    </svg>
  ),
  /** Align: stretch */
  stretch: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="4" width="20" height="3" rx="0.5" />
      <rect x="2" y="9" width="20" height="3" rx="0.5" opacity="0.5" />
      <rect x="2" y="14" width="20" height="3" rx="0.5" opacity="0.3" />
    </svg>
  ),
  /** Space: between */
  spaceBetween: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="4" width="6" height="16" rx="1" />
      <rect x="16" y="4" width="6" height="16" rx="1" />
    </svg>
  ),
  /** Space: around */
  spaceAround: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="1" y="4" width="5" height="16" rx="1" />
      <rect x="9.5" y="4" width="5" height="16" rx="1" opacity="0.5" />
      <rect x="18" y="4" width="5" height="16" rx="1" />
    </svg>
  ),
  /** Wrap toggle */
  wrap: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 17.5h7" strokeLinecap="round" />
    </svg>
  ),
  /** No wrap */
  noWrap: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="6" height="10" rx="1" />
      <rect x="9" y="7" width="6" height="10" rx="1" />
      <rect x="16" y="7" width="6" height="10" rx="1" />
    </svg>
  ),
};
