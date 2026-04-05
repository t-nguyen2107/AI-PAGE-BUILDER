"use client";

import { useRef, useState, useEffect } from "react";
import type { ComparisonTableProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

function formatCellValue(value: string): string {
  const lower = value.toLowerCase().trim();
  if (lower === "yes" || lower === "true" || lower === "1" || lower === "✓" || lower === "check") return "\u2713";
  if (lower === "" || lower === "no" || lower === "false" || lower === "0" || lower === "—" || lower === "-") return "\u2014";
  return value;
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
    features,
    highlightedPlan,
    highlightedColor,
    tooltipDetails = false,
    animation = "none",
    className,
    ...metaRest
  } = props;
  const { ref: animRef, className: animClass } = useScrollAnimation(animation);

  const highlightIdx = highlightedPlan != null && highlightedPlan >= 0 && highlightedPlan < plans.length
    ? highlightedPlan
    : -1;

  const highlightBg = highlightedColor
    ? { backgroundColor: highlightedColor }
    : undefined;

  const highlightBgClass = !highlightedColor ? "bg-primary/10" : "";
  const highlightTextClass = !highlightedColor ? "text-primary" : "";

  return (
    <section
      className={`w-full py-20 px-6 bg-background text-foreground ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      <div
        ref={animRef}
        className={`max-w-6xl mx-auto transition-all duration-700 ease-out ${animClass}`}
      >
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {heading}
          </h2>
        )}

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
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
                        <span className="text-xs font-normal opacity-80">Recommended</span>
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
                          className="relative group cursor-help"
                          title={`${feature.name}: ${feature.values[colIdx] ?? ""}`}
                        >
                          {formatCellValue(feature.values[colIdx] ?? "")}
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs rounded-lg bg-foreground text-background opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                            {feature.name}: {feature.values[colIdx] ?? ""}
                          </span>
                        </span>
                      ) : (
                        formatCellValue(feature.values[colIdx] ?? "")
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
