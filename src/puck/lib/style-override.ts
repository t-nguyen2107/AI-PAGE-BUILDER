import type { ComponentMeta } from "../types";
import type React from "react";

/**
 * Extract style override props from ComponentMeta into React CSSProperties.
 * Use on the outermost element of every render component.
 */
export function extractStyleProps(
  props: Partial<ComponentMeta>,
): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (props.bgColor) style.backgroundColor = props.bgColor;
  if (props.textColor) style.color = props.textColor;
  if (props.padding) style.padding = props.padding;
  if (props.margin) style.margin = props.margin;
  if (props.borderRadius) style.borderRadius = props.borderRadius;
  if (props.maxWidth) style.maxWidth = props.maxWidth;
  if (props.opacity !== undefined && props.opacity !== null) {
    style.opacity = Math.max(0, Math.min(1, props.opacity));
  }

  return style;
}

/**
 * Returns CSS class names for responsive visibility hiding.
 * Usage: on the outermost element of each component.
 *
 * Requires CSS rules for .rv-hide-mobile / .rv-hide-tablet / .rv-hide-desktop
 * (defined in puck-dark.css).
 */
export function getResponsiveClass(
  hiddenOnBreakpoints: string[] | undefined,
): string {
  if (!hiddenOnBreakpoints || hiddenOnBreakpoints.length === 0) return "";
  return hiddenOnBreakpoints
    .map((bp) => `rv-hide-${bp}`)
    .join(" ");
}
