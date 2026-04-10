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

const bounceIcons = new Set(["megaphone", "gift"]);

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
    marquee = false,
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

  const iconAnimated = icon && bounceIcons.has(icon);

  const ctaLink = ctaText && ctaHref ? (
    <a
      href={ctaHref}
      className="announcement-cta text-sm font-semibold relative inline-block group"
    >
      {ctaText}
    </a>
  ) : null;

  const iconElement = icon && iconMap[icon] ? (
    <span className={`shrink-0 ${iconAnimated ? "animate-bounce" : ""}`}>
      {iconMap[icon]}
    </span>
  ) : null;

  const messageContent = (
    <>
      {iconElement}
      <p className="text-sm font-medium whitespace-nowrap">{message}</p>
      {ctaLink}
    </>
  );

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes marquee {
          from { transform: translateX(0%); }
          to { transform: translateX(-50%); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .announcement-marquee-track {
          display: flex;
          animation: marquee 25s linear infinite;
        }
        .announcement-bar:hover .announcement-marquee-track {
          animation-play-state: paused;
        }
        .announcement-bar:hover .announcement-shimmer {
          animation-play-state: paused;
        }
        .announcement-shimmer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .announcement-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.15) 50%,
            transparent 100%
          );
          animation: shimmer 3s ease-in-out infinite;
        }
        .announcement-cta::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 0;
          height: 1px;
          background: currentColor;
          transition: width 0.25s ease;
        }
        .announcement-cta:hover::after {
          width: 100%;
        }
      `}</style>
      <div
        className={`announcement-bar w-full py-2 px-4 overflow-hidden relative ${bgClass} ${animClass} ${className ?? ""}`}
        style={{ ...customBgStyle, ...extractStyleProps(metaRest) }}
      >
        {marquee && <div className="announcement-shimmer" />}

        {marquee ? (
          <div className="flex items-center overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}>
            <div className="announcement-marquee-track">
              <div className="flex items-center gap-4 shrink-0 pr-4">
                {messageContent}
              </div>
              <div className="flex items-center gap-4 shrink-0 pr-4" aria-hidden="true">
                {messageContent}
              </div>
              <div className="flex items-center gap-4 shrink-0 pr-4" aria-hidden="true">
                {messageContent}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto relative">
            {messageContent}
          </div>
        )}

        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 hover:bg-white/20 hover:scale-110"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}
