import type { ImageBlockProps } from "../types";

const radiusMap: Record<NonNullable<ImageBlockProps["borderRadius"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function ImageBlock({ src, alt, width, borderRadius }: ImageBlockProps) {
  const radius = borderRadius || "none";

  return (
    <div className="flex justify-center w-full">
      <img
        src={src}
        alt={alt}
        className={`${radiusMap[radius]} object-cover`}
        style={{ width: width || "100%" }}
      />
    </div>
  );
}
