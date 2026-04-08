"use client";

import { createContext, useContext, useEffect } from "react";

export interface StyleguideColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  surface?: string;
  text?: string;
  textSecondary?: string;
  border?: string;
  error?: string;
  success?: string;
  warning?: string;
  [key: string]: string | undefined;
}

const StyleguideContext = createContext<StyleguideColors | null>(null);

export function StyleguideProvider({
  colors,
  children,
}: {
  colors: StyleguideColors | null;
  children: React.ReactNode;
}) {
  return (
    <StyleguideContext.Provider value={colors}>
      {children}
    </StyleguideContext.Provider>
  );
}

export function useStyleguideColors(): StyleguideColors | null {
  return useContext(StyleguideContext);
}

/**
 * Map StyleguideColors keys → CSS variable names used by globals.css.
 * These are the raw `:root` variables that Tailwind resolves through.
 */
const CSS_VAR_MAP: Record<string, string> = {
  primary: "--primary",
  secondary: "--secondary",
  accent: "--tertiary",
  background: "--surface-lowest",
  surface: "--surface",
  text: "--on-surface",
  textSecondary: "--on-surface-variant",
  border: "--outline-variant",
  error: "--error",
  success: "--success",
  warning: "--warning",
};

/**
 * Inject styleguide CSS variables into the document's `<head>`.
 * Overrides `:root` CSS vars so all Tailwind classes resolve to project colors.
 * Call from any client component that has styleguide colors available.
 */
export function useStyleguideCssVars(colors: StyleguideColors | null): void {
  useEffect(() => {
    if (!colors) return;

    const styleId = "styleguide-override";
    let el = document.getElementById(styleId);
    if (!el) {
      el = document.createElement("style");
      el.id = styleId;
      document.head.appendChild(el);
    }

    const vars = Object.entries(CSS_VAR_MAP)
      .map(([key, cssVar]) => {
        const value = colors[key];
        return value ? `  ${cssVar}: ${value}` : "";
      })
      .filter(Boolean)
      .join(";\n");

    // Derive related tokens
    const derived: string[] = [];
    if (colors.primary) {
      derived.push(`  --primary-light: ${colors.primary}`);
      derived.push(`  --primary-dark: ${colors.primary}`);
      derived.push(
        `  --primary-gradient: linear-gradient(15deg, ${colors.primary}, ${colors.accent ?? colors.primary})`,
      );
    }

    el.textContent = `:root {\n${vars}${vars ? ";\n" : ""}${derived.join(";\n")}\n}`;

    return () => {
      const existing = document.getElementById(styleId);
      if (existing) existing.remove();
    };
  }, [colors]);
}
