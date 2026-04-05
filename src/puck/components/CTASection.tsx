"use client";

import type { CTASectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

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
    animation = "none",
    className,
    ...metaRest
  } = props;
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

  // Variant-based styling
  const getVariantClasses = () => {
    if (hasBg) return "text-white";
    switch (variant) {
      case "gradient":
        return "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground relative overflow-hidden";
      case "dark":
        return "bg-foreground text-background";
      default:
        return "bg-background text-foreground";
    }
  };

  // Button styling based on variant
  const getPrimaryButtonClasses = () => {
    if (hasBg) {
      return "bg-surface-lowest text-on-surface hover:bg-surface-container";
    }
    switch (variant) {
      case "gradient":
        return "bg-surface-lowest text-primary hover:bg-surface-container";
      case "dark":
        return "bg-background text-foreground hover:opacity-90";
      default:
        return "bg-primary text-primary-foreground hover:opacity-90";
    }
  };

  const getSecondaryButtonClasses = () => {
    if (hasBg) {
      return "border-2 border-surface-lowest text-inverse-on-surface hover:bg-surface-lowest hover:text-on-surface";
    }
    switch (variant) {
      case "gradient":
        return "border-2 border-surface-lowest text-inverse-on-surface hover:bg-surface-lowest hover:text-primary";
      case "dark":
        return "border-2 border-background text-background hover:bg-background hover:text-foreground";
      default:
        return "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground";
    }
  };

  return (
    <section
      className={`w-full py-20 px-6 ${getVariantClasses()} ${className ?? ""}`}
      style={sectionStyle}
    >
      {/* Decorative background blobs for gradient variant */}
      {variant === "gradient" && !hasBg && (
        <>
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-primary-foreground/5 -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary-foreground/5 translate-x-1/3 translate-y-1/3 blur-3xl" />
        </>
      )}

      <div
        ref={anim.ref}
        className={`relative z-10 ${isSplit ? "max-w-6xl" : "max-w-3xl"} mx-auto transition-all duration-700 ease-out ${anim.className} ${isSplit ? "grid md:grid-cols-2 gap-8 items-center" : "text-center"}`}
      >
        {/* Image side (for split layout) */}
        {hasImage && imagePosition === "left" && (
          <div className="order-1">
            <img
              src={imageUrl}
              alt=""
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Content side */}
        <div className={isSplit ? "order-2" : ""}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
          {subtext && (
            <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto md:mx-0">{subtext}</p>
          )}
          <div className={`flex ${isSplit ? "justify-start" : "justify-center"} gap-4 flex-wrap mb-4`}>
            <a
              href={ctaHref}
              className={`inline-block rounded-lg px-8 py-3 font-semibold transition ${getPrimaryButtonClasses()}`}
            >
              {ctaText}
            </a>
            {ctaSecondaryText && ctaSecondaryHref && (
              <a
                href={ctaSecondaryHref}
                className={`inline-block rounded-lg px-8 py-3 font-semibold transition ${getSecondaryButtonClasses()}`}
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
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </section>
  );
}
