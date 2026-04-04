import type { ImageBlockProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

const radiusMap: Record<NonNullable<ImageBlockProps["borderRadius"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function ImageBlock(props: ImageBlockProps & ComponentMeta) {
  const { src, alt, width, borderRadius, className, ...metaRest } = props;
  const radius = borderRadius || "none";

  return (
    <div className={`flex justify-center w-full ${className ?? ""}`} style={extractStyleProps(metaRest)}>
      <img
        src={src}
        alt={alt}
        className={`${radiusMap[radius]} object-cover`}
        style={{ width: width || "100%" }}
      />
    </div>
  );
}
