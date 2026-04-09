/**
 * Seed Vector DB — delete old vectors, seed design knowledge with Gemini 3072-dim embeddings.
 *
 * Usage: npx tsx scripts/seed-vector-db.ts
 *
 * All AI/vector imports are dynamic to ensure dotenv loads .env.local first.
 */
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  // Dynamic imports — ensures env vars are loaded before module evaluation
  const { execSync } = await import('node:child_process');
  const { prisma } = await import('../src/lib/prisma');
  const { storeVectorBatch, searchVectors } = await import('../src/lib/ai/vector-store');
  const { resolveEmbeddingConfig, resetEmbeddingConfig } = await import('../src/lib/ai/embeddings');
  const {
    PRODUCT_COLOR_PALETTES,
    DESIGN_STYLES,
    LANDING_PATTERNS,
    TYPOGRAPHY_PAIRINGS,
    PRODUCT_REASONING,
    formatDesignGuidance,
    resolveDesignGuidance,
  } = await import('../src/lib/ai/knowledge/design-knowledge');

  // Reset cached embedding config so it picks up fresh env vars
  resetEmbeddingConfig();

  console.log('=== Seed Vector DB ===\n');

  // Verify config
  const embedConfig = resolveEmbeddingConfig();
  console.log(`Embedding: ${embedConfig.provider}/${embedConfig.model} dims=${embedConfig.dimensions}`);

  if (embedConfig.dimensions !== 768) {
    console.error(`\n❌ ERROR: Expected dims=768 but got dims=${embedConfig.dimensions}.`);
    console.error('   Set EMBEDDING_DIMENSIONS="768" in .env.local and re-run.');
    process.exit(1);
  }

  // 1. Migrate vector column dimension via Prisma CLI (uses direct URL)
  console.log('\n## Step 1: Migrate embedding_vec column to vector(768)');
  const alterSql = 'ALTER TABLE vector_embeddings ALTER COLUMN embedding_vec TYPE vector(768);';
  try {
    execSync(`echo "${alterSql}" | npx prisma db execute --stdin`, { stdio: 'pipe', cwd: process.cwd(), shell: '/bin/bash' });
    console.log('  ✅ Column migrated to vector(768)');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('does not exist')) {
      console.log('  Column does not exist — creating...');
      const addSql = 'ALTER TABLE vector_embeddings ADD COLUMN embedding_vec vector(768);';
      try {
        execSync(`echo "${addSql}" | npx prisma db execute --stdin`, { stdio: 'pipe', cwd: process.cwd(), shell: '/bin/bash' });
        console.log('  ✅ Column created as vector(768)');
      } catch (createErr) {
        console.error('  ❌ Failed:', createErr instanceof Error ? createErr.message : createErr);
      }
    } else if (msg.includes('already') || msg.includes('same type')) {
      console.log('  ✅ Already vector(768)');
    } else {
      console.log(`  Note: ${msg.substring(0, 200)}`);
    }
  }

  // 2. Delete all existing vectors (old dimensions won't match)
  console.log('\n## Step 2: Clear existing vectors');
  const count = await prisma.vectorEmbedding.count();
  console.log(`  Existing vectors: ${count}`);
  if (count > 0) {
    await prisma.vectorEmbedding.deleteMany({});
    console.log('  ✅ All deleted');
  }

  // 3. Build knowledge entries
  console.log('\n## Step 3: Building knowledge entries');
  const entries: Array<{ scope: 'global'; category: string; content: string }> = [];

  // Color palettes
  for (const [bizType, palette] of Object.entries(PRODUCT_COLOR_PALETTES)) {
    entries.push({
      scope: 'global' as const,
      category: 'colors',
      content: `Color palette for ${bizType}: primary=${palette.primary}, secondary=${palette.secondary}, accent=${palette.accent}, background=${palette.background}, foreground=${palette.foreground}, card=${palette.card}, muted=${palette.muted}, border=${palette.border}. Note: ${palette.note}`,
    });
  }
  console.log(`  Color palettes: ${Object.keys(PRODUCT_COLOR_PALETTES).length}`);

  // Design styles
  for (const [styleName, style] of Object.entries(DESIGN_STYLES)) {
    entries.push({
      scope: 'global' as const,
      category: 'styles',
      content: `Design style "${styleName}": Keywords: ${style.keywords.join(', ')}. Colors: ${style.colors}. Effects: ${style.effects}. Best for: ${style.bestFor.join(', ')}. Avoid for: ${style.avoidFor.join(', ')}. Guidance: ${style.promptHint}`,
    });
  }
  console.log(`  Design styles: ${Object.keys(DESIGN_STYLES).length}`);

  // Landing patterns
  for (const [patternName, pattern] of Object.entries(LANDING_PATTERNS)) {
    entries.push({
      scope: 'global' as const,
      category: 'patterns',
      content: `Landing page pattern "${patternName}": Section order: ${pattern.sectionOrder.join(' → ')}. CTA placement: ${pattern.ctaPlacement}. Color strategy: ${pattern.colorStrategy}. Conversion tip: ${pattern.conversionTip}`,
    });
  }
  console.log(`  Landing patterns: ${Object.keys(LANDING_PATTERNS).length}`);

  // Typography pairings
  for (const [pairingName, pairing] of Object.entries(TYPOGRAPHY_PAIRINGS)) {
    entries.push({
      scope: 'global' as const,
      category: 'typography',
      content: `Typography "${pairingName}": Heading: ${pairing.heading}, Body: ${pairing.body}. Mood: ${pairing.mood.join(', ')}. Best for: ${pairing.bestFor.join(', ')}`,
    });
  }
  console.log(`  Typography pairings: ${Object.keys(TYPOGRAPHY_PAIRINGS).length}`);

  // Product reasoning — combined with full guidance
  for (const [bizType] of Object.entries(PRODUCT_REASONING)) {
    const guidance = resolveDesignGuidance(bizType);
    if (guidance) {
      entries.push({
        scope: 'global' as const,
        category: 'reasoning',
        content: formatDesignGuidance(guidance, bizType),
      });
    }
  }
  console.log(`  Product reasoning: ${Object.keys(PRODUCT_REASONING).length}`);

  console.log(`\n  Total entries to seed: ${entries.length}`);

  // 4. Seed in batches (3 at a time — Gemini has rate limits)
  console.log('\n## Step 4: Seeding (embedding + storing)');
  const BATCH_SIZE = 3;
  let seeded = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    try {
      const ids = await storeVectorBatch(batch);
      seeded += ids.length;
      process.stdout.write(`\r  Seeded: ${seeded}/${entries.length} `);
    } catch (err) {
      failed += batch.length;
      console.error(`\n  Batch ${i}-${i + batch.length} failed:`, err instanceof Error ? err.message : err);
      // Wait 2s on rate limit before continuing
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`\n  ✅ Seeded: ${seeded}, Failed: ${failed}`);

  // 5. Verify with test searches
  console.log('\n## Step 5: Verify search');

  const queries = [
    'restaurant color palette design',
    'modern SaaS landing page layout',
    'luxury elegant typography',
  ];

  for (const q of queries) {
    const results = await searchVectors(q, { scopes: ['global'], topK: 3, minScore: 0.3 });
    console.log(`\n  Query: "${q}" → ${results.length} results`);
    for (const r of results) {
      console.log(`    [${r.category}] score=${r.score.toFixed(3)}: ${r.content.substring(0, 70)}...`);
    }
  }

  await prisma.$disconnect();
  console.log('\n=== Done ===');
}

main().catch(console.error);
