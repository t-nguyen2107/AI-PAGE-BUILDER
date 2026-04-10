import type { SpacerProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

// ─── Divider border style map ────────────────────────────────────────────────

const BORDER_STYLE_MAP: Record<string, string> = {
  solid: "solid",
  dashed: "dashed",
  dotted: "dotted",
};

// ─── SVG divider shapes ─────────────────────────────────────────────────────

function resolveColor(dividerColor: string | undefined): string {
  return dividerColor || "var(--color-primary)";
}

function WaveDivider({ color }: { color: string }) {
  return (
    <svg
      width="100%"
      height="40"
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M0 20 C150 0, 350 40, 600 20 C850 0, 1050 40, 1200 20"
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
      />
    </svg>
  );
}

function SlantDivider({ color }: { color: string }) {
  return (
    <svg
      width="100%"
      height="40"
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <polygon points="0,0 1200,40 1200,41 0,1" fill={color} opacity="0.15" />
      <line
        x1="0"
        y1="0.5"
        x2="1200"
        y2="40"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.3"
      />
    </svg>
  );
}

function ArrowDivider({ color }: { color: string }) {
  return (
    <svg
      width="100%"
      height="40"
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <polyline
        points="500,10 600,30 700,10"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
    </svg>
  );
}

let fadeInstance = 0;
function FadeDivider({ color }: { color: string }) {
  const id = `spacer-fade-gradient-${++fadeInstance}`;
  return (
    <svg
      width="100%"
      height="8"
      viewBox="0 0 1200 8"
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="3" width="1200" height="2" fill={`url(#${id})`} />
    </svg>
  );
}

function DotsDivider({ color }: { color: string }) {
  return (
    <svg
      width="100%"
      height="20"
      viewBox="0 0 1200 20"
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <circle cx="500" cy="10" r="4" fill={color} opacity="0.35" />
      <circle cx="560" cy="10" r="4" fill={color} opacity="0.45" />
      <circle cx="600" cy="10" r="4" fill={color} opacity="0.55" />
      <circle cx="640" cy="10" r="4" fill={color} opacity="0.45" />
      <circle cx="700" cy="10" r="4" fill={color} opacity="0.35" />
    </svg>
  );
}

function ShapeDivider({
  shape,
  color,
}: {
  shape: "wave" | "slant" | "arrow" | "fade" | "dots";
  color: string;
}) {
  switch (shape) {
    case "wave":
      return <WaveDivider color={color} />;
    case "slant":
      return <SlantDivider color={color} />;
    case "arrow":
      return <ArrowDivider color={color} />;
    case "fade":
      return <FadeDivider color={color} />;
    case "dots":
      return <DotsDivider color={color} />;
  }
}

// ─── Spacer component ────────────────────────────────────────────────────────

export function Spacer(props: SpacerProps & ComponentMeta) {
  const {
    height,
    showDivider,
    dividerStyle,
    dividerColor,
    dividerWidth,
    dividerShape,
    className,
    ...metaRest
  } = props;

  const clampedHeight = Math.max(height, 8);

  const inlineStyle: React.CSSProperties = {
    height: `${clampedHeight}px`,
    minHeight: "8px",
    ...extractStyleProps(metaRest),
  };

  const hasShape = dividerShape && dividerShape !== "none";
  const color = resolveColor(dividerColor);

  // No divider and no shape — plain spacer
  if (!showDivider && !hasShape) {
    return (
      <div
        role="presentation"
        className={className}
        style={inlineStyle}
      />
    );
  }

  // SVG shape divider — takes priority over showDivider
  if (hasShape) {
    return (
      <div
        role="presentation"
        className={`flex items-center justify-center ${className ?? ""}`}
        style={inlineStyle}
      >
        <div
          className={
            dividerWidth === "contained"
              ? "max-w-4xl mx-auto w-full"
              : "w-full"
          }
        >
          <ShapeDivider shape={dividerShape} color={color} />
        </div>
      </div>
    );
  }

  // Classic <hr> divider
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
