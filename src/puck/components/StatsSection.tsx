"use client";

import { useState, useEffect } from "react";
import type { StatsSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { resolveIconPath } from "../lib/icon-map";

// ─── Animated counter hook ────────────────────────────────────────────

function useCountUp(target: string, visible: boolean, duration = 2000) {
  const [count, setCount] = useState("0");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const num = parseInt(target.replace(/[^0-9]/g, ""));
    if (isNaN(num)) {
      requestAnimationFrame(() => {
        setCount(target);
        setDone(true);
      });
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
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDone(true);
      }
    };

    requestAnimationFrame(step);
  }, [visible, target, duration]);

  return { count, done };
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
  featured,
}: {
  stat: StatsSectionProps["stats"][number];
  animated?: boolean;
  duration?: number;
  animation: string;
  visible: boolean;
  staggerDelay: number;
  cardStyle: string;
  ds: ReturnType<typeof getDesignTokens>;
  featured?: boolean;
}) {
  const { count, done } = useCountUp(stat.value, visible, duration);

  const prefix = stat.prefix ?? "";
  const suffix = stat.suffix ?? "";

  const isStagger = animation === "stagger";
  const staggerStyle = isStagger
    ? { transitionDelay: visible ? `${staggerDelay}ms` : "0ms" }
    : {};

  const iconPath = stat.icon ? resolveIconPath(stat.icon) : null;

  // ─── Card style variants ─────────────────────────────────────────
  const isFeatured = featured && cardStyle !== "none";

  // Glassmorphic base for card/gradient variants
  const glassBase = cardStyle === "gradient"
    ? "backdrop-blur-xl bg-white/[0.08] dark:bg-white/[0.04] border border-white/[0.15] dark:border-white/[0.08]"
    : "";

  const borderedBase = cardStyle === "bordered"
    ? "border-2 border-primary/15 hover:border-primary/40"
    : "";

  const cardBase = cardStyle === "card"
    ? `${ds.card.base} ${ds.card.hover}`
    : "";

  // Featured card gets gradient border animation
  const featuredClass = isFeatured
    ? "ring-1 ring-primary/20 shadow-xl shadow-primary/[0.07]"
    : "";

  const valueSize = isFeatured ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl";
  const labelSize = isFeatured ? "text-sm" : "text-xs";
  const iconSize = isFeatured ? "w-16 h-16" : "w-12 h-12";
  const iconInner = isFeatured ? "w-8 h-8" : "w-6 h-6";
  const padding = isFeatured ? "p-10 md:p-12" : "p-6 md:p-8";

  return (
    <div
      className={`
        group relative text-center transition-all duration-500 ease-out
        ${cardStyle !== "none" ? `rounded-2xl ${padding}` : ""}
        ${cardBase} ${glassBase} ${borderedBase} ${featuredClass}
        hover:-translate-y-1.5
      `}
      style={staggerStyle}
    >
      {/* Animated gradient border for featured card */}
      {isFeatured && (
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute -inset-px rounded-2xl opacity-60"
            style={{
              background: "conic-gradient(from 0deg, var(--color-primary, #6366f1), var(--color-tertiary, #8b5cf6), var(--color-primary, #6366f1))",
              animation: visible ? "stat-border-spin 6s linear infinite" : "none",
            }}
          />
          <div className="absolute inset-px rounded-2xl bg-background" />
        </div>
      )}

      {/* Subtle hover glow */}
      {cardStyle !== "none" && (
        <div
          className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, var(--color-primary, #6366f1) 0%, transparent 70%)",
            opacity: 0,
          }}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        {stat.icon && (
          <div className={`mx-auto mb-5 ${iconSize} rounded-2xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300`}>
            {iconPath ? (
              <img src={iconPath} alt="" className={iconInner} />
            ) : (
              <span className={`material-symbols-outlined text-primary/70 ${isFeatured ? "text-3xl" : "text-2xl"}`}>
                {stat.icon}
              </span>
            )}
          </div>
        )}

        {/* Value with gradient treatment */}
        <p className={`${valueSize} font-extrabold tracking-tight mb-2 tabular-nums ${
          cardStyle === "gradient"
            ? "bg-clip-text text-transparent bg-linear-to-r from-primary via-primary/80 to-tertiary"
            : "text-primary"
        }`}>
          {prefix}
          {animated ? count : stat.value}
          {suffix}
        </p>

        {/* Completion indicator */}
        {done && animated && (
          <div className="flex justify-center mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary/50 tracking-wider uppercase">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        )}

        {/* Label */}
        <p className={`${labelSize} font-semibold tracking-widest uppercase text-muted-foreground/70`}>
          {stat.label}
        </p>
      </div>

      {/* Bottom accent line on hover */}
      {cardStyle !== "none" && !isFeatured && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-16 h-0.5 rounded-full transition-all duration-300"
          style={{
            background: "linear-gradient(90deg, transparent, var(--color-primary, #6366f1), transparent)",
          }}
          aria-hidden="true"
        />
      )}
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
    animation = "stagger",
    cardStyle = "none",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);

  const { ref, className: animClass, visible } =
    useScrollAnimation(animation);

  // Featured stat: first item when there are 3+ stats
  const hasFeatured = stats.length >= 3 && stats.length % 2 !== 0;
  const featuredIdx = hasFeatured ? Math.floor(stats.length / 2) : -1;

  return (
    <section
      className={`w-full ${ds.section.base} text-foreground relative overflow-hidden ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {/* Animated gradient keyframes */}
      <style>{`
        @keyframes stat-border-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes stat-glow-pulse {
          0%, 100% { opacity: 0.03; transform: scale(1); }
          50% { opacity: 0.06; transform: scale(1.05); }
        }
        @media (prefers-reduced-motion: reduce) {
          .stat-glow-blob { animation: none !important; }
        }
      `}</style>

      {/* Decorative aurora blobs */}
      {cardStyle !== "none" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="stat-glow-blob absolute -top-1/4 -left-1/4 w-150 h-150 rounded-full opacity-[0.03]"
            style={{
              background: "radial-gradient(circle, var(--color-primary, #6366f1) 0%, transparent 70%)",
              animation: "stat-glow-pulse 8s ease-in-out infinite",
            }}
          />
          <div
            className="stat-glow-blob absolute -bottom-1/4 -right-1/4 w-125 h-125 rounded-full opacity-[0.03]"
            style={{
              background: "radial-gradient(circle, var(--color-tertiary, #8b5cf6) 0%, transparent 70%)",
              animation: "stat-glow-pulse 10s ease-in-out infinite 2s",
            }}
          />
        </div>
      )}

      {/* Decorative background */}
      {ds.section.decorative && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className={ds.section.decorative} />
        </div>
      )}

      <div
        ref={ref}
        className={`${ds.containerWidth} mx-auto transition-all duration-700 ease-out relative z-10 ${animClass}`}
      >
        {heading && (
          <h2 className={`${ds.typography.h2} text-center mb-16`}>
            {heading}
          </h2>
        )}

        <div className={`grid gap-4 md:gap-6 grid-cols-2 ${
          columns >= 3 ? "md:grid-cols-3" : ""
        } ${columns >= 4 ? "lg:grid-cols-4" : ""}`}>
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
              featured={i === featuredIdx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
