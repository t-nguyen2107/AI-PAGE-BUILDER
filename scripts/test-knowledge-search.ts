/**
 * Test Knowledge Search — verify vector DB is readable by AI pipeline.
 * Usage: npx tsx scripts/test-knowledge-search.ts
 */
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('Loading modules...');

  const { resetEmbeddingConfig } = await import('../src/lib/ai/embeddings');
  resetEmbeddingConfig();
  console.log('Embedding config reset.');

  const { searchVectors } = await import('../src/lib/ai/vector-store');
  console.log('vector-store loaded.');

  const { searchDesignKnowledge } = await import('../src/lib/ai/knowledge/knowledge-search');
  console.log('knowledge-search loaded.');

  // Test 1: Direct vector search
  console.log('\n=== Test 1: Direct searchVectors() ===');
  const results = await searchVectors('restaurant color palette', {
    scopes: ['global'],
    topK: 3,
    minScore: 0.3,
  });
  console.log(`Results: ${results.length}`);
  for (const r of results) {
    console.log(`  [${r.category}] score=${r.score.toFixed(3)}: ${r.content.substring(0, 80)}`);
  }

  // Test 2: High-level knowledge search (what the AI pipeline uses)
  console.log('\n=== Test 2: searchDesignKnowledge() ===');
  const tests = [
    { query: 'restaurant landing page', businessType: 'restaurant' },
    { query: 'SaaS pricing page layout', businessType: 'SaaS' },
    { query: 'luxury brand elegant typography', businessType: 'luxury' },
  ];

  for (const t of tests) {
    console.log(`\nQuery: "${t.query}" (businessType: ${t.businessType})`);
    const result = await searchDesignKnowledge({
      query: t.query,
      businessType: t.businessType,
      topK: 5,
    });
    console.log(`  Hits: ${result.hitCount} | Categories: ${result.categories.join(', ')}`);
    if (result.contextText) {
      console.log(`  Context preview: ${result.contextText.substring(0, 150)}...`);
    }
  }

  // Test 3: Simulate what route.ts does — merge static + RAG
  console.log('\n=== Test 3: Merged context (static + RAG) ===');
  const { resolveDesignGuidance, formatDesignGuidance } = await import(
    '../src/lib/ai/knowledge/design-knowledge'
  );
  const guidance = resolveDesignGuidance('restaurant');
  const staticCtx = guidance ? formatDesignGuidance(guidance, 'restaurant') : '';
  const ragResult = await searchDesignKnowledge({
    query: 'restaurant landing page design',
    businessType: 'restaurant',
  });
  const merged = [staticCtx, ragResult.contextText].filter(Boolean).join('\n');
  console.log(`  Static context: ${staticCtx.length} chars`);
  console.log(`  RAG context: ${ragResult.contextText.length} chars`);
  console.log(`  Merged: ${merged.length} chars`);
  console.log(`  Preview: ${merged.substring(0, 200)}...`);

  console.log('\n=== All tests passed ===');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('ERROR:', err);
    process.exit(1);
  });
