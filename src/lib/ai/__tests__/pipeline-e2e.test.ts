/**
 * E2E Pipeline Test — calls REAL LLM + embedding APIs.
 *
 * Prerequisites:
 *   - .env.local with AI_API_KEY, EMBEDDING_API_KEY configured
 *   - Database accessible (for RAG test; non-fatal if DB is down)
 *
 * Run:  npx vitest run src/lib/ai/__tests__/pipeline-e2e.test.ts --testTimeout=180000
 */

import { describe, it, expect } from 'vitest';
import { resolveConfig } from '../config';
import { createModelBundle } from '../provider';
import { buildTemplatePrompt } from '../prompts/template-prompt';
import { optimizePrompt } from '../prompts/prompt-optimizer';
import { resolveDesignGuidance, formatDesignGuidance } from '../knowledge/design-knowledge';
import { generateStyleguideFromBusinessType } from '../knowledge/auto-styleguide';
import { searchDesignKnowledge, isKnowledgeSeeded } from '../knowledge/knowledge-search';
import { embed, resolveEmbeddingConfig } from '../embeddings';
import { invokeAIChain } from '../chain';
import { extractJSON } from '../streaming';
import { validateTemplateResponse } from '../prompts/template-schema';
import { orderPuckComponents } from '../puck-adapter';
import { generateId } from '@/lib/id';
import type { ComponentData } from '@puckeditor/core';

// ─── Timing helper ────────────────────────────────────────────────────────────
function time<T>(label: string, fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const start = performance.now();
  return fn().then((result) => {
    const ms = Math.round(performance.now() - start);
    console.log(`  ⏱ [timing] ${label}: ${ms}ms`);
    return { result, ms };
  });
}

// ─── Config snapshot (logged once) ────────────────────────────────────────────
const config = resolveConfig();
const embConfig = resolveEmbeddingConfig();
console.log('\n🔧 AI Config:', {
  provider: config.provider,
  model: config.model,
  baseUrl: config.baseUrl?.replace(/\/api\/.*/, '/***'),
  temperature: config.temperature,
  maxTokens: config.maxTokens,
});
console.log('🔧 Embedding Config:', {
  provider: embConfig.provider,
  model: embConfig.model,
  dimensions: embConfig.dimensions,
});

