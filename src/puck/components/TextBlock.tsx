import type { TextBlockProps } from "../types";

const maxWidthMap: Record<TextBlockProps["maxWidth"], string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
};

const alignMap: Record<TextBlockProps["align"], string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function TextBlock({ content, align, maxWidth }: TextBlockProps) {
  return (
    <div
      className={`${maxWidthMap[maxWidth] || "max-w-full"} ${alignMap[align] || "text-left"} mx-auto space-y-4 text-foreground`}
    >
      <div dangerouslySetInnerHTML={{ __html: content || "" }} />
    </div>
  );
}
