"use client";

import { useState, useEffect } from "react";
import type { CountdownTimerProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

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
    animation = "none",
    endMessage,
    className,
    ...metaRest
  } = props;

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

  // Animation wrapper classes
  const animClass =
    animation === "fade-up"
      ? "animate-[fadeUp_0.6s_ease-out_both]"
      : "";

  // Style variants for the digit containers
  const unitClassByStyle: Record<string, string> = {
    default:
      "flex flex-col items-center bg-background rounded-lg px-5 py-4 min-w-[80px] shadow-sm",
    flip:
      "flex flex-col items-center bg-inverse-surface text-inverse-on-surface rounded-lg px-5 py-4 min-w-[80px] shadow-lg relative overflow-hidden",
    minimal:
      "flex flex-col items-center px-4 py-2 min-w-[60px]",
  };

  const digitClassByStyle: Record<string, string> = {
    default: "text-3xl md:text-4xl font-bold text-primary tabular-nums",
    flip: "text-3xl md:text-4xl font-bold tabular-nums",
    minimal: "text-2xl md:text-3xl font-semibold text-foreground tabular-nums",
  };

  const labelClassByStyle: Record<string, string> = {
    default: "text-xs text-muted-foreground mt-1 uppercase tracking-wider",
    flip: "text-[10px] text-on-surface-outline mt-1 uppercase tracking-wider",
    minimal: "text-xs text-muted-foreground mt-0.5 uppercase tracking-wide",
  };

  return (
    <>
      {animation === "fade-up" && (
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      )}
      <section
        className={`w-full py-20 px-6 bg-muted text-foreground ${animClass} ${className ?? ""}`}
        style={extractStyleProps(metaRest)}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
          {subtext && (
            <p className="text-lg opacity-70 mb-2 max-w-xl mx-auto">{subtext}</p>
          )}

          {remaining.ended && endMessage ? (
            <div className="mt-6">
              <p className="text-xl font-semibold text-primary">{endMessage}</p>
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
                      <div className="absolute inset-x-0 top-1/2 h-px bg-outline" />
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
                  className="inline-block rounded-lg px-8 py-3 font-semibold transition bg-primary text-primary-foreground hover:opacity-90"
                >
                  {ctaText}
                </a>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
