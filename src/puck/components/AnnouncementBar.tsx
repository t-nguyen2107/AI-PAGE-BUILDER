"use client";

import { useState } from "react";
import type { AnnouncementBarProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

const bgStyles: Record<Exclude<AnnouncementBarProps["bgColor"], "custom">, string> = {
  primary: "bg-primary text-primary-foreground",
  dark: "bg-inverse-surface text-inverse-on-surface",
  accent: "bg-tertiary text-on-tertiary",
};

const iconMap: Record<string, React.ReactNode> = {
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  megaphone: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l3-3 8 2 4-4 2 2-4 4 2 8-3 3-2-8-8-2z" />
    </svg>
  ),
  gift: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  ),
  tag: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
};

export function AnnouncementBar(props: AnnouncementBarProps & ComponentMeta) {
  const {
    message,
    ctaText,
    ctaHref,
    bgColor = "primary",
    customBgColor,
    dismissible = false,
    animation = "fade-in",
    icon,
    className,
    ...metaRest
  } = props;

  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return <div />;

  const bgClass = bgColor === "custom" ? "" : (bgStyles[bgColor] ?? bgStyles.primary);
  const customBgStyle: React.CSSProperties = bgColor === "custom" && customBgColor
    ? { backgroundColor: customBgColor, color: "#fff" }
    : {};

  const animClass =
    animation === "slide-down"
      ? "animate-[slideDown_0.4s_ease-out_both]"
      : animation === "fade-in"
        ? "animate-[fadeIn_0.4s_ease-out_both]"
        : "";

  return (
    <>
      {(animation === "slide-down" || animation === "fade-in") && (
        <style>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-100%); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      )}
      <div
        className={`w-full py-2 px-4 ${bgClass} ${animClass} ${className ?? ""}`}
        style={{ ...customBgStyle, ...extractStyleProps(metaRest) }}
      >
        <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto relative">
          {icon && iconMap[icon] && (
            <span className="shrink-0">{iconMap[icon]}</span>
          )}
          <p className="text-sm font-medium">{message}</p>
          {ctaText && ctaHref && (
            <a
              href={ctaHref}
              className="text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition"
            >
              {ctaText}
            </a>
          )}
          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition"
              aria-label="Dismiss"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
