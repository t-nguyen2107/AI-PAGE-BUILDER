'use client';

import React from 'react';
import { useKeyboardShortcuts } from '@/lib/use-keyboard-shortcuts';
import { ToastContainer } from '@/components/ui/toast-container';

/**
 * Client wrapper that registers builder-wide side effects
 * (keyboard shortcuts, etc.). Must be rendered inside the builder layout.
 */
export function BuilderClientShell({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  useKeyboardShortcuts(projectId);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
