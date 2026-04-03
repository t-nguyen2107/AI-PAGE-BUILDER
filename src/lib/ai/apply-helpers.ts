/**
 * Apply Helpers — apply AI generation responses to Puck data.
 *
 * These helpers convert AIGenerationResponse actions into state updates
 * that can be dispatched to the Puck editor.
 */

import type { AIGenerationResponse, AIDiff } from '@/types/ai';
import type { ComponentData } from '@puckeditor/core';
import { AIAction } from '@/types/enums';

interface ApplyResponseParams {
  res: AIGenerationResponse;
  currentComponents: ComponentData[];
  selectedComponentId: string | null;
  applyAIDiff: (diff: AIDiff) => void;
}

/**
 * Apply an AI generation response to Puck component data.
 * Shared by editor components that consume AI output.
 */
export function applyAIResponse({
  res,
  currentComponents,
  selectedComponentId,
  applyAIDiff,
}: ApplyResponseParams) {
  switch (res.action) {
    case AIAction.FULL_PAGE: {
      // Replace all content with AI-generated components
      applyAIDiff({
        action: AIAction.FULL_PAGE,
        targetComponentId: '__root__',
        payload: res.components,
      });
      break;
    }

    case AIAction.INSERT_COMPONENT: {
      // Insert at end or at specific position
      applyAIDiff({
        action: AIAction.INSERT_COMPONENT,
        targetComponentId: '__root__',
        payload: res.components,
        position: res.position ?? currentComponents.length,
      });
      break;
    }

    case AIAction.MODIFY_NODE: {
      // Modify specific component props
      const targetId = res.targetComponentId ?? selectedComponentId;
      if (targetId && res.components.length > 0) {
        applyAIDiff({
          action: res.action,
          targetComponentId: targetId,
          payload: res.components[0],
        });
      }
      break;
    }

    case AIAction.REPLACE_NODE: {
      // Replace entire component
      const targetId = res.targetComponentId ?? selectedComponentId;
      if (targetId && res.components.length > 0) {
        applyAIDiff({
          action: res.action,
          targetComponentId: targetId,
          payload: res.components[0],
        });
      }
      break;
    }

    case AIAction.DELETE_NODE: {
      const targetId = res.targetComponentId ?? selectedComponentId;
      if (targetId) {
        applyAIDiff({
          action: res.action,
          targetComponentId: targetId,
          payload: [],
        });
      }
      break;
    }

    default:
      console.warn('[applyAIResponse] Unknown action:', res.action);
  }
}
