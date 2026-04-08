"use client";

import type { ReactNode } from "react";
import { SegmentedControl, InlineInput, Divider, PropertyLabel } from "../inspector/components";
import { LayoutIcons } from "../inspector/components";
import type { StylesValue } from "./StylesField";

type Display = "block" | "flex" | "grid" | "inline" | "inline-block" | "inline-flex" | "none";
type FlexDirection = "row" | "column" | "row-reverse" | "column-reverse";
type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
type JustifyContent = "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
type AlignItems = "flex-start" | "flex-end" | "center" | "stretch" | "baseline";

interface SegOpt<T extends string> {
  label: string;
  value: T;
  icon?: ReactNode;
}

const DISPLAY_OPTIONS: SegOpt<Display>[] = [
  { label: "Block", value: "block", icon: LayoutIcons.block },
  { label: "Flex", value: "flex", icon: LayoutIcons.flex },
  { label: "Grid", value: "grid", icon: LayoutIcons.grid },
  { label: "None", value: "none", icon: LayoutIcons.none },
];

const FLEX_DIR_OPTIONS: SegOpt<FlexDirection>[] = [
  { label: "Row", value: "row", icon: LayoutIcons.row },
  { label: "Column", value: "column", icon: LayoutIcons.col },
  { label: "Row Rev", value: "row-reverse" },
  { label: "Col Rev", value: "column-reverse" },
];

const ALIGN_OPTIONS: SegOpt<AlignItems>[] = [
  { label: "Start", value: "flex-start", icon: LayoutIcons.alignStart },
  { label: "Center", value: "center", icon: LayoutIcons.alignCenter },
  { label: "End", value: "flex-end", icon: LayoutIcons.alignEnd },
  { label: "Stretch", value: "stretch", icon: LayoutIcons.stretch },
];

const JUSTIFY_OPTIONS: SegOpt<JustifyContent>[] = [
  { label: "Start", value: "flex-start", icon: LayoutIcons.alignStart },
  { label: "Center", value: "center", icon: LayoutIcons.alignCenter },
  { label: "End", value: "flex-end", icon: LayoutIcons.alignEnd },
  { label: "Between", value: "space-between", icon: LayoutIcons.spaceBetween },
  { label: "Around", value: "space-around", icon: LayoutIcons.spaceAround },
];

const WRAP_OPTIONS: SegOpt<FlexWrap>[] = [
  { label: "No Wrap", value: "nowrap" },
  { label: "Wrap", value: "wrap" },
];

export function LayoutSection({
  value,
  onChange,
}: {
  value: StylesValue;
  onChange: (val: StylesValue) => void;
}) {
  const display = value.display || "block";

  const set = <K extends keyof StylesValue>(key: K, val: StylesValue[K]) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--inspector-gap-lg, 8px)" }}>
      {/* Display mode */}
      <div>
        <PropertyLabel>Display</PropertyLabel>
        <SegmentedControl<Display>
          options={DISPLAY_OPTIONS}
          value={display}
          onChange={(val) => {
            const update: StylesValue = { ...value, display: val };
            if (val !== "flex" && val !== "inline-flex") {
              delete update.flexDirection;
              delete update.flexWrap;
              delete update.justifyContent;
              delete update.alignItems;
              delete update.gap;
            }
            if (val !== "grid") {
              delete update.gridTemplateColumns;
              delete update.gridTemplateRows;
            }
            onChange(update);
          }}
        />
      </div>

      {/* Flex properties */}
      {(display === "flex" || display === "inline-flex") && (
        <>
          <Divider />
          <div>
            <PropertyLabel>Direction</PropertyLabel>
            <SegmentedControl<FlexDirection>
              options={FLEX_DIR_OPTIONS}
              value={value.flexDirection || "row"}
              onChange={(val) => set("flexDirection", val)}
            />
          </div>
          <div>
            <PropertyLabel>Justify</PropertyLabel>
            <SegmentedControl<JustifyContent>
              options={JUSTIFY_OPTIONS}
              value={value.justifyContent || "flex-start"}
              onChange={(val) => set("justifyContent", val)}
            />
          </div>
          <div>
            <PropertyLabel>Align</PropertyLabel>
            <SegmentedControl<AlignItems>
              options={ALIGN_OPTIONS}
              value={value.alignItems || "stretch"}
              onChange={(val) => set("alignItems", val)}
            />
          </div>
          <div>
            <PropertyLabel>Wrap</PropertyLabel>
            <SegmentedControl<FlexWrap>
              options={WRAP_OPTIONS}
              value={value.flexWrap || "nowrap"}
              onChange={(val) => set("flexWrap", val)}
            />
          </div>
          <div>
            <PropertyLabel>Gap</PropertyLabel>
            <InlineInput
              value={value.gap || ""}
              onChange={(val) => set("gap", val || undefined)}
              placeholder="0px"
              mono
            />
          </div>
        </>
      )}

      {/* Grid properties */}
      {display === "grid" && (
        <>
          <Divider />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--inspector-gap-sm, 4px)" }}>
            <div>
              <PropertyLabel>Columns</PropertyLabel>
              <InlineInput
                value={value.gridTemplateColumns || ""}
                onChange={(val) => set("gridTemplateColumns", val || undefined)}
                placeholder="1fr 1fr"
                mono
              />
            </div>
            <div>
              <PropertyLabel>Rows</PropertyLabel>
              <InlineInput
                value={value.gridTemplateRows || ""}
                onChange={(val) => set("gridTemplateRows", val || undefined)}
                placeholder="auto"
                mono
              />
            </div>
          </div>
          <div>
            <PropertyLabel>Gap</PropertyLabel>
            <InlineInput
              value={value.gap || ""}
              onChange={(val) => set("gap", val || undefined)}
              placeholder="0px"
              mono
            />
          </div>
          <div>
            <PropertyLabel>Justify</PropertyLabel>
            <SegmentedControl<JustifyContent>
              options={JUSTIFY_OPTIONS}
              value={value.justifyContent || "flex-start"}
              onChange={(val) => set("justifyContent", val)}
            />
          </div>
          <div>
            <PropertyLabel>Align</PropertyLabel>
            <SegmentedControl<AlignItems>
              options={ALIGN_OPTIONS}
              value={value.alignItems || "stretch"}
              onChange={(val) => set("alignItems", val)}
            />
          </div>
        </>
      )}
    </div>
  );
}
