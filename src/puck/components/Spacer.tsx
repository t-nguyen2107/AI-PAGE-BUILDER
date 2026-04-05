import type { SpacerProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

// ─── Divider border style map ────────────────────────────────────────────────

const BORDER_STYLE_MAP: Record<string, string> = {
  solid: "solid",
  dashed: "dashed",
  dotted: "dotted",
};

export function Spacer(props: SpacerProps & ComponentMeta) {
  const {
    height,
    showDivider,
    dividerStyle,
    dividerColor,
    dividerWidth,
    className,
    ...metaRest
  } = props;

  const clampedHeight = Math.max(height, 8);

  const inlineStyle: React.CSSProperties = {
    height: `${clampedHeight}px`,
    minHeight: "8px",
    ...extractStyleProps(metaRest),
  };

  if (!showDivider) {
    return (
      <div
        role="presentation"
        className={className}
        style={inlineStyle}
      />
    );
  }

  // Divider visible
  const borderStyle = BORDER_STYLE_MAP[dividerStyle ?? "solid"] ?? "solid";

  return (
    <div
      role="presentation"
      className={`flex items-center ${className ?? ""}`}
      style={inlineStyle}
    >
      <hr
        className={
          dividerWidth === "contained"
            ? "max-w-4xl mx-auto w-full"
            : "w-full"
        }
        style={{
          borderStyle,
          borderWidth: 0,
          borderTopWidth: "1px",
          borderColor: dividerColor || undefined,
        }}
      />
    </div>
  );
}
