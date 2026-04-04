import type { ComponentConfig, Slot } from "@puckeditor/core";
import type { ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

export type SectionBlockProps = {
  paddingY: string;
  paddingX: string;
  maxWidth: string;
  bgColor: string;
  bgImageUrl: string;
  bgOverlay: boolean;
  content: Slot;
};

const paddingOptions = [
  { label: "0px", value: "0px" },
  { label: "8px", value: "8px" },
  { label: "16px", value: "16px" },
  { label: "24px", value: "24px" },
  { label: "32px", value: "32px" },
  { label: "48px", value: "48px" },
  { label: "64px", value: "64px" },
  { label: "96px", value: "96px" },
  { label: "128px", value: "128px" },
];

const maxWidthOptions = [
  { label: "None (full width)", value: "100%" },
  { label: "640px", value: "640px" },
  { label: "768px", value: "768px" },
  { label: "1024px", value: "1024px" },
  { label: "1280px", value: "1280px" },
  { label: "1440px", value: "1440px" },
];

export const SectionBlockConfig: ComponentConfig<SectionBlockProps> = {
  fields: {
    paddingY: {
      type: "select",
      label: "Padding Top / Bottom",
      options: paddingOptions,
    },
    paddingX: {
      type: "select",
      label: "Padding Left / Right",
      options: paddingOptions,
    },
    maxWidth: {
      type: "select",
      label: "Max Width",
      options: maxWidthOptions,
    },
    bgColor: {
      type: "text",
      label: "Background Color",
    },
    bgImageUrl: {
      type: "text",
      label: "Background Image URL",
    },
    bgOverlay: {
      type: "radio",
      label: "Dark Overlay",
      options: [
        { label: "On", value: true },
        { label: "Off", value: false },
      ],
    },
    content: { type: "slot" },
  },
  defaultProps: {
    paddingY: "64px",
    paddingX: "24px",
    maxWidth: "1280px",
    bgColor: "",
    bgImageUrl: "",
    bgOverlay: false,
    content: [],
  },
  render: (props: any) => {
    const { paddingY, paddingX, maxWidth, bgColor, bgImageUrl, bgOverlay, content: Content, className, ...metaRest } = props;
    const hasBg = !!bgImageUrl;

    return (
      <div
        className={`w-full relative ${className ?? ""}`}
        style={{
          padding: `${paddingY} ${paddingX}`,
          backgroundColor: bgColor || undefined,
          ...extractStyleProps(metaRest),
        }}
      >
        {hasBg && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImageUrl})` }}
          />
        )}
        {hasBg && bgOverlay && (
          <div className="absolute inset-0 bg-black/50" />
        )}
        <div
          className="relative mx-auto"
          style={{ maxWidth }}
        >
          <Content />
        </div>
      </div>
    );
  },
};
