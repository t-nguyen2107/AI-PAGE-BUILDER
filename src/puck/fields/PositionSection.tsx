"use client";

import { InlineSelect, InlineInput, PropertyLabel, Divider } from "../inspector/components";
import type { StylesValue } from "./StylesField";

type Position = "static" | "relative" | "absolute" | "fixed" | "sticky";

const POSITION_OPTIONS: Array<{ label: string; value: Position }> = [
  { label: "Static", value: "static" },
  { label: "Relative", value: "relative" },
  { label: "Absolute", value: "absolute" },
  { label: "Fixed", value: "fixed" },
  { label: "Sticky", value: "sticky" },
];

export function PositionSection({
  value,
  onChange,
}: {
  value: StylesValue;
  onChange: (val: StylesValue) => void;
}) {
  const pos = value.position || "static";
  const inset = value.inset || { top: "auto", right: "auto", bottom: "auto", left: "auto" };

  const set = <K extends keyof StylesValue>(key: K, val: StylesValue[K]) => {
    onChange({ ...value, [key]: val });
  };

  const updateInset = (side: "top" | "right" | "bottom" | "left", val: string) => {
    onChange({ ...value, inset: { ...inset, [side]: val } });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--inspector-gap-lg, 8px)" }}>
      {/* Position type */}
      <div>
        <PropertyLabel>Position</PropertyLabel>
        <InlineSelect<Position>
          value={pos}
          onChange={(val) => {
            const update: StylesValue = { ...value, position: val };
            if (val === "static") {
              delete update.inset;
              delete update.zIndex;
            }
            onChange(update);
          }}
          options={POSITION_OPTIONS}
        />
      </div>

      {/* Z-Index */}
      {pos !== "static" && (
        <div>
          <PropertyLabel>Z-Index</PropertyLabel>
          <InlineInput
            value={value.zIndex || ""}
            onChange={(val) => set("zIndex", val || undefined)}
            placeholder="auto"
            mono
          />
        </div>
      )}

      {/* Inset controls */}
      {pos !== "static" && (
        <>
          <Divider />
          <div>
            <PropertyLabel>Inset</PropertyLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--inspector-gap-sm, 4px)" }}>
              {(
                [
                  ["top", "Top"],
                  ["right", "Right"],
                  ["bottom", "Bottom"],
                  ["left", "Left"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label style={{ display: "block", textAlign: "center", marginBottom: 2, fontSize: "var(--inspector-font-size-xs, 10px)", color: "var(--inspector-text-dim)" }}>{label}</label>
                  <input
                    type="text"
                    value={inset[key]}
                    onChange={(e) => updateInset(key, e.target.value)}
                    placeholder="auto"
                    style={{
                      width: "100%",
                      height: "var(--inspector-control-height, 28px)",
                      textAlign: "center",
                      fontSize: "var(--inspector-font-size, 11px)",
                      fontFamily: "monospace",
                      background: "var(--inspector-surface)",
                      color: "var(--inspector-text)",
                      border: "1px solid var(--inspector-border)",
                      borderRadius: "var(--inspector-radius-sm, 4px)",
                      outline: "none",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
