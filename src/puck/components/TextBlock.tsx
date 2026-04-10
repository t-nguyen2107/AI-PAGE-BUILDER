"use client";

import type { ComponentMeta, TextBlockProps } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { Section } from "./Section";
import { getDesignTokens } from "../lib/design-styles";

const sizeMap: Record<string, string> = {
  sm: "text-sm",
  md: "text-base md:text-lg",
  lg: "text-lg md:text-xl",
};

// Unique counter for scoped <style> tags (drop-cap variant uses ::first-letter)
let styleInstance = 0;

export function TextBlock(props: TextBlockProps & ComponentMeta) {
  const {
    text,
    align,
    size,
    color,
    maxWidth,
    className,
    variant = "default",
    gradientFrom,
    gradientTo,
    designStyle,
    ...metaRest
  } = props;

  const ds = getDesignTokens(designStyle);
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";

  const sizeClass = sizeMap[size] || sizeMap.md;
  const colorClass =
    color === "muted"
      ? "text-muted-foreground"
      : "text-foreground";
  const bodyToken = ds.typography.body;

  // ─── Variant: gradient ──────────────────────────────────────────────
  if (variant === "gradient") {
    const from = gradientFrom || "var(--color-primary, #6366f1)";
    const to = gradientTo || "var(--color-secondary, #8b5cf6)";
    return (
      <Section
        padding="0px"
        maxWidth={maxWidth}
        className={className}
        style={extractStyleProps(metaRest)}
      >
        <p
          className={`${sizeClass} ${alignClass} ${bodyToken} font-semibold leading-relaxed`}
          style={{
            backgroundImage: `linear-gradient(to right, ${from}, ${to})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          {text}
        </p>
      </Section>
    );
  }

  // ─── Variant: drop-cap ──────────────────────────────────────────────
  if (variant === "drop-cap") {
    const scopeId = `tb-dc-${++styleInstance}`;
    return (
      <Section
        padding="0px"
        maxWidth={maxWidth}
        className={className}
        style={extractStyleProps(metaRest)}
      >
        <style>{`
          .${scopeId}::first-letter {
            float: left;
            font-size: 3em;
            line-height: 0.8;
            padding-right: 0.12em;
            padding-top: 0.05em;
            font-weight: 800;
            color: var(--color-primary, #6366f1);
          }
        `}</style>
        <p
          className={`${scopeId} ${sizeClass} ${alignClass} ${colorClass} ${bodyToken} leading-relaxed`}
        >
          {text}
        </p>
      </Section>
    );
  }

  // ─── Variant: pull-quote ────────────────────────────────────────────
  if (variant === "pull-quote") {
    return (
      <Section
        padding="0px"
        maxWidth={maxWidth}
        className={className}
        style={extractStyleProps(metaRest)}
      >
        <blockquote
          className={`relative border-l-4 border-[var(--color-primary,#6366f1)] pl-6 py-2 ${alignClass}`}
        >
          <span
            className="absolute -top-2 left-3 text-6xl leading-none font-serif select-none pointer-events-none"
            style={{
              color: "var(--color-primary, #6366f1)",
              opacity: 0.2,
            }}
            aria-hidden="true"
          >
            {"\u201C"}
          </span>
          <p
            className={`${sizeMap.lg} italic ${colorClass} ${bodyToken} leading-relaxed`}
          >
            {text}
          </p>
        </blockquote>
      </Section>
    );
  }

  // ─── Variant: highlighted ──────────────────────────────────────────
  if (variant === "highlighted") {
    return (
      <Section
        padding="0px"
        maxWidth={maxWidth}
        className={className}
        style={extractStyleProps(metaRest)}
      >
        <p
          className={`${sizeClass} ${alignClass} ${colorClass} ${bodyToken} leading-relaxed`}
        >
          <mark
            className="bg-[var(--color-primary,#6366f1)]/10 text-inherit rounded-sm px-1.5 py-0.5"
          >
            {text}
          </mark>
        </p>
      </Section>
    );
  }

  // ─── Variant: default (backward compatible) ────────────────────────
  return (
    <Section
      padding="0px"
      maxWidth={maxWidth}
      className={className}
      style={extractStyleProps(metaRest)}
    >
      <p
        className={`${sizeClass} ${colorClass} ${alignClass} ${bodyToken} leading-relaxed font-light`}
      >
        {text}
      </p>
    </Section>
  );
}
