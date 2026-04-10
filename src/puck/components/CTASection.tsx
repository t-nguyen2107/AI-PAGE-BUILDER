"use client";

import type { CTASectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { getDesignTokens } from "../lib/design-styles";
import { ArrowRight } from "lucide-react";

export function CTASection(props: CTASectionProps & ComponentMeta) {
  const {
    heading,
    subtext,
    ctaText,
    ctaHref,
    backgroundUrl,
    layout = "centered",
    imageUrl,
    imagePosition = "right",
    ctaSecondaryText,
    ctaSecondaryHref,
    variant = "default",
    trustText,
    animation = "fade-up",
    designStyle,
    className,
    ...metaRest
  } = props;
  const ds = getDesignTokens(designStyle);
  const hasBg = !!backgroundUrl;
  const isSplit = layout === "split";
  const hasImage = isSplit && !!imageUrl;
  const anim = useScrollAnimation(animation);

  const sectionStyle: React.CSSProperties = hasBg
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...extractStyleProps(metaRest),
      }
    : { ...extractStyleProps(metaRest) };

  // Variant-based styling — always include padding from design tokens
  const getVariantClasses = () => {
    // Extract padding classes from ds.section.base (e.g., "py-24 px-6")
    const sectionPadding = ds.section.base.split(' ').filter(c => c.startsWith('py-') || c.startsWith('px-')).join(' ');
    if (hasBg) return `text-white ${sectionPadding}`;
    switch (variant) {
      case "gradient":
        return `bg-primary text-primary-foreground relative overflow-hidden ${sectionPadding}`;
      case "dark":
        return `bg-foreground text-background ${sectionPadding}`;
      default:
        return ds.section.base;
    }
  };

  // Button styling based on variant
  const getPrimaryButtonClasses = () => {
    if (hasBg) {
      return `${ds.button.primary} bg-surface-lowest text-on-surface hover:bg-surface-container`;
    }
    switch (variant) {
      case "gradient":
        return `${ds.button.primary} bg-surface-lowest text-primary hover:bg-surface-container shadow-lg shadow-primary/25`;
      case "dark":
        return `${ds.button.primary} bg-background text-foreground hover:opacity-90`;
      default:
        return `${ds.button.primary} bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25`;
    }
  };

  const getSecondaryButtonClasses = () => {
    if (hasBg) {
      return `${ds.button.secondary} border-surface-lowest text-inverse-on-surface hover:bg-surface-lowest hover:text-on-surface`;
    }
    switch (variant) {
      case "gradient":
        return `${ds.button.secondary} border-surface-lowest text-inverse-on-surface hover:bg-surface-lowest hover:text-primary`;
      case "dark":
        return `${ds.button.secondary} border-background text-background hover:bg-background hover:text-foreground`;
      default:
        return `${ds.button.secondary} border-primary text-primary hover:bg-primary hover:text-primary-foreground`;
    }
  };

  return (
    <section
      className={`w-full ${getVariantClasses()} ${className ?? ""}`}
      style={sectionStyle}
    >
      {/* Decorative element for default variant */}
      {variant === "default" && !hasBg && ds.section.decorative && (
        <div className={ds.section.decorative} aria-hidden="true" />
      )}
      {/* Decorative background blobs for gradient variant */}
      {variant === "gradient" && !hasBg && (
        <>
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary-foreground/10 -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-foreground/10 translate-x-1/3 translate-y-1/3 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
        </>
      )}

      <div
        ref={anim.ref}
        className={`relative z-10 ${isSplit ? ds.containerWidth : "max-w-3xl"} mx-auto transition-all duration-700 ease-out ${anim.className} ${isSplit ? "grid md:grid-cols-2 gap-8 items-center" : "text-center"}`}
      >
        {/* Image side (for split layout) */}
        {hasImage && imagePosition === "left" && (
          <div className="order-1">
            <img
              src={imageUrl}
              alt=""
              className={`w-full h-auto ${ds.card.base}`}
            />
          </div>
        )}

        {/* Content side */}
        <div className={isSplit ? "order-2" : ""}>
          <h2 className={`${ds.typography.h2} mb-4`}>{heading}</h2>
          {subtext && (
            <p className={`text-lg opacity-80 mb-8 max-w-xl mx-auto md:mx-auto leading-relaxed ${
              hasBg || variant === "gradient" || variant === "dark"
                ? ""
                : ds.typography.body
            }`}>{subtext}</p>
          )}
          <div className={`flex ${isSplit ? "justify-start" : "justify-center"} gap-4 flex-wrap mb-4`}>
            <a
              href={ctaHref}
              className={`inline-flex items-center gap-2 transition ${getPrimaryButtonClasses()}`}
            >
              {ctaText}
              <ArrowRight className="w-4 h-4" />
            </a>
            {ctaSecondaryText && ctaSecondaryHref && (
              <a
                href={ctaSecondaryHref}
                className={`inline-block transition ${getSecondaryButtonClasses()}`}
              >
                {ctaSecondaryText}
              </a>
            )}
          </div>
          {trustText && (
            <p className={`text-sm opacity-70 ${isSplit ? "" : "mt-4"}`}>
              {trustText}
            </p>
          )}
        </div>

        {/* Image side (right position) */}
        {hasImage && imagePosition === "right" && (
          <div className="order-3">
            <img
              src={imageUrl}
              alt=""
              className={`w-full h-auto ${ds.card.base}`}
            />
          </div>
        )}
      </div>
    </section>
  );
}
