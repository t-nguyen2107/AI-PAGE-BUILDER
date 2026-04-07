"use client";

import { useState } from "react";
import { MediaManager } from "./MediaManager";

interface MediaPickerFieldProps {
  value: string | undefined;
  onChange: (url: string) => void;
  label?: string;
  acceptTypes?: string;
}

export function MediaPickerField({
  value,
  onChange,
  label,
  acceptTypes = "image/*",
}: MediaPickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="text-[11px] text-gray-600 font-medium">{label}</div>
      )}

      {value ? (
        <div className="relative w-full h-20 rounded-lg border border-[var(--puck-color-grey-05)] overflow-hidden bg-[var(--puck-color-grey-01)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            ×
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-[11px] py-2 rounded-md border border-dashed border-[var(--puck-color-grey-05)] text-[var(--puck-color-grey-07)] hover:border-[var(--puck-color-azure-04)] hover:text-[var(--puck-color-azure-05)] hover:bg-[var(--puck-color-azure-01)] font-medium transition-all"
      >
        {value ? "Change Image" : "Select Image"}
      </button>

      <MediaManager
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setOpen(false);
        }}
        acceptTypes={acceptTypes}
      />
    </div>
  );
}
