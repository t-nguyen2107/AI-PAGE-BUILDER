"use client";

const BREAKPOINTS = [
  { id: "desktop", label: "Desktop", icon: "desktop_windows" },
  { id: "tablet", label: "Tablet", icon: "tablet_android" },
  { id: "mobile", label: "Mobile", icon: "phone_android" },
] as const;

type BreakpointId = "desktop" | "tablet" | "mobile";

export function ResponsiveVisibility({
  value,
  onChange,
}: {
  value: string[] | undefined;
  onChange: (val: string[]) => void;
}) {
  const hidden = value || [];

  const toggle = (bp: BreakpointId) => {
    if (hidden.includes(bp)) {
      onChange(hidden.filter((b) => b !== bp));
    } else {
      onChange([...hidden, bp]);
    }
  };

  return (
    <div style={{ padding: "var(--inspector-spacing-lg, 12px)" }}>
      <div
        style={{
          fontSize: "var(--inspector-font-size-xs, 10px)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--inspector-text-dim)",
          marginBottom: "var(--inspector-spacing-sm, 6px)",
        }}
      >
        Responsive Visibility
      </div>
      <div style={{ display: "flex", gap: "var(--inspector-spacing-sm, 6px)" }}>
        {BREAKPOINTS.map((bp) => {
          const isHidden = hidden.includes(bp.id);
          return (
            <button
              key={bp.id}
              type="button"
              onClick={() => toggle(bp.id as BreakpointId)}
              title={isHidden ? `Show on ${bp.label}` : `Hide on ${bp.label}`}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "6px 4px",
                borderRadius: "var(--inspector-radius-md, 6px)",
                border: `1px solid ${isHidden ? "var(--inspector-danger, #ef4444)" : "var(--inspector-border)"}`,
                background: isHidden
                  ? "color-mix(in srgb, var(--inspector-danger, #ef4444) 8%, transparent)"
                  : "var(--inspector-surface)",
                cursor: "pointer",
                opacity: isHidden ? 0.6 : 1,
                transition: "all 0.15s",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 18,
                  fontVariationSettings: "'FILL' 0, 'wght' 300",
                  color: isHidden ? "var(--inspector-danger, #ef4444)" : "var(--inspector-text)",
                }}
              >
                {isHidden ? "visibility_off" : bp.icon}
              </span>
              <span
                style={{
                  fontSize: "var(--inspector-font-size-xs, 10px)",
                  color: isHidden ? "var(--inspector-danger, #ef4444)" : "var(--inspector-text-dim)",
                }}
              >
                {isHidden ? "Hidden" : bp.label}
              </span>
            </button>
          );
        })}
      </div>
      <p
        style={{
          fontSize: "var(--inspector-font-size-xs, 10px)",
          color: "var(--inspector-text-dim)",
          marginTop: "var(--inspector-spacing-xs, 4px)",
        }}
      >
        Click to toggle visibility per breakpoint
      </p>
    </div>
  );
}
