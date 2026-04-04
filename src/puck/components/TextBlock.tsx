import type { ComponentMeta, TextBlockProps } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { Section } from "./Section";

const sizeMap: Record<string, string> = {
  sm: "text-sm",
  md: "text-base md:text-lg",
  lg: "text-lg md:text-xl",
};

export function TextBlock(props: TextBlockProps & ComponentMeta) {
  const { text, align, size, color, maxWidth, className, ...metaRest } = props;
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  return (
    <Section padding="0px" maxWidth={maxWidth} className={className} style={extractStyleProps(metaRest)}>
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
