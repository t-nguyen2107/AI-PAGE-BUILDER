"use client";

import { useState, useMemo } from "react";

export type IconValue = {
  type: "heroicon" | "svg" | "emoji";
  name: string;
  svg?: string;
  size?: string;
  color?: string;
};

// Subset of popular heroicon outlines (24x24)
const HEROICONS: Record<string, string> = {
  "arrow-right": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>`,
  "check": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>`,
  "chevron-down": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>`,
  "star": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"/></svg>`,
  "heart": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/></svg>`,
  "home": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>`,
  "user": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>`,
  "envelope": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>`,
  "phone": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/></svg>`,
  "globe": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558"/></svg>`,
  "link": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/></svg>`,
  "calendar": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>`,
  "clock": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>`,
  "shield-check": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/></svg>`,
  "bolt": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"/></svg>`,
  "fire": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"/></svg>`,
  "cog": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a7.723 7.723 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>`,
  "shopping-bag": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/></svg>`,
  "chat-bubble": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"/></svg>`,
  "map-pin": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>`,
  "play": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"/></svg>`,
};

const EMOJIS = [
  "🚀", "⚡", "🔥", "✨", "💡", "🎯", "💎", "🌟",
  "👍", "👏", "🎉", "🏆", "📈", "💪", "🔒", "🌍",
  "📧", "📞", "💬", "⚙️", "✅", "❤️", "⭐", "🎨",
];

export function IconPickerField({
  value,
  onChange,
}: {
  value: IconValue | undefined;
  onChange: (val: IconValue) => void;
}) {
  const [tab, setTab] = useState<"heroicon" | "emoji" | "svg">("heroicon");
  const [search, setSearch] = useState("");

  const v: IconValue = value || { type: "heroicon", name: "", size: "24px", color: "" };

  const filteredIcons = useMemo(() => {
    if (!search) return Object.keys(HEROICONS);
    return Object.keys(HEROICONS).filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const update = (key: keyof IconValue, val: string) => {
    onChange({ ...v, [key]: val });
  };

  const selectHeroicon = (name: string) => {
    onChange({ ...v, type: "heroicon", name, svg: HEROICONS[name] });
  };

  const selectEmoji = (emoji: string) => {
    onChange({ ...v, type: "emoji", name: emoji, svg: undefined });
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</div>

      {/* Tab switch */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setTab("heroicon")}
          className={`flex-1 text-[11px] py-1 rounded border ${
            tab === "heroicon" ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-gray-200 text-gray-500"
          }`}
        >
          Icons
        </button>
        <button
          type="button"
          onClick={() => setTab("emoji")}
          className={`flex-1 text-[11px] py-1 rounded border ${
            tab === "emoji" ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-gray-200 text-gray-500"
          }`}
        >
          Emoji
        </button>
        <button
          type="button"
          onClick={() => setTab("svg")}
          className={`flex-1 text-[11px] py-1 rounded border ${
            tab === "svg" ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-gray-200 text-gray-500"
          }`}
        >
          Custom SVG
        </button>
      </div>

      {/* Selected icon preview */}
      {v.name && (
        <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded border border-gray-200">
          <span
            className="inline-block"
            style={{ width: v.size || "24px", height: v.size || "24px", color: v.color || "currentColor" }}
            dangerouslySetInnerHTML={
              v.type === "heroicon" && v.svg
                ? { __html: v.svg }
                : v.type === "emoji"
                  ? { __html: `<span style="font-size:${v.size || "24px"}">${v.name}</span>` }
                  : v.svg
                    ? { __html: v.svg }
                    : { __html: "" }
            }
          />
          <span className="text-xs text-gray-500">{v.name}</span>
        </div>
      )}

      {tab === "heroicon" && (
        <>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-400"
            placeholder="Search icons..."
          />
          <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
            {filteredIcons.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => selectHeroicon(name)}
                className={`w-8 h-8 flex items-center justify-center rounded border text-gray-600 hover:bg-indigo-50 hover:border-indigo-400 ${
                  v.type === "heroicon" && v.name === name ? "border-indigo-400 bg-indigo-50" : "border-gray-200"
                }`}
                title={name}
                dangerouslySetInnerHTML={{ __html: HEROICONS[name] }}
              />
            ))}
          </div>
        </>
      )}

      {tab === "emoji" && (
        <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => selectEmoji(emoji)}
              className={`w-8 h-8 flex items-center justify-center rounded border text-sm hover:bg-indigo-50 ${
                v.type === "emoji" && v.name === emoji ? "border-indigo-400 bg-indigo-50" : "border-gray-200"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {tab === "svg" && (
        <textarea
          value={v.svg || ""}
          onChange={(e) => onChange({ ...v, type: "svg", svg: e.target.value, name: "custom" })}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-400 font-mono h-20 resize-none"
          placeholder="Paste SVG code here..."
        />
      )}

      {/* Size + Color */}
      <div className="flex gap-1">
        <div className="flex-1">
          <label className="text-[10px] text-gray-400 block">Size</label>
          <input
            type="text"
            value={v.size || ""}
            onChange={(e) => update("size", e.target.value)}
            className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-400"
            placeholder="24px"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-gray-400 block">Color</label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={v.color || "#000000"}
              onChange={(e) => update("color", e.target.value)}
              className="w-6 h-6 border border-gray-200 rounded cursor-pointer p-0"
            />
            <input
              type="text"
              value={v.color || ""}
              onChange={(e) => update("color", e.target.value)}
              className="flex-1 text-xs border border-gray-200 rounded px-1 py-1 font-mono"
              placeholder="currentColor"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Render an IconValue to HTML string (for use in dangerouslySetInnerHTML)
 */
export function iconToHtml(v: IconValue | undefined): string {
  if (!v || !v.name) return "";
  if (v.type === "heroicon" && v.svg) {
    return v.svg;
  }
  if (v.type === "emoji") {
    return `<span style="font-size:${v.size || "24px"}">${v.name}</span>`;
  }
  if (v.type === "svg" && v.svg) {
    return v.svg;
  }
  return "";
}
