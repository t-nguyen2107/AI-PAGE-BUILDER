import type { TextBlockProps } from "../types";
import { Section } from "./Section";

const sizeMap: Record<string, string> = {
  sm: "text-sm",
  md: "text-base md:text-lg",
  lg: "text-lg md:text-xl",
};

export function TextBlock({ text, align, size, color, maxWidth }: TextBlockProps) {
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  return (
    <Section padding="0px" maxWidth={maxWidth}>
      <p
        className={`
          ${sizeMap[size] || sizeMap.md}
          ${color === "muted" ? "text-muted-foreground" : "text-foreground"}
          ${alignClass}
          leading-relaxed font-light
        `}
      >
        {text}
      </p>
    </Section>
  );
}
