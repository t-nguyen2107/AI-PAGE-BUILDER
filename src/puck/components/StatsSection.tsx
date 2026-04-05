"use client";

import { useState, useEffect } from "react";
import type { StatsSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
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
}: {
  stat: StatsSectionProps["stats"][number];
  animated?: boolean;
  duration?: number;
  animation: string;
  visible: boolean;
  staggerDelay: number;
  cardStyle: string;
}) {
  const displayValue = useCountUp(stat.value, visible, duration);

  const prefix = stat.prefix ?? "";
  const suffix = stat.suffix ?? "";

  const isStagger = animation === "stagger";
  const staggerStyle = isStagger
    ? { transitionDelay: visible ? `${staggerDelay}ms` : "0ms" }
    : {};

  const cardClasses: Record<string, string> = {
    card: "p-6 rounded-xl bg-card border border-border shadow-sm",
    bordered: "p-6 rounded-xl border-2 border-primary/20",
    gradient: "p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10",
    none: "",
  };

  return (
    <div
      className={`text-center transition-all duration-500 ease-out ${cardClasses[cardStyle] ?? ""}`}
      style={staggerStyle}
    >
      {stat.icon && (
        <span className="material-symbols-outlined text-3xl text-primary/70 mb-3 block mx-auto">
          {stat.icon}
        </span>
      )}
      <p className="text-4xl font-bold text-primary mb-2">
        {prefix}
        {animated ? displayValue : stat.value}
        {suffix}
      </p>
      <p className="text-muted-foreground text-sm">{stat.label}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────

export function StatsSection(props: StatsSectionProps & ComponentMeta) {
  const {
    heading,
    stats,
    columns,
    animated,
    duration,
    animation = "none",
    cardStyle = "none",
    className,
    ...metaRest
  } = props;

  const { ref, className: animClass, visible } =
    useScrollAnimation(animation);

  return (
    <section
      className={`w-full py-20 px-6 bg-background text-foreground ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      <div
        ref={ref}
        className={`max-w-6xl mx-auto transition-all duration-700 ease-out ${animClass}`}
      >
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}
