import type { ComponentData } from '@puckeditor/core';
import type { AIAction } from './enums';

export interface AIGenerationRequest {
  prompt: string;
  projectId: string;
  pageId: string;
  styleguideId: string;
}

export interface AIGenerationResponse {
  action: AIAction;
  components: ComponentData[];
  targetComponentId?: string;
  position?: number;
  message?: string;
}

export interface AIDiff {
  action: AIAction;
  targetComponentId: string;
  payload: Partial<ComponentData> | ComponentData | ComponentData[];
  position?: number;
}

export interface ParsedIntent {
  action: AIAction;
  componentCategory?: string;
  properties?: Record<string, unknown>;
  targetDescription?: string;
  count?: number;
}
