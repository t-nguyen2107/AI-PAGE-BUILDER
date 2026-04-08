"use client";

import { InlineInput, PropertyLabel } from "../inspector/components";
import type { TransformValue, StylesValue } from "./StylesField";

const DEFAULT_TRANSFORM: TransformValue = {
  translateX: "0px",
  translateY: "0px",
  rotate: "0deg",
  scaleX: "1",
  scaleY: "1",
  skewX: "0deg",
  skewY: "0deg",
};

export function TransformSection({
  value,
  onChange,
}: {
  value: StylesValue;
  onChange: (val: StylesValue) => void;
}) {
  const t: TransformValue = value.transform || DEFAULT_TRANSFORM;

  const update = (key: keyof TransformValue, val: string) => {
    onChange({ ...value, transform: { ...t, [key]: val } });
  };

  const reset = () => {
    onChange({ ...value, transform: undefined });
  };

  const isDefault =
    t.translateX === "0px" && t.translateY === "0px" &&
    t.rotate === "0deg" &&
    t.scaleX === "1" && t.scaleY === "1" &&
    t.skewX === "0deg" && t.skewY === "0deg";

  return (
    <div className="space-y-[var(--inspector-gap-lg)]">
      {/* Translate */}
      <div>
        <PropertyLabel onReset={isDefault ? undefined : reset}>Translate</PropertyLabel>
        <div className="grid grid-cols-2 gap-[var(--inspector-gap-sm)]">
          <div>
            <label className="text-[9px] text-[var(--inspector-text-dim)] block text-center mb-[2px]">X</label>
            <InlineInput
              value={t.translateX}
              onChange={(val) => update("translateX", val)}
              placeholder="0px"
              mono
              center
            />
          </div>
          <div>
            <label className="text-[9px] text-[var(--inspector-text-dim)] block text-center mb-[2px]">Y</label>
            <InlineInput
              value={t.translateY}
              onChange={(val) => update("translateY", val)}
              placeholder="0px"
              mono
              center
            />
          </div>
        </div>
      </div>

      {/* Rotate */}
      <div>
        <PropertyLabel>Rotate</PropertyLabel>
        <InlineInput
          value={t.rotate}
          onChange={(val) => update("rotate", val)}
          placeholder="0deg"
          mono
        />
      </div>

      {/* Scale */}
      <div>
        <PropertyLabel>Scale</PropertyLabel>
        <div className="grid grid-cols-2 gap-[var(--inspector-gap-sm)]">
          <div>
            <label className="text-[9px] text-[var(--inspector-text-dim)] block text-center mb-[2px]">X</label>
            <InlineInput
              value={t.scaleX}
              onChange={(val) => update("scaleX", val)}
              placeholder="1"
              mono
              center
            />
          </div>
          <div>
            <label className="text-[9px] text-[var(--inspector-text-dim)] block text-center mb-[2px]">Y</label>
            <InlineInput
              value={t.scaleY}
              onChange={(val) => update("scaleY", val)}
              placeholder="1"
              mono
              center
            />
          </div>
        </div>
      </div>

      {/* Skew */}
      <div>
        <PropertyLabel>Skew</PropertyLabel>
        <div className="grid grid-cols-2 gap-[var(--inspector-gap-sm)]">
          <div>
            <label className="text-[9px] text-[var(--inspector-text-dim)] block text-center mb-[2px]">X</label>
            <InlineInput
              value={t.skewX}
              onChange={(val) => update("skewX", val)}
              placeholder="0deg"
              mono
              center
            />
          </div>
          <div>
            <label className="text-[9px] text-[var(--inspector-text-dim)] block text-center mb-[2px]">Y</label>
            <InlineInput
              value={t.skewY}
              onChange={(val) => update("skewY", val)}
              placeholder="0deg"
              mono
              center
            />
          </div>
        </div>
      </div>
    </div>
  );
}
