import type { AIDiff } from '@/types/ai';
import { useBuilderStore } from '@/store';
import { validateAIDiff } from './json-diff-generator';

/**
 * Applies an AIDiff to the Zustand store.
 * Validates the diff structure before applying.
 * Throws if the diff is invalid or the store has no tree loaded.
 */
export function applyAIDiffToStore(diff: AIDiff): void {
  // Validate diff structure first
  const validationError = validateAIDiff(diff);
  if (validationError) {
    throw new Error(`Cannot apply invalid AIDiff: ${validationError}`);
  }

  const store = useBuilderStore.getState();

  if (!store.tree) {
    throw new Error('Cannot apply AIDiff: no page tree is loaded in the store.');
  }

  store.applyAIDiff(diff);
}
