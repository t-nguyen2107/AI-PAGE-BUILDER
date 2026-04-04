import type { ComponentConfig, Slot } from "@puckeditor/core";
import type { ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { withStyles } from "../fields/withStyles";
import { Section } from "./Section";

export type BlankProps = {
  children: Slot;
};

const BlankInner: ComponentConfig<BlankProps> = {
  fields: {
    children: { type: "slot" },
  },
  defaultProps: {
    children: [],
  },
  render: (props: any) => {
    const { children: Children, className, ...metaRest } = props;
    return (
      <Section padding="0px" className={className} style={extractStyleProps(metaRest)}>
        <Children />
      </Section>
    );
  },
};

export const Blank = withStyles(BlankInner);
