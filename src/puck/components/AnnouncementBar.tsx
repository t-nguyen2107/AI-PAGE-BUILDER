"use client";

import { useState } from "react";
import type { AnnouncementBarProps } from "../types";

const bgStyles: Record<AnnouncementBarProps["bgColor"], string> = {
  primary: "bg-primary text-primary-foreground",
  dark: "bg-gray-900 text-white",
  accent: "bg-yellow-500 text-gray-900",
};

export function AnnouncementBar({
  message,
  ctaText,
  ctaHref,
  bgColor = "primary",
  dismissible = false,
}: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return <div />;

  return (
    <div className={`w-full py-2 px-4 ${bgStyles[bgColor]}`}>
      <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto relative">
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
  );
}
