import type { HeaderNavProps } from "../types";

export function HeaderNav({ logo, links, ctaText, ctaHref, sticky }: HeaderNavProps) {
  return (
    <nav
      className={`flex items-center justify-between px-6 py-4 border-b border-border bg-background ${
        sticky ? "sticky top-0 z-50" : ""
      }`}
    >
      <div className="font-bold text-xl text-foreground">{logo}</div>
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
      <div>
        {ctaText && ctaHref && (
          <a
            href={ctaHref}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition"
          >
            {ctaText}
          </a>
        )}
      </div>
    </nav>
  );
}
