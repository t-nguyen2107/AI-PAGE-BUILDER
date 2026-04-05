"use client";

import { useState } from "react";
import type { FooterSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

const SOCIAL_ICONS: Record<string, string> = {
  twitter: "M22.46 6c-.85.38-1.78.64-2.73.76a4.78 4.78 0 0 0 2.1-2.64c-.95.56-2 .96-3.12 1.19a4.77 4.77 0 0 0-8.13 4.35A13.54 13.54 0 0 1 1.64 4.15a4.77 4.77 0 0 0 1.47 6.37A4.75 4.75 0 0 1 .96 9.85v.06a4.77 4.77 0 0 0 3.83 4.68 4.76 4.76 0 0 1-2.15.08 4.78 4.78 0 0 0 4.46 3.31A9.56 9.56 0 0 1 0 20.14a13.5 13.5 0 0 0 7.32 2.15c8.78 0 13.59-7.28 13.59-13.59 0-.21 0-.42-.02-.62A9.7 9.7 0 0 0 24 4.56a9.52 9.52 0 0 1-2.74.75 4.78 4.78 0 0 0 2.1-2.64 9.58 9.58 0 0 1-3.03 1.16A4.76 4.76 0 0 0 16.62 3c-2.63 0-4.77 2.13-4.77 4.77 0 .37.04.74.13 1.09C8.03 8.62 4.77 6.72 2.6 3.95a4.77 4.77 0 0 0 1.47 6.37A4.73 4.73 0 0 1 1.84 9.8v.06a4.77 4.77 0 0 0 3.83 4.68 4.76 4.76 0 0 1-2.13.08 4.78 4.78 0 0 0 4.45 3.3A9.54 9.54 0 0 1 .96 19.5a13.48 13.48 0 0 0 7.32 2.15",
  facebook: "M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07",
  instagram: "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.41-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z",
  linkedin: "M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z",
  youtube: "M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.65 31.65 0 000 12a31.65 31.65 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.65 31.65 0 0024 12a31.65 31.65 0 00-.5-5.81zM9.75 15.27V8.73L15.82 12l-6.07 3.27z",
  github: "M12 .3C5.37.3 0 5.67 0 12.3c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016.02 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12.01 12.01 0 0024 12.3C24 5.67 18.63.3 12 .3z",
  tiktok: "M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
};

function getSocialIcon(platform: string): string {
  const key = platform.toLowerCase().replace(/[^a-z]/g, "");
  return SOCIAL_ICONS[key] ?? SOCIAL_ICONS["twitter"];
}

export function FooterSection(props: FooterSectionProps & ComponentMeta) {
  const {
    logo,
    description,
    linkGroups,
    copyright,
    socialLinks,
    backToTop = false,
    newsletterIntegration = false,
    showCopyright = true,
    className,
    ...metaRest
  } = props;

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const colCount = 1 + linkGroups.length + (socialLinks && socialLinks.length > 0 ? 1 : 0) + (newsletterIntegration ? 1 : 0);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer
      className={`w-full bg-muted/50 border-t border-border text-foreground ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div
          className={`grid gap-8 grid-cols-1 sm:grid-cols-2 ${
            colCount >= 3 ? "lg:grid-cols-3" : ""
          } ${colCount >= 4 ? "xl:grid-cols-4" : ""} ${
            colCount >= 5 ? "2xl:grid-cols-5" : ""
          }`}
        >
          {/* Logo & description column */}
          <div>
            {logo && <p className="font-bold text-xl mb-3">{logo}</p>}
            {description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Link groups */}
          {linkGroups.map((group, i) => (
            <div key={i}>
              <p className="font-semibold mb-3 text-sm">{group.title}</p>
              <div className="flex flex-col gap-2">
                {group.links.map((link, j) => (
                  <a
                    key={j}
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-foreground transition"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Newsletter integration */}
          {newsletterIntegration && (
            <div>
              <p className="font-semibold mb-3 text-sm">Newsletter</p>
              {subscribed ? (
                <p className="text-sm text-muted-foreground">
                  Thanks for subscribing!
                </p>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Social links */}
          {socialLinks && socialLinks.length > 0 && (
            <div>
              <p className="font-semibold mb-3 text-sm">Follow Us</p>
              <div className="flex gap-3">
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 fill-current"
                      dangerouslySetInnerHTML={{ __html: getSocialIcon(link.platform) }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar: copyright + back to top */}
        {(showCopyright || backToTop) && (
          <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
            {showCopyright && copyright && (
              <p className="text-muted-foreground text-sm">{copyright}</p>
            )}
            {!copyright && showCopyright && <span />}
            {!showCopyright && <span />}
            {backToTop && (
              <button
                onClick={scrollToTop}
                className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 transition"
                aria-label="Back to top"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="w-4 h-4 fill-current"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to top
              </button>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
