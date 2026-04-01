import React from 'react';

/**
 * Renders a dynamic HTML element by tag name string.
 *
 * This avoids TypeScript issues with dynamic JSX tag variables
 * (JSX.IntrinsicElements namespace) that occur with React 19's
 * new JSX transform. Uses React.createElement directly which
 * accepts string tag names without type complaints.
 */
export function renderElement(
  tag: string,
  props: Record<string, unknown> | null,
  ...children: React.ReactNode[]
): React.ReactElement {
  return React.createElement(tag, props, ...children);
}
