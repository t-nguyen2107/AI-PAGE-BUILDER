"use client";

import { useState, useEffect } from "react";
import type { CountdownTimerProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";

function calcRemaining(endDate: string) {
  const target = new Date(endDate);
  if (isNaN(target.getTime())) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };

  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    ended: diff <= 0,
  };
}

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

  useEffect(() => {
    const id = setInterval(() => setRemaining(calcRemaining(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const target = new Date(endDate);
  const isValid = !isNaN(target.getTime());
  const formattedDate = isValid
    ? `${months[target.getMonth()]} ${target.getDate()}, ${target.getFullYear()}`
    : endDate;

  const units = [
    ...(showDays ? [{ value: pad(remaining.days), raw: remaining.days, label: "Days" }] : []),
    ...(showHours ? [{ value: pad(remaining.hours), raw: remaining.hours, label: "Hours" }] : []),
    { value: pad(remaining.minutes), raw: remaining.minutes, label: "Minutes" },
    { value: pad(remaining.seconds), raw: remaining.seconds, label: "Seconds" },
  ];

  // Style variants for the digit containers
  const unitClassByStyle: Record<string, string> = {
    default:
      `flex flex-col items-center bg-card ${ds.card.base} px-5 py-4 min-w-[80px]`,
    flip:
      "flex flex-col items-center bg-foreground text-background rounded-lg px-5 py-4 min-w-[80px] shadow-lg relative overflow-hidden",
    minimal:
      "flex flex-col items-center px-4 py-2 min-w-[60px]",
  };

  const digitClassByStyle: Record<string, string> = {
    default: `text-3xl md:text-4xl font-bold text-primary tabular-nums`,
    flip: "text-3xl md:text-4xl font-bold tabular-nums",
    minimal: "text-2xl md:text-3xl font-semibold text-foreground tabular-nums",
  };

  const labelClassByStyle: Record<string, string> = {
    default: "text-xs text-muted-foreground mt-1 uppercase tracking-wider",
    flip: "text-[10px] text-background/60 mt-1 uppercase tracking-wider",
    minimal: "text-xs text-muted-foreground mt-0.5 uppercase tracking-wide",
  };

  return (
    <section
      className={`w-full ${ds.section.base} text-foreground relative ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {ds.section.decorative && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className={ds.section.decorative} />
        </div>
      )}
      <div className={`${ds.containerWidth === "max-w-7xl" || ds.containerWidth === "max-w-6xl" ? "max-w-3xl" : ds.containerWidth} mx-auto text-center relative`}>
        <h2 className={`${ds.typography.h2} mb-4`}>{heading}</h2>
        {subtext && (
          <p className={`text-lg opacity-70 mb-2 max-w-xl mx-auto ${ds.typography.body}`}>{subtext}</p>
        )}

        {remaining.ended && endMessage ? (
          <div className="mt-6">
            <p className={`text-xl font-semibold text-primary`}>{endMessage}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-10">
              Ends {formattedDate}
            </p>

            <div className="flex justify-center gap-4 mb-10">
              {units.map((unit) => (
                <div
                  key={unit.label}
                  className={unitClassByStyle[style] ?? unitClassByStyle.default}
                >
                  {style === "flip" && (
                    <div className="absolute inset-x-0 top-1/2 h-px bg-background/20" />
                  )}
                  <span className={digitClassByStyle[style] ?? digitClassByStyle.default}>
                    {unit.value}
                  </span>
                  {showLabels && (
                    <span className={labelClassByStyle[style] ?? labelClassByStyle.default}>
                      {unit.label}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {ctaText && ctaHref && (
              <a
                href={ctaHref}
                className={`inline-block ${ds.button.primary} bg-primary text-primary-foreground`}
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
