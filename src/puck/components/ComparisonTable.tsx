"use client";

import { useState } from "react";
import type { ComparisonTableProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { getDesignTokens } from "../lib/design-styles";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

// ─── Cell value formatter ────────────────────────────────────────────

function CellValue({ value }: { value: string }) {
  const lower = value.toLowerCase().trim();
  if (lower === "yes" || lower === "true" || lower === "1" || lower === "✓" || lower === "check") {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
        <svg className="w-4 h-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </span>
    );
  }
  if (lower === "" || lower === "no" || lower === "false" || lower === "0" || lower === "—" || lower === "-") {
    return <span className="text-muted-foreground/30 text-lg">—</span>;
  }
  return <span className="text-sm font-medium">{value}</span>;
}

// ─── Main component ──────────────────────────────────────────────────

export function ComparisonTable(props: ComparisonTableProps & ComponentMeta) {
  const {
    heading,
    plans,
    features = [],
    highlightedPlan,
    highlightedColor,
    tooltipDetails = false,
    animation = "fade-up",
    designStyle,
    className,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);
  const { ref: animRef, className: animClass } = useScrollAnimation(animation);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const highlightIdx =
    highlightedPlan != null && highlightedPlan >= 0 && highlightedPlan < plans.length
      ? highlightedPlan
      : -1;

  const highlightBg = highlightedColor ? { backgroundColor: highlightedColor } : undefined;
  const highlightRingClass = !highlightedColor ? "ring-2 ring-primary/50 bg-primary/[0.03]" : "";
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

        {/* ─── Desktop Table (hidden on mobile) ─────────────────────── */}
        <div className={`hidden md:block overflow-x-auto ${ds.card.base}`}>
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b-2 border-border bg-muted/60">
                <th className="text-left px-6 py-5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                  Features
                </th>
                {plans.map((plan, i) => (
                  <th
                    key={i}
                    className={`text-center px-6 py-5 font-semibold transition-colors duration-200 ${
                      hoveredCol === i ? "bg-primary/4" : ""
                    } ${i === highlightIdx ? highlightTextClass : ""} ${
                      plan.highlighted && i !== highlightIdx ? "bg-primary/5 text-primary" : ""
                    }`}
                    style={i === highlightIdx ? highlightBg : undefined}
                    onMouseEnter={() => setHoveredCol(i)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    <div className="flex flex-col items-center gap-2 relative">
                      {/* Diagonal ribbon for highlighted plan */}
                      {i === highlightIdx && (
                        <div className="absolute -top-5 -right-5 w-20 h-20 overflow-hidden pointer-events-none">
                          <div className={`absolute top-4 -right-6 rotate-45 text-[10px] font-bold px-6 py-1 ${
                            highlightedColor
                              ? "text-white"
                              : "bg-primary text-primary-foreground"
                          }`}
                          style={highlightedColor ? { backgroundColor: highlightedColor } : undefined}
                          >
                            Best
                          </div>
                        </div>
                      )}
                      <span className="text-base">{plan.name}</span>
                      {plan.highlighted && !highlightedColor && (
                        <span className={`text-[10px] font-medium ${ds.accent.badge}`}>Recommended</span>
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
                  className={`border-b border-border last:border-b-0 transition-colors duration-150 ${
                    rowIdx % 2 === 0 ? "bg-transparent" : "bg-muted/20"
                  } ${hoveredCol !== null ? "bg-transparent" : ""}`}
                >
                  <td className="px-6 py-4 font-medium text-sm">{feature.name}</td>
                  {plans.map((_, colIdx) => (
                    <td
                      key={colIdx}
                      className={`text-center px-6 py-4 transition-colors duration-200 ${
                        hoveredCol === colIdx ? "bg-primary/4" : ""
                      } ${colIdx === highlightIdx ? highlightRingClass : ""} ${
                        plans[colIdx].highlighted && colIdx !== highlightIdx ? "bg-primary/5" : ""
                      }`}
                      style={colIdx === highlightIdx ? highlightBg : undefined}
                      onMouseEnter={() => setHoveredCol(colIdx)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      {tooltipDetails ? (
                        <span className="relative group cursor-help inline-flex flex-col items-center">
                          <CellValue value={feature.values[colIdx] ?? ""} />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs rounded-xl bg-foreground text-background opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-10 shadow-lg translate-y-1 group-hover:translate-y-0">
                            {feature.name}: {feature.values[colIdx] ?? ""}
                            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-foreground" />
                          </span>
                        </span>
                      ) : (
                        <CellValue value={feature.values[colIdx] ?? ""} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── Mobile: Stacked Cards (shown on mobile only) ──────────── */}
        <div className="md:hidden space-y-8">
          {plans.map((plan, planIdx) => (
            <div
              key={planIdx}
              className={`relative overflow-hidden rounded-2xl border ${
                planIdx === highlightIdx
                  ? `border-primary ring-2 ring-primary/30 ${highlightRingClass}`
                  : plan.highlighted
                    ? "border-primary/50"
                    : "border-border"
              } p-6`}
              style={planIdx === highlightIdx ? highlightBg : undefined}
            >
              {/* Ribbon badge */}
              {planIdx === highlightIdx && (
                <div className="absolute -top-1 -right-1 w-16 h-16 overflow-hidden pointer-events-none">
                  <div className={`absolute top-3 -right-4 rotate-45 text-[9px] font-bold px-4 py-0.5 ${
                    highlightedColor ? "text-white" : "bg-primary text-primary-foreground"
                  }`}
                  style={highlightedColor ? { backgroundColor: highlightedColor } : undefined}
                  >
                    Best
                  </div>
                </div>
              )}

              <h3 className={`text-lg font-semibold mb-4 ${
                planIdx === highlightIdx ? highlightTextClass : ""
              }`}>
                {plan.name}
                {plan.highlighted && planIdx !== highlightIdx && (
                  <span className={`ml-2 text-xs font-normal ${ds.accent.badge}`}>Popular</span>
                )}
              </h3>

              <div className="space-y-3">
                {features.map((feature, featureIdx) => (
                  <div
                    key={featureIdx}
                    className={`flex items-center justify-between py-2 ${
                      featureIdx < features.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    <span className="text-sm text-muted-foreground">{feature.name}</span>
                    <CellValue value={feature.values[planIdx] ?? ""} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
