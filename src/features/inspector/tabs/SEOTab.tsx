'use client';

import type { DOMNode, PageNode } from '@/types';
import { NodeType } from '@/types';
import { getNodeTypeLabel } from '../constants';

export interface SEOTabProps {
  node: DOMNode;
}

export function SEOTab({ node }: SEOTabProps) {
  const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag);
  const headingLevel = isHeading ? node.tag.replace('h', '') : null;

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="rounded-lg bg-surface-container p-3">
        <p className="text-xs text-on-surface-variant mb-1">Semantic Tag</p>
        <p className="text-sm text-on-surface font-mono">{`<${node.tag}>`}</p>
      </div>

      <div className="rounded-lg bg-surface-container p-3">
        <p className="text-xs text-on-surface-variant mb-1">Node Type</p>
        <p className="text-sm text-on-surface">{getNodeTypeLabel(node.type)}</p>
      </div>

      {isHeading && (
        <div className="rounded-lg bg-primary/5 p-3">
          <p className="text-xs text-primary mb-1">Heading Level</p>
          <p className="text-sm text-on-surface">Level {headingLevel}</p>
          {node.tag === 'h1' && (
            <p className="text-xs text-on-surface-variant mt-1">
              H1 tags should appear only once per page for optimal SEO.
            </p>
          )}
        </div>
      )}

      {node.type === NodeType.PAGE && (
        <>
          <div className="rounded-lg bg-surface-container p-3">
            <p className="text-xs text-on-surface-variant mb-1">Page Info</p>
            <p className="text-sm text-on-surface">
              {(node as PageNode).meta?.title ?? 'Untitled'}
            </p>
          </div>
          {((node as PageNode).meta?.seoKeywords?.length ?? 0) > 0 && (
            <div className="rounded-lg bg-surface-container p-3">
              <p className="text-xs text-on-surface-variant mb-1">SEO Keywords</p>
              <div className="flex flex-wrap gap-1">
                {(node as PageNode).meta.seoKeywords!.map((kw, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 text-[10px] bg-surface-high text-on-surface-variant rounded-md"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="rounded-lg bg-surface-container p-3">
        <p className="text-xs text-on-surface-variant mb-1">Node ID</p>
        <p className="text-xs text-outline font-mono break-all">{node.id}</p>
      </div>
    </div>
  );
}
