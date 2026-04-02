import { NodeType, SemanticTag } from '@/types/enums';
import type { AIDiff, AIGenerationResponse, DOMNode, PageNode } from '@/types';

interface ApplyResponseParams {
  res: AIGenerationResponse;
  tree: PageNode | null;
  selectedNodeId: string | null;
  applyAIDiff: (diff: AIDiff) => void;
}

/**
 * Apply an AI generation response to the DOM tree.
 * Shared by Canvas, AIChatPanel, and SelectionToolbar.
 */
export function applyAIResponse({
  res,
  tree,
  selectedNodeId,
  applyAIDiff,
}: ApplyResponseParams) {
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
}
