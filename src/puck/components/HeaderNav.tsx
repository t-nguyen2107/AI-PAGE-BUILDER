"use client";

import { useState } from "react";
import type { HeaderNavProps } from "../types";

export function HeaderNav({ logo, links, ctaText, ctaHref, sticky }: HeaderNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className={`flex items-center justify-between px-6 py-4 border-b border-border bg-background ${
        sticky ? "sticky top-0 z-50" : ""
      }`}
    >
      <div className="font-bold text-xl text-foreground">{logo}</div>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-6">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {ctaText && ctaHref && (
          <a
            href={ctaHref}
            className="hidden md:inline-block bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition"
          >
            {ctaText}
          </a>
        )}

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] w-6 h-6"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block h-[2px] bg-foreground transition-transform ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block h-[2px] bg-foreground transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-[2px] bg-foreground transition-transform ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border md:hidden z-50">
          <div className="flex flex-col p-4 gap-3">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition py-2"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {ctaText && ctaHref && (
              <a
                href={ctaHref}
                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold text-center hover:opacity-90 transition"
              >
                {ctaText}
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
