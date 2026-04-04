"use client";

import { useState, useEffect } from "react";
import type { CountdownTimerProps } from "../types";

function calcRemaining(endDate: string) {
  const target = new Date(endDate);
  if (isNaN(target.getTime())) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function CountdownTimer({
  heading,
  subtext,
  endDate,
  ctaText,
  ctaHref,
  showDays = true,
  showHours = true,
}: CountdownTimerProps) {
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
    ...(showDays ? [{ value: pad(remaining.days), label: "Days" }] : []),
    ...(showHours ? [{ value: pad(remaining.hours), label: "Hours" }] : []),
    { value: pad(remaining.minutes), label: "Minutes" },
    { value: pad(remaining.seconds), label: "Seconds" },
  ];

  return (
    <section className="w-full py-20 px-6 bg-muted text-foreground">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
        {subtext && (
          <p className="text-lg opacity-70 mb-2 max-w-xl mx-auto">{subtext}</p>
        )}
        <p className="text-sm text-muted-foreground mb-10">
          Ends {formattedDate}
        </p>

        <div className="flex justify-center gap-4 mb-10">
          {units.map((unit) => (
            <div
              key={unit.label}
              className="flex flex-col items-center bg-background rounded-lg px-5 py-4 min-w-[80px] shadow-sm"
            >
              <span className="text-3xl md:text-4xl font-bold text-primary tabular-nums">
                {unit.value}
              </span>
              <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                {unit.label}
              </span>
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
      </div>
    </section>
  );
}
