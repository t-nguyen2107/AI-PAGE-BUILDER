'use client';

import { useCallback, useRef, useState } from 'react';
import { useBuilderStore } from '@/store';
import { apiClient } from '@/lib/api-client';
import type { AIGenerationResponse, DOMNode } from '@/types';
import { NodeType, SemanticTag } from '@/types/enums';

export interface UseAIGenerationOptions {
  projectId: string;
  onChunk?: (text: string) => void;
  onDone?: (result: AIGenerationResponse) => void;
  onError?: (error: string) => void;
  onStatus?: (step: string, label: string) => void;
}

export interface UseAIGenerationReturn {
  send: (prompt: string) => void;
  cancel: () => void;
  loading: boolean;
}

/**
 * Shared hook for AI generation — used by both AIChatPanel and the
 * floating command bar on the Canvas. Encapsulates streaming,
 * canvas application, and abort control.
 */
export function useAIGeneration(opts: UseAIGenerationOptions): UseAIGenerationReturn {
  const abortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentPageId = useBuilderStore((s) => s.currentPageId);
  const tree = useBuilderStore((s) => s.tree);
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const applyAIDiff = useBuilderStore((s) => s.applyAIDiff);

  const applyResponse = useCallback(
    (res: AIGenerationResponse) => {
      if (res.action === 'full_page' && res.nodes.length > 0 && res.nodes[0].type !== NodeType.PAGE) {
        const pageNode = {
          id: tree?.id ?? `page_${Date.now()}`,
          type: NodeType.PAGE,
          tag: SemanticTag.MAIN,
          className: '',
          children: res.nodes,
          meta: tree?.meta ?? {
            title: 'Untitled Page',
            slug: 'untitled',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          styleguideId: tree?.styleguideId ?? '',
          globalSectionIds: tree?.globalSectionIds ?? [],
        };
        applyAIDiff({
          action: res.action,
          targetNodeId: tree?.id ?? '',
          payload: pageNode as DOMNode,
          position: res.position,
        });
      } else {
        applyAIDiff({
          action: res.action,
          targetNodeId: res.targetNodeId ?? (selectedNodeId ?? tree?.id ?? ''),
          payload: res.nodes.length === 1 ? res.nodes[0] : res.nodes,
          position: res.position,
        });
      }
    },
    [selectedNodeId, tree, applyAIDiff],
  );

  const send = useCallback(
    (prompt: string) => {
      if (!currentPageId || !opts.projectId || loadingRef.current) return;

      const controller = new AbortController();
      abortRef.current = controller;
      loadingRef.current = true;
      setIsLoading(true);

      apiClient.generateFromPromptStream(
        {
          prompt,
          projectId: opts.projectId,
          pageId: currentPageId,
          targetNodeId: selectedNodeId ?? undefined,
          styleguideId: tree?.styleguideId ?? '',
        },
        (text) => {
          opts.onChunk?.(text);
        },
        (result) => {
          loadingRef.current = false;
          setIsLoading(false);
          abortRef.current = null;
          if (result.action !== 'clarify') {
            applyResponse(result);
          }
          opts.onDone?.(result);
        },
        (error) => {
          loadingRef.current = false;
          setIsLoading(false);
          abortRef.current = null;
          opts.onError?.(error);
        },
        opts.onStatus,
      );
    },
    [opts, currentPageId, selectedNodeId, tree, applyResponse],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    loadingRef.current = false;
    setIsLoading(false);
  }, []);

  return { send, cancel, loading: isLoading };
}
