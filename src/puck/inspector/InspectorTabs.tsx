"use client";

export type TabId = "content" | "style" | "settings";

interface InspectorTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: Array<{ id: TabId; icon: string; label: string }> = [
  { id: "content", icon: "edit_note", label: "Content" },
  { id: "style", icon: "palette", label: "Style" },
  { id: "settings", icon: "tune", label: "Settings" },
];

export function InspectorTabs({ activeTab, onTabChange }: InspectorTabsProps) {
  const activeIndex = TABS.findIndex((t) => t.id === activeTab);

  return (
    <div className="inspector-tabs" role="tablist">
      <div className="inspector-tabs-track">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`inspector-tab ${activeTab === tab.id ? "inspector-tab--active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span
              className="material-symbols-outlined inspector-tab-icon"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              {tab.icon}
            </span>
            <span className="inspector-tab-label">{tab.label}</span>
          </button>
        ))}
        {/* Sliding indicator */}
        <div
          className="inspector-tabs-indicator"
          style={{
            width: `${100 / TABS.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      </div>
    </div>
  );
}
