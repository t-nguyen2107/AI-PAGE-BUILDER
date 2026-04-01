'use client';

import React from 'react';
import { useToastStore } from '@/store/toast-store';
import { Button } from '@/components/ui/button';

/**
 * Example component demonstrating toast usage.
 * Add this to any page to test the toast system.
 */
export function ToastExample() {
  const { addToast } = useToastStore();

  return (
    <div className="flex flex-col gap-2 p-4">
      <h3 className="text-sm font-medium text-on-surface-variant">Toast Examples</h3>

      <Button
        size="sm"
        variant="primary"
        onClick={() => addToast('Project saved successfully!', 'success')}
      >
        Success Toast
      </Button>

      <Button
        size="sm"
        variant="danger"
        onClick={() => addToast('Failed to save project. Please try again.', 'error')}
      >
        Error Toast
      </Button>

      <Button
        size="sm"
        variant="default"
        onClick={() => addToast('Changes auto-saved to draft.', 'info')}
      >
        Info Toast
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          addToast('First toast', 'info');
          setTimeout(() => addToast('Second toast', 'success'), 500);
          setTimeout(() => addToast('Third toast', 'error'), 1000);
        }}
      >
        Multiple Toasts
      </Button>
    </div>
  );
}
