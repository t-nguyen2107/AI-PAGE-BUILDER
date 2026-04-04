import type { ComponentConfig, Slot } from "@puckeditor/core";
import type { ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { withStyles } from "../fields/withStyles";
import { Section } from "./Section";

export type FlexProps = {
  direction: "row" | "column";
  justifyContent: "start" | "center" | "end" | "between" | "around";
  alignItems: "start" | "center" | "end" | "stretch";
  gap: number;
  wrap: boolean;
  items: Slot;
};

const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const FlexInner: ComponentConfig<FlexProps> = {
  fields: {
    direction: {
      label: "Direction",
      type: "radio",
      options: [
        { label: "Row", value: "row" },
        { label: "Column", value: "column" },
      ],
    },
    justifyContent: {
      label: "Justify",
      type: "select",
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
        { label: "Between", value: "between" },
        { label: "Around", value: "around" },
      ],
    },
    alignItems: {
      label: "Align",
      type: "select",
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
        { label: "Stretch", value: "stretch" },
      ],
    },
    gap: {
      label: "Gap (px)",
      type: "number",
      min: 0,
      max: 96,
    },
    wrap: {
      label: "Wrap",
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    items: { type: "slot" },
  },
  defaultProps: {
    direction: "row",
    justifyContent: "start",
    alignItems: "stretch",
    gap: 24,
    wrap: true,
    items: [],
  },
  render: (props: any) => {
    const { direction, justifyContent, alignItems, gap, wrap, items: Items, className, ...metaRest } = props;
    const justify = justifyMap[justifyContent as keyof typeof justifyMap];
    const align = alignMap[alignItems as keyof typeof alignMap];
    return (
      <Section padding="0px" className={className} style={extractStyleProps(metaRest)}>
        <Items
          className={`
            flex ${direction === "column" ? "flex-col" : "flex-row"}
            ${justify}
            ${align}
            ${wrap ? "flex-wrap" : "flex-nowrap"}
          `}
          style={{ gap }}
          disallow={["HeroSection", "HeaderNav", "FooterSection"]}
        />
      </Section>
    );
  },
};

export const Flex = withStyles(FlexInner);
