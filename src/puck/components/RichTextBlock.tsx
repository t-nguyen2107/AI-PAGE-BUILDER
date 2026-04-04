import type { RichTextBlockProps } from "../types";

const maxWidthMap: Record<RichTextBlockProps["maxWidth"], string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
};

const alignMap: Record<RichTextBlockProps["align"], string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function RichTextBlock({ content, align, maxWidth }: RichTextBlockProps) {
  const isString = typeof content === "string";

  return (
    <div
      className={`${maxWidthMap[maxWidth] || "max-w-full"} ${alignMap[align] || "text-left"} mx-auto space-y-4 text-foreground`}
    >
      {isString ? (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div>{content}</div>
      )}
    </div>
  );
}
