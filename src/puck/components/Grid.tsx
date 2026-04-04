import type { ComponentConfig, Slot } from "@puckeditor/core";
import type { ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { withStyles } from "../fields/withStyles";
import { Section } from "./Section";

export type GridProps = {
  numColumns: number;
  gap: number;
  items: Slot;
};

const GridInner: ComponentConfig<GridProps> = {
  fields: {
    numColumns: {
      label: "Number of columns",
      type: "number",
      min: 1,
      max: 12,
    },
    gap: {
      label: "Gap (px)",
      type: "number",
      min: 0,
      max: 96,
    },
    items: { type: "slot" },
  },
  defaultProps: {
    numColumns: 3,
    gap: 24,
    items: [],
  },
  render: (props: any) => {
    const { gap, numColumns, items: Items, className, ...metaRest } = props;
    return (
      <Section className={className} style={extractStyleProps(metaRest)}>
        <Items
          className="grid"
          style={{
            gap,
            gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
          }}
          disallow={["HeroSection", "HeaderNav", "FooterSection"]}
        />
      </Section>
    );
  },
};

export const Grid = withStyles(GridInner);
