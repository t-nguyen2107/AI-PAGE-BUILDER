"use client";

import type { PricingTableProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import { useState, useEffect, useRef } from "react";

export function PricingTable(props: PricingTableProps & ComponentMeta) {
  const {
    heading,
    subtext,
    plans,
    pricingToggle = false,
    yearlyPlans,
    highlightedBadge = "Popular",
    currency = "$",
    animation = "stagger",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);

  const [yearly, setYearly] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const activePlans = yearly && yearlyPlans?.length ? yearlyPlans : plans;

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    if (animation === "none") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [animation]);

  // Animation classes
  const getAnimationClass = (index: number) => {
    if (animation === "none") return "";
    if (!isVisible) return "opacity-0 translate-y-8";
    if (animation === "fade-up") return "opacity-100 translate-y-0 transition-all duration-700 ease-out";
    if (animation === "stagger") {
      const delay = index * 100;
      return `opacity-100 translate-y-0 transition-all duration-700 ease-out [transition-delay:${delay}ms]`;
    }
    return "";
  };

  return (
    <section
      ref={sectionRef}
      className={`w-full ${ds.section.base} text-foreground relative ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {/* Subtle decorative background */}
      {ds.section.decorative && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className={ds.section.decorative} />
        </div>
      )}

      <div className={`${ds.containerWidth} mx-auto relative`}>
        <div className="text-center mb-16">
          <h2 className={`${ds.typography.h2} mb-4`}>{heading}</h2>
          {subtext && (
            <p className={`text-lg ${ds.typography.body} max-w-2xl mx-auto`}>
              {subtext}
            </p>
          )}
        </div>

        {/* Monthly/Yearly Toggle */}
        {pricingToggle && (
          <div className="flex items-center justify-center gap-3 mb-8">
            <span
              className={`text-sm transition-colors ${
                !yearly
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setYearly(!yearly)}
              className="relative w-12 h-6 rounded-full bg-primary/20 transition-colors hover:bg-primary/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
              role="switch"
              aria-checked={yearly}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-primary transition-all duration-200 ${
                  yearly ? "left-6" : "left-0.5"
                }`}
              />
            </button>
            <span
              className={`text-sm transition-colors ${
                yearly
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Yearly
            </span>
          </div>
        )}

        <div className="grid gap-6 items-start grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {activePlans.map((plan, i) => (
            <div
              key={i}
              className={`relative overflow-hidden p-8 ${ds.card.base} ${
                plan.highlighted
                  ? "ring-2 ring-primary md:scale-105 border-primary shadow-xl shadow-primary/10"
                  : ""
              } ${ds.card.hover} ${getAnimationClass(i)}`}
            >
              {/* Accent bar */}
              {ds.accent.cardAccent && (
                <div className={ds.accent.cardAccent} />
              )}
              {plan.highlighted && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 ${ds.accent.badge} text-primary-foreground`}>
                  {highlightedBadge}
                </span>
              )}
              {yearly && plan.savePercentage && (
                <span className="absolute top-4 right-4 bg-success/10 text-success text-xs font-semibold px-2 py-1 rounded-full">
                  {plan.savePercentage}
                </span>
              )}
              <h3 className={ds.typography.h3}>{plan.name}</h3>
              <div className="mb-2 mt-2">
                <span className="text-4xl font-bold tracking-tight text-primary">
                  {currency}
                  {plan.price.replace(/^[\$\€\£\¥]/, "")}
                </span>
                <span className={`${ds.typography.body} text-sm`}>
                  /{plan.period}
                </span>
              </div>
              <p className={`${ds.typography.body} text-sm mb-6`}>
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className={`flex items-center gap-2 text-sm ${ds.typography.body}`}>
                    <span className="text-primary font-bold">&#10003;</span>
                    {typeof feature === "string" ? feature : feature.value}
                  </li>
                ))}
              </ul>
              <a
                href={plan.ctaHref}
                className={`block text-center ${
                  plan.highlighted
                    ? `${ds.button.primary} bg-primary text-primary-foreground shadow-lg shadow-primary/25`
                    : `${ds.button.secondary} text-foreground`
                }`}
              >
                {plan.ctaText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
