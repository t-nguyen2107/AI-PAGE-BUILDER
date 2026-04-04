import { forwardRef, type CSSProperties, type ReactNode } from "react";

export type SectionProps = {
  className?: string;
  children: ReactNode;
  maxWidth?: string;
  style?: CSSProperties;
  padding?: string;
};

export const Section = forwardRef<HTMLDivElement, SectionProps>(
  ({ children, className, maxWidth = "1280px", style, padding }, ref) => {
    return (
      <div
        className={`w-full ${className ?? ""}`}
        style={{ ...style, paddingTop: padding, paddingBottom: padding }}
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
