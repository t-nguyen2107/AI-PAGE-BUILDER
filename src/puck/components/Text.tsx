import type { ComponentConfig } from "@puckeditor/core";
import type { ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { withLayout, type WithLayout } from "./Layout";
import { withStyles, type WithStyles } from "../fields/withStyles";
import { Section } from "./Section";

export type TextProps = WithLayout<WithStyles<{
  text: string;
  align: "left" | "center" | "right";
  size: "sm" | "md" | "lg";
  color: "default" | "muted";
  maxWidth?: string;
}>>;

const sizeMap = {
  sm: "text-sm",
  md: "text-base md:text-lg",
  lg: "text-lg md:text-xl",
};

const TextInner: ComponentConfig<TextProps> = {
  fields: {
    text: { type: "textarea", contentEditable: true },
    size: {
      type: "select",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    align: {
      type: "radio",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
    },
    color: {
      type: "radio",
      options: [
        { label: "Default", value: "default" },
        { label: "Muted", value: "muted" },
      ],
    },
    maxWidth: { type: "text", label: "Max Width (e.g. 916px)" },
  },
  defaultProps: {
    text: "Text content goes here.",
    align: "left",
    size: "md",
    color: "default",
  },
  render: (props: any) => {
    const { text, align, size, color, maxWidth, className, ...metaRest } = props as TextProps & ComponentMeta;
    const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

    return (
      <Section padding="0px" maxWidth={maxWidth} className={className} style={extractStyleProps(metaRest)}>
        <p
          className={`
            ${sizeMap[size]}
            ${color === "muted" ? "text-muted-foreground" : "text-foreground"}
            ${alignClass}
            leading-relaxed font-light
          `}
          style={maxWidth ? { maxWidth } : undefined}
        >
          {text}
        </p>
      </Section>
    );
  },
};

export const Text = withLayout(withStyles(TextInner));
