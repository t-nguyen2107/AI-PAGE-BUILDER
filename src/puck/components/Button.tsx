import type { ComponentConfig } from "@puckeditor/core";
import type { ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";
import { withLayout, type WithLayout } from "./Layout";
import { withStyles, type WithStyles } from "../fields/withStyles";
import { Section } from "./Section";

export type ButtonProps = WithLayout<WithStyles<{
  label: string;
  href: string;
  variant: "primary" | "secondary" | "outline";
  size: "sm" | "md" | "lg";
  fullWidth: boolean;
}>>;

const variantStyles = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90",
  secondary:
    "bg-surface-container text-on-surface hover:bg-surface-high",
  outline:
    "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const ButtonInner: ComponentConfig<ButtonProps> = {
  fields: {
    label: { type: "text", contentEditable: true },
    href: { type: "text" },
    variant: {
      type: "select",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Outline", value: "outline" },
      ],
    },
    size: {
      type: "select",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    fullWidth: {
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
  },
  defaultProps: {
    label: "Click me",
    href: "#",
    variant: "primary",
    size: "md",
    fullWidth: false,
  },
  render: (props: any) => {
    const { label, href, variant, size, fullWidth, className, ...metaRest } = props as ButtonProps & ComponentMeta;
    return (
      <Section padding="0px" className={className} style={extractStyleProps(metaRest)}>
        <a
          href={href}
          className={`
            inline-flex items-center justify-center font-semibold rounded-lg
            transition-all duration-200 cursor-pointer
            ${variantStyles[variant]}
            ${sizeStyles[size]}
            ${fullWidth ? "w-full" : ""}
          `}
        >
          {label}
        </a>
      </Section>
    );
  },
};

export const Button = withLayout(withStyles(ButtonInner));
