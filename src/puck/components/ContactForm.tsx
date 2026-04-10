"use client";

import { useState } from "react";
import type { ContactFormProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { getDesignTokens } from "../lib/design-styles";

export function ContactForm(props: ContactFormProps & ComponentMeta) {
  const {
    heading,
    subtext,
    showPhone,
    showCompany,
    buttonText,
    animation = "fade-up",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);
  const anim = useScrollAnimation(animation);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <section
      className={`w-full ${ds.section.base} ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {ds.section.decorative && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className={ds.section.decorative} />
        </div>
      )}
      <div
        ref={anim.ref}
        className={`${ds.containerWidth} mx-auto grid md:grid-cols-2 gap-12 transition-all duration-700 ease-out relative ${anim.className}`}
      >
        <div>
          <h2 className={ds.typography.h2}>{heading}</h2>
          {subtext && (
            <p className={ds.typography.body}>
              {subtext}
            </p>
          )}
        </div>
        <div>
          {submitted ? (
            <div className="text-center py-12">
              <p className="text-2xl font-semibold text-green-600 mb-2">Message Sent!</p>
              <p className="text-muted-foreground">We'll get back to you soon.</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                className="w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {showPhone && (
                <input
                  type="tel"
                  placeholder="Phone"
                  className="w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
              {showCompany && (
                <input
                  type="text"
                  placeholder="Company"
                  className="w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
              <textarea
                placeholder="Message"
                rows={5}
                className="w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className={`${ds.button.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {submitting ? "Sending..." : buttonText || "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
