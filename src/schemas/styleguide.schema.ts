import { z } from 'zod';

export const colorPaletteSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  surface: z.string(),
  text: z.string(),
  textMuted: z.string(),
  border: z.string(),
  error: z.string(),
  success: z.string(),
  warning: z.string(),
  custom: z.record(z.string(), z.string()).optional(),
});

export const typographySystemSchema = z.object({
  headingFont: z.string(),
  bodyFont: z.string(),
  monoFont: z.string(),
  fontSizes: z.record(z.string(), z.string()),
  fontWeights: z.record(z.string(), z.string()),
});

export const spacingScaleSchema = z.object({
  values: z.record(z.string(), z.string()),
});

export const componentVariantSchema = z.object({
  name: z.string(),
  baseClasses: z.string(),
  modifiers: z.record(z.string(), z.string()).optional(),
});

export const styleguideSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  colors: colorPaletteSchema,
  typography: typographySystemSchema,
  spacing: spacingScaleSchema,
  componentVariants: z.array(componentVariantSchema),
  cssVariables: z.record(z.string(), z.string()),
});
