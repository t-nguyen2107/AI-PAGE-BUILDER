"use client";

import { useState, useCallback, type ReactNode } from "react";
import { createUsePuck } from "@puckeditor/core";
import type { Data } from "@puckeditor/core";
import {
  StylesField,
  type StylesValue,
} from "../fields/StylesField";
import { InspectorTabs, type TabId } from "./InspectorTabs";
import "./inspector.css";

// ─── Puck context hook (module-level singleton) ──────────────────────
const usePuckData = createUsePuck();

// ─── ItemSelector type (not exported from Puck, must define locally) ───
interface ItemSelector {
  index: number;
  zone?: string;
}

// ─── Props ───────────────────────────────────────────────────────────────
interface UnifiedInspectorProps {
  children: ReactNode;
  isLoading: boolean;
  itemSelector?: ItemSelector | null;
}

// ─── Component ───────────────────────────────────────────────────────────
export function UnifiedInspector({
  children,
  isLoading,
  itemSelector,
}: UnifiedInspectorProps) {
  const [activeTab, setActiveTab] = useState<TabId>("content");

  const selectedItem = usePuckData((s) => s.selectedItem);
  const dispatch = usePuckData((s) => s.dispatch);

  // Nothing selected → show empty state
  if (!itemSelector || !selectedItem) {
    return (
      <div className="unified-inspector">
        <div className="inspector-empty">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300", color: "var(--puck-color-grey-08)", fontSize: 24 }}>
            touch_app
          </span>
          <p style={{ fontSize: 12, color: "var(--puck-color-grey-07)", marginTop: 4 }}>
            Select a component to edit
          </p>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = selectedItem.props as Record<string, any>;

  // ── Read current values ──
  const styles = (props.styles as StylesValue | undefined) ?? undefined;
  const name = (props.name as string) ?? "";
  const className = (props.className as string) ?? "";
  const targetId = props.id as string;

  // ── Dispatch helper: update a single prop on the selected component ──
  const updateProp = useCallback(
    (key: string, value: unknown) => {
      if (!targetId) return;
      dispatch({
        type: "setData",
        data: (prev: Data) => ({
          ...prev,
          content: prev.content.map((item) =>
            item.props.id === targetId
              ? { ...item, props: { ...item.props, [key]: value } }
              : item
          ),
        }),
        recordHistory: true,
      });
    },
    [dispatch, targetId],
  );

  const handleStylesChange = useCallback(
    (newStyles: StylesValue) => {
      updateProp("styles", newStyles);
    },
    [updateProp]
  );

  // ── Migrate flat style props → StylesValue for Style tab ──
  const effectiveStyles: StylesValue = migrateFlatProps(props, styles);

  return (
    <div className="unified-inspector">
      {/* ── Component header ── */}
      <div className="inspector-header">
        <span className="inspector-header-label">
          {selectedItem.type as string}
        </span>
      </div>

      {/* ── Tab bar ── */}
      <InspectorTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Tab content ── */}
      <div className="inspector-content">
        {isLoading ? (
          <div className="inspector-loading">
            <div style={{
              width: 16,
              height: 16,
              border: "2px solid var(--puck-color-azure-04)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
            }} />
          </div>
        ) : (
          <>
            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="tab-panel tab-panel--content">
                {children}
              </div>
            )}

            {/* Style Tab */}
            {activeTab === "style" && (
              <div className="tab-panel tab-panel--style">
                <StylesField
                  value={effectiveStyles}
                  onChange={handleStylesChange}
                />
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === "advanced" && (
              <div className="tab-panel tab-panel--advanced">
                {/* Name field */}
                <div className="puck-field">
                  <label className="puck-field-label">Name</label>
                  <input
                    className="puck-field-text-input"
                    value={name}
                    onChange={(e) => updateProp("name", e.target.value)}
                    placeholder="e.g. hero_main, pricing_pro"
                  />
                  <p className="puck-field-description">
                    Internal name for AI targeting
                  </p>
                </div>

                {/* CSS Classes */}
                <div className="puck-field">
                  <label className="puck-field-label">CSS Classes</label>
                  <input
                    className="puck-field-text-input"
                    value={className}
                    onChange={(e) => updateProp("className", e.target.value)}
                    placeholder="e.g. my-section dark-mode"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Legacy migration: flat props → StylesValue ──────────────────────────
function migrateFlatProps(
  props: Record<string, unknown>,
  existingStyles?: StylesValue
): StylesValue {
  // If already has styles object, use it
  if (existingStyles && Object.keys(existingStyles).length > 0) {
    return existingStyles;
  }

  // Try to migrate from flat props
  const s: StylesValue = {};
  let hasAny = false;

  if (props.bgColor) {
    s.backgroundColor = props.bgColor as string;
    hasAny = true;
  }
  if (props.textColor) {
    s.typography = {
      fontFamily: "",
      fontSize: "",
      fontWeight: "",
      lineHeight: "",
      letterSpacing: "",
      color: props.textColor as string,
      textAlign: "left",
      textDecoration: "none",
      textTransform: "none",
      fontStyle: "normal",
    };
    hasAny = true;
  }
  if (props.padding) {
    const p = props.padding as string;
    s.padding = { top: p, right: p, bottom: p, left: p };
    hasAny = true;
  }
  if (props.margin) {
    const m = props.margin as string;
    s.margin = { top: m, right: m, bottom: m, left: m };
    hasAny = true;
  }
  if (props.borderRadius) {
    const r = props.borderRadius as string;
    s.border = {
      radius: { tl: r, tr: r, br: r, bl: r },
      width: "0px",
      style: "solid",
      color: "#000000",
    };
    hasAny = true;
  }
  if (props.opacity != null && props.opacity !== "") {
    const num = typeof props.opacity === "number" ? props.opacity : parseFloat(String(props.opacity));
    if (!isNaN(num)) {
      s.opacity = num * 100;
      hasAny = true;
    }
  }

  return hasAny ? s : (existingStyles ?? {});
}
