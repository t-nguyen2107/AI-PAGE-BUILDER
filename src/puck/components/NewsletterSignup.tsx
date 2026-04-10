"use client";

import { useState } from "react";
import type { NewsletterSignupProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

// ─── Render component ─────────────────────────────────────────────────

export function NewsletterSignup(props: NewsletterSignupProps & ComponentMeta) {
  const {
    heading,
    subtext,
    placeholder,
    buttonText,
    layout,
    backgroundUrl,
    subscriberCount,
    privacyNote,
    bgVariant = "none",
    testimonialQuote,
    testimonialAuthor,
    animation = "fade-up",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);
  const anim = useScrollAnimation(animation ?? "none");
  const hasBgImage = bgVariant === "image" && !!backgroundUrl;
  const hasBgGradient = bgVariant === "gradient";
  const transitionClass = animation !== "none" ? "transition-all duration-700 ease-out" : "";

  // Form submission state
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

  // Build section styles
  let sectionStyle: React.CSSProperties = { ...extractStyleProps(metaRest) };
  let bgClass = "";
  let textClass = "text-primary-foreground";

  if (hasBgImage) {
    sectionStyle = {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      ...sectionStyle,
    };
    textClass = "text-white";
  } else if (hasBgGradient) {
    bgClass = "bg-gradient-to-r from-primary/10 to-primary/5";
    textClass = "text-primary-foreground";
  } else {
    bgClass = "bg-primary";
  }

  const inputClass =
    "w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const btnClass = `inline-block rounded-lg px-8 py-3 font-semibold transition ${
    hasBgImage
      ? "bg-white text-gray-900 hover:bg-white/90"
      : "bg-primary-foreground text-primary hover:opacity-90"
  } disabled:opacity-50 disabled:cursor-not-allowed`;

  // Testimonial block
  const testimonialBlock = testimonialQuote && (
    <blockquote className="mt-6 border-l-2 border-primary/30 pl-4 italic text-muted-foreground">
      &ldquo;{testimonialQuote}&rdquo;
      {testimonialAuthor && (
        <footer className="mt-1 not-italic text-sm">&mdash; {testimonialAuthor}</footer>
      )}
    </blockquote>
  );

  // Social proof line
  const socialProof = subscriberCount && (
    <p className="text-sm text-muted-foreground mt-2">
      Join {subscriberCount} subscribers
    </p>
  );

  // Privacy note
  const privacyBlock = privacyNote && (
    <p className="text-xs text-muted-foreground/60 mt-2">{privacyNote}</p>
  );

  const formElement = submitted ? (
    <div className="text-center py-4">
      <p className="text-lg font-semibold">Subscribed!</p>
      <p className="text-sm opacity-80 mt-1">Check your inbox for confirmation.</p>
    </div>
  ) : (
    <form className="flex flex-col sm:flex-row gap-3 w-full" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder={placeholder || "Enter your email"}
        className={inputClass}
        required
      />
      <button type="submit" disabled={submitting} className={btnClass}>
        {submitting ? "Subscribing..." : buttonText || "Subscribe"}
      </button>
    </form>
  );

  if (layout === "split") {
    return (
      <section
        className={`w-full py-20 px-6 ${bgClass} ${textClass} ${className ?? ""}`}
        style={sectionStyle}
      >
        <div
          ref={anim.ref}
          className={`${ds.containerWidth} mx-auto grid md:grid-cols-2 gap-12 items-center ${anim.className} ${transitionClass}`}
        >
          <div>
            <h2 className={`${ds.typography.h2} mb-4`}>{heading}</h2>
            {subtext && (
              <p className={`text-lg opacity-80 leading-relaxed ${ds.typography.body}`}>{subtext}</p>
            )}
            {socialProof}
            {testimonialBlock}
          </div>
          <div>
            {formElement}
            {privacyBlock}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`w-full py-20 px-6 ${bgClass} ${textClass} ${className ?? ""}`}
      style={sectionStyle}
    >
      <div
        ref={anim.ref}
        className={`${ds.containerWidth === "max-w-7xl" || ds.containerWidth === "max-w-6xl" ? "max-w-3xl" : ds.containerWidth} mx-auto text-center ${anim.className} ${transitionClass}`}
      >
        <h2 className={`${ds.typography.h2} mb-4`}>{heading}</h2>
        {subtext && (
          <p className={`text-lg opacity-80 mb-8 max-w-xl mx-auto ${ds.typography.body}`}>{subtext}</p>
        )}
        <div className="max-w-md mx-auto">
          {formElement}
          {socialProof}
          {privacyBlock}
        </div>
        {testimonialBlock}
      </div>
    </section>
  );
}
