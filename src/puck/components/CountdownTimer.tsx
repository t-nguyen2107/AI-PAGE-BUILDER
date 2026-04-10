"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CountdownTimerProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";

// ─── Helpers ────────────────────────────────────────────────────────────

function calcRemaining(endDate: string) {
  const target = new Date(endDate);
  if (isNaN(target.getTime())) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true, totalMs: 0 };

  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    ended: diff <= 0,
    totalMs: diff,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ─── Flip animation hook ────────────────────────────────────────────────

function useFlipAnimation(value: string) {
  const [flipping, setFlipping] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      setFlipping(true);
      const timer = setTimeout(() => setFlipping(false), 200);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return flipping;
}

// ─── Sub-components ─────────────────────────────────────────────────────

/** Pulsing colon separator between digit groups */
function Separator({ isUrgent }: { isUrgent: boolean }) {
  return (
    <span
      className={`flex items-center text-3xl md:text-5xl font-bold tabular-nums select-none
        ${isUrgent ? "text-red-500/80" : "text-muted-foreground/60"}
        animate-[pulse-sep_1s_ease-in-out_infinite]`}
      aria-hidden="true"
    >
      :
    </span>
  );
}

/** Individual digit unit card for "default" style */
function DefaultUnit({
  value,
  label,
  showLabels,
  isSeconds,
  isUrgent,
}: {
  value: string;
  label: string;
  showLabels: boolean;
  isSeconds: boolean;
  isUrgent: boolean;
}) {
  const urgencyClass = isSeconds && isUrgent
    ? "text-red-500 animate-[urgency-pulse_1s_ease-in-out_infinite]"
    : "text-primary";

  return (
    <div
      className={`flex flex-col items-center min-w-[76px] md:min-w-[96px]
        bg-gradient-to-b from-muted/50 to-muted/30
        border border-border/40 rounded-xl
        shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]
        px-4 py-5 md:px-6 md:py-6
        transition-colors duration-300`}
    >
      <span
        className={`text-5xl md:text-6xl font-bold font-mono tabular-nums leading-none ${urgencyClass}`}
      >
        {value}
      </span>
      {showLabels && (
        <span className="text-[10px] md:text-xs text-muted-foreground/80 mt-2 uppercase tracking-[0.2em] font-medium">
          {label}
        </span>
      )}
    </div>
  );
}

