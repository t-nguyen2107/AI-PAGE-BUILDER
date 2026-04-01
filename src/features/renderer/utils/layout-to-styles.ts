import type { LayoutProperties, TypographyProperties, BackgroundProperties } from '@/types';

/**
 * Convert LayoutProperties to React CSS inline styles.
 */
export function layoutToStyles(layout?: LayoutProperties): React.CSSProperties {
  if (!layout) return {};

  const styles: React.CSSProperties = {};

  if (layout.display) styles.display = layout.display;
  if (layout.flexDirection) styles.flexDirection = layout.flexDirection;
  if (layout.justifyContent) styles.justifyContent = layout.justifyContent;
  if (layout.alignItems) styles.alignItems = layout.alignItems;
  if (layout.alignContent) styles.alignContent = layout.alignContent;
  if (layout.gap) styles.gap = layout.gap;
  if (layout.flexWrap) styles.flexWrap = layout.flexWrap;
  if (layout.flexGrow) styles.flexGrow = layout.flexGrow;
  if (layout.flexShrink) styles.flexShrink = layout.flexShrink;
  if (layout.flexBasis) styles.flexBasis = layout.flexBasis;
  if (layout.order) styles.order = layout.order;
  if (layout.gridTemplateColumns) styles.gridTemplateColumns = layout.gridTemplateColumns;
  if (layout.gridTemplateRows) styles.gridTemplateRows = layout.gridTemplateRows;
  if (layout.gridColumn) styles.gridColumn = layout.gridColumn;
  if (layout.gridRow) styles.gridRow = layout.gridRow;
  if (layout.padding) styles.padding = layout.padding;
  if (layout.margin) styles.margin = layout.margin;
  if (layout.maxWidth) styles.maxWidth = layout.maxWidth;
  if (layout.minWidth) styles.minWidth = layout.minWidth;
  if (layout.minHeight) styles.minHeight = layout.minHeight;
  if (layout.maxHeight) styles.maxHeight = layout.maxHeight;
  if (layout.width) styles.width = layout.width;
  if (layout.height) styles.height = layout.height;
  if (layout.borderRadius) styles.borderRadius = layout.borderRadius;
  if (layout.overflow) styles.overflow = layout.overflow;
  if (layout.position) styles.position = layout.position;

  return styles;
}

/**
 * Convert TypographyProperties to React CSS inline styles.
 */
export function typographyToStyles(typography?: TypographyProperties): React.CSSProperties {
  if (!typography) return {};

  const styles: React.CSSProperties = {};

  if (typography.fontFamily) styles.fontFamily = typography.fontFamily;
  if (typography.fontSize) styles.fontSize = typography.fontSize;
  if (typography.fontWeight) styles.fontWeight = typography.fontWeight;
  if (typography.lineHeight) styles.lineHeight = typography.lineHeight;
  if (typography.letterSpacing) styles.letterSpacing = typography.letterSpacing;
  if (typography.textAlign) styles.textAlign = typography.textAlign;
  if (typography.color) styles.color = typography.color;
  if (typography.textDecoration) styles.textDecoration = typography.textDecoration;
  if (typography.textTransform) styles.textTransform = typography.textTransform;

  return styles;
}

/**
 * Convert BackgroundProperties to React CSS inline styles.
 */
export function backgroundToStyles(background?: BackgroundProperties): React.CSSProperties {
  if (!background) return {};

  const styles: React.CSSProperties = {};

  if (background.gradient) {
    styles.backgroundImage = background.gradient;
  } else if (background.imageUrl) {
    styles.backgroundImage = `url(${background.imageUrl})`;
    styles.backgroundSize = background.size ?? 'cover';
    styles.backgroundPosition = background.position ?? 'center';
    styles.backgroundRepeat = background.repeat ?? 'no-repeat';
  }

  if (background.color) {
    styles.backgroundColor = background.color;
  }

  return styles;
}

/**
 * Merge node inlineStyles (Record<string, string>) into React.CSSProperties.
 */
export function inlineStylesToCSS(
  inlineStyles?: Record<string, string>
): React.CSSProperties {
  if (!inlineStyles) return {};
  return { ...inlineStyles } as React.CSSProperties;
}

/**
 * Merge multiple style objects into one, filtering out empty objects.
 */
export function mergeStyles(
  ...styleObjects: React.CSSProperties[]
): React.CSSProperties {
  let merged: React.CSSProperties = {};
  for (const obj of styleObjects) {
    if (obj && Object.keys(obj).length > 0) {
      merged = { ...merged, ...obj };
    }
  }
  return merged;
}
