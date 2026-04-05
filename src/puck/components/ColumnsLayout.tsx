import type { ColumnsLayoutProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

// ─── Gap size map ────────────────────────────────────────────────────────────

const GAP_MAP: Record<string, string> = {
  sm: "12px",
  md: "24px",
  lg: "32px",
  xl: "48px",
};

export function ColumnsLayout(props: ColumnsLayoutProps & ComponentMeta) {
  const {
    columns,
    gap,
    col1,
    col2,
    col3,
    col4,
    unequalWidths,
    widths,
    stackOrder,
    gapSize,
    className,
    ...metaRest
  } = props;

  // Determine effective gap value
  const effectiveGap = gapSize ? GAP_MAP[gapSize] ?? `${gap}px` : `${gap}px`;

  // Build grid template columns for desktop
  const desktopColumns =
    unequalWidths && widths && widths.length > 0
      ? widths.slice(0, columns).join(" ")
      : `repeat(${columns}, 1fr)`;

  // Collect column content in order
  const columnSlots = [col1, col2];
  if (columns >= 3) columnSlots.push(col3);
  if (columns >= 4) columnSlots.push(col4);

  // Reverse stacking: reverse the slot order so last columns appear first on mobile
  const slots = stackOrder === "reverse" ? [...columnSlots].reverse() : columnSlots;

  const styleOverrides = extractStyleProps(metaRest);

  return (
    <div
      className={`grid w-full grid-cols-1 md:grid-cols-2 ${columns >= 3 ? "lg:grid-cols-3" : ""} ${columns >= 4 ? "xl:grid-cols-4" : ""} ${className ?? ""}`}
      style={{
        gap: effectiveGap,
        // On desktop, use the computed template (equal or unequal)
        // Tailwind responsive classes handle base breakpoints;
        // inline gridTemplateColumns overrides for unequal widths at all sizes.
        ...(unequalWidths && widths && widths.length > 0
          ? { gridTemplateColumns: desktopColumns }
          : {}),
        ...styleOverrides,
      }}
    >
      {slots.map((slot, i) => (
        <div key={i}>{slot?.()}</div>
      ))}
    </div>
  );
}
