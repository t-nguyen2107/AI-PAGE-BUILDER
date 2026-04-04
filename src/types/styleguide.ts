export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  custom?: Record<string, string>;
}

export interface TypographySystem {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  fontSizes: Record<string, string>;
  fontWeights: Record<string, string>;
  lineHeights?: Record<string, string>;
  letterSpacings?: Record<string, string>;
}

export interface SpacingScale {
  values: Record<string, string>;
}

export interface ComponentVariant {
  name: string;
  baseClasses: string;
  modifiers?: Record<string, string>;
}

export interface Styleguide {
  id: string;
  projectId: string;
  name: string;
  colors: ColorPalette;
  typography: TypographySystem;
  spacing: SpacingScale;
  componentVariants: ComponentVariant[];
  cssVariables: Record<string, string>;
}
