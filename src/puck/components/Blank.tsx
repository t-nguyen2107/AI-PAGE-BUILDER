import type { ComponentConfig, Slot } from "@puckeditor/core";
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
  render: ({ children: Children }) => {
    return (
      <Section padding="0px">
        <Children />
      </Section>
    );
  },
};

export const Blank = withStyles(BlankInner);
