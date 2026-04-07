import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { ComponentMeta } from "../types";
import { stylesToCss, type StylesValue } from "../fields/StylesField";

export type SectionProps = {
  className?: string;
  children: ReactNode;
  maxWidth?: string;
  style?: CSSProperties;
  padding?: string;
  styles?: StylesValue;
} & Partial<ComponentMeta>;

export const Section = forwardRef<HTMLDivElement, SectionProps>(
  ({ children, className, maxWidth = "1280px", style, padding, styles, ...metaRest }, ref) => {
    // Merge any ComponentMeta style props (bgColor, textColor, etc.) into style
    const metaStyle: CSSProperties = {};
    if (metaRest.bgColor) metaStyle.backgroundColor = metaRest.bgColor;
    if (metaRest.textColor) metaStyle.color = metaRest.textColor;
    if (metaRest.margin) metaStyle.margin = metaRest.margin;
    if (metaRest.borderRadius) metaStyle.borderRadius = metaRest.borderRadius;
    if (metaRest.opacity !== undefined && metaRest.opacity !== null) {
      metaStyle.opacity = Math.max(0, Math.min(1, metaRest.opacity));
    }

    const cssStyles = stylesToCss(styles);

    return (
      <div
        className={`w-full ${className ?? ""}`}
        style={{ ...style, ...metaStyle, ...cssStyles, paddingTop: padding, paddingBottom: padding }}
        ref={ref}
      >
        <div className="mx-auto px-6" style={{ maxWidth }}>
          {children}
        </div>
      </div>
    );
  },
);

Section.displayName = "Section";
