"use client";

import { useState, useEffect } from "react";
import type { HeaderNavProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

export function HeaderNav(props: HeaderNavProps & ComponentMeta) {
  const {
    logo,
    logoImageUrl,
    links = [],
    ctaText,
    ctaHref,
    sticky,
    mobileMenu = true,
    transparent = false,
    showSearch = false,
    className,
    ...metaRest
  } = props;

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Scroll listener for transparent variant and sticky glassmorphism
  useEffect(() => {
    if (!transparent && !sticky) return;
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [transparent, sticky]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const bgClass = transparent
    ? scrolled
      ? "bg-background/95 backdrop-blur-xl shadow-sm border-b border-border/50"
      : "bg-transparent"
    : sticky && scrolled
      ? "bg-background/80 backdrop-blur-xl shadow-sm border-b border-border/50"
      : "bg-background";

  return (
    <nav
      className={`flex items-center justify-between px-6 py-4 border-b border-border transition-colors duration-300 ${bgClass} ${
        sticky ? "sticky top-0 z-50" : ""
      } ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {/* Logo */}
      <div className="flex items-center shrink-0">
        {logoImageUrl ? (
          <img
            src={logoImageUrl}
            alt={logo || "Logo"}
            className="h-8 w-auto object-contain"
          />
        ) : (
          <span className="text-xl font-bold tracking-tight text-foreground">{logo}</span>
        )}
      </div>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-6">
        {links.map((link, i) => (
          <div key={i} className="relative group">
            <a
              href={link.href}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              {link.label}
              {link.children && (
                <span className="material-symbols-outlined text-sm">
                  expand_more
                </span>
              )}
            </a>
            {link.children && (
              <div className="absolute top-full left-0 hidden group-hover:block bg-background shadow-lg rounded-lg border border-border py-2 min-w-[180px] z-50">
                {link.children.map((child, j) => (
                  <a
                    key={j}
                    href={child.href}
                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-primary transition"
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right section: search + CTA + mobile toggle */}
      <div className="flex items-center gap-3">
        {/* Search */}
        {showSearch && (
          <div className="hidden md:flex items-center">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-40 md:w-56 px-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  aria-label="Close search"
                >
                  <span className="material-symbols-outlined text-muted-foreground hover:text-foreground">
                    close
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <span className="material-symbols-outlined text-muted-foreground hover:text-foreground">
                  search
                </span>
              </button>
            )}
          </div>
        )}

        {/* CTA button (desktop) */}
        {ctaText && ctaHref && (
          <a
            href={ctaHref}
            className="hidden md:inline-block rounded-full px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            {ctaText}
          </a>
        )}

        {/* Mobile hamburger */}
        {mobileMenu && (
          <button
            className="md:hidden flex flex-col justify-center gap-[5px] w-6 h-6"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`block h-[2px] bg-foreground transition-transform ${
                menuOpen ? "rotate-45 translate-y-[7px]" : ""
              }`}
            />
            <span
              className={`block h-[2px] bg-foreground transition-opacity ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-[2px] bg-foreground transition-transform ${
                menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </button>
        )}
      </div>

      {/* Mobile slide-in drawer */}
      {mobileMenu && menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          {/* Drawer */}
          <nav className="absolute right-0 top-0 h-full w-72 bg-background shadow-xl p-6 flex flex-col">
            {/* Close button */}
            <button
              onClick={() => setMenuOpen(false)}
              className="self-end mb-6"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-foreground">
                close
              </span>
            </button>

            {/* Links */}
            <div className="flex flex-col gap-1">
              {links.map((link, i) => (
                <div key={i}>
                  <a
                    href={link.href}
                    className="block py-3 text-foreground hover:text-primary transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                  {/* Sub-links */}
                  {link.children && (
                    <div className="pl-4 border-l border-border">
                      {link.children.map((child, j) => (
                        <a
                          key={j}
                          href={child.href}
                          className="block py-2 text-sm text-muted-foreground hover:text-primary transition"
                          onClick={() => setMenuOpen(false)}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            {ctaText && ctaHref && (
              <a
                href={ctaHref}
                className="mt-6 block rounded-full px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 text-center"
                onClick={() => setMenuOpen(false)}
              >
                {ctaText}
              </a>
            )}

            {/* Mobile search */}
            {showSearch && (
              <div className="mt-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
          </nav>
        </div>
      )}
    </nav>
  );
}
