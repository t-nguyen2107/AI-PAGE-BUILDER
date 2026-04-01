import { useMemo } from 'react';
import { NodeType, SemanticTag } from '@/types';
import type { BaseNode } from '@/types';

/**
 * Maps a SemanticTag enum value to the actual HTML tag string.
 */
const SEMANTIC_TAG_MAP: Record<SemanticTag, string> = {
  [SemanticTag.HEADER]: 'header',
  [SemanticTag.NAV]: 'nav',
  [SemanticTag.MAIN]: 'main',
  [SemanticTag.SECTION]: 'section',
  [SemanticTag.ARTICLE]: 'article',
  [SemanticTag.ASIDE]: 'aside',
  [SemanticTag.FOOTER]: 'footer',
  [SemanticTag.DIV]: 'div',
  [SemanticTag.SPAN]: 'span',
  [SemanticTag.H1]: 'h1',
  [SemanticTag.H2]: 'h2',
  [SemanticTag.H3]: 'h3',
  [SemanticTag.H4]: 'h4',
  [SemanticTag.H5]: 'h5',
  [SemanticTag.H6]: 'h6',
  [SemanticTag.P]: 'p',
  [SemanticTag.A]: 'a',
  [SemanticTag.IMG]: 'img',
  [SemanticTag.UL]: 'ul',
  [SemanticTag.OL]: 'ol',
  [SemanticTag.LI]: 'li',
  [SemanticTag.BUTTON]: 'button',
  [SemanticTag.FORM]: 'form',
  [SemanticTag.INPUT]: 'input',
  [SemanticTag.FIGURE]: 'figure',
  [SemanticTag.FIGCAPTION]: 'figcaption',
};

/**
 * Returns a default HTML tag for a given NodeType when the node's tag
 * value is not specific enough or needs a fallback.
 */
const DEFAULT_TAG_BY_TYPE: Record<NodeType, string> = {
  [NodeType.PAGE]: 'main',
  [NodeType.SECTION]: 'section',
  [NodeType.CONTAINER]: 'div',
  [NodeType.COMPONENT]: 'div',
  [NodeType.ELEMENT]: 'div',
  [NodeType.ITEM]: 'div',
};

/**
 * Hook that resolves the best semantic HTML tag for a node.
 *
 * Uses the node's explicit `tag` property when available, falling back
 * to a sensible default based on NodeType.
 */
export function useSemanticTag(node: BaseNode): string {
  const tag = useMemo(() => {
    if (node.tag && SEMANTIC_TAG_MAP[node.tag]) {
      return SEMANTIC_TAG_MAP[node.tag];
    }
    return DEFAULT_TAG_BY_TYPE[node.type] ?? 'div';
  }, [node.tag, node.type]);

  return tag;
}

/**
 * Non-hook version for use outside React component bodies.
 */
export function resolveSemanticTag(node: BaseNode): string {
  if (node.tag && SEMANTIC_TAG_MAP[node.tag]) {
    return SEMANTIC_TAG_MAP[node.tag];
  }
  return DEFAULT_TAG_BY_TYPE[node.type] ?? 'div';
}
