import { createElement } from "react";
import type { ComponentConfig } from "@puckeditor/core";
import { withLayout, type WithLayout } from "./Layout";
import { withStyles, type WithStyles } from "../fields/withStyles";
import { Section } from "./Section";

export type HeadingProps = WithLayout<WithStyles<{
  text: string;
  level: "h1" | "h2" | "h3" | "h4";
  align: "left" | "center" | "right";
  size: "sm" | "md" | "lg" | "xl";
}>>;

const sizeStyles: Record<string, string> = {
  sm: "text-lg font-semibold",
  md: "text-xl md:text-2xl font-bold",
  lg: "text-2xl md:text-3xl font-bold",
  xl: "text-3xl md:text-4xl font-extrabold",
};

const HeadingInner: ComponentConfig<HeadingProps> = {
  fields: {
    text: { type: "text", contentEditable: true },
    level: {
      type: "select",
      options: [
        { label: "H1", value: "h1" },
        { label: "H2", value: "h2" },
        { label: "H3", value: "h3" },
        { label: "H4", value: "h4" },
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
    size: {
      type: "select",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "Extra Large", value: "xl" },
      ],
    },
  },
  defaultProps: {
    text: "Heading",
    level: "h2",
    align: "left",
    size: "lg",
  },
  render: ({ text, level, align, size }) => {
    const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

    return (
      <Section padding="0px">
        {createElement(level, {
          className: `${sizeStyles[size]} text-foreground ${alignClass}`,
        }, text)}
      </Section>
    );
  },
};

export const Heading = withLayout(withStyles(HeadingInner));
