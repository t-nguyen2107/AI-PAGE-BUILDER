"use client";

import { useState, useEffect, useRef } from "react";
import type { StatsSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

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

// ─── Scroll animation hook ────────────────────────────────────────────

function useScrollAnimation(animation: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (animation === "none" || !ref.current) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
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
    "fade-up": visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
    stagger: visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
  };

  return { ref, className: animClasses[animation] ?? "", visible };
}

// ─── Stat card ────────────────────────────────────────────────────────

function StatCard({
  stat,
  animated,
  duration,
  animation,
  visible,
  staggerDelay,
}: {
  stat: StatsSectionProps["stats"][number];
  animated?: boolean;
  duration?: number;
  animation: string;
  visible: boolean;
  staggerDelay: number;
}) {
  const displayValue = useCountUp(stat.value, visible, duration);

  const prefix = stat.prefix ?? "";
  const suffix = stat.suffix ?? "";

  const isStagger = animation === "stagger";
  const staggerStyle = isStagger
    ? { transitionDelay: visible ? `${staggerDelay}ms` : "0ms" }
    : {};

  return (
    <div
      className="text-center transition-all duration-500 ease-out"
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}
