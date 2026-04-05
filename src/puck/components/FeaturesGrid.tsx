"use client";

import { useRef, useState, useEffect } from "react";
import type { FeaturesGridProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

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
  lift: "hover:-translate-y-1 hover:shadow-lg transition",
  glow: "hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition",
  border: "hover:border-primary transition",
};

// ─── Card style base classes ───────────────────────────────────────

const CARD_BASE: Record<string, string> = {
  icon: "p-6 rounded-xl bg-card border border-border",
  image: "rounded-xl overflow-hidden bg-card border border-border",
  flat: "p-6",
  elevated: "p-6 rounded-xl bg-card shadow-md",
};

// ─── Render a single feature card ──────────────────────────────────

function FeatureCard({
  feature,
  cardStyle,
  hoverEffect,
}: {
  feature: { title: string; description: string; icon?: string; imageUrl?: string };
  cardStyle: "icon" | "image" | "flat" | "elevated";
  hoverEffect: "none" | "lift" | "glow" | "border";
}) {
  const base = CARD_BASE[cardStyle] ?? CARD_BASE.icon;
  const hover = HOVER_CLASSES[hoverEffect] ?? "";

  // Image card: full-width image with text below
  if (cardStyle === "image" && feature.imageUrl) {
    return (
      <div className={`${base} ${hover}`}>
        <img
          src={feature.imageUrl}
          alt={feature.title}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    );
  }

  // Icon / flat / elevated cards
  return (
    <div className={`${base} ${hover}`}>
      {(feature.icon || (cardStyle === "icon" && !feature.imageUrl)) && feature.icon && (
        <span className="material-symbols-outlined text-2xl text-primary mb-4 block">
          {feature.icon}
        </span>
      )}
      {cardStyle === "image" && feature.imageUrl && !feature.icon && (
        <img
          src={feature.imageUrl}
          alt={feature.title}
          className="w-full h-40 object-cover rounded-t-xl mb-4"
          loading="lazy"
        />
      )}
      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
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
    features,
    variant = "grid",
    cardStyle = "icon",
    animation = "none",
    hoverEffect = "none",
    className,
    ...metaRest
  } = props;

  const anim = useScrollAnimation(animation);

  return (
    <section
      className={`w-full py-20 px-6 bg-background text-foreground ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
          {subtext && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtext}
            </p>
          )}
        </div>

        {variant === "carousel" ? (
          <div
            ref={anim.ref}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 -mx-6 px-6 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
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
                />
              </div>
            ))}
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
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
