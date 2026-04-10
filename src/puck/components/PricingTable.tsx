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
    if (animation === "fade-up")
      return "opacity-100 translate-y-0 transition-all duration-700 ease-out";
    if (animation === "stagger") {
      const delay = index * 100;
      return `opacity-100 translate-y-0 transition-all duration-700 ease-out [transition-delay:${delay}ms]`;
    }
    return "";
  };

  // Determine if any yearly plan has savePercentage for badge positioning
  const hasYearlySavings =
    yearly && activePlans.some((p) => p.savePercentage);

  return (
    <section
      ref={sectionRef}
      className={`w-full ${ds.section.base} text-foreground relative ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {/* Subtle decorative background */}
      {ds.section.decorative && (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div className={ds.section.decorative} />
        </div>
      )}

      <div className={`${ds.containerWidth} mx-auto relative`}>
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className={`${ds.typography.h2} mb-4`}>{heading}</h2>
          {subtext && (
            <p
              className={`text-lg ${ds.typography.body} max-w-2xl mx-auto`}
            >
              {subtext}
            </p>
          )}
        </div>

        {/* ── Pill-style Monthly/Yearly Toggle ── */}
        {pricingToggle && (
          <div className="flex items-center justify-center mb-10">
            <div className="relative inline-flex items-center rounded-full bg-muted p-1">
              {/* Sliding background indicator */}
              <span
                className="absolute top-1 bottom-1 rounded-full bg-primary transition-all duration-300 ease-in-out"
                style={{
                  left: yearly ? "calc(50% + 2px)" : "4px",
                  width: "calc(50% - 6px)",
                }}
              />
              <button
                type="button"
                onClick={() => setYearly(false)}
                className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${
                  !yearly
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setYearly(true)}
                className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-300 flex items-center gap-2 ${
                  yearly
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
                {hasYearlySavings && (
                  <span className="inline-flex items-center rounded-full bg-success/20 text-success text-[10px] font-bold px-2 py-0.5 leading-none">
                    Save
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Cards grid: responsive + mobile scroll ── */}
        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory md:overflow-visible md:snap-none md:grid md:grid-cols-2 lg:grid-cols-3 pb-4 md:pb-0 scrollbar-thin">
          {activePlans.map((plan, i) => (
            <div
              key={i}
              className={`relative shrink-0 min-w-70 w-[85vw] max-w-md md:shrink md:min-w-0 md:w-auto md:max-w-none snap-center overflow-hidden p-8 ${
                ds.card.base
              } ${
                plan.highlighted
                  ? "ring-2 ring-primary md:scale-105 border-primary shadow-xl shadow-primary/10"
                  : ""
              } ${ds.card.hover} ${getAnimationClass(i)}`}
            >
              {/* ── Gradient top border for highlighted card ── */}
              {plan.highlighted && (
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-primary/80 to-primary/40"
                  aria-hidden="true"
                />
              )}

              {/* ── Design-token accent bar (non-highlighted) ── */}
              {ds.accent.cardAccent && !plan.highlighted && (
                <div className={ds.accent.cardAccent} />
              )}

              {/* ── Popular badge ── */}
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-linear-to-r from-primary to-primary/80 px-4 py-1 text-xs font-bold text-primary-foreground shadow-md shadow-primary/25">
                  {highlightedBadge}
                </span>
              )}

              {/* ── Save percentage badge ── */}
              {yearly && plan.savePercentage && (
                <span className="absolute top-4 right-4 bg-success/10 text-success text-xs font-semibold px-2.5 py-1 rounded-full">
                  {plan.savePercentage}
                </span>
              )}

              {/* Plan name */}
              <h3 className={`mt-2 ${ds.typography.h3}`}>{plan.name}</h3>

              {/* ── Price display: large currency + number ── */}
              <div className="flex items-baseline gap-1 mt-3 mb-1">
                <span className="text-2xl font-bold text-primary">
                  {currency}
                </span>
                <span className="text-5xl font-extrabold tracking-tight text-foreground">
                  {plan.price.replace(/^[\$\€\£\¥]/, "")}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  /{plan.period}
                </span>
              </div>

              {/* Description in italic */}
              {plan.description && (
                <p
                  className={`text-sm italic ${ds.typography.body} mb-6 mt-2`}
                >
                  {plan.description}
                </p>
              )}

              {/* ── Feature list with dividers + SVG checks ── */}
              <ul className="space-y-0 mb-8">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
                    className={`flex items-start gap-3 py-3 text-sm ${
                      ds.typography.body
                    } ${j > 0 ? "border-t border-border/30" : ""}`}
                  >
                    <svg
                      className="w-4 h-4 mt-0.5 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>
                      {typeof feature === "string" ? feature : feature.value}
                    </span>
                  </li>
                ))}
              </ul>

              {/* ── CTA button with hover lift ── */}
              <a
                href={plan.ctaHref}
                className={`block text-center transition-all duration-300 hover:-translate-y-0.5 ${
                  plan.highlighted
                    ? `${ds.button.primary} bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl`
                    : `${ds.button.secondary} text-foreground hover:shadow-md`
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