/** Individual digit unit card for "flip" style */
function FlipUnit({
  value,
  label,
  showLabels,
  isSeconds,
  isUrgent,
}: {
  value: string;
  label: string;
  showLabels: boolean;
  isSeconds: boolean;
  isUrgent: boolean;
}) {
  const flipping = useFlipAnimation(value);

  const urgencyClass = isSeconds && isUrgent
    ? "!bg-red-600 animate-[urgency-pulse_1s_ease-in-out_infinite]"
    : "";

  return (
    <div
      className={`flex flex-col items-center min-w-[76px] md:min-w-[96px]
        bg-foreground text-background rounded-xl
        shadow-[0_6px_20px_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.15)]
        relative overflow-hidden
        transition-transform duration-200
        ${flipping ? "scale-95" : "scale-100"}
        ${urgencyClass}`}
    >
      {/* Flip crease line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-px h-[2px] bg-background/10" />
      {/* Subtle top/bottom gradient for 3D feel */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/[0.1] to-transparent pointer-events-none" />

      <div className="relative px-4 py-5 md:px-6 md:py-6 flex flex-col items-center">
        <span
          className={`text-5xl md:text-6xl font-bold font-mono tabular-nums leading-none
            transition-transform duration-200
            ${flipping ? "scale-90" : "scale-100"}`}
        >
          {value}
        </span>
        {showLabels && (
          <span className="text-[10px] md:text-xs text-background/50 mt-2 uppercase tracking-[0.2em] font-medium">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

/** Individual digit unit for "minimal" style */
function MinimalUnit({
  value,
  label,
  showLabels,
  isSeconds,
  isUrgent,
}: {
  value: string;
  label: string;
  showLabels: boolean;
  isSeconds: boolean;
  isUrgent: boolean;
}) {
  const urgencyClass = isSeconds && isUrgent
    ? "text-red-500 animate-[urgency-pulse_1s_ease-in-out_infinite]"
    : "text-foreground";

  return (
    <div className="flex flex-col items-center px-3 md:px-5">
      <span
        className={`text-4xl md:text-6xl font-bold font-mono tabular-nums leading-none ${urgencyClass}`}
      >
        {value}
      </span>
      {showLabels && (
        <span className="text-[10px] md:text-xs text-muted-foreground/70 mt-2 uppercase tracking-[0.18em] font-medium">
          {label}
        </span>
      )}
    </div>
  );
}

/** Vertical divider for minimal style */
function MinimalDivider({ isUrgent }: { isUrgent: boolean }) {
  return (
    <span
      className={`text-3xl md:text-5xl font-light select-none
        ${isUrgent ? "text-red-500/40" : "text-muted-foreground/25"}`}
      aria-hidden="true"
    >
      |
    </span>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

export function CountdownTimer(props: CountdownTimerProps & ComponentMeta) {
  const {
    heading,
    subtext,
    endDate,
    ctaText,
    ctaHref,
    showDays = true,
    showHours = true,
    style = "default",
    showLabels = true,
    animation = "fade-up",
    endMessage,
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);
  const [remaining, setRemaining] = useState(() => calcRemaining(endDate));
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const r = calcRemaining(endDate);
      setRemaining(r);
      if (r.ended && !hasEnded) setHasEnded(true);
    }, 1000);
    return () => clearInterval(id);
  }, [endDate, hasEnded]);

  const target = new Date(endDate);
  const isValid = !isNaN(target.getTime());
  const formattedDate = isValid
    ? `${MONTHS[target.getMonth()]} ${target.getDate()}, ${target.getFullYear()}`
    : endDate;

  const units = [
    ...(showDays ? [{ value: pad(remaining.days), raw: remaining.days, label: "Days" }] : []),
    ...(showHours ? [{ value: pad(remaining.hours), raw: remaining.hours, label: "Hours" }] : []),
    { value: pad(remaining.minutes), raw: remaining.minutes, label: "Minutes" },
    { value: pad(remaining.seconds), raw: remaining.seconds, label: "Seconds" },
  ];

  // Urgency: less than 24 hours remaining
  const isUrgent = !remaining.ended && (remaining.totalMs ?? 0) > 0 && (remaining.totalMs ?? 0) < 86400000;

  // Render the appropriate digit unit based on style
  const renderUnit = useCallback(
    (unit: { value: string; raw: number; label: string }, index: number) => {
      const isLast = index === units.length - 1;
      const isSeconds = unit.label === "Seconds";

      if (style === "flip") {
        return (
          <FlipUnit
            key={unit.label}
            value={unit.value}
            label={unit.label}
            showLabels={showLabels}
            isSeconds={isSeconds}
            isUrgent={isUrgent}
          />
        );
      }

      if (style === "minimal") {
        return (
          <div key={unit.label} className="flex items-center">
            <MinimalUnit
              value={unit.value}
              label={unit.label}
              showLabels={showLabels}
              isSeconds={isSeconds}
              isUrgent={isUrgent}
            />
            {!isLast && <MinimalDivider isUrgent={isUrgent} />}
          </div>
        );
      }

      // default style
      return (
        <DefaultUnit
          key={unit.label}
          value={unit.value}
          label={unit.label}
          showLabels={showLabels}
          isSeconds={isSeconds}
          isUrgent={isUrgent}
        />
      );
    },
    [style, showLabels, isUrgent, units.length],
  );

  // Background card wrapper classes per style
  const wrapperClassByStyle: Record<string, string> = {
    default:
      "inline-flex items-center gap-3 md:gap-4 rounded-2xl bg-muted/20 border border-border/20 shadow-sm px-5 py-5 md:px-8 md:py-7",
    flip:
      "inline-flex items-center gap-3 md:gap-4 rounded-2xl bg-muted/30 border border-border/10 shadow-lg px-5 py-5 md:px-8 md:py-7",
    minimal:
      "inline-flex items-center gap-0 rounded-xl px-2 py-4 md:px-4 md:py-6",
  };

  return (
    <section
      className={`w-full ${ds.section.base} text-foreground relative ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {/* Inline keyframes for animations */}
      <style>{`
        @keyframes pulse-sep {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes urgency-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] { animation: none !important; }
        }
      `}</style>

      {ds.section.decorative && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className={ds.section.decorative} />
        </div>
      )}

      <div
        className={`${ds.containerWidth === "max-w-7xl" || ds.containerWidth === "max-w-6xl" ? "max-w-3xl" : ds.containerWidth} mx-auto text-center relative`}
      >
        <h2 className={`${ds.typography.h2} mb-4`}>{heading}</h2>

        {subtext && (
          <p className={`text-lg opacity-70 mb-3 max-w-xl mx-auto ${ds.typography.body}`}>
            {subtext}
          </p>
        )}

        {/* ── Ended state ─────────────────────────────────────────────── */}
        {hasEnded && endMessage ? (
          <div className="mt-8 transition-all duration-500 ease-out animate-[fadeUp_0.5s_ease-out]">
            <style>{`
              @keyframes fadeUp {
                from { opacity: 0; transform: translateY(12px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <p className="text-2xl md:text-3xl font-bold text-primary mb-6">
              {endMessage}
            </p>
            {ctaText && ctaHref && (
              <a
                href={ctaHref}
                className={`inline-block ${ds.button.primary} bg-primary text-primary-foreground
                  shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35`}
              >
                {ctaText}
              </a>
            )}
          </div>
        ) : (
          <>
            {/* ── Countdown display ────────────────────────────────────── */}
            <p className="text-sm text-muted-foreground mb-8">
              Ends {formattedDate}
            </p>

            <div className="flex justify-center mb-10">
              <div className={wrapperClassByStyle[style] ?? wrapperClassByStyle.default}>
                {units.map((unit, i) => (
                  <div key={unit.label} className="flex items-center gap-3 md:gap-4">
                    {renderUnit(unit, i)}
                    {/* Colon separator for default and flip styles */}
                    {style !== "minimal" && i < units.length - 1 && (
                      <Separator isUrgent={isUrgent} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Urgency badge ──────────────────────────────────────── */}
            {isUrgent && (
              <p className="text-xs font-medium text-red-500/80 uppercase tracking-wider mb-4">
                Less than 24 hours remaining
              </p>
            )}

            {/* ── CTA button ──────────────────────────────────────────── */}
            {ctaText && ctaHref && (
              <a
                href={ctaHref}
                className={`inline-block ${ds.button.primary} bg-primary text-primary-foreground
                  ${isUrgent ? "shadow-xl shadow-red-500/20" : "shadow-lg shadow-primary/15"}
                  hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
              >
                {ctaText}
              </a>
            )}
          </>
        )}
      </div>
    </section>
  );
}
