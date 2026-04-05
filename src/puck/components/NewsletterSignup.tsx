"use client";

import { useRef, useState, useEffect } from "react";
import type { NewsletterSignupProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

// ─── Scroll animation hook ────────────────────────────────────────────

function useScrollAnimation(animation: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (animation === "none" || !ref.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [animation]);

  const animClasses: Record<string, string> = {
    "fade-up": visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
    zoom: visible ? "opacity-100 scale-100" : "opacity-0 scale-95",
  };

  return {
    ref,
    className: animClasses[animation] ?? "",
    visible,
  };
}

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
    animation = "none",
    className,
    ...metaRest
  } = props;

  const anim = useScrollAnimation(animation ?? "none");
  const hasBgImage = bgVariant === "image" && !!backgroundUrl;
  const hasBgGradient = bgVariant === "gradient";
  const transitionClass = animation !== "none" ? "transition-all duration-700 ease-out" : "";

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
      ? "bg-white text-gray-900 hover:bg-gray-100"
      : "bg-primary-foreground text-primary hover:opacity-90"
  }`;

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

  const formElement = (
    <form className="flex flex-col sm:flex-row gap-3 w-full" onSubmit={(e) => e.preventDefault()}>
      <input
        type="email"
        placeholder={placeholder || "Enter your email"}
        className={inputClass}
      />
      <button type="submit" className={btnClass}>
        {buttonText || "Subscribe"}
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
          className={`max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center ${anim.className} ${transitionClass}`}
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
            {subtext && (
              <p className="text-lg opacity-80 leading-relaxed">{subtext}</p>
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
        className={`max-w-3xl mx-auto text-center ${anim.className} ${transitionClass}`}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
        {subtext && (
          <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">{subtext}</p>
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
