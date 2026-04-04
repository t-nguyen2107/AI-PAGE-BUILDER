import { DEFAULT_COLORS } from "@/lib/constants";

export type HeadingStyle = {
  font?: string; weight?: string; size?: string; lineHeight?: string;
  letterSpacing?: string; marginTop?: string; marginBottom?: string; color?: string;
};
export type BodyStyle = {
  font?: string; weight?: string; size?: string; lineHeight?: string;
  letterSpacing?: string; marginBottom?: string; color?: string;
};
export type ButtonStyle = {
  bg?: string; text?: string; border?: string; borderRadius?: string;
  paddingX?: string; paddingY?: string; fontSize?: string; fontWeight?: string;
  hoverBg?: string; hoverText?: string; hoverBorder?: string;
  hoverShadow?: string; hoverScale?: string; transition?: string;
};
export type ShadowTokens = { sm?: string; md?: string; lg?: string; xl?: string };
export type BorderRadiusTokens = { sm?: string; md?: string; lg?: string; full?: string };
export type LinkStyle = { color?: string; hoverColor?: string; underline?: boolean; fontWeight?: string };

export type StyleGuideData = {
  colors: Record<string, string>;
  typography: {
    headingFont?: string;
    bodyFont?: string;
    monoFont?: string;
    fontSizes?: Record<string, string>;
    fontWeights?: Record<string, string>;
    lineHeights?: Record<string, string>;
    letterSpacings?: Record<string, string>;
    headingStyles?: Record<string, HeadingStyle>;
    bodyStyles?: Record<string, BodyStyle>;
  };
  spacing: { values: Record<string, string> };
  cssVariables: Record<string, string>;
  buttons?: { primary?: ButtonStyle; secondary?: ButtonStyle };
  shadows?: ShadowTokens;
  borderRadius?: BorderRadiusTokens;
  links?: LinkStyle;
};

export function generateCssVariables(styleGuide: StyleGuideData): Record<string, string> {
  const vars: Record<string, string> = {};
  const colors = { ...DEFAULT_COLORS, ...styleGuide.colors };

  vars["--color-primary"] = colors.primary;
  vars["--color-secondary"] = colors.secondary;
  vars["--color-accent"] = colors.accent;
  vars["--color-background"] = colors.background;
  vars["--color-surface"] = colors.surface;
  vars["--color-text"] = colors.text;
  vars["--color-text-muted"] = colors.textMuted;
  vars["--color-border"] = colors.border;
  vars["--color-error"] = colors.error;
  vars["--color-success"] = colors.success;
  vars["--color-warning"] = colors.warning;

  const typo = styleGuide.typography;
  if (typo.headingFont) vars["--font-heading"] = typo.headingFont;
  if (typo.bodyFont) vars["--font-body"] = typo.bodyFont;
  if (typo.monoFont) vars["--font-mono"] = typo.monoFont;
  if (typo.fontSizes) {
    Object.entries(typo.fontSizes).forEach(([k, v]) => {
      vars[`--text-${k}`] = v;
    });
  }
  if (typo.lineHeights) {
    Object.entries(typo.lineHeights).forEach(([k, v]) => {
      vars[`--leading-${k}`] = v;
    });
  }
  if (typo.letterSpacings) {
    Object.entries(typo.letterSpacings).forEach(([k, v]) => {
      vars[`--tracking-${k}`] = v;
    });
  }

  Object.entries(styleGuide.spacing.values).forEach(([k, v]) => {
    vars[`--spacing-${k}`] = v;
  });

  if (styleGuide.shadows) {
    Object.entries(styleGuide.shadows).forEach(([k, v]) => {
      vars[`--shadow-${k}`] = v;
    });
  }
  if (styleGuide.borderRadius) {
    Object.entries(styleGuide.borderRadius).forEach(([k, v]) => {
      vars[`--radius-${k}`] = v;
    });
  }
  if (styleGuide.links) {
    if (styleGuide.links.color) vars["--link-color"] = styleGuide.links.color;
    if (styleGuide.links.hoverColor) vars["--link-hover-color"] = styleGuide.links.hoverColor;
    if (styleGuide.links.fontWeight) vars["--link-font-weight"] = styleGuide.links.fontWeight;
    vars["--link-underline"] = styleGuide.links.underline !== false ? "underline" : "none";
  }

  return vars;
}
