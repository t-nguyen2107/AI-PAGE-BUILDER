'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store/toast-store';

const typeConfig = {
  success: {
    icon: 'check_circle',
    color: 'var(--success)',
  },
  error: {
    icon: 'error',
    color: 'var(--error)',
  },
  info: {
    icon: 'info',
    color: 'var(--info)',
  },
  warning: {
    icon: 'warning',
    color: 'var(--warning)',
  },
};

/**
 * Toast notification container with aria-live for screen reader support.
 * Shows max 3 toasts, newest at top.
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  const visibleToasts = toasts.slice(-3).reverse();

  return (
    <div
      className="fixed bottom-24 right-4 z-toast flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {visibleToasts.map((toast) => {
        const config = typeConfig[toast.type] || typeConfig.info;

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto animate-slide-in-right',
              'relative overflow-hidden rounded-xl shadow-lg',
              'bg-surface-container/90 backdrop-blur-xl',
              'min-w-75 max-w-md'
            )}
            style={{ borderLeft: `3px solid ${config.color}` }}
            role="status"
          >
            <div className="flex items-center gap-3 p-4">
              {/* Icon */}
              <span
                className="material-symbols-outlined text-lg flex-shrink-0"
                style={{ color: config.color }}
                aria-hidden="true"
              >
                {config.icon}
              </span>

              {/* Message */}
              <p className="flex-1 text-sm text-on-surface">{toast.message}</p>

              {/* Close button */}
              <button
                onClick={() => removeToast(toast.id)}
                className={cn(
                  'shrink-0 p-1 rounded-md',
                  'hover:bg-surface-high transition-colors'
                )}
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
