import type { NodeType } from './enums';
import type { AIAction } from './enums';
import type { DOMNode } from './dom-tree';

export interface AIGenerationRequest {
  prompt: string;
  projectId: string;
  pageId: string;
  targetNodeType?: NodeType;
  targetNodeId?: string;
  position?: number;
  styleguideId: string;
}

export interface AIGenerationResponse {
  action: AIAction;
  nodes: DOMNode[];
  targetNodeId?: string;
  position?: number;
  message?: string;
}

export interface AIDiff {
  action: AIAction;
  targetNodeId: string;
  payload: Partial<DOMNode> | DOMNode | DOMNode[];
  position?: number;
}

export interface ParsedIntent {
  action: AIAction;
  componentCategory?: string;
  properties?: Record<string, unknown>;
  targetDescription?: string;
  count?: number;
}
