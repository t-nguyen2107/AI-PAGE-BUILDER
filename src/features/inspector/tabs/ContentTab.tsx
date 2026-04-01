'use client';

import type { DOMNode, ElementNode, ItemNode } from '@/types';
import { NodeType } from '@/types';
import { Input, TextArea } from '@/components/ui/input';

export interface ContentTabProps {
  node: DOMNode;
  onUpdateContent: (key: string, value: string) => void;
}

export function ContentTab({
  node,
  onUpdateContent,
}: ContentTabProps) {
  const isElementOrItem =
    node.type === NodeType.ELEMENT || node.type === NodeType.ITEM;

  return (
    <div className="flex flex-col gap-3 p-3">
      {isElementOrItem && (
        <>
          <TextArea
            label="Text Content"
            value={(node as ElementNode | ItemNode).content ?? ''}
            onChange={(e) => onUpdateContent('content', e.target.value)}
            placeholder="Enter text content..."
          />

          {node.type === NodeType.ELEMENT && (
            <>
              {(node as ElementNode).tag === 'img' && (
                <Input
                  label="Image URL"
                  value={(node as ElementNode).src ?? ''}
                  onChange={(e) => onUpdateContent('src', e.target.value)}
                  placeholder="https://..."
                />
              )}

              {(node as ElementNode).tag === 'a' && (
                <Input
                  label="Link Href"
                  value={(node as ElementNode).href ?? ''}
                  onChange={(e) => onUpdateContent('href', e.target.value)}
                  placeholder="https://..."
                />
              )}
            </>
          )}
        </>
      )}

      <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mt-2 mb-1">
        Attributes
      </p>
      <Input
        label="CSS Class"
        value={node.className ?? ''}
        onChange={(e) => onUpdateContent('className', e.target.value)}
        placeholder="class-name"
      />
      <Input
        label="ID"
        value={node.attributes?.id ?? ''}
        onChange={(e) =>
          onUpdateContent(
            '__attr__id',
            e.target.value
          )
        }
        placeholder="element-id"
      />
    </div>
  );
}