// ═══════════════════════════════════════════════════════════════════════════════
// STAGE 1: Embedding API (Jina)
// ═══════════════════════════════════════════════════════════════════════════════
describe('E2E: Stage 1 — Embedding API', () => {
  it('embeds a single text via Jina', async () => {
    const { result, ms } = await time('embed("restaurant website design")', () =>
      embed('restaurant website design'),
    );

    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBeGreaterThan(0);
    console.log(`    → dimensions: ${result.length}, first 3: [${Array.from(result.slice(0, 3)).map((v) => v.toFixed(4)).join(', ')}]`);
  });

  it('embeds Vietnamese text', async () => {
    const { result, ms } = await time('embed("Tạo trang web cho nhà hàng")', () =>
      embed('Tạo trang web cho nhà hàng Việt Nam'),
    );

    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBeGreaterThan(0);
    console.log(`    → dimensions: ${result.length}`);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STAGE 2: Static Design Knowledge (zero latency — sanity check)
// ═══════════════════════════════════════════════════════════════════════════════
describe('E2E: Stage 2 — Static Design Knowledge', () => {
  it('optimizes Vietnamese prompt → detects restaurant', async () => {
    const { result } = await time('optimizePrompt("nhà hàng")', () =>
      Promise.resolve(optimizePrompt('Tạo trang web cho nhà hàng Việt Nam')),
    );

    console.log(`    → businessType: ${result.businessType}, intent: ${result.intent}`);
    expect(result.businessType).toBeTruthy();
  });

  it('resolves + formats design guidance for SaaS', async () => {
    const { result: guidance } = await time('resolveDesignGuidance("SaaS/technology")', () =>
      Promise.resolve(resolveDesignGuidance('SaaS/technology')),
    );

    expect(guidance).not.toBeNull();
    const { result: formatted } = await time('formatDesignGuidance', () =>
      Promise.resolve(formatDesignGuidance(guidance!)),
    );

    console.log(`    → formatted length: ${formatted.length} chars`);
    expect(formatted.length).toBeGreaterThan(100);
  });

  it('generates auto-styleguide for restaurant', async () => {
    const { result } = await time('generateStyleguideFromBusinessType("restaurant/dining")', () =>
      Promise.resolve(generateStyleguideFromBusinessType('restaurant/dining')),
    );

    expect(result).not.toBeNull();
    console.log(`    → primary: ${result!.styleguide.colors.primary}, heading: ${result!.styleguide.typography.headingFont}`);
    expect(result!.styleguide.cssVariables['--color-primary']).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STAGE 3: LLM — Template Mode (full-page generation)
// ═══════════════════════════════════════════════════════════════════════════════
describe('E2E: Stage 3 — LLM Template Mode', () => {
  it('generates a full page for "nhà hàng" via template prompt', async () => {
    const totalStart = performance.now();

    // 3a. Optimize prompt
    const { result: optimized } = await time('  optimizePrompt', () =>
      Promise.resolve(optimizePrompt('Tạo trang web cho nhà hàng Việt Nam')),
    );
    console.log(`    → businessType: ${optimized.businessType}`);

    // 3b. Get design context
    const guidance = optimized.businessType
      ? resolveDesignGuidance(optimized.businessType)
      : null;
    const designContext = guidance ? formatDesignGuidance(guidance) : undefined;
    console.log(`    → designContext: ${designContext?.length ?? 0} chars`);

    // 3c. Build template prompt
    const { result: tmplPrompt } = await time('  buildTemplatePrompt', () =>
      Promise.resolve(buildTemplatePrompt({
        businessType: optimized.businessType ?? undefined,
        designContext,
      })),
    );

    // 3d. Call LLM
    const { result: response, ms: llmMs } = await time('  LLM invoke (template mode)', async () => {
      const { model, jsonCallOptions } = createModelBundle({ maxTokens: 4096 });
      const messages = await tmplPrompt.formatMessages({ input: optimized.enrichedPrompt });
      return model.invoke(messages, jsonCallOptions);
    });

    const text = typeof response.content === 'string' ? response.content : '';
    console.log(`    → LLM response length: ${text.length} chars`);

    // 3e. Parse + validate
    const { result: parsed, ms: parseMs } = await time('  parse + validate', () => {
      const raw = extractJSON(text);
      if (!raw) return Promise.resolve(null);
      const { data, error } = validateTemplateResponse(raw);
      if (error) console.log(`    → validation error: ${error}`);
      return Promise.resolve(data);
    });

    if (parsed) {
      const components: ComponentData[] = parsed.components.map((c) => ({
        type: c.type,
        props: { id: generateId(), ...c.props },
      }));
      const ordered = orderPuckComponents(components);
      console.log(`    → ✅ ${ordered.length} components generated:`);
      ordered.forEach((c) => console.log(`       - ${c.type}`));
      expect(ordered.length).toBeGreaterThan(0);
    } else {
      console.log('    → ⚠️ Template mode returned unparseable result (LLM output issue)');
    }

    const totalMs = Math.round(performance.now() - totalStart);
    console.log(`  📊 TOTAL template mode: ${totalMs}ms (LLM: ${llmMs}ms)`);
  }, 120_000);
});

// ═══════════════════════════════════════════════════════════════════════════════
// STAGE 4: LLM — Full Chain (component-level generation)
// ═══════════════════════════════════════════════════════════════════════════════
describe('E2E: Stage 4 — LLM Full Chain', () => {
  it('generates components via invokeAIChain for a SaaS prompt', async () => {
    const optimized = optimizePrompt('Add a pricing section for my SaaS product');

    // Get design guidance
    const guidance = optimized.businessType
      ? resolveDesignGuidance(optimized.businessType)
      : null;
    const designContext = guidance ? formatDesignGuidance(guidance) : undefined;

    const { result, ms } = await time('invokeAIChain (pricing)', () =>
      invokeAIChain(optimized.enrichedPrompt, {
        designContext,
      }),
    );

    console.log(`    → data: ${result.data ? '✅' : '❌'}, error: ${result.error ?? 'none'}`);
    if (result.data) {
      console.log(`    → action: ${result.data.action}, components: ${result.data.components.length}`);
      result.data.components.forEach((c) => console.log(`       - ${c.type}`));
      expect(result.data.components.length).toBeGreaterThan(0);
    }
    console.log(`  📊 Full chain: ${ms}ms`);
  }, 180_000);
});

// ═══════════════════════════════════════════════════════════════════════════════
// STAGE 5: RAG — Vector Knowledge Search (requires seeded DB)
// ═══════════════════════════════════════════════════════════════════════════════
describe('E2E: Stage 5 — RAG Vector Search', () => {
  it('checks if knowledge is seeded', async () => {
    const { result, ms } = await time('isKnowledgeSeeded', () => isKnowledgeSeeded());
    console.log(`    → seeded: ${result}`);
  });

  it('searches design knowledge for "fitness gym"', async () => {
    const { result, ms } = await time('searchDesignKnowledge("fitness gym")', () =>
      searchDesignKnowledge({ query: 'fitness gym landing page design', businessType: 'fitness/gym' }),
    );

    console.log(`    → hits: ${result.hitCount}, categories: ${result.categories.join(', ')}`);
    console.log(`    → context length: ${result.contextText.length} chars`);
    if (result.contextText.length > 0) {
      console.log(`    → preview: ${result.contextText.slice(0, 200)}...`);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STAGE 6: Full Pipeline — Optimize → Design → LLM → Parse
// ═══════════════════════════════════════════════════════════════════════════════
describe('E2E: Stage 6 — Full Pipeline', () => {
  const testCases = [
    { prompt: 'Tạo trang web cho tiệm bánh Artisan Bakery', label: 'bakery (Vietnamese)' },
    { prompt: 'Create a landing page for my fitness gym', label: 'fitness (English)' },
  ];

  for (const { prompt: testPrompt, label } of testCases) {
    it(`full pipeline: "${label}"`, async () => {
      const totalStart = performance.now();
      console.log(`\n  📝 Prompt: "${testPrompt}"`);

      // Step 1: Optimize
      const { result: optimized, ms: s1 } = await time('  Step 1: optimizePrompt', () =>
        Promise.resolve(optimizePrompt(testPrompt)),
      );
      console.log(`    → businessType: ${optimized.businessType}, intent: ${optimized.intent}`);

      // Step 2: Design guidance
      const { result: guidance, ms: s2 } = await time('  Step 2: resolveDesignGuidance', () =>
        Promise.resolve(resolveDesignGuidance(optimized.businessType)),
      );
      const { result: designCtx, ms: s3 } = await time('  Step 3: formatDesignGuidance', () =>
        Promise.resolve(guidance ? formatDesignGuidance(guidance) : ''),
      );
      console.log(`    → designCtx: ${designCtx.length} chars`);

      // Step 4: Auto-styleguide
      const { result: sg, ms: s4 } = await time('  Step 4: auto-styleguide', () =>
        Promise.resolve(generateStyleguideFromBusinessType(optimized.businessType ?? '')),
      );
      if (sg) {
        console.log(`    → styleguide: primary=${sg.styleguide.colors.primary}, heading=${sg.styleguide.typography.headingFont}`);
      }

      // Step 5: RAG search (non-fatal)
      let ragCtx = '';
      try {
        const { result: ragResult, ms: s5 } = await time('  Step 5: RAG search', () =>
          searchDesignKnowledge({ query: testPrompt, businessType: optimized.businessType ?? undefined }),
        );
        ragCtx = ragResult.contextText;
        console.log(`    → RAG: ${ragResult.hitCount} hits, ${ragCtx.length} chars`);
      } catch {
        console.log('    → RAG: skipped (DB unavailable)');
      }

      // Step 6: LLM generation (template mode)
      const mergedCtx = [designCtx, ragCtx].filter(Boolean).join('\n') || undefined;
      const { result: tmplPrompt, ms: s6 } = await time('  Step 6: buildTemplatePrompt', () =>
        Promise.resolve(buildTemplatePrompt({
          businessType: optimized.businessType ?? undefined,
          designContext: mergedCtx,
        })),
      );

      const { result: llmResp, ms: s7 } = await time('  Step 7: LLM invoke', async () => {
        const { model, jsonCallOptions } = createModelBundle({ maxTokens: 4096 });
        const messages = await tmplPrompt.formatMessages({ input: optimized.enrichedPrompt });
        return model.invoke(messages, jsonCallOptions);
      });

      const text = typeof llmResp.content === 'string' ? llmResp.content : '';
      const raw = extractJSON(text);
      const { data: plan } = raw ? validateTemplateResponse(raw) : { data: null };

      if (plan) {
        const components: ComponentData[] = plan.components.map((c) => ({
          type: c.type,
          props: { id: generateId(), ...c.props },
        }));
        const ordered = orderPuckComponents(components);
        console.log(`    → ✅ Generated ${ordered.length} components:`);
        ordered.forEach((c) => console.log(`       - ${c.type} (${Object.keys(c.props).length} props)`));
        expect(ordered.length).toBeGreaterThan(0);
      } else {
        console.log(`    → ⚠️ LLM output could not be parsed`);
        console.log(`    → raw length: ${text.length}, json found: ${!!raw}`);
      }

      const totalMs = Math.round(performance.now() - totalStart);
      console.log(`\n  📊 PIPELINE TOTAL: ${totalMs}ms`);
      console.log(`     optimize=${s1}ms, guidance=${s2}ms, format=${s3}ms, styleguide=${s4}ms, prompt=${s6}ms, LLM=${s7}ms`);
    }, 180_000);
  }
});
