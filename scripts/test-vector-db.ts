/**
 * Quick test: Is vector DB working?
 * Loads .env.local (Next.js env) for Prisma + embedding config.
 */
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('=== Vector DB Test ===\n');

  // Show resolved config
  console.log('## Env Check');
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? 'set' : 'NOT SET'}`);
  console.log(`  EMBEDDING_PROVIDER: ${process.env.EMBEDDING_PROVIDER || '(inferred from AI_PROVIDER)'}`);
  console.log(`  EMBEDDING_MODEL: ${process.env.EMBEDDING_MODEL || '(default)'}`);
  console.log(`  AI_PROVIDER: ${process.env.AI_PROVIDER || '(default)'}`);

  // 1. Check table + row count
  console.log('\n## Step 1: Check VectorEmbedding table');
  try {
    const count = await prisma.vectorEmbedding.count();
    console.log(`  Rows in vector_embeddings: ${count}`);
    
    if (count > 0) {
      const sample = await prisma.vectorEmbedding.findFirst();
      console.log(`  Sample: scope=${sample?.scope}, category=${sample?.category}`);
      console.log(`  Content: ${sample?.content?.substring(0, 100)}...`);
    } else {
      console.log('  → Table is EMPTY — no knowledge seeded');
    }
  } catch (err: unknown) {
    console.error('  ERROR:', err instanceof Error ? err.message : err);
  }

  // 2. Test embedding
  console.log('\n## Step 2: Test embedding generation');
  try {
    const { embed, resolveEmbeddingConfig } = await import('../src/lib/ai/embeddings');
    const config = resolveEmbeddingConfig();
    console.log(`  Provider: ${config.provider}, Model: ${config.model}, Dims: ${config.dimensions}`);
    
    const start = Date.now();
    const vec = await embed('restaurant landing page design');
    console.log(`  ✅ Embedding OK: ${vec.length} dims, ${Date.now() - start}ms`);
  } catch (err: unknown) {
    console.error('  ❌ ERROR:', err instanceof Error ? err.message : err);
  }

  // 3. Test vector search
  console.log('\n## Step 3: Test vector search');
  try {
    const { searchVectors } = await import('../src/lib/ai/vector-store');
    const results = await searchVectors('restaurant color palette', {
      scopes: ['global', 'project'],
      topK: 5,
      minScore: 0.3,
    });
    console.log(`  Results: ${results.length}`);
    for (const r of results) {
      console.log(`  - [${r.category}] score=${r.score.toFixed(3)}: ${r.content.substring(0, 80)}...`);
    }
  } catch (err: unknown) {
    console.error('  ❌ ERROR:', err instanceof Error ? err.message : err);
  }

  // 4. Test knowledge search (high-level)
  console.log('\n## Step 4: Test knowledge search');
  try {
    const { searchDesignKnowledge } = await import('../src/lib/ai/knowledge/knowledge-search');
    const result = await searchDesignKnowledge({
      query: 'landing page for restaurant',
      businessType: 'restaurant',
      topK: 3,
      minScore: 0.3,
    });
    console.log(`  Hits: ${result.hitCount}, Categories: ${result.categories.join(', ') || 'none'}`);
    if (result.contextText) {
      console.log(`  Context: ${result.contextText.substring(0, 200)}...`);
    }
  } catch (err: unknown) {
    console.error('  ❌ ERROR:', err instanceof Error ? err.message : err);
  }

  await prisma.$disconnect();
  console.log('\n=== Done ===');
}

main().catch(console.error);
