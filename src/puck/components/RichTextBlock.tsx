import DOMPurify from "isomorphic-dompurify";
import type { ComponentMeta, RichTextBlockProps } from "../types";
import { extractStyleProps } from "../lib/style-override";

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

export function RichTextBlock(props: RichTextBlockProps & ComponentMeta) {
  const { content, align, maxWidth, className, ...metaRest } = props;
  const isString = typeof content === "string";
  const sanitizedContent = isString ? DOMPurify.sanitize(content) : null;

  return (
    <div
      className={`${maxWidthMap[maxWidth] || "max-w-full"} ${alignMap[align] || "text-left"} mx-auto space-y-4 text-foreground ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      {isString && sanitizedContent ? (
        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      ) : (
        <div>{content}</div>
      )}
    </div>
  );
}
