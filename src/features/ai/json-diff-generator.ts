import { AIAction } from '@/types/enums';
import type { AIDiff } from '@/types/ai';
import type { DOMNode } from '@/types/dom-tree';

/**
 * Validates the structure of an AIDiff before it can be applied.
 * Returns an error message if invalid, or null if valid.
 */
export function validateAIDiff(diff: AIDiff): string | null {
  if (!diff || typeof diff !== 'object') {
    return 'AIDiff must be an object.';
  }

  if (!diff.action || !Object.values(AIAction).includes(diff.action)) {
    return `Invalid or missing action: ${diff.action}`;
  }

  if (!diff.targetNodeId || typeof diff.targetNodeId !== 'string') {
    return 'AIDiff must have a valid targetNodeId string.';
  }

  if (diff.payload === undefined || diff.payload === null) {
    return 'AIDiff must have a payload.';
  }

  // Validate payload shape per action
  switch (diff.action) {
    case AIAction.INSERT_SECTION:
    case AIAction.INSERT_COMPONENT: {
      if (Array.isArray(diff.payload)) {
        for (const node of diff.payload) {
          if (!node || typeof node !== 'object' || !('type' in node)) {
            return 'Each payload node must have a type property.';
          }
        }
      } else if (typeof diff.payload === 'object') {
        if (!('type' in diff.payload)) {
          return 'Payload node must have a type property.';
        }
      } else {
        return 'Payload for insert actions must be a DOMNode or DOMNode array.';
      }
      break;
    }
    case AIAction.MODIFY_NODE: {
      if (typeof diff.payload !== 'object' || Array.isArray(diff.payload)) {
        return 'Payload for modify_node must be a partial DOMNode object.';
      }
      break;
    }
    case AIAction.DELETE_NODE: {
      // Payload is not strictly required for delete, but can contain metadata
      break;
    }
    case AIAction.REPLACE_NODE: {
      if (typeof diff.payload !== 'object' || Array.isArray(diff.payload)) {
        return 'Payload for replace_node must be a DOMNode object.';
      }
      if (!('type' in (diff.payload as object))) {
        return 'Payload for replace_node must have a type property.';
      }
      break;
    }
    case AIAction.REORDER_CHILDREN: {
      if (!Array.isArray(diff.payload)) {
        return 'Payload for reorder_children must be an array of child IDs.';
      }
      for (const item of diff.payload as unknown[]) {
        if (typeof item !== 'string') {
          return 'Each item in reorder_children payload must be a string ID.';
        }
      }
      break;
    }
    case AIAction.FULL_PAGE: {
      if (typeof diff.payload !== 'object' || !('type' in (diff.payload as object))) {
        return 'Payload for full_page must be a PageNode object.';
      }
      break;
    }
  }

  if (diff.position !== undefined && typeof diff.position !== 'number') {
    return 'Position must be a number if provided.';
  }

  return null;
}

/**
 * Generates an AIDiff from a parsed intent and generated nodes.
 *
 * @param action - The AI action to perform
 * @param targetNodeId - The ID of the target node in the tree
 * @param nodes - The DOMNode(s) to use as the diff payload
 * @param position - Optional insertion position index
 * @returns A validated AIDiff object
 */
export function generateAIDiff(
  action: AIAction,
  targetNodeId: string,
  nodes: DOMNode[],
  position?: number
): AIDiff {
  const diff: AIDiff = {
    action,
    targetNodeId,
    payload: nodes.length === 1 ? nodes[0] : nodes,
  };

  if (position !== undefined) {
    diff.position = position;
  }

  const validationError = validateAIDiff(diff);
  if (validationError) {
    throw new Error(`Invalid AIDiff generated: ${validationError}`);
  }

  return diff;
}
