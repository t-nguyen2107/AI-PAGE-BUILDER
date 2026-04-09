"use client";

import { useState, useEffect } from "react";
import type { StatsSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

// ─── Animated counter hook ────────────────────────────────────────────

function useCountUp(target: string, visible: boolean, duration = 2000) {
  const [count, setCount] = useState("0");

  useEffect(() => {
    if (!visible) return;

    const num = parseInt(target.replace(/[^0-9]/g, ""));
    if (isNaN(num)) {
      setCount(target);
      return;
    }

    const prefix = target.match(/^[^0-9]*/)?.[0] ?? "";
    const suffix = target.match(/[^0-9]*$/)?.[0] ?? "";
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * num);
      setCount(`${prefix}${current.toLocaleString()}${suffix}`);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [visible, target, duration]);

  return count;
}

// ─── Stat card ────────────────────────────────────────────────────────

function StatCard({
  stat,
  animated,
  duration,
  animation,
  visible,
  staggerDelay,
  cardStyle,
  ds,
}: {
  stat: StatsSectionProps["stats"][number];
  animated?: boolean;
  duration?: number;
  animation: string;
  visible: boolean;
  staggerDelay: number;
  cardStyle: string;
  ds: ReturnType<typeof getDesignTokens>;
}) {
  const displayValue = useCountUp(stat.value, visible, duration);

  const prefix = stat.prefix ?? "";
  const suffix = stat.suffix ?? "";

  const isStagger = animation === "stagger";
  const staggerStyle = isStagger
    ? { transitionDelay: visible ? `${staggerDelay}ms` : "0ms" }
    : {};

  // Content-specific extra classes per cardStyle variant (gradient bg, border emphasis)
  const cardStyleExtras: Record<string, string> = {
    card: "",
    bordered: "border-2 border-primary/30",
    gradient: "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10",
    none: "",
  };

  const baseCardClasses = cardStyle === "none"
    ? ""
    : `p-8 ${ds.card.base} ${ds.card.hover}`;

  return (
    <div
      className={`text-center transition-all duration-500 ease-out ${baseCardClasses} ${cardStyleExtras[cardStyle] ?? ""}`}
      style={staggerStyle}
    >
      {stat.icon && (
        <span className={`material-symbols-outlined text-3xl text-primary/70 mb-3 block mx-auto ${ds.accent.icon} p-2.5 mx-auto`}>
          {stat.icon}
        </span>
      )}
      <p className={`text-4xl font-bold mb-2 ${cardStyle === "gradient" ? "bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60" : "text-primary"}`}>
        {prefix}
        {animated ? displayValue : stat.value}
        {suffix}
      </p>
      <p className={`${ds.typography.body} text-sm font-medium tracking-wide uppercase`}>{stat.label}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────

export function StatsSection(props: StatsSectionProps & ComponentMeta) {
  const {
    heading,
    stats = [],
    columns,
    animated,
    duration,
    animation = "none",
    cardStyle = "none",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);

  const { ref, className: animClass, visible } =
    useScrollAnimation(animation);

  return (
    <section
      className={`w-full ${ds.section.base} text-foreground relative ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {ds.section.decorative && (
        <div className={ds.section.decorative} />
      )}
      <div
        ref={ref}
        className={`${ds.containerWidth} mx-auto transition-all duration-700 ease-out relative z-10 ${animClass}`}
      >
        {heading && (
          <h2 className={`${ds.typography.h2} text-center mb-12`}>
            {heading}
          </h2>
        )}
        <div
          className={`grid gap-8 grid-cols-2 ${columns >= 3 ? "md:grid-cols-3" : ""} ${columns >= 4 ? "lg:grid-cols-4" : ""}`}
        >
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              stat={stat}
              animated={animated}
              duration={duration}
              animation={animation}
              visible={visible}
              staggerDelay={i * 120}
              cardStyle={cardStyle}
              ds={ds}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
