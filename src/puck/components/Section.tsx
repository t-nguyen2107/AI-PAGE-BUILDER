import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { ComponentMeta } from "../types";

export type SectionProps = {
  className?: string;
  children: ReactNode;
  maxWidth?: string;
  style?: CSSProperties;
  padding?: string;
} & Partial<ComponentMeta>;

export const Section = forwardRef<HTMLDivElement, SectionProps>(
  ({ children, className, maxWidth = "1280px", style, padding, ...metaRest }, ref) => {
    // Merge any ComponentMeta style props (bgColor, textColor, etc.) into style
    const metaStyle: CSSProperties = {};
    if (metaRest.bgColor) metaStyle.backgroundColor = metaRest.bgColor;
    if (metaRest.textColor) metaStyle.color = metaRest.textColor;
    if (metaRest.margin) metaStyle.margin = metaRest.margin;
    if (metaRest.borderRadius) metaStyle.borderRadius = metaRest.borderRadius;
    if (metaRest.opacity !== undefined && metaRest.opacity !== null) {
      metaStyle.opacity = Math.max(0, Math.min(1, metaRest.opacity));
    }

    return (
      <div
        className={`w-full ${className ?? ""}`}
        style={{ ...style, ...metaStyle, paddingTop: padding, paddingBottom: padding }}
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
