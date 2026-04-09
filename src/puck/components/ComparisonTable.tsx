"use client";

import { useRef, useState, useEffect } from "react";
import type { ComparisonTableProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";

function formatCellValue(value: string): { text: string; className: string } {
  const lower = value.toLowerCase().trim();
  if (lower === "yes" || lower === "true" || lower === "1" || lower === "✓" || lower === "check") return { text: "\u2713", className: "text-primary font-semibold" };
  if (lower === "" || lower === "no" || lower === "false" || lower === "0" || lower === "—" || lower === "-") return { text: "\u2014", className: "text-muted-foreground/40" };
  return { text: value, className: "" };
}

function useScrollAnimation(animation: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (animation === "none" || !ref.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setVisible(true); return; }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [animation]);
  const animClasses: Record<string, string> = {
    "fade-up": visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
  };
  return { ref, className: animClasses[animation] ?? "", visible };
}

export function ComparisonTable(props: ComparisonTableProps & ComponentMeta) {
  const {
    heading,
    plans,
    features = [],
    highlightedPlan,
    highlightedColor,
    tooltipDetails = false,
    animation = "none",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);
  const { ref: animRef, className: animClass } = useScrollAnimation(animation);

  const highlightIdx = highlightedPlan != null && highlightedPlan >= 0 && highlightedPlan < plans.length
    ? highlightedPlan
    : -1;

  const highlightBg = highlightedColor
    ? { backgroundColor: highlightedColor }
    : undefined;

  const highlightBgClass = !highlightedColor ? "ring-2 ring-primary bg-primary/5" : "";
  const highlightTextClass = !highlightedColor ? "text-primary" : "";

  return (
    <section
      className={`w-full ${ds.section.base} text-foreground relative ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {ds.section.decorative && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className={ds.section.decorative} />
        </div>
      )}
      <div
        ref={animRef}
        className={`${ds.containerWidth} mx-auto transition-all duration-700 ease-out relative ${animClass}`}
      >
        {heading && (
          <h2 className={`${ds.typography.h2} text-center mb-12`}>
            {heading}
          </h2>
        )}

        <div className={`overflow-x-auto ${ds.card.base}`}>
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">
                  Features
                </th>
                {plans.map((plan, i) => (
                  <th
                    key={i}
                    className={`text-center px-6 py-4 font-semibold transition-colors ${
                      i === highlightIdx ? highlightTextClass : ""
                    } ${plan.highlighted && i !== highlightIdx ? "bg-primary/5 text-primary" : ""}`}
                    style={i === highlightIdx ? highlightBg : undefined}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>{plan.name}</span>
                      {i === highlightIdx && (
                        <span className={`text-xs ${ds.accent.badge}`}>Recommended</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {features.map((feature, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-6 py-4 font-medium">{feature.name}</td>
                  {plans.map((plan, colIdx) => (
                    <td
                      key={colIdx}
                      className={`text-center px-6 py-4 transition-colors ${
                        colIdx === highlightIdx ? highlightBgClass : ""
                      } ${plan.highlighted && colIdx !== highlightIdx ? "bg-primary/5" : ""}`}
                      style={colIdx === highlightIdx ? highlightBg : undefined}
                    >
                      {tooltipDetails ? (
                        <span
                          className={`relative group cursor-help ${formatCellValue(feature.values[colIdx] ?? "").className}`}
                          title={`${feature.name}: ${feature.values[colIdx] ?? ""}`}
                        >
                          {formatCellValue(feature.values[colIdx] ?? "").text}
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs rounded-lg bg-foreground text-background opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                            {feature.name}: {feature.values[colIdx] ?? ""}
                          </span>
                        </span>
                      ) : (
                        <span className={formatCellValue(feature.values[colIdx] ?? "").className}>
                          {formatCellValue(feature.values[colIdx] ?? "").text}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
