'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  label?: string;
}

/**
 * Accessible tab navigation with ARIA roles and keyboard support.
 * - role="tablist" on container
 * - role="tab" + aria-selected on each tab
 * - Arrow key navigation between tabs
 */
export function Tabs({ tabs, activeTab, onTabChange, className, label = 'Tab navigation' }: TabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab);
    let nextIndex = currentIndex;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % tabs.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      e.preventDefault();
    }

    if (nextIndex !== currentIndex) {
      onTabChange(tabs[nextIndex].id);
      // Focus the new tab
      const tabEl = document.getElementById(`tab-${tabs[nextIndex].id}`);
      tabEl?.focus();
    }
  };

  return (
    <div
      className={cn('flex', className)}
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          className={cn(
            'px-3 py-1.5 text-xs font-medium transition-colors rounded-lg',
            'flex items-center gap-1.5',
            activeTab === tab.id
              ? 'text-primary bg-primary/10 font-semibold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          )}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon && (
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
  activeTabId?: string;
}

export function TabPanels({ children, className, activeTabId }: TabPanelsProps) {
  return (
    <div
      className={cn('flex-1 overflow-y-auto', className)}
      role="tabpanel"
      id={activeTabId ? `panel-${activeTabId}` : undefined}
      aria-labelledby={activeTabId ? `tab-${activeTabId}` : undefined}
    >
      {children}
    </div>
  );
}
