'use client';

import React from 'react';
import Link from 'next/link';
import type { PageNode, SectionNode } from '@/types';
import { PreviewRenderer } from '@/features/renderer/components/PreviewRenderer';

interface PreviewPageContentProps {
  tree: PageNode;
  headerSections: SectionNode[];
  footerSections: SectionNode[];
  projectId: string;
  pageId: string;
}

/**
 * Client component that renders the preview page content.
 *
 * Wraps PreviewRenderer with a floating "Back to Editor" button
 * that links back to the builder for this page.
 */
export function PreviewPageContent({
  tree,
  headerSections,
  footerSections,
  projectId,
  pageId,
}: PreviewPageContentProps) {
  return (
    <>
      {/* Floating back-to-editor button */}
      <Link
        href={`/builder/${projectId}/pages/${pageId}`}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 9999,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          backgroundColor: '#1a1a2e',
          color: '#ffffff',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
          textDecoration: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = '#16213e';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = '#1a1a2e';
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M10 3L5 8L10 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Editor
      </Link>

      {/* Page content rendered by PreviewRenderer */}
      <PreviewRenderer
        node={tree}
        globalHeaderSections={headerSections}
        globalFooterSections={footerSections}
      />
    </>
  );
}
