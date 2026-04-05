"use client";

import type { PricingTableProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
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
    animation = "none",
    className,
    ...metaRest
  } = props;

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
    if (!isVisible) return "opacity-0";
    if (animation === "fade-up") return "opacity-100 translate-y-0 transition-all duration-700 ease-out";
    if (animation === "stagger") {
      const delay = index * 100;
      return `opacity-100 translate-y-0 transition-all duration-700 ease-out [transition-delay:${delay}ms]`;
    }
    return "";
  };

  const getInitialClass = () => {
    if (animation === "none") return "";
    return "opacity-0 translate-y-8";
  };

  return (
    <section
      ref={sectionRef}
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
              className="relative w-12 h-6 rounded-full bg-primary/20 transition-colors hover:bg-primary/30"
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
              className={`relative p-8 rounded-2xl border bg-card transition ${
                plan.highlighted
                  ? "ring-2 ring-primary scale-105 border-primary shadow-lg"
                  : "border-border"
              } ${getInitialClass()} ${getAnimationClass(i)}`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  {highlightedBadge}
                </span>
              )}
              {yearly && plan.savePercentage && (
                <span className="absolute top-4 right-4 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold px-2 py-1 rounded-full">
                  {plan.savePercentage}
                </span>
              )}
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold">
                  {currency}
                  {plan.price.replace(/^[\$\€\£\¥]/, "")}
                </span>
                <span className="text-muted-foreground text-sm">
                  /{plan.period}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-6">
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <span className="text-primary font-bold">&#10003;</span>
                    {typeof feature === "string" ? feature : feature.value}
                  </li>
                ))}
              </ul>
              <a
                href={plan.ctaHref}
                className={`block text-center rounded-lg px-6 py-3 font-semibold transition ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border text-foreground hover:bg-muted"
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
