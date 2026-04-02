'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`flex ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`
            px-3 py-1.5 text-xs font-medium transition-colors rounded-lg
            ${
              activeTab === tab.id
                ? 'text-primary-container bg-primary-container/10 border-b-2 border-primary-container'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }
          `}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

export function TabPanels({ children, className = '' }: TabPanelsProps) {
  return <div className={`flex-1 overflow-y-auto ${className}`}>{children}</div>;
}
