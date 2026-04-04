import { z } from 'zod';
import { AIAction } from '@/types/enums';
import { domNodeSchema } from './dom-node.schema';

export const aiDiffSchema = z.object({
  action: z.nativeEnum(AIAction),
  targetNodeId: z.string(),
  payload: z.union([
    domNodeSchema,
    domNodeSchema,
    z.array(domNodeSchema),
  ]),
  position: z.number().optional(),
});

export const aiGenerationResponseSchema = z.object({
  action: z.nativeEnum(AIAction),
  nodes: z.array(domNodeSchema),
  targetNodeId: z.string().optional(),
  position: z.number().optional(),
});
