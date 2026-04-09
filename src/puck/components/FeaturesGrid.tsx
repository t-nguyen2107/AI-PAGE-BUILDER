"use client";

import { useRef, useState, useEffect } from "react";
import type { FeaturesGridProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import type { DesignStyleTokens } from "../lib/design-styles";

// ─── Scroll animation hook ─────────────────────────────────────────

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
      { threshold: 0.15 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [animation]);

  const animClasses: Record<string, string> = {
    "stagger-fade": visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
    "stagger-slide": visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
  };

  return { ref, className: animClasses[animation] ?? "", visible };
}

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
      {feature.icon && (
        <div className={`${ds.accent.icon} mb-5`}>
          <span className="material-symbols-outlined text-2xl text-primary">
            {feature.icon}
          </span>
        </div>
      )}
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
    animation = "none",
    hoverEffect = "none",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);
  const anim = useScrollAnimation(animation);

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
          <div
            ref={anim.ref}
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
            )
          )
        }
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
