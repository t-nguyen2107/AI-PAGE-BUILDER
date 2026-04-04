import type { SpacerProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

export function Spacer(props: SpacerProps & ComponentMeta) {
  const { height, className, ...metaRest } = props;
  const clampedHeight = Math.max(height, 8);

  const inlineStyle: React.CSSProperties = {
    height: `${clampedHeight}px`,
    minHeight: "8px",
    ...extractStyleProps(metaRest),
  };

  return (
    <div
      role="presentation"
      className={className}
      style={inlineStyle}
    />
  );
}
