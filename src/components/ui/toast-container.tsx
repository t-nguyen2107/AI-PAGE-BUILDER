'use client';

import React from 'react';
import { useToastStore } from '@/store/toast-store';

const typeConfig = {
  success: {
    icon: 'check_circle',
    color: '#4ade80',
  },
  error: {
    icon: 'error',
    color: '#f87171',
  },
  info: {
    icon: 'info',
    color: '#89acff',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  // Show max 3 toasts, newest at top
  const visibleToasts = toasts.slice(-3).reverse();

  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {visibleToasts.map((toast) => {
        const config = typeConfig[toast.type];

        return (
          <div
            key={toast.id}
            className="pointer-events-auto animate-slide-in-right relative overflow-hidden rounded-xl shadow-lg bg-surface-container/90 backdrop-blur-xl min-w-[300px] max-w-md"
            style={{ borderLeft: `3px solid ${config.color}` }}
          >
            <div className="flex items-center gap-3 p-4">
              {/* Icon */}
              <span className="material-symbols-outlined text-lg flex-shrink-0" style={{ color: config.color }}>
                {config.icon}
              </span>

              {/* Message */}
              <p className="flex-1 text-sm text-on-surface">{toast.message}</p>

              {/* Close button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 p-1 rounded-md hover:bg-surface-high transition-colors"
                aria-label="Close toast"
              >
                <span className="material-symbols-outlined text-lg text-on-surface-variant">
                  close
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
