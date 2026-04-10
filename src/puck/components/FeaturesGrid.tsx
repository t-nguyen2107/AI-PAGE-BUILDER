"use client";

import { useState, useRef, useEffect } from "react";
import type { FeaturesGridProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import type { DesignStyleTokens } from "../lib/design-styles";
import { resolveIconPath } from "../lib/icon-map";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

// ─── Hover effect classes ──────────────────────────────────────────

const HOVER_CLASSES: Record<string, string> = {
  none: "",
  lift: "hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300",
  glow: "hover:shadow-[0_0_20px_rgba(34,116,110,0.2)] transition-all duration-300",
  border: "hover:border-primary/60 transition-all duration-300",
};

// ─── Card style base classes (used only for variant-specific padding/overflow) ───

const CARD_VARIANT_EXTRA: Record<string, string> = {
  icon: "p-6",
  image: "overflow-hidden",
  flat: "p-6",
  elevated: "p-6",
  glass: "p-6",
};

// ─── Render a single feature card ──────────────────────────────────

function FeatureCard({
  feature,
  cardStyle,
  hoverEffect,
  ds,
}: {
  feature: { title: string; description: string; icon?: string; imageUrl?: string };
  cardStyle: "icon" | "image" | "flat" | "elevated" | "glass";
  hoverEffect: "none" | "lift" | "glow" | "border";
  ds: DesignStyleTokens;
}) {
  const variantExtra = CARD_VARIANT_EXTRA[cardStyle] ?? "p-6";
  const hover = HOVER_CLASSES[hoverEffect] ?? "";

  // Image card: full-width image with text below
  if (cardStyle === "image" && feature.imageUrl) {
    return (
      <div className={`${ds.card.base} ${variantExtra} ${hover}`}>
        <img
          src={feature.imageUrl}
          alt={feature.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <div className="p-6">
          <h3 className={`${ds.typography.h3} mb-2`}>{feature.title}</h3>
          <p className={`text-sm ${ds.typography.body}`}>
            {feature.description}
          </p>
        </div>
      </div>
    );
  }

  // Icon / flat / elevated / glass cards
  return (
    <div className={`${ds.card.base} ${variantExtra} ${ds.card.hover} ${hover}`}>
      {feature.icon && (() => {
        const iconPath = resolveIconPath(feature.icon);
        return (
          <div className={`${ds.accent.icon} mb-5`}>
            {iconPath ? (
              <img src={iconPath} alt="" className="w-6 h-6 text-primary [&>svg]:inherit" />
            ) : (
              <span className="material-symbols-outlined text-2xl text-primary">
                {feature.icon}
              </span>
            )}
          </div>
        );
      })()}
      {!feature.icon && feature.imageUrl && (
        <img
          src={feature.imageUrl}
          alt={feature.title}
          className="w-full h-40 object-cover rounded-xl mb-4"
          loading="lazy"
        />
      )}
      <h3 className={`${ds.typography.h3} mb-2`}>{feature.title}</h3>
      <p className={`text-sm ${ds.typography.body}`}>
        {feature.description}
      </p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────

export function FeaturesGrid(props: FeaturesGridProps & ComponentMeta) {
  const {
    heading,
    subtext,
    columns,
    features = [],
    variant = "grid",
    cardStyle = "icon",
    animation = "stagger-fade",
    hoverEffect = "none",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);
  const anim = useScrollAnimation(animation);

  // Carousel scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState);
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, []);

  const hasBgOverride = "bgColor" in metaRest && metaRest.bgColor;

  return (
    <section
      className={`w-full ${hasBgOverride ? "" : ds.section.base} text-foreground relative ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {/* Decorative element */}
      {!hasBgOverride && ds.section.decorative && (
        <div className={ds.section.decorative} aria-hidden="true" />
      )}

      <div className={`${ds.containerWidth} mx-auto relative`}>
        <div className="text-center mb-16">
          <h2 className={`${ds.typography.h2} mb-4`}>{heading}</h2>
          {subtext && (
            <p className={`text-lg max-w-2xl mx-auto ${ds.typography.body}`}>
              {subtext}
            </p>
          )}
        </div>

        {variant === "carousel" ? (
          <div className="relative group">
            {canScrollLeft && (
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: -scrollRef.current.clientWidth * 0.8, behavior: "smooth" })}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 transition focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                aria-label="Previous"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scrollRef.current?.scrollBy({ left: scrollRef.current!.clientWidth * 0.8, behavior: "smooth" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 transition focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                aria-label="Next"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <div
              ref={scrollRef}
              className="carousel-scroll flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 -mx-6 px-6 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`.carousel-scroll::-webkit-scrollbar { display: none; }`}</style>
              {features.map((feature, i) => (
                <div
                  key={i}
                  className={`snap-center shrink-0 w-[85%] md:w-[45%] lg:w-[30%] transition-all duration-500 ${anim.className}`}
                  style={{ transitionDelay: anim.visible ? `${i * 100}ms` : "0ms" }}
                >
                  <FeatureCard
                    feature={feature}
                    cardStyle={cardStyle}
                    hoverEffect={hoverEffect}
                    ds={ds}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            ref={anim.ref}
            className={`grid gap-6 grid-cols-1 md:grid-cols-2 ${columns >= 3 ? "lg:grid-cols-3" : ""} ${columns >= 4 ? "xl:grid-cols-4" : ""}`}
          >
            {features.map((feature, i) => (
              <div
                key={i}
                className={`transition-all duration-500 ${anim.className}`}
                style={{ transitionDelay: anim.visible ? `${i * 100}ms` : "0ms" }}
              >
                <FeatureCard
                  feature={feature}
                  cardStyle={cardStyle}
                  hoverEffect={hoverEffect}
                  ds={ds}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
