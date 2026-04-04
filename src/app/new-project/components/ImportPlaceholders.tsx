"use client";

export function ImportPlaceholders() {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container/50 text-on-surface-outline text-xs opacity-60 cursor-not-allowed"
        title="Coming Soon"
      >
        <span className="material-symbols-outlined text-sm">upload_file</span>
        Import from Figma
        <span className="text-[9px] px-1 py-0.5 rounded bg-outline-variant/20 font-medium uppercase tracking-wider">Soon</span>
      </button>
      <button
        type="button"
        disabled
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface-container/50 text-on-surface-outline text-xs opacity-60 cursor-not-allowed"
        title="Coming Soon"
      >
        <span className="material-symbols-outlined text-sm">auto_awesome</span>
        Import from Stitch
        <span className="text-[9px] px-1 py-0.5 rounded bg-outline-variant/20 font-medium uppercase tracking-wider">Soon</span>
      </button>
    </div>
  );
}
