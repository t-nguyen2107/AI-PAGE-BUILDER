/**
 * Knowledge Seeder — batch-embeds design reference data into VectorEmbedding table.
 *
 * Categories seeded (scope='global'):
 *   - color_palette: product type → color mapping
 *   - design_system: style definitions
 *   - landing_pattern: landing page patterns
 *   - typography: font pairings
 *   - product_reasoning: product → design reasoning
 *
 * Idempotent: clears existing global entries before seeding.
 */

import {
  PRODUCT_COLOR_PALETTES,
  DESIGN_STYLES,
  LANDING_PATTERNS,
  TYPOGRAPHY_PAIRINGS,
  PRODUCT_REASONING,
} from './design-knowledge';

import { storeVectorBatch, deleteVectorsByScope } from '../vector-store';
import type { StoreEntry } from '../vector-store';

// ─── Seed data formatters ────────────────────────────────────────────────

function formatColorPalette(businessType: string, p: typeof PRODUCT_COLOR_PALETTES[string]): string {
  return `Color palette for ${businessType}: primary=${p.primary}, secondary=${p.secondary}, accent=${p.accent}, background=${p.background}, foreground=${p.foreground}, card=${p.card}, muted=${p.muted}, border=${p.border}. Note: ${p.note}`;
}

function formatDesignStyle(name: string, s: typeof DESIGN_STYLES[string]): string {
  return `Design style "${name}": colors=${s.colors}, effects=${s.effects}, best for ${s.bestFor.join(', ')}. Tip: ${s.promptHint}`;
}

function formatLandingPattern(name: string, p: typeof LANDING_PATTERNS[string]): string {
  return `Landing pattern "${name}": sections=${p.sectionOrder.join(' → ')}, CTA=${p.ctaPlacement}, colors=${p.colorStrategy}. Tip: ${p.conversionTip}`;
}

function formatTypography(name: string, t: typeof TYPOGRAPHY_PAIRINGS[string]): string {
  return `Typography "${name}": heading=${t.heading}, body=${t.body}, mood=${t.mood.join(', ')}, best for ${t.bestFor.join(', ')}`;
}

function formatProductReasoning(businessType: string, r: typeof PRODUCT_REASONING[string]): string {
  return `Product design for ${businessType}: pattern=${r.recommendedPattern}, style=${r.stylePriority}, colors=${r.colorMood}, typography=${r.typographyMood}, effects=${r.keyEffects}, avoid=${r.antiPatterns}`;
}

// ─── Main seed function ──────────────────────────────────────────────────

export interface SeedResult {
  categories: Record<string, number>;
  totalSeeded: number;
  errors: string[];
}

/**
 * Seed all design knowledge into the vector DB.
 * Idempotent: clears existing global entries first.
 */
export async function seedDesignKnowledge(): Promise<SeedResult> {
  const result: SeedResult = { categories: {}, totalSeeded: 0, errors: [] };

  // Clear existing global knowledge entries
  try {
    await deleteVectorsByScope('global');
  } catch (err) {
    result.errors.push(`Clear failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  const entries: StoreEntry[] = [];

  // Color palettes
  for (const [businessType, palette] of Object.entries(PRODUCT_COLOR_PALETTES)) {
    entries.push({
      scope: 'global',
      category: 'color_palette',
      content: formatColorPalette(businessType, palette),
      metadata: { businessType },
    });
  }

  // Design styles
  for (const [name, style] of Object.entries(DESIGN_STYLES)) {
    entries.push({
      scope: 'global',
      category: 'design_system',
      content: formatDesignStyle(name, style),
      metadata: { styleName: name },
    });
  }

  // Landing patterns
  for (const [name, pattern] of Object.entries(LANDING_PATTERNS)) {
    entries.push({
      scope: 'global',
      category: 'landing_pattern',
      content: formatLandingPattern(name, pattern),
      metadata: { patternName: name },
    });
  }

  // Typography pairings
  for (const [name, pairing] of Object.entries(TYPOGRAPHY_PAIRINGS)) {
    entries.push({
      scope: 'global',
      category: 'typography',
      content: formatTypography(name, pairing),
      metadata: { pairingName: name },
    });
  }

  // Product reasoning
  for (const [businessType, reasoning] of Object.entries(PRODUCT_REASONING)) {
    entries.push({
      scope: 'global',
      category: 'product_reasoning',
      content: formatProductReasoning(businessType, reasoning),
      metadata: { businessType },
    });
  }

  // Batch insert — 10 at a time to avoid overwhelming the embedding API
  const BATCH_SIZE = 10;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    try {
      const ids = await storeVectorBatch(batch);
      const cat = batch[0]!.category;
      result.categories[cat] = (result.categories[cat] ?? 0) + ids.length;
      result.totalSeeded += ids.length;
    } catch (err) {
      const msg = `Batch ${i}-${i + batch.length} failed: ${err instanceof Error ? err.message : String(err)}`;
      result.errors.push(msg);
      console.error(`[seed-knowledge] ${msg}`);
    }
  }

  return result;
}
