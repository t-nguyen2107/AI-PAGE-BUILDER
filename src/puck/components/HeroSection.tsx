"use client";

import type { HeroSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { getDesignTokens } from "../lib/design-styles";

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
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);

  const paddingValue = props.padding || "128px";
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

  // Extract style overrides but exclude padding — hero manages its own padding
  const metaStyles = extractStyleProps(metaRest);
  delete metaStyles.padding;

  const sectionStyle: React.CSSProperties = {
    ...(backgroundUrl && !videoUrl
      ? {
          backgroundImage: backgroundOverlay && !resolvedFrom
            ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${backgroundUrl})`
            : resolvedFrom
              ? `linear-gradient(135deg, ${resolvedFrom}cc, ${(resolvedTo ?? resolvedFrom)}cc), url(${backgroundUrl})`
              : `url(${backgroundUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}),
    padding: `${paddingValue} 24px`,
    ...metaStyles,
  };

  const hasBgOverride = "bgColor" in metaRest && metaRest.bgColor;
  const hasBg = !!(backgroundUrl || videoUrl || resolvedFrom);
  const textClass = hasBg && !hasBgOverride ? "text-white" : !hasBgOverride ? "bg-background text-foreground" : "";

  // ─── Content block (shared between centered and split) ────────────

  const contentBlock = (
    <>
      {badge && (
        <span className={`inline-block mb-6 ${ds.accent.badge} ${
          hasBg
            ? "bg-white/15 text-white border border-white/25 backdrop-blur-sm"
            : ""
        }`}>
          {badge}
        </span>
      )}
      <h1 className={`${ds.typography.h1} mb-6`}>
        {hasBg || hasBgOverride ? heading : (
          <>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/60">
              {heading}
            </span>
          </>
        )}
      </h1>
      <p className={`text-lg md:text-xl opacity-75 mb-10 max-w-2xl mx-auto ${ds.typography.body}`}>
        {subtext}
      </p>
      <div className={`flex gap-4 flex-wrap ${isCenter ? "justify-center" : "justify-start"}`}>
        <a
          href={ctaHref}
          className={`group inline-flex items-center gap-2 text-base ${ds.button.primary} ${
            hasBg
              ? "bg-white text-gray-900 hover:bg-white/90 shadow-lg shadow-black/20"
              : "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
          }`}
        >
          {ctaText}
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
        {ctaSecondaryText && ctaSecondaryHref && (
          <a
            href={ctaSecondaryHref}
            className={`inline-flex items-center gap-2 text-base ${ds.button.secondary} ${
              hasBg
                ? "border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
                : "border-border text-foreground hover:bg-muted hover:border-primary/30"
            }`}
          >
            {ctaSecondaryText}
          </a>
        )}
      </div>
      {trustBadges && trustBadges.length > 0 && (
        <div className={`flex flex-wrap items-center gap-5 mt-10 text-sm ${hasBg ? "opacity-70" : "text-muted-foreground"} ${isCenter ? "justify-center" : "justify-start"}`}>
          {trustBadges.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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

      {/* Gradient overlay with mesh effect */}
      {!videoUrl && !backgroundUrl && resolvedFrom && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${resolvedFrom}dd, ${(resolvedTo ?? resolvedFrom)}dd)`,
            }}
          />
          {/* Decorative mesh gradient blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div
              className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
              style={{ background: `radial-gradient(circle, ${resolvedTo ?? resolvedFrom}80, transparent 70%)` }}
            />
            <div
              className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
              style={{ background: `radial-gradient(circle, ${resolvedFrom}80, transparent 70%)` }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
              style={{ background: `radial-gradient(circle, #ffffff40, transparent 70%)` }}
            />
          </div>
        </>
      )}

      {/* Background image with decorative elements */}
      {!videoUrl && backgroundUrl && resolvedFrom && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
            style={{ background: `radial-gradient(circle, ${resolvedTo ?? resolvedFrom}60, transparent 70%)` }}
          />
        </div>
      )}

      {/* Decorative element for non-background heroes */}
      {!videoUrl && !backgroundUrl && !resolvedFrom && ds.section.decorative && (
        <div className={ds.section.decorative} aria-hidden="true" />
      )}

      {/* Animated content wrapper */}
      <div
        ref={anim.ref}
        className={`relative z-10 transition-all duration-700 ease-out ${anim.className}`}
      >
        {isSplit ? (
          <div className={`${ds.containerWidth} mx-auto grid gap-12 md:grid-cols-2 items-center ${layout === "split-right" ? "md:[direction:rtl]" : ""}`}>
            {/* Image side */}
            {imageUrl && (
              <div className={`md:[direction:ltr] ${layout === "split-right" ? "md:[direction:ltr]" : ""}`}>
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt=""
                    className={`w-full object-cover max-h-[520px] ${ds.card.base}`}
                  />
                  {/* Floating accent shape behind image */}
                  <div className="absolute -inset-4 bg-primary/5 rounded-3xl -z-10 blur-xl" />
                </div>
              </div>
            )}
            {/* Text side */}
            <div className={`${isCenter ? "text-center" : "text-left"} ${layout === "split-right" ? "md:[direction:ltr]" : ""}`}>
              {contentBlock}
            </div>
          </div>
        ) : (
          <div className={`${ds.containerWidth === "max-w-6xl" || ds.containerWidth === "max-w-7xl" ? "max-w-4xl" : ds.containerWidth} mx-auto ${isCenter ? "text-center" : "text-left"}`}>
            {contentBlock}
          </div>
        )}
      </div>
    </section>
  );
}
