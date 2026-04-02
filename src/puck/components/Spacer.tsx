import type { SpacerProps } from "../types";

export function Spacer({ height }: SpacerProps) {
  const clampedHeight = Math.max(height, 8);

  return (
    <div
      role="presentation"
      style={{ height: `${clampedHeight}px`, minHeight: "8px" }}
    />
  );
}
