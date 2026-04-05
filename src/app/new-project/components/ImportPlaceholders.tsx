"use client";

export function ImportPlaceholders() {
  return (
    <div className="flex gap-2.5">
      <ImportTeaser
        icon="design_services"
        label="Import from Figma"
        tag="Soon"
      />
      <ImportTeaser
        icon="auto_awesome"
        label="Import from Stitch"
        tag="Soon"
      />
    </div>
  );
}

function ImportTeaser({ icon, label, tag }: { icon: string; label: string; tag: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-outline-variant/30 bg-surface-lowest text-xs select-none"
      title={`${label} — coming soon`}
    >
      <span className="material-symbols-outlined text-sm text-on-surface-outline" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
        {icon}
      </span>
      <span className="text-on-surface-outline font-medium">{label}</span>
      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary/8 text-primary/70 font-semibold uppercase tracking-wider">
        {tag}
      </span>
    </div>
  );
}
