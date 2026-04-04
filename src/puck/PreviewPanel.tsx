"use client";

import React, { useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Render } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { config } from "./puck.config";
import type { Data } from "@puckeditor/core";

type Device = "desktop" | "tablet" | "mobile";

const DEVICE_CONFIG: Record<Device, { width: number; label: string; frame: boolean }> = {
  desktop: { width: 1280, label: "Desktop", frame: false },
  tablet: { width: 768, label: "Tablet", frame: true },
  mobile: { width: 375, label: "Mobile", frame: true },
};

interface PreviewPanelProps {
  open: boolean;
  onClose: () => void;
  data: Data;
  projectId: string;
  pageId: string;
}

export function PreviewPanel({ open, onClose, data, projectId, pageId }: PreviewPanelProps) {
  const [device, setDevice] = useState<Device>("desktop");
  const cfg = DEVICE_CONFIG[device];

  const previewUrl = useMemo(
    () => `/preview/${projectId}/${pageId}`,
    [projectId, pageId],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-white flex flex-col"
      onKeyDown={handleKeyDown}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200 shrink-0">
        {/* Left: Device toggles */}
        <div className="flex items-center gap-1">
          <DeviceToggle
            active={device === "desktop"}
            onClick={() => setDevice("desktop")}
            label="Desktop"
          >
            <DesktopIcon />
          </DeviceToggle>
          <DeviceToggle
            active={device === "tablet"}
            onClick={() => setDevice("tablet")}
            label="Tablet"
          >
            <TabletIcon />
          </DeviceToggle>
          <DeviceToggle
            active={device === "mobile"}
            onClick={() => setDevice("mobile")}
            label="Mobile"
          >
            <MobileIcon />
          </DeviceToggle>

          <div className="w-px h-5 bg-gray-200 mx-2" />

          <span className="text-xs text-gray-400">
            {cfg.label} &middot; {cfg.width}px
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open in new tab
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Close preview (Esc)"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-gray-100 overflow-auto">
        <div className="flex justify-center py-6 min-h-full">
          {cfg.frame ? (
            <DeviceFrame device={device} width={cfg.width}>
              <Render config={config} data={data} />
            </DeviceFrame>
          ) : (
            <div className="w-full max-w-[1280px] bg-white min-h-full shadow-sm">
              <Render config={config} data={data} />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ── Device Frame ── */
function DeviceFrame({ device, width, children }: { device: Device; width: number; children: React.ReactNode }) {
  const isMobile = device === "mobile";
  return (
    <div
      className="bg-gray-800 rounded-[2.5rem] p-3 shadow-2xl shrink-0"
      style={{ width: width + 24 }}
    >
      {/* Top notch */}
      <div className="flex justify-center mb-1">
        <div className={`bg-gray-800 rounded-full ${isMobile ? "w-20 h-5" : "w-12 h-4"}`}>
          <div className="w-2 h-2 rounded-full bg-gray-700 mx-auto mt-0.5" />
        </div>
      </div>

      {/* Screen */}
      <div
        className="bg-white rounded-[1.25rem] overflow-y-auto overflow-x-hidden"
        style={{ width, height: `calc(100vh - 160px)`, maxHeight: 900 }}
      >
        {children}
      </div>

      {/* Bottom bar */}
      <div className="flex justify-center mt-2">
        <div className={`bg-gray-600 rounded-full ${isMobile ? "w-28 h-1" : "w-8 h-1"}`} />
      </div>
    </div>
  );
}

/* ── Device Toggle Button ── */
function DeviceToggle({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex items-center justify-center w-9 h-9 rounded-lg transition-colors ${
        active
          ? "bg-indigo-100 text-indigo-600"
          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

/* ── Icons ── */
function DesktopIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function TabletIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="12" y1="18" x2="12" y2="18.01" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12" y2="18.01" />
    </svg>
  );
}
