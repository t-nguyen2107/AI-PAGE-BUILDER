"use client";

import { useRef, useState, useEffect } from "react";
import type { HeroSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

// ─── Gradient presets ────────────────────────────────────────────────

const GRADIENT_PRESETS: Record<string, { from: string; to: string }> = {
  teal:     { from: "#22746e", to: "#1a5c56" },
  navy:     { from: "#081b22", to: "#0d2f3a" },
  gold:     { from: "#e39c37", to: "#c47f1a" },
  sunset:   { from: "#f97316", to: "#ec4899" },
  ocean:    { from: "#0ea5e9", to: "#6366f1" },
  forest:   { from: "#059669", to: "#065f46" },
  aurora:   { from: "#7c3aed", to: "#06b6d4" },
  midnight: { from: "#1e1b4b", to: "#312e81" },
  berry:    { from: "#be185d", to: "#7c3aed" },
  ember:    { from: "#dc2626", to: "#f97316" },
};

// ─── Render component ─────────────────────────────────────────────────

export function HeroSection(props: HeroSectionProps & ComponentMeta) {
  const {
    heading,
    subtext,
    badge,
    ctaText,
    ctaHref,
    ctaSecondaryText,
    ctaSecondaryHref,
    align,
    layout,
    backgroundUrl,
    backgroundOverlay,
    videoUrl,
    imageUrl,
    animation,
    trustBadges,
    gradientFrom,
    gradientTo,
    gradientPreset,
    className,
    ...metaRest
  } = props;

  const paddingValue = props.padding || "96px";
  const isCenter = align === "center";
  const isSplit = layout === "split-left" || layout === "split-right";
  const anim = useScrollAnimation(animation ?? "none");

  // Resolve gradient preset → explicit colors (explicit props take precedence)
  const preset = gradientPreset ? GRADIENT_PRESETS[gradientPreset] : undefined;
  const resolvedFrom = gradientFrom ?? preset?.from;
  const resolvedTo = gradientTo ?? preset?.to;

  // Determine overlay style
  const overlayStyle = resolvedFrom
    ? `linear-gradient(135deg, ${resolvedFrom}cc, ${(resolvedTo ?? resolvedFrom)}cc)`
    : backgroundOverlay
      ? "rgba(0,0,0,0.5)"
      : undefined;

  const sectionStyle: React.CSSProperties = {
    ...(backgroundUrl && !videoUrl
      ? {
          backgroundImage: backgroundOverlay && !resolvedFrom
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundUrl})`
            : resolvedFrom
              ? `linear-gradient(135deg, ${resolvedFrom}cc, ${(resolvedTo ?? resolvedFrom)}cc), url(${backgroundUrl})`
              : `url(${backgroundUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}),
    padding: `${paddingValue} 24px`,
    ...extractStyleProps(metaRest),
  };

  const hasBgOverride = "bgColor" in metaRest && metaRest.bgColor;
  const hasBg = !!(backgroundUrl || videoUrl || resolvedFrom);
  const textClass = hasBg && !hasBgOverride ? "text-white" : !hasBgOverride ? "bg-background text-foreground" : "";

  // ─── Content block (shared between centered and split) ────────────

  const contentBlock = (
    <>
      {badge && (
        <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
          {badge}
        </span>
      )}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
        {heading}
      </h1>
      <p className="text-lg md:text-xl opacity-80 mb-8 max-w-2xl mx-auto">
        {subtext}
      </p>
      <div className={`flex gap-4 ${isCenter ? "justify-center" : "justify-start"}`}>
        <a
          href={ctaHref}
          className="inline-block bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold hover:opacity-90 transition"
        >
          {ctaText}
        </a>
        {ctaSecondaryText && ctaSecondaryHref && (
          <a
            href={ctaSecondaryHref}
            className={`inline-block border rounded-lg px-6 py-3 font-semibold transition ${hasBg ? "border-white/30 text-white hover:bg-white/10" : "border-border text-foreground hover:bg-muted"}`}
          >
            {ctaSecondaryText}
          </a>
        )}
      </div>
      {trustBadges && trustBadges.length > 0 && (
        <div className={`flex flex-wrap items-center gap-4 mt-6 text-sm opacity-70 ${isCenter ? "justify-center" : "justify-start"}`}>
          {trustBadges.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              {b.text}
            </span>
          ))}
        </div>
      )}
    </>
  );

  return (
    <section
      className={`${textClass} w-full relative overflow-hidden ${className ?? ""}`}
      style={sectionStyle}
    >
      {/* Video background */}
      {videoUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={videoUrl} type="video/mp4" />
          </video>
          {overlayStyle && (
            <div className="absolute inset-0" style={{ background: overlayStyle }} />
          )}
        </div>
      )}

      {/* Gradient-only overlay (no video, no backgroundUrl) */}
      {!videoUrl && !backgroundUrl && resolvedFrom && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${resolvedFrom}dd, ${(resolvedTo ?? resolvedFrom)}dd)`,
          }}
        />
      )}

      {/* Animated content wrapper */}
      <div
        ref={anim.ref}
        className={`relative z-10 transition-all duration-700 ease-out ${anim.className}`}
      >
        {isSplit ? (
          <div className={`max-w-6xl mx-auto grid gap-8 md:grid-cols-2 items-center ${layout === "split-right" ? "md:[direction:rtl]" : ""}`}>
            {/* Image side */}
            {imageUrl && (
              <div className={layout === "split-right" ? "md:[direction:ltr]" : ""}>
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full rounded-xl shadow-lg object-cover max-h-[480px]"
                />
              </div>
            )}
            {/* Text side */}
            <div className={`${isCenter ? "text-center" : "text-left"} ${layout === "split-right" ? "md:[direction:ltr]" : ""}`}>
              {contentBlock}
            </div>
          </div>
        ) : (
          <div className={`max-w-4xl mx-auto ${isCenter ? "text-center" : "text-left"}`}>
            {contentBlock}
          </div>
        )}
      </div>
    </section>
  );
}
